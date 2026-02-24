"use client";

import { PageShell } from "@/components/layout";
import { Pricing, FAQ, FinalCTA } from "@/components/landing/BottomSection";

export default function PricingPage() {
  return (
    <PageShell>
      <Pricing />
      <FAQ />
      <FinalCTA />
    </PageShell>
  );
}
