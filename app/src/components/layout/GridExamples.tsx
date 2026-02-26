/**
 * Grid Component Examples - Responsive grid patterns
 * All grids are mobile-first and transform at breakpoints
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* ============================================
   FEATURE GRID (1 → 2 → 3 columns)
   ============================================ */
interface FeatureGridProps {
  children: ReactNode;
  className?: string;
}

export function FeatureGrid({ children, className }: FeatureGridProps) {
  return (
    <div className={cn("grid-features", className)}>
      {children}
    </div>
  );
}

/* ============================================
   LOGO GRID (2 → 4 → 6 columns)
   ============================================ */
interface LogoGridProps {
  children: ReactNode;
  className?: string;
}

export function LogoGrid({ children, className }: LogoGridProps) {
  return (
    <div className={cn("grid-logos", className)}>
      {children}
    </div>
  );
}

/* ============================================
   FOOTER GRID (1 → 2 → 4 columns)
   ============================================ */
interface FooterGridProps {
  children: ReactNode;
  className?: string;
}

export function FooterGrid({ children, className }: FooterGridProps) {
  return (
    <div className={cn("grid-footer", className)}>
      {children}
    </div>
  );
}

/* ============================================
   PRICING GRID (Stack → 3 columns)
   ============================================ */
interface PricingGridProps {
  children: ReactNode;
  className?: string;
}

export function PricingGrid({ children, className }: PricingGridProps) {
  return (
    <div className={cn("grid-pricing", className)}>
      {children}
    </div>
  );
}

/* ============================================
   ASYMMETRIC GRID (1 col → 60/40 split)
   ============================================ */
interface AsymmetricGridProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}

export function AsymmetricGrid({
  children,
  className,
  reverse = false,
}: AsymmetricGridProps) {
  return (
    <div
      className={cn(
        "grid-asymmetric",
        reverse && "lg:grid-cols-[2fr_3fr]",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ============================================
   FLEXIBLE GRID (Custom columns at breakpoints)
   ============================================ */
interface FlexibleGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: 1 | 2;
    tablet?: 2 | 3 | 4;
    desktop?: 2 | 3 | 4 | 5 | 6;
  };
  gap?: "sm" | "md" | "lg";
}

const gapClasses = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export function FlexibleGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md",
}: FlexibleGridProps) {
  const mobileClass = `grid-cols-${cols.mobile || 1}`;
  const tabletClass = cols.tablet ? `md:grid-cols-${cols.tablet}` : "";
  const desktopClass = cols.desktop ? `lg:grid-cols-${cols.desktop}` : "";

  return (
    <div
      className={cn(
        "grid",
        mobileClass,
        tabletClass,
        desktopClass,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
