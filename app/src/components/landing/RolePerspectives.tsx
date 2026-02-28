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
    benefits: [
      "Real-time budget tracking",
      "Automatic PO generation",
      "Invoice reconciliation in minutes",
      "Complete audit trail",
    ],
  },
  {
    icon: Briefcase,
    color: "bg-green-50 text-green-600",
    title: "Operations Lead",
    benefits: [
      "2-hour approval time (vs 3 days)",
      "Pre-approved request templates",
      "Zero onboarding delays",
      "Vendor relationship management",
    ],
  },
  {
    icon: Users,
    color: "bg-purple-50 text-purple-600",
    title: "Team Member",
    benefits: [
      "Request any tool in 2 minutes",
      "Slack-native approvals",
      "Know exactly what's approved",
      "No more email archaeology",
    ],
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
                  <h3 className="text-h4 text-slate-900 font-semibold mb-6">
                    {role.title}
                  </h3>

                  {/* Benefits */}
                  <ul className="space-y-3">
                    {role.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2.5 flex-shrink-0"></div>
                        <span className="text-body text-slate-600 leading-relaxed">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
