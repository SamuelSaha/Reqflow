"use client";

import { PageShell } from "@/components/layout";
import { Integrations } from "@/components/landing/GridSection";
import { FinalCTA } from "@/components/landing/BottomSection";

export default function IntegrationsPage() {
  return (
    <PageShell>
      <section className="bg-gradient-to-b from-white to-slate-50 pt-20 pb-12 px-20 text-center">
        <h1 className="text-h2 font-extrabold tracking-[-1.5px] text-slate-900 mb-4">
          Connects with your existing stack
        </h1>
        <p className="text-body-lg text-slate-600 max-w-[620px] mx-auto">
          One-click integrations with the tools your team already uses. No
          manual data entry required.
        </p>
      </section>
      <Integrations />
      <FinalCTA />
    </PageShell>
  );
}
