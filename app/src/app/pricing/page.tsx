"use client";

import { PageShell } from "@/components/layout";
import { Pricing, FAQ, FinalCTA } from "@/components/landing/BottomSection";

// Note: metadata export doesn't work in client components
// Metadata is set via layout.tsx template: "Pricing | Reqflow"

export default function PricingPage() {
  return (
    <PageShell>
      <Pricing />
      <FAQ />
      <FinalCTA />
    </PageShell>
  );
}
