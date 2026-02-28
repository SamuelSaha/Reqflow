/**
 * Dark Features Section
 * Premium dark background with key capabilities
 */

import { Workflow, Shield, Zap, BarChart } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const features = [
  {
    icon: Workflow,
    title: "Purchase Tracking",
    description: "Every request flows through one system. Tool → Contract → Subscription → Invoice → Owner.",
  },
  {
    icon: Shield,
    title: "Budget Enforcement",
    description: "Set department budgets with automatic alerts. Soft warnings at 80%, hard stops at 100%.",
  },
  {
    icon: Zap,
    title: "Renewal Management",
    description: "Track notice windows, not just renewal dates. Get alerted 90/60/30 days before deadlines.",
  },
  {
    icon: BarChart,
    title: "Spend Analytics",
    description: "See total spend by category, department, or owner. Identify duplicates and optimize.",
  },
];

export function DarkFeatures() {
  return (
    <Section background="white" className="relative">
      <Container size="default" className="relative">
        <div className="py-20 md:py-28">
          {/* Dark container */}
          <div className="bg-slate-900 rounded-3xl p-12 md:p-16">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-h2 text-white mb-4">
                Everything you need. Nothing you don't.
              </h2>
              <p className="text-body-lg text-slate-400 max-w-2xl mx-auto">
                Built for teams of 5-50. Not enterprise bloat. Not spreadsheet chaos.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div key={index}>
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-blue-400" strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <h3 className="text-h4 text-white font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-body text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
