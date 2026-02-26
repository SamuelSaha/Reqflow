/**
 * Hero Section - Updated to match issue #56 requirements
 * - Warm background (cream/beige)
 * - Grid-based centered layout
 * - Responsive typography system
 * - CTA components with analytics
 * - Social proof integration
 * - 70-80vh height
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PrimaryCta, SecondaryCta, CtaGroup } from "@/components/ui/cta-button";
import { SocialProofGroup } from "@/components/marketing/SocialProof";
import {
  TriangleAlert,
  X,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Hero Section - Issue #56 Spec                                     */
/* ------------------------------------------------------------------ */
export function HeroSection() {
  return (
    <Section
      background="warm"
      className="min-h-[80vh] flex items-center justify-center"
    >
      <Container size="narrow">
        {/* Grid-based layout for content organization */}
        <div className="grid grid-cols-1 gap-8 text-center">
          {/* Badge - Optional */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-700">
                Free during early access • No card needed
              </span>
            </div>
          </div>

          {/* Headline - Responsive typography */}
          <div className="space-y-4">
            <h1 className="text-hero text-slate-900">
              The connected procurement workflow for small teams
            </h1>

            {/* Subheadline - Responsive typography */}
            <p className="text-body-lg text-slate-600 max-w-2xl mx-auto">
              Streamline vendor management, budget tracking, and renewals in one place.
              Never miss a deadline. Never overspend.
            </p>
          </div>

          {/* CTAs - Using new CTA components */}
          <div className="space-y-6">
            <CtaGroup alignment="center">
              <PrimaryCta
                href="/signup"
                size="large"
                icon="arrow"
                analyticsEvent="hero_primary_click"
              >
                Start Free Trial
              </PrimaryCta>
              <SecondaryCta
                href="/contact"
                size="large"
                analyticsEvent="hero_secondary_click"
              >
                Book a Demo
              </SecondaryCta>
            </CtaGroup>

            {/* Social Proof - Trust signals */}
            <SocialProofGroup
              userCount={500}
              rating={{ rating: 4.9, reviews: 127 }}
              showNoCreditCard
              alignment="center"
              size="md"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust Logos                                                         */
/* ------------------------------------------------------------------ */
export function TrustLogos() {
  const logos = ["Doctolib", "Qonto", "Alan", "Pennylane", "Swile", "Spendesk"];

  return (
    <section className="bg-white py-10 px-20 flex flex-col items-center gap-6">
      <span className="text-[12px] font-semibold text-slate-400 tracking-[1.5px] uppercase">
        BUILT FOR FAST-MOVING TEAMS WHO BUY WITHOUT A PROCUREMENT DEPARTMENT
      </span>
      <div className="flex items-center justify-center gap-16">
        {logos.map((name) => (
          <span
            key={name}
            className="text-[18px] font-bold text-slate-300 select-none"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Problem Section                                                    */
/* ------------------------------------------------------------------ */

const beforeSteps = [
  'Someone drops a Slack message: "Can I buy this tool?"',
  'Founder replies three hours later: "Ask ops"',
  "Ops lead is buried in other work, sees it next day",
  "Nobody checks if the team already pays for something similar",
  "Purchase happens on a shared card with no record",
  "Invoice shows up. Nobody remembers approving it.",
];

const afterSteps = [
  "Team member submits a request in Slack or a quick web form",
  "Reqflow flags duplicates and fills in the details automatically",
  "Request routes to the right person on your team instantly",
  "Approver sees full context, approves with one click",
  "PO created. Spend logged. Audit trail saved.",
  "Done. Your team's spend is tracked in real time.",
];

const painStats = [
  { value: "40-60%", label: "of purchases bypass any formal process" },
  { value: "29%", label: "of SaaS subscriptions overlap or duplicate" },
  { value: "8.3 hrs", label: "per week lost to manual procurement tasks" },
  { value: "$15-40", label: "cost to process one invoice manually" },
];

export function ProblemSection() {
  return (
    <section className="bg-gradient-to-b from-white via-slate-50 to-white py-24 px-20 flex flex-col items-center gap-16">
      <div className="max-w-[700px] flex flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-red-50 rounded-full px-3.5 py-1.5">
          <TriangleAlert className="w-3.5 h-3.5 text-red-600" />
          <span className="text-[13px] font-semibold text-red-600">
            The Problem
          </span>
        </div>

        <h2 className="text-[44px] font-bold leading-[1.15] tracking-tight text-slate-900">
          Your team buys tools on a shared card and hopes someone is tracking it.
        </h2>

        <p className="text-[18px] leading-relaxed text-slate-600 max-w-[620px]">
          No procurement team. No formal process. Just Slack messages, a shared
          credit card, and a founder who finds surprise charges every month.
          Sound familiar?
        </p>
      </div>

      <div className="max-w-[1200px] w-full grid grid-cols-2 gap-8">
        {/* Before */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md">
          <div className="inline-flex items-center gap-1.5 mb-4">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-3 h-3 text-red-600" />
            </div>
            <span className="text-[13px] font-semibold text-red-600">
              Without Reqflow
            </span>
          </div>
          <h3 className="text-[22px] font-bold text-slate-900 mb-6">
            A week to approve a $200 tool for a 20-person team
          </h3>
          <div className="flex flex-col gap-4">
            {beforeSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[13px] font-semibold text-red-600">
                    {i + 1}
                  </span>
                </div>
                <span className="text-[15px] leading-relaxed text-slate-600 pt-0.5">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* After */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md">
          <div className="inline-flex items-center gap-1.5 mb-4">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-[13px] font-semibold text-green-600">
              With Reqflow
            </span>
          </div>
          <h3 className="text-[22px] font-bold text-slate-900 mb-6">
            Under 2 hours. Every time. Zero confusion.
          </h3>
          <div className="flex flex-col gap-4">
            {afterSteps.map((step, i) => {
              const isLast = i === afterSteps.length - 1;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-semibold text-green-600">
                      {i + 1}
                    </span>
                  </div>
                  <span
                    className={`text-[15px] leading-relaxed pt-0.5 ${
                      isLast ? "font-bold text-green-600" : "text-slate-600"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] w-full grid grid-cols-4 gap-6">
        {painStats.map((stat) => (
          <div
            key={stat.value}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center gap-2"
          >
            <span className="text-[28px] font-bold text-red-600 tracking-tight">
              {stat.value}
            </span>
            <span className="text-[13px] font-medium text-slate-600 text-center">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
