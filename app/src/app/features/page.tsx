"use client";

import { MarketingNav } from '@/components/marketing/nav/MarketingNav';
import { MarketingFooter } from '@/components/marketing/footer/MarketingFooter';
import {
  CoreFeatures,
  PersonaSection,
} from "@/components/landing/FeaturesSection";
import { CaseBuilderShowcase } from "@/components/landing/CaseBuilderSection";
import { FeaturesGrid } from "@/components/landing/GridSection";
import { FinalCTA } from "@/components/landing/BottomSection";

export default function FeaturesPage() {
  return (
    <><MarketingNav />
      <section className="bg-gradient-to-b from-white to-slate-50 min-h-[50vh] flex flex-col items-center justify-center pt-16 pb-12 px-20 text-center">
        <h1 className="text-hero font-extrabold tracking-[-1.5px] text-slate-900 mb-4">
          The connected record for every tool you buy
        </h1>
        <p className="text-body-lg text-slate-600 max-w-[620px] mx-auto">
          From first request to renewal decision, Reqflow captures why you bought
          it, who owns it, what it costs, and when you can leave - automatically.
        </p>
      </section>
      <CoreFeatures />
      <CaseBuilderShowcase />
      <PersonaSection />
      <FeaturesGrid />
      <FinalCTA />
    <MarketingFooter /></>
  );
}
