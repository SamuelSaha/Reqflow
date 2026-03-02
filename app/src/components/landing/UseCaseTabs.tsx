"use client";

/**
 * Use Case Tabs - Mistral-inspired
 * Department-specific examples showing how different departments use Reqflow
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
    challenge: "Finance department spent 6 hours reconciling invoices that didn't match purchase orders.",
    solution: "Every invoice is pre-approved. POs are auto-generated. Reconciliation takes 20 minutes.",
    outcome: "94% of invoices match POs perfectly",
    savings: "€16K/year saved",
  },
  {
    id: "engineering",
    icon: Code,
    title: "Engineering",
    scenario: "Prevent budget overruns from tool sprawl",
    challenge: "Engineering blew through Q1 budget in 6 weeks buying dev tools. No visibility until month-end.",
    solution: "Real-time budget tracking. Soft warning at 80%, hard stop at 100%. Automatic duplicate detection.",
    outcome: "<2% budget variance",
    savings: "€25K saved by catching duplicates",
  },
  {
    id: "operations",
    icon: Briefcase,
    title: "Operations",
    scenario: "Onboard new employees without approval chaos",
    challenge: "New hire needs laptop, software, phone. Ops lead chases approvals across Slack for 3 days.",
    solution: "Pre-approved 'New Hire Package' template. One-click submission, auto-routed approval.",
    outcome: "<2 hour approval time",
    savings: "Zero onboarding delays",
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
              Built for every department
            </h2>
            <p className="text-body-lg text-slate-600">
              Real results from Finance, Engineering, and Operations departments.
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
                      onClick={() => {
                        setActiveTab(useCase.id);
                        // Track use case tab engagement
                        if (typeof window !== 'undefined' && window.gtag) {
                          window.gtag('event', 'use_case_tab_click', {
                            department: useCase.title,
                            use_case_id: useCase.id,
                          });
                        }
                      }}
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
                      <span className="text-caption text-blue-900">{activeCase.title}</span>
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
