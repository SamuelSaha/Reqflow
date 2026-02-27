"use client";

/**
 * Navigation Prefetch Hook
 * Intelligently prefetches pages based on user behavior patterns
 */

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

/**
 * Prefetch strategy configuration
 */
interface PrefetchConfig {
  /** Immediate prefetch on mount (high confidence navigation) */
  immediate?: string[];
  /** Prefetch on hover with delay (medium confidence) */
  onHover?: string[];
  /** Prefetch after page idle (low confidence, non-blocking) */
  idle?: string[];
}

/**
 * Hook for intelligent navigation prefetching
 */
export function useNavigationPrefetch() {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Prefetch a single route
   */
  const prefetch = useCallback((href: string) => {
    if (href && href.startsWith("/")) {
      router.prefetch(href);
    }
  }, [router]);

  /**
   * Prefetch multiple routes with strategy
   */
  const prefetchBatch = useCallback((
    routes: string[],
    strategy: "immediate" | "idle" = "immediate"
  ) => {
    if (strategy === "immediate") {
      routes.forEach(prefetch);
    } else {
      // Idle callback for non-blocking prefetch
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => {
          routes.forEach(prefetch);
        });
      } else {
        // Fallback for Safari
        setTimeout(() => routes.forEach(prefetch), 200);
      }
    }
  }, [prefetch]);

  /**
   * Prefetch on hover with debounce
   */
  const createHoverHandler = useCallback((href: string, delay = 100) => {
    let timeoutId: NodeJS.Timeout;

    return {
      onMouseEnter: () => {
        timeoutId = setTimeout(() => prefetch(href), delay);
      },
      onMouseLeave: () => {
        clearTimeout(timeoutId);
      },
    };
  }, [prefetch]);

  return {
    prefetch,
    prefetchBatch,
    createHoverHandler,
    pathname,
  };
}
