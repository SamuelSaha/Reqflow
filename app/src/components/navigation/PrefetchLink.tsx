"use client";

/**
 * Prefetch Link Component
 * Extends Next.js Link with intelligent prefetching on hover
 */

import Link from "next/link";
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface PrefetchLinkProps extends React.ComponentProps<typeof Link> {
  /** Prefetch delay on hover in ms (default: 100) */
  prefetchDelay?: number;
  /** Prefetch strategy: 'hover' | 'visible' | 'immediate' */
  prefetchStrategy?: "hover" | "visible" | "immediate";
}

/**
 * Enhanced Link with intelligent prefetching
 */
export function PrefetchLink({
  href,
  prefetchDelay = 100,
  prefetchStrategy = "hover",
  children,
  ...props
}: PrefetchLinkProps) {
  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hasPrefetched = useRef(false);

  const doPrefetch = useCallback(() => {
    if (hasPrefetched.current) return;
    if (typeof href === "string" && href.startsWith("/")) {
      router.prefetch(href);
      hasPrefetched.current = true;
    }
  }, [router, href]);

  // Immediate prefetch
  useEffect(() => {
    if (prefetchStrategy === "immediate" && !hasPrefetched.current) {
      doPrefetch();
    }
  }, [prefetchStrategy, doPrefetch]);

  // Visible prefetch (Intersection Observer)
  useEffect(() => {
    if (prefetchStrategy !== "visible" || !linkRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          doPrefetch();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(linkRef.current);
    return () => observer.disconnect();
  }, [prefetchStrategy, doPrefetch]);

  // Hover prefetch handlers
  const handleMouseEnter = useCallback(() => {
    if (prefetchStrategy === "hover") {
      setTimeout(doPrefetch, prefetchDelay);
    }
  }, [prefetchStrategy, prefetchDelay, doPrefetch]);

  const commonProps = {
    ref: linkRef,
    onMouseEnter: handleMouseEnter,
    ...props,
  };

  return (
    <Link href={href} {...commonProps}>
      {children}
    </Link>
  );
}
