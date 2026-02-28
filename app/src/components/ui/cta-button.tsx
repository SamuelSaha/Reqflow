/**
 * CTA Button Components - Conversion-optimized call-to-action buttons
 * Follows 3-tier hierarchy: Primary > Secondary > Tertiary
 */

import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/* ============================================
   PRIMARY CTA - Main conversion action
   ============================================ */
interface PrimaryCtaProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: "arrow" | "sparkle" | "none";
  size?: "default" | "large";
  className?: string;
  fullWidth?: boolean;
  analyticsEvent?: string;
}

export function PrimaryCta({
  children,
  href,
  onClick,
  icon = "arrow",
  size = "default",
  className,
  fullWidth = false,
  analyticsEvent,
}: PrimaryCtaProps) {
  const handleClick = () => {
    // Track analytics event
    if (analyticsEvent && typeof window !== "undefined") {
      window.gtag?.("event", analyticsEvent, {
        event_category: "CTA",
        event_label: children?.toString() || "Primary CTA",
      });
    }
    onClick?.();
  };

  const baseClasses = cn(
    // Layout
    "inline-flex items-center justify-center gap-2",
    "touch-target", // 44px minimum from responsive system

    // Typography
    "font-manrope font-semibold", // Manrope 600
    "text-sm",

    // Colors
    "bg-blue-600 text-white",
    "hover:bg-blue-700",
    "focus:bg-blue-700",
    "active:bg-blue-800",

    // Effects - Subtle, premium hover (no scale, just shadow)
    "shadow-sm",
    "transition-all duration-200 ease-out",
    "hover:shadow-md",
    "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",

    // Spacing - Standard sizing
    size === "large" ? "px-6 py-2" : "px-5 py-2",

    // Shape
    "rounded-lg",

    // Width
    fullWidth && "w-full",

    className
  );

  const IconComponent = icon === "arrow" ? ArrowRight : icon === "sparkle" ? Sparkles : null;

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={handleClick}>
        {children}
        {IconComponent && <IconComponent className="w-4 h-4" />}
      </Link>
    );
  }

  return (
    <button className={baseClasses} onClick={handleClick}>
      {children}
      {IconComponent && <IconComponent className="w-4 h-4" />}
    </button>
  );
}

/* ============================================
   SECONDARY CTA - Lower commitment action
   ============================================ */
interface SecondaryCtaProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  size?: "default" | "large";
  className?: string;
  fullWidth?: boolean;
  analyticsEvent?: string;
}

export function SecondaryCta({
  children,
  href,
  onClick,
  size = "default",
  className,
  fullWidth = false,
  analyticsEvent,
}: SecondaryCtaProps) {
  const handleClick = () => {
    // Track analytics event
    if (analyticsEvent && typeof window !== "undefined") {
      window.gtag?.("event", analyticsEvent, {
        event_category: "CTA",
        event_label: children?.toString() || "Secondary CTA",
      });
    }
    onClick?.();
  };

  const baseClasses = cn(
    // Layout
    "inline-flex items-center justify-center gap-2",
    "touch-target", // 44px minimum

    // Typography
    "font-manrope font-semibold",
    size === "large" ? "text-base" : "text-sm",

    // Colors
    "bg-white text-slate-900",
    "border-2 border-slate-300",
    "hover:bg-slate-50 hover:border-slate-400",
    "focus:bg-slate-50",
    "active:bg-slate-100",

    // Effects
    "transition-all duration-150 ease-in-out",
    "hover:scale-105 hover:shadow-md",
    "active:scale-95",
    "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",

    // Spacing
    size === "large" ? "px-8 py-4" : "px-6 py-3",

    // Shape
    "rounded-lg",

    // Width
    fullWidth && "w-full",

    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} onClick={handleClick}>
      {children}
    </button>
  );
}

/* ============================================
   TERTIARY CTA - Text link action
   ============================================ */
interface TertiaryCtaProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  analyticsEvent?: string;
}

export function TertiaryCta({
  children,
  href,
  onClick,
  className,
  analyticsEvent,
}: TertiaryCtaProps) {
  const handleClick = () => {
    // Track analytics event
    if (analyticsEvent && typeof window !== "undefined") {
      window.gtag?.("event", analyticsEvent, {
        event_category: "CTA",
        event_label: children?.toString() || "Tertiary CTA",
      });
    }
    onClick?.();
  };

  const baseClasses = cn(
    // Layout
    "inline-flex items-center gap-1",
    "touch-target", // 44px minimum

    // Typography
    "font-manrope font-medium text-sm",

    // Colors
    "text-slate-600 hover:text-blue-600",

    // Effects
    "transition-colors duration-150 ease-in-out",
    "underline decoration-transparent hover:decoration-blue-600 underline-offset-4",
    "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:rounded",

    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} onClick={handleClick}>
      {children}
    </button>
  );
}

/* ============================================
   CTA GROUP - Multiple CTAs side by side
   ============================================ */
interface CtaGroupProps {
  children: ReactNode;
  alignment?: "left" | "center" | "right";
  stack?: boolean;
  className?: string;
}

export function CtaGroup({
  children,
  alignment = "left",
  stack = false,
  className,
}: CtaGroupProps) {
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div
      className={cn(
        "flex gap-4",
        stack ? "flex-col items-stretch" : "flex-col sm:flex-row sm:items-center",
        alignmentClasses[alignment],
        className
      )}
    >
      {children}
    </div>
  );
}
