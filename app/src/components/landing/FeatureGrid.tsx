import {
  Workflow,
  CheckCircle,
  PieChart,
  Building,
  Bell,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Workflow,
    title: "Connected Records",
    description: "Tool → Contract → Subscription → Invoice. Every purchase tells its full story from request to renewal.",
  },
  {
    icon: CheckCircle,
    title: "Smart Approvals",
    description: "Role-based workflows with Slack integration. Approve requests in one click, wherever you work.",
  },
  {
    icon: PieChart,
    title: "Budget Intelligence",
    description: "Department budgets with auto-alerts at 80% threshold. Hard stops prevent overspend automatically.",
  },
  {
    icon: Building,
    title: "Vendor Management",
    description: "Compliance tracking and spend analytics. Know who you work with, what you spend, and contract status.",
  },
  {
    icon: Bell,
    title: "Renewal Tracking",
    description: "Never miss a renewal deadline. Track notice windows, not just renewal dates—decide before auto-renew locks you in.",
  },
  {
    icon: Sparkles,
    title: "AI Categorization",
    description: "Auto-categorize requests and detect duplicates. AI learns your purchasing patterns to keep things organized.",
  },
];

export function FeatureGrid() {
  return (
    <section className="py-16 md:py-20 lg:py-24 px-6 md:px-12 lg:px-20 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="group border border-slate-200 bg-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-out will-change-transform"
            >
              <CardHeader className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-h5 text-slate-900">
                  {title}
                </CardTitle>
                <CardDescription className="text-body text-slate-600 leading-relaxed">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
