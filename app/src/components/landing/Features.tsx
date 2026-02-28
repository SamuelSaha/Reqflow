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
        <div className="py-20 md:py-28">
          {/* Scannable grid - premium spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="group">
                  {/* Premium card with subtle shadow */}
                  <div className="h-full p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                    {/* Icon - minimal, monochrome */}
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-slate-100 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-slate-700" aria-hidden="true" strokeWidth={1.5} />
                    </div>

                    {/* Title */}
                    <h3 className="text-h4 text-slate-900 font-semibold mb-4">
                      {feature.title}
                    </h3>

                    {/* Mechanism */}
                    <p className="text-body text-slate-600 mb-4 leading-relaxed">
                      {feature.mechanism}
                    </p>

                    {/* Outcome - visual emphasis with color for signaling */}
                    <p className="text-body-sm text-blue-600 font-semibold">
                      {feature.outcome}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
