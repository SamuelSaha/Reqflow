/**
 * Container Component - Responsive wrapper with max-width and padding
 * Mobile-first: adapts padding from px-4 → px-6 → px-8
 * Max-width: 1280px on large screens
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide" | "full";
  noPadding?: boolean;
}

const sizeClasses = {
  narrow: "max-w-3xl", // 768px - for text-heavy content
  default: "max-w-7xl", // 1280px - standard container
  wide: "max-w-screen-2xl", // 1536px - extra wide
  full: "max-w-full", // No max-width constraint
};

export function Container({
  children,
  className,
  size = "default",
  noPadding = false,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        sizeClasses[size],
        !noPadding && "container-padding", // Uses CSS custom property
        className
      )}
    >
      {children}
    </div>
  );
}
