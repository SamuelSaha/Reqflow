"use client";

/**
 * Use Case Tabs - Mistral-inspired
 * Department-specific examples showing how different teams use Reqflow
 */

import { useState } from "react";
import { DollarSign, Users, Code, Scale, Briefcase, TrendingUp, Package } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const useCases = [
  {
    id: "finance",
    icon: DollarSign,
    title: "Finance",
    scenario: "Month-end close with zero invoice surprises",
    challenge: "Finance team spent 6 hours reconciling invoices that didn't match purchase orders.",
    solution: "With Reqflow, every invoice is pre-approved. POs are auto-generated. Reconciliation takes 20 minutes.",
    outcome: "94% of invoices match POs perfectly",
    savings: "€16K/year in finance labor saved",
  },
  {
    id: "operations",
    icon: Briefcase,
    title: "Operations",
    scenario: "Onboarding new employees without procurement chaos",
    challenge: "New hire needs laptop, software, phone. Ops lead chases approvals across Slack for 3 days.",
    solution: "Reqflow has pre-approved 'New Hire Package' template. One-click submission, auto-routed approval, done in 2 hours.",
    outcome: "<2 hour approval time for standard requests",
    savings: "Zero onboarding delays",
  },
  {
    id: "engineering",
    icon: Code,
    title: "Engineering",
    scenario: "Engineers buying tools without budget surprises",
    challenge: "Engineering blew through Q1 budget in 6 weeks buying dev tools. No one knew until month-end.",
    solution: "Reqflow tracks engineering budget in real-time. Soft warning at 80%, hard stop at 100%. Duplicate tool detection.",
    outcome: "<2% budget variance (vs 23% industry avg)",
    savings: "€25K saved by catching duplicate tools",
  },
  {
    id: "legal",
    icon: Scale,
    title: "Legal",
    scenario: "Contract renewal tracking without missed deadlines",
    challenge: "Legal team missed 60-day cancellation window on €50K contract. Locked in for another year.",
    solution: "Reqflow tracks notice windows (not just renewal dates). Legal gets alerted 90/60/30 days before window closes.",
    outcome: "Zero missed cancellation windows",
    savings: "€50K saved from unwanted auto-renewals",
  },
  {
    id: "sales",
    icon: TrendingUp,
    title: "Sales",
    scenario: "Sales tools procurement without finance bottlenecks",
    challenge: "Sales leader wants to buy €12K/year CRM seats. Approval takes 5 days, deal momentum lost.",
    solution: "Reqflow routes to CFO automatically (>€10K threshold). CFO approves in Slack in 20 minutes.",
    outcome: "Same-day approval for time-sensitive deals",
    savings: "Faster deal closure, happier sales team",
  },
  {
    id: "hr",
    icon: Users,
    title: "HR",
    scenario: "Managing employee benefit subscriptions at scale",
    challenge: "HR manages 15 different SaaS tools for benefits. Can't track who owns what or when things renew.",
    solution: "Reqflow centralizes all HR SaaS subscriptions. Ownership, renewal dates, and spend in one dashboard.",
    outcome: "100% of tools have an owner and renewal date",
    savings: "€8K saved by consolidating duplicate tools",
  },
  {
    id: "procurement",
    icon: Package,
    title: "Procurement",
    scenario: "Professional procurement for teams without a procurement department",
    challenge: "You're the 'procurement team' but also the ops lead. Tracking everything in spreadsheets.",
    solution: "Reqflow IS your procurement department. Automated workflows, budget tracking, vendor management—all in one place.",
    outcome: "95% of purchases tracked, zero spreadsheets",
    savings: "8.3 hours/week recovered (€16K/year value)",
  },
];

export function UseCaseTabs() {
  const [activeTab, setActiveTab] = useState(useCases[0].id);
  const activeCase = useCases.find(c => c.id === activeTab) || useCases[0];

  return (
    <Section background="warm" className="relative">
      <Container size="default">
        <div className="py-16 md:py-20 lg:py-24">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-h2 text-slate-900 mb-4">
              Built for every team
            </h2>
            <p className="text-body-lg text-slate-600">
              See how different departments use Reqflow to solve their specific procurement challenges.
            </p>
          </div>

          {/* Vertical Tab Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left: Tab Navigation (Vertical on desktop, horizontal scroll on mobile) */}
            <div className="lg:col-span-1">
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
                {useCases.map((useCase) => {
                  const Icon = useCase.icon;
                  const isActive = activeTab === useCase.id;

                  return (
                    <button
                      key={useCase.id}
                      onClick={() => setActiveTab(useCase.id)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-body-sm
                        transition-all duration-150 ease-out whitespace-nowrap lg:whitespace-normal
                        ${isActive
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }
                      `}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`panel-${useCase.id}`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} aria-hidden="true" />
                      <span>{useCase.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Tab Content Panel */}
            <div className="lg:col-span-3">
              <div
                id={`panel-${activeCase.id}`}
                role="tabpanel"
                className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm h-full"
              >
                <div className="space-y-6">
                  {/* Scenario */}
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 mb-4">
                      <activeCase.icon className="w-4 h-4 text-blue-600" />
                      <span className="text-caption text-blue-900">{activeCase.title} Team</span>
                    </div>
                    <h3 className="text-h4 text-slate-900 mb-3">
                      {activeCase.scenario}
                    </h3>
                  </div>

                  {/* Challenge */}
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="text-body-sm font-semibold text-red-900 mb-1">
                      The Problem:
                    </div>
                    <p className="text-body text-red-800">
                      {activeCase.challenge}
                    </p>
                  </div>

                  {/* Solution */}
                  <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
                    <div className="text-body-sm font-semibold text-teal-900 mb-1">
                      With Reqflow:
                    </div>
                    <p className="text-body text-teal-800">
                      {activeCase.solution}
                    </p>
                  </div>

                  {/* Outcomes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-5">
                      <div className="text-caption text-slate-500 mb-2">OUTCOME</div>
                      <div className="text-body font-semibold text-slate-900">
                        {activeCase.outcome}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-teal-50 border border-amber-200 rounded-xl p-5">
                      <div className="text-caption text-amber-700 mb-2">IMPACT</div>
                      <div className="text-body font-semibold text-slate-900">
                        {activeCase.savings}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
