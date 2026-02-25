"use client";

import { PageShell } from "@/components/layout";
import {
  CoreFeatures,
  PersonaSection,
} from "@/components/landing/FeaturesSection";
import { CaseBuilderShowcase } from "@/components/landing/CaseBuilderSection";
import { FeaturesGrid } from "@/components/landing/GridSection";
import { FinalCTA } from "@/components/landing/BottomSection";

export default function FeaturesPage() {
  return (
    <PageShell>
      <section className="bg-gradient-to-b from-white to-slate-50 pt-20 pb-12 px-20 text-center">
        <h1 className="text-[52px] font-extrabold tracking-[-1.5px] text-slate-900 mb-4">
          Everything your team needs to buy smarter
        </h1>
        <p className="text-[18px] text-slate-600 max-w-[620px] mx-auto">
          From request to payment, Reqflow handles the full procurement workflow
          so your team can focus on what matters.
        </p>
      </section>
      <CoreFeatures />
      <CaseBuilderShowcase />
      <PersonaSection />
      <FeaturesGrid />
      <FinalCTA />
    </PageShell>
  );
}
