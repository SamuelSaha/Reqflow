"use client";

/**
 * Mobile Sticky CTA Bar
 * Appears at bottom of viewport on mobile when user scrolls past hero
 * Increases mobile conversion by keeping signup CTA visible
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling 600px (past hero section)
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)", // iOS safe area
      }}
    >
      {/* Gradient fade for visual transition */}
      <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      {/* CTA Bar */}
      <div className="bg-white border-t border-slate-200 shadow-lg px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Primary CTA - Consistent wording */}
          <Link
            href="/signup"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm touch-target"
            onClick={() => {
              // Track mobile sticky CTA click
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'mobile_sticky_cta_click', {
                  cta_type: 'signup',
                  location: 'sticky_bottom',
                });
              }
            }}
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
