/**
 * Hero Section - BEAST MODE EDITION
 * Premium conversion-optimized design with:
 * - Visual hierarchy amplification
 * - Product showcase integration
 * - Advanced micro-interactions
 * - Social proof at decision moments
 * - Grid-based responsive layout
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PrimaryCta, SecondaryCta, CtaGroup, TertiaryCta } from "@/components/ui/cta-button";
import { SocialProofGroup, UserCount, NoCreditCard } from "@/components/marketing/SocialProof";
import {
  Sparkles,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  TrendingDown,
  TriangleAlert,
  X,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Hero Section - Premium Edition with Product Showcase             */
/* ------------------------------------------------------------------ */
export function HeroSection() {
  return (
    <Section
      background="warm"
      className="relative overflow-hidden"
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/30 pointer-events-none" />

      <Container size="default" className="relative">
        <div className="grid grid-cols-1 gap-12 lg:gap-16 py-20 lg:py-24">
          {/* Content Section */}
          <div className="grid grid-cols-1 gap-8 text-center max-w-4xl mx-auto">
            {/* Trust Badge with Icon */}
            <div className="flex justify-center animate-in fade-in slide-in-from-top duration-500">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-900">
                  Free during early access
                </span>
                <span className="text-sm text-emerald-600">•</span>
                <span className="text-sm text-emerald-700">
                  No credit card required
                </span>
              </div>
            </div>

            {/* Headline with emphasis */}
            <div className="space-y-6 animate-in fade-in slide-in-from-top duration-700 delay-100">
              <h1 className="text-hero text-slate-900 leading-[1.1]">
                Procurement for teams that{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">move too fast</span>
                  <span className="absolute bottom-2 left-0 right-0 h-3 bg-blue-200/60 -rotate-1" />
                </span>
                {" "}for spreadsheets
              </h1>

              {/* Enhanced subheadline with benefits */}
              <p className="text-body-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Replace Slack chaos with a real purchasing workflow. Track budgets, manage vendors,
                catch renewals—all in one place. <span className="font-semibold text-slate-700">Built for teams of 5-50.</span>
              </p>
            </div>

            {/* Quick wins - Value props */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm animate-in fade-in slide-in-from-top duration-700 delay-200">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">2-minute setup</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Instant approvals</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Budget guardrails</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Never miss renewals</span>
              </div>
            </div>

            {/* CTAs with enhanced spacing */}
            <div className="space-y-6 animate-in fade-in slide-in-from-top duration-700 delay-300">
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

              {/* Social proof directly under CTAs */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-6 flex-wrap justify-center">
                  <UserCount count={500} size="md" />
                  <div className="h-4 w-px bg-slate-300" />
                  <NoCreditCard size="md" additionalText="Cancel anytime" />
                </div>
              </div>

              {/* Tertiary action */}
              <div className="pt-2">
                <TertiaryCta
                  href="/demo"
                  analyticsEvent="hero_watch_demo"
                >
                  Watch 2-min demo →
                </TertiaryCta>
              </div>
            </div>
          </div>

          {/* Product Showcase - Elevated design */}
          <div className="relative max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
            {/* Glow effect behind mockup */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-transparent to-transparent blur-3xl -z-10 scale-150" />

            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80 bg-white">
              {/* Browser chrome */}
              <div className="h-12 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="w-3 h-3 bg-amber-400 rounded-full" />
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg h-8 px-4">
                  <Shield className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-slate-600">
                    app.reqflow.com/dashboard
                  </span>
                </div>
                <div className="w-[68px]" />
              </div>

              {/* Dashboard mockup with real metrics */}
              <div className="bg-gradient-to-br from-slate-50 to-white p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Metric Cards */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          €127K
                        </div>
                        <div className="text-sm font-medium text-slate-600">
                          Monthly Spend
                        </div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="text-xs font-semibold text-green-600">
                        ↓ 12% vs last month
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          3.2h
                        </div>
                        <div className="text-sm font-medium text-slate-600">
                          Avg. Approval Time
                        </div>
                      </div>
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="text-xs font-semibold text-green-600">
                        ↓ 40% improvement
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          94%
                        </div>
                        <div className="text-sm font-medium text-slate-600">
                          Budget Compliance
                        </div>
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="text-xs font-semibold text-green-600">
                        ✓ On target
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Requests Table Preview */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="text-base font-semibold text-slate-900">
                      Recent Requests
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          GH
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">GitHub Copilot</div>
                          <div className="text-sm text-slate-600">GitHub • Engineering</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">€2,736/yr</div>
                          <div className="text-xs text-slate-600">20 seats</div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Approved
                        </span>
                      </div>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          FG
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">Figma Enterprise</div>
                          <div className="text-sm text-slate-600">Figma • Design</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">€8,400/yr</div>
                          <div className="text-xs text-slate-600">15 seats</div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            </div>
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
