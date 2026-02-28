/**
 * Pain Points Section
 * Checkbox-style problem statements
 */

import { Check } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const problems = [
  "Engineer signs up for a tool with company credit card",
  "Trial converts to paid subscription automatically",
  "Finance sees the charge but has no context",
  "6 months later, engineer left the company",
  "Tool is still being paid for. No one owns it",
  "Multiply this by 50+ tools",
];

const metrics = [
  { value: "40-60%", label: "purchases bypass process" },
  { value: "29%", label: "SaaS subscriptions duplicate" },
  { value: "8.3 hrs", label: "wasted per week" },
  { value: "$15-40", label: "cost per manual invoice" },
];

export function PainPoints() {
  return (
    <Section background="white" className="relative">
      <Container size="default">
        <div className="py-20 md:py-28">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-h2 text-slate-900 mb-4">
              Your team buys like it's 2005
            </h2>
            <p className="text-body-lg text-slate-600 max-w-2xl mx-auto">
              Procurement happens in Slack threads, spreadsheets, and email. Everyone loses track.
            </p>
          </div>

          {/* Checklist - Centered */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-slate-400" strokeWidth={3} />
                  </div>
                  <p className="text-body text-slate-700 leading-relaxed">
                    {problem}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Embedded Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
                  {metric.value}
                </div>
                <div className="text-body-sm text-slate-600">
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
