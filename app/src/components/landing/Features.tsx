/**
 * Features Section - Scannable, No Interaction Required
 * Pain → Mechanism → Outcome structure
 */

import { Workflow, PieChart, Bell } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const features = [
  {
    icon: Workflow,
    title: "Connected Records",
    mechanism: "Every purchase flows through one system",
    outcome: "Know who owns what, what it costs, when it renews",
  },
  {
    icon: PieChart,
    title: "Budget Intelligence",
    mechanism: "Real-time spend tracking with automatic alerts",
    outcome: "Reduce budget overruns from 23% to <2%",
  },
  {
    icon: Bell,
    title: "Renewal Tracking",
    mechanism: "Track notice windows, not just renewal dates",
    outcome: "Zero missed cancellation deadlines",
  },
];

export function Features() {
  return (
    <Section background="white" className="relative">
      <Container size="default">
        <div className="py-16 md:py-20">
          {/* No header - let features speak for themselves */}

          {/* Scannable grid - all visible at once */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="space-y-4">
                  {/* Icon + Title */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-amber-400" aria-hidden="true" />
                    </div>
                    <h3 className="text-h4 text-slate-900 font-semibold">
                      {feature.title}
                    </h3>
                  </div>

                  {/* Mechanism (how it works) */}
                  <p className="text-body text-slate-600 leading-relaxed">
                    {feature.mechanism}
                  </p>

                  {/* Outcome (result) */}
                  <p className="text-body-sm text-slate-900 font-semibold">
                    → {feature.outcome}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
