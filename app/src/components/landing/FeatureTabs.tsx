"use client";

/**
 * Feature Discovery Tabs - Mistral-inspired
 * Interactive tabs showing primary capabilities with real workflow examples
 */

import { useState } from "react";
import { Workflow, PieChart, Bell, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const features = [
  {
    id: "connected-records",
    icon: Workflow,
    title: "Connected Records",
    description: "Every purchase tells its complete story - from request to renewal. Tool → Contract → Subscription → Invoice → Owner.",
    benefits: [
      "Auto-link requests to contracts and invoices",
      "Track ownership changes over time",
      "See complete spend history per tool"
    ],
    link: "/features/vendors",
    image: "/screenshots/connected-records.png",
  },
  {
    id: "budget-intelligence",
    icon: PieChart,
    title: "Budget Intelligence",
    description: "Set department budgets with automatic enforcement. Soft warnings at 80%, hard stops at 100%.",
    benefits: [
      "Real-time spend tracking vs budget",
      "Automatic alerts at 80% threshold",
      "Reduce budget variance from 23% to <2%"
    ],
    link: "/features/budgets",
    image: "/screenshots/budget-dashboard.png",
  },
  {
    id: "renewal-tracking",
    icon: Bell,
    title: "Renewal Tracking",
    description: "Track when you MUST decide, not when it renews. Get alerted 90/60/30 days before notice windows close.",
    benefits: [
      "Notice window tracking (not just renewal dates)",
      "Multi-stage alerts (90/60/30 days)",
      "Zero missed cancellation windows"
    ],
    link: "/features/renewals",
    image: "/screenshots/renewal-calendar.png",
  },
];

export function FeatureTabs() {
  const [activeTab, setActiveTab] = useState(features[0].id);
  const activeFeature = features.find(f => f.id === activeTab) || features[0];

  return (
    <Section background="white" className="relative">
      <Container size="default">
        <div className="py-16 md:py-20 lg:py-24">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-h2 text-slate-900 mb-4">
              Three core capabilities
            </h2>
            <p className="text-body-lg text-slate-600">
              Track every purchase from request to renewal.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeTab === feature.id;

              return (
                <button
                  key={feature.id}
                  onClick={() => {
                    setActiveTab(feature.id);
                    // Track feature tab engagement
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'feature_tab_click', {
                        feature_name: feature.title,
                        feature_id: feature.id,
                      });
                    }
                  }}
                  className={`
                    inline-flex items-center gap-2.5 px-6 py-3 rounded-lg font-semibold text-body-sm
                    transition-all duration-150 ease-out
                    ${isActive
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${feature.id}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} aria-hidden="true" />
                  <span>{feature.title}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div
            id={`panel-${activeFeature.id}`}
            role="tabpanel"
            className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left: Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 text-slate-900 mb-4">
                    {activeFeature.title}
                  </h3>
                  <p className="text-body-lg text-slate-600 leading-relaxed">
                    {activeFeature.description}
                  </p>
                </div>

                {/* Benefits Checklist */}
                <div className="space-y-3">
                  {activeFeature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10.3 2.3L4.5 8.1 1.7 5.3l.7-.7 2.1 2.1 5.1-5.1.7.7z" />
                        </svg>
                      </div>
                      <span className="text-body text-slate-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={activeFeature.link}
                  className="inline-flex items-center gap-2 text-body font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
                >
                  Learn more about {activeFeature.title.toLowerCase()}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>

              {/* Right: Visual */}
              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 flex items-center justify-center">
                  {/* Placeholder - Replace with actual screenshots */}
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <activeFeature.icon className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-caption text-slate-500">
                      Screenshot: {activeFeature.title}
                    </p>
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
