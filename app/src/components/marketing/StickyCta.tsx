/**
 * Sticky CTA Bar - Appears after scrolling past hero
 * Conversion psychology: Keep primary action visible during scroll
 */

"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { PrimaryCta, SecondaryCta } from "../ui/cta-button";

interface StickyCtaProps {
  primaryText?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
  showAfterScroll?: number; // px scrolled before showing
  dismissible?: boolean;
  className?: string;
}

export function StickyCta({
  primaryText = "Start Free Trial",
  primaryHref = "/signup",
  secondaryText = "Book a Demo",
  secondaryHref = "/contact",
  showAfterScroll = 600, // Show after scrolling past hero
  dismissible = true,
  className,
}: StickyCtaProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user dismissed in this session
    const dismissed = sessionStorage.getItem("sticky-cta-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > showAfterScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("sticky-cta-dismissed", "true");
  };

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        // Position
        "fixed bottom-0 left-0 right-0 z-50",

        // Layout
        "border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-2xl",

        // Animation
        "animate-in slide-in-from-bottom duration-300",

        className
      )}
    >
      <div className="container-padding mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Left: Value prop */}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-900">
              Ready to streamline your procurement?
            </p>
            <p className="text-xs text-slate-600">
              No credit card required • Free 14-day trial
            </p>
          </div>

          {/* Center/Right: CTAs */}
          <div className="flex flex-1 items-center justify-end gap-3 md:flex-initial">
            <SecondaryCta
              href={secondaryHref}
              size="default"
              className="hidden sm:inline-flex"
              analyticsEvent="sticky_cta_secondary_click"
            >
              {secondaryText}
            </SecondaryCta>

            <PrimaryCta
              href={primaryHref}
              size="default"
              icon="arrow"
              analyticsEvent="sticky_cta_primary_click"
            >
              {primaryText}
            </PrimaryCta>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className={cn(
                  "p-2 text-slate-400 hover:text-slate-600",
                  "transition-colors rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-slate-400"
                )}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
