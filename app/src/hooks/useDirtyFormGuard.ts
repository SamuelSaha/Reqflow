"use client";

import { useEffect, useCallback } from "react";

/**
 * Guards against accidental navigation away from a form with unsaved changes.
 *
 * Layer 1: `beforeunload` catches browser-level navigation (refresh, close, direct URL).
 * Layer 2: `confirmNavigation` wraps in-app Next.js router.push / Link onClick calls.
 *
 * Usage:
 *   const { confirmNavigation } = useDirtyFormGuard(formState.isDirty);
 *   <Link href="/..." onClick={(e) => { e.preventDefault(); confirmNavigation(() => router.push('/...')) }}>
 */
export function useDirtyFormGuard(isDirty: boolean) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const confirmNavigation = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action();
        return;
      }
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (confirmed) action();
    },
    [isDirty]
  );

  return { confirmNavigation };
}
