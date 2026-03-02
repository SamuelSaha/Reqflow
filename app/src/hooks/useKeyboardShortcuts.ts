"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface KeyboardShortcut {
  key: string;
  modifier?: "cmd" | "ctrl" | "alt" | "shift";
  action: () => void;
  description: string;
  category?: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts?: KeyboardShortcut[];
  onCommandPalette?: () => void;
  onHelp?: () => void;
}

/**
 * Global keyboard shortcuts hook
 * Handles Cmd+K palette, G+key navigation, N for new, ? for help, / for search
 */
export function useKeyboardShortcuts({
  shortcuts = [],
  onCommandPalette,
  onHelp,
}: UseKeyboardShortcutsProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const gKeyPressedRef = useRef(false);
  const gKeyTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleGoToNavigation = useCallback(
    (key: string) => {
      const routes: Record<string, string> = {
        d: "/dashboard",
        r: "/dashboard/requests",
        a: "/dashboard/approvals",
        t: "/dashboard/trials",
        w: "/dashboard/renewals", // W for renewal/watch
        b: "/dashboard/budgets",
        s: "/dashboard/subscriptions",
        i: "/dashboard/invoices",
        v: "/dashboard/vendors",
        e: "/dashboard/settings", // E for sEttings
      };

      const route = routes[key];
      if (route) {
        router.push(route);
      }
    },
    [router]
  );

  const handleNewAction = useCallback(() => {
    // Context-aware "New" action based on current route
    if (pathname.startsWith("/dashboard/requests")) {
      router.push("/dashboard/requests/new");
    } else if (pathname.startsWith("/dashboard/vendors")) {
      router.push("/dashboard/vendors/new");
    } else if (pathname.startsWith("/dashboard/contracts")) {
      router.push("/dashboard/contracts/new");
    } else if (pathname.startsWith("/dashboard/workflows")) {
      router.push("/dashboard/settings/workflows/new");
    } else {
      // Default: new request
      router.push("/dashboard/requests/new");
    }
  }, [pathname, router]);

  const handleSearchFocus = useCallback(() => {
    // Focus the search input if it exists on the page
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[type="search"], input[placeholder*="Search" i], input[aria-label*="Search" i]'
    );
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Cmd+K or Ctrl+K - Command palette (works everywhere)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onCommandPalette?.();
        return;
      }

      // Don't trigger shortcuts when typing in inputs (except Cmd+K above)
      if (isInputFocused) {
        // Allow Esc to blur inputs
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      // G key - Enter "go to" mode
      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        gKeyPressedRef.current = true;

        // Clear any existing timeout
        if (gKeyTimeoutRef.current) {
          clearTimeout(gKeyTimeoutRef.current);
        }

        // Reset G mode after 1 second
        gKeyTimeoutRef.current = setTimeout(() => {
          gKeyPressedRef.current = false;
        }, 1000);
        return;
      }

      // If G was pressed, check for navigation keys
      if (gKeyPressedRef.current) {
        e.preventDefault();
        handleGoToNavigation(e.key.toLowerCase());
        gKeyPressedRef.current = false;
        if (gKeyTimeoutRef.current) {
          clearTimeout(gKeyTimeoutRef.current);
        }
        return;
      }

      // N - New (context-aware)
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        handleNewAction();
        return;
      }

      // / - Focus search
      if (e.key === "/") {
        e.preventDefault();
        handleSearchFocus();
        return;
      }

      // ? - Show shortcuts help
      if (e.key === "?") {
        e.preventDefault();
        onHelp?.();
        return;
      }

      // Custom shortcuts
      for (const shortcut of shortcuts) {
        const modifierMatch =
          (!shortcut.modifier && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) ||
          (shortcut.modifier === "cmd" && e.metaKey) ||
          (shortcut.modifier === "ctrl" && e.ctrlKey) ||
          (shortcut.modifier === "alt" && e.altKey) ||
          (shortcut.modifier === "shift" && e.shiftKey);

        if (modifierMatch && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (gKeyTimeoutRef.current) {
        clearTimeout(gKeyTimeoutRef.current);
      }
    };
  }, [shortcuts, onCommandPalette, onHelp, handleGoToNavigation, handleNewAction, handleSearchFocus]);
}
