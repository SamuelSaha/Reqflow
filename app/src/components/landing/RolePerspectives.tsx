/**
 * Role Perspectives Section
 * Show how different roles benefit
 */

import { DollarSign, Users, Briefcase } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const roles = [
  {
    icon: DollarSign,
    color: "bg-blue-50 text-blue-600",
    title: "CFO / Finance",
    benefit: "Real-time budget tracking with automatic alerts at 80% and 100%",
  },
  {
    icon: Briefcase,
    color: "bg-green-50 text-green-600",
    title: "Operations Lead",
    benefit: "Approve requests in <2 hours instead of 3+ days",
  },
  {
    icon: Users,
    color: "bg-purple-50 text-purple-600",
    title: "Team Member",
    benefit: "Request any tool via Slack in under 2 minutes",
  },
];

export function RolePerspectives() {
  return (
    <Section background="white" className="relative">
      <Container size="default">
        <div className="py-20 md:py-28">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-h2 text-slate-900 mb-4">
              One platform. Three perspectives.
            </h2>
            <p className="text-body-lg text-slate-600 max-w-2xl mx-auto">
              Every role gets exactly what they need. Nothing they don't.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => {
              const Icon = role.icon;

              return (
                <div
                  key={index}
                  className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${role.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-h4 text-slate-900 font-semibold mb-4">
                    {role.title}
                  </h3>

                  {/* Single Key Benefit */}
                  <p className="text-body text-slate-600 leading-relaxed">
                    {role.benefit}
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
