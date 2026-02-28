/**
 * Metrics Row Section
 * Key statistics highlighting the problem
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const metrics = [
  {
    value: "40-60%",
    label: "purchases bypass process",
    color: "text-red-600",
  },
  {
    value: "29%",
    label: "SaaS subscriptions duplicate",
    color: "text-red-600",
  },
  {
    value: "8.3 hrs",
    label: "wasted per week",
    color: "text-red-600",
  },
  {
    value: "$15-40",
    label: "cost per manual invoice",
    color: "text-red-600",
  },
];

export function MetricsRow() {
  return (
    <Section background="warm" className="relative">
      <Container size="default">
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`text-5xl md:text-6xl font-bold ${metric.color} mb-3`}>
                  {metric.value}
                </div>
                <div className="text-body text-slate-600">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
