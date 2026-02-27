import {
  Workflow,
  CheckCircle,
  PieChart,
  Building,
  Bell,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Workflow,
    title: "Connected Records",
    description: "Tool → Contract → Subscription → Invoice. Every purchase tells its full story from request to renewal.",
    link: "/features/vendors",
  },
  {
    icon: CheckCircle,
    title: "Smart Approvals",
    description: "Role-based workflows with Slack integration. Approve requests in one click, wherever you work.",
    link: null,
  },
  {
    icon: PieChart,
    title: "Budget Intelligence",
    description: "Department budgets with auto-alerts at 80% threshold. Hard stops prevent overspend automatically.",
    link: "/features/budgets",
  },
  {
    icon: Building,
    title: "Vendor Management",
    description: "Compliance tracking and spend analytics. Know who you work with, what you spend, and contract status.",
    link: "/features/vendors",
  },
  {
    icon: Bell,
    title: "Renewal Tracking",
    description: "Never miss a renewal deadline. Track notice windows, not just renewal dates—decide before auto-renew locks you in.",
    link: "/features/renewals",
  },
  {
    icon: Sparkles,
    title: "AI Categorization",
    description: "Auto-categorize requests and detect duplicates. AI learns your purchasing patterns to keep things organized.",
    link: "/features/saas",
  },
];

export function FeatureGrid() {
  return (
    <section
      className="py-16 md:py-20 lg:py-24 px-6 md:px-12 lg:px-20 bg-slate-50"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto">
        <h2 id="features-heading" className="sr-only">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, link }) => (
            <Card
              key={title}
              className="group border border-slate-200 bg-white hover:shadow-lg hover:scale-[1.02] focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 transition-all duration-200 ease-out will-change-transform"
            >
              <CardHeader className="p-6 space-y-4">
                <div
                  className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200"
                  aria-hidden="true"
                >
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-h5 text-slate-900">
                  {title}
                </CardTitle>
                <CardDescription className="text-body text-slate-600 leading-relaxed">
                  {description}
                </CardDescription>
                {link && (
                  <Link
                    href={link}
                    className="inline-flex items-center gap-1 text-body-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors mt-2"
                    aria-label={`Learn more about ${title}`}
                  >
                    Learn more
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
