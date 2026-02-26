/**
 * Section Component - Full-width section with responsive padding
 * Mobile-first: adapts padding from py-12 → py-16 → py-24 → py-32
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Container } from "./Container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  background?: "white" | "warm" | "slate" | "dark" | "none";
  containerSize?: "default" | "narrow" | "wide" | "full";
  noPadding?: boolean;
}

const backgroundClasses = {
  white: "bg-white",
  warm: "bg-[var(--warm-50)]",
  slate: "bg-slate-50",
  dark: "bg-slate-900 text-white",
  none: "",
};

export function Section({
  children,
  className,
  containerClassName,
  background = "none",
  containerSize = "default",
  noPadding = false,
}: SectionProps) {
  return (
    <section
      className={cn(
        "w-full",
        backgroundClasses[background],
        !noPadding && "section-padding", // Uses CSS custom property
        className
      )}
    >
      <Container size={containerSize} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}
