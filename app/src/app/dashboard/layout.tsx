"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, CheckSquare, LayoutDashboard, Wallet, FlaskConical, Calendar, Settings, Building2, Menu, Package, Receipt } from "lucide-react";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNavigationPrefetch } from "@/hooks/useNavigationPrefetch";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CommandPalette } from "@/components/ui/command-palette";
import { KeyboardShortcutsHelp } from "@/components/ui/keyboard-shortcuts-help";

// Skip SSR for NotificationBell — Radix DropdownMenu generates mismatched
// IDs between server and client. No SEO value in a notification bell anyway.
const NotificationBell = dynamic(
  () => import("@/components/notifications/NotificationBell").then((m) => m.NotificationBell),
  { ssr: false, loading: () => <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" /> }
);

// Note: route segment config (dynamic = "force-dynamic") only works in Server Components

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/requests", label: "Requests", icon: FileText, exact: false },
  { href: "/dashboard/approvals", label: "Approvals", icon: CheckSquare, exact: false },
  { href: "/dashboard/trials", label: "Trials", icon: FlaskConical, exact: false },
  { href: "/dashboard/renewals", label: "Renewals", icon: Calendar, exact: false },
  { href: "/dashboard/budgets", label: "Budgets", icon: Wallet, exact: false },
  { href: "/dashboard/subscriptions", label: "Subscriptions", icon: Package, exact: false },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt, exact: false },
  { href: "/dashboard/vendors", label: "Vendors", icon: Building2, exact: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { prefetch } = useNavigationPrefetch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

  // Prefetch likely next pages on mount
  useNavigationPrefetchOnMount(prefetch, pathname);

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onCommandPalette: () => setCommandPaletteOpen(true),
    onHelp: () => setShortcutsHelpOpen(true),
  });

  return (
    <div className="min-h-screen bg-[var(--warm-50)] dashboard-bg">
      {/* Skip navigation for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-blue-600 focus:font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>

      {/* Top nav */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-slate-900">
              Reqflow
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 ml-10 overflow-x-auto scrollbar-hide">
              {navItems.map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact
                  ? pathname === href
                  : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onMouseEnter={() => prefetch(href)}
                    className={`shrink-0 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link
                href="/dashboard/settings"
                onMouseEnter={() => prefetch("/dashboard/settings")}
                className={`hidden md:flex items-center justify-center h-10 w-10 rounded-xl transition-colors ${
                  pathname.startsWith("/dashboard/settings")
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>

              {/* Mobile hamburger */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden h-10 w-10 p-0"
                  suppressHydrationWarning
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  {[...navItems, { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false }].map(({ href, label, icon: Icon, exact }) => {
                    const isActive = exact
                      ? pathname === href
                      : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 text-sm font-medium px-3 py-3 rounded-xl transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        <ErrorBoundary>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Command palette (Cmd+K) */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

      {/* Keyboard shortcuts help (?) */}
      <KeyboardShortcutsHelp open={shortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen} />
    </div>
  );
}

/**
 * Prefetch likely navigation targets based on current page
 */
function useNavigationPrefetchOnMount(
  prefetch: (href: string) => void,
  pathname: string
) {
   
  // Prefetch common destinations based on current page
  const prefetchMap: Record<string, string[]> = {
    "/dashboard": ["/dashboard/requests", "/dashboard/approvals"],
    "/dashboard/requests": ["/dashboard/requests/new", "/dashboard/approvals"],
    "/dashboard/approvals": ["/dashboard/requests", "/dashboard/trials"],
    "/dashboard/trials": ["/dashboard/approvals", "/dashboard/renewals"],
    "/dashboard/renewals": ["/dashboard/trials", "/dashboard/subscriptions"],
    "/dashboard/budgets": ["/dashboard/settings/budgets", "/dashboard/subscriptions"],
    "/dashboard/subscriptions": ["/dashboard/budgets", "/dashboard/invoices"],
    "/dashboard/invoices": ["/dashboard/subscriptions", "/dashboard/vendors"],
    "/dashboard/vendors": ["/dashboard/vendors/new", "/dashboard/requests"],
    "/dashboard/settings": ["/dashboard/settings/team", "/dashboard/settings/workflows"],
  };

   
  const routesToPrefetch = prefetchMap[pathname] || [];

  // Prefetch after short delay to avoid blocking initial render
  if (typeof window !== "undefined") {
    setTimeout(() => {
      routesToPrefetch.forEach(prefetch);
    }, 300);
  }
}
