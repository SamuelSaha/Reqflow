import { PageShell } from "@/components/layout";
import { Sparkles, Check, Wrench, AlertCircle, Zap } from "lucide-react";

export default function ChangelogPage() {
  const entries = [
    {
      date: "February 22, 2026",
      version: "v0.3.0-beta",
      type: "feature",
      items: [
        {
          type: "new",
          title: "Trial Management",
          desc: "Track every trial with success criteria and auto-reminders. Set evaluation goals, get notified before trials convert, and decide before auto-renew locks you in.",
        },
        {
          type: "new",
          title: "Renewal Notice Window Tracking",
          desc: "Finally know when you MUST decide — not just when renewals happen. We track cancellation deadlines so you don't miss notice windows and get stuck for another year.",
        },
        {
          type: "improved",
          title: "Dashboard Performance",
          desc: "Dashboard now loads 3x faster. Optimized stats queries and added caching for recent requests and approvals.",
        },
        {
          type: "fixed",
          title: "Slack notifications timing",
          desc: "Fixed bug where approval notifications arrived 5-10 minutes late. Now instant.",
        },
      ],
    },
    {
      date: "February 15, 2026",
      version: "v0.2.5-beta",
      type: "improvement",
      items: [
        {
          type: "improved",
          title: "Case Builder AI accuracy",
          desc: "Improved vendor detection and pricing extraction. Now correctly identifies 90%+ of SaaS tool pricing from public sources.",
        },
        {
          type: "improved",
          title: "Budget tracking granularity",
          desc: "Added project-level budgets in addition to department budgets. Track spend by initiative, not just org structure.",
        },
        {
          type: "fixed",
          title: "QuickBooks sync reliability",
          desc: "Fixed intermittent sync failures when invoices had special characters in memo fields.",
        },
        {
          type: "fixed",
          title: "Email notifications formatting",
          desc: "Approval emails now render correctly in Outlook and Gmail dark mode.",
        },
      ],
    },
    {
      date: "February 8, 2026",
      version: "v0.2.0-beta",
      type: "feature",
      items: [
        {
          type: "new",
          title: "AI-Powered Case Builder",
          desc: "Purchases over €500 now trigger automatic vendor comparison. AI researches 2-3 alternatives, pulls pricing, and builds a structured business case — so approvers see options, not just a number.",
        },
        {
          type: "new",
          title: "Visual Workflow Builder",
          desc: "Build approval chains with a drag-and-drop editor. Conditional routing based on amount, category, department. No more hardcoded rules.",
        },
        {
          type: "improved",
          title: "Mobile experience",
          desc: "Approve requests from your phone. One-tap approval/rejection with optional comments.",
        },
        {
          type: "fixed",
          title: "Duplicate request detection",
          desc: "Fixed false positives where similar (but not duplicate) tools were flagged as duplicates.",
        },
      ],
    },
    {
      date: "February 1, 2026",
      version: "v0.1.0-beta",
      type: "launch",
      items: [
        {
          type: "new",
          title: "Beta Launch",
          desc: "Reqflow goes live for first 10 beta customers. Core features: Slack intake, approval workflows, QuickBooks/Xero sync, budget tracking, audit trail.",
        },
        {
          type: "new",
          title: "Slack Integration",
          desc: "Submit purchase requests directly from Slack. AI-powered form detects categories and estimates costs.",
        },
        {
          type: "new",
          title: "Approval Workflows",
          desc: "Multi-level approval chains with email and Slack notifications. One-click approve/reject from anywhere.",
        },
        {
          type: "new",
          title: "Budget Enforcement",
          desc: "Hierarchical budgets by department and category. Soft warnings at 80%, hard stops at 100%.",
        },
        {
          type: "new",
          title: "Accounting Sync",
          desc: "Push approved requests to QuickBooks or Xero as purchase orders. Keep accounting in sync automatically.",
        },
      ],
    },
  ];

  const getBadge = (type: string) => {
    switch (type) {
      case "feature":
        return { icon: Sparkles, label: "New Features", color: "text-violet-600 bg-violet-50 border-violet-200" };
      case "improvement":
        return { icon: Zap, label: "Improvements", color: "text-blue-600 bg-blue-50 border-blue-200" };
      case "launch":
        return { icon: Check, label: "Launch", color: "text-green-600 bg-green-50 border-green-200" };
      default:
        return { icon: Wrench, label: "Updates", color: "text-slate-600 bg-slate-50 border-slate-200" };
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "new":
        return { icon: Sparkles, color: "text-violet-600 bg-violet-50" };
      case "improved":
        return { icon: Zap, color: "text-blue-600 bg-blue-50" };
      case "fixed":
        return { icon: Wrench, color: "text-green-600 bg-green-50" };
      default:
        return { icon: AlertCircle, color: "text-slate-600 bg-slate-50" };
    }
  };

  return (
    <PageShell>
      <section className="pt-20 pb-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white via-[var(--warm-50)] to-white">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="text-[48px] font-extrabold tracking-tight text-slate-900 mb-4">
              Changelog
            </h1>
            <p className="text-[18px] text-slate-600 leading-relaxed max-w-[600px] mx-auto">
              Every update, improvement, and fix as we build Reqflow. We ship fast and communicate honestly about what's working and what's not.
            </p>
          </div>

          {/* Beta notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[16px] font-bold text-amber-900 mb-2">We're in beta</h3>
                <p className="text-[14px] text-amber-800 leading-relaxed">
                  This changelog reflects our current development pace. Expect frequent updates, occasional breaking changes, and honest communication about what's ready and what's still rough.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-12">
            {entries.map((entry, idx) => {
              const badge = getBadge(entry.type);
              const BadgeIcon = badge.icon;

              return (
                <div key={entry.version} className="relative">
                  {/* Timeline connector */}
                  {idx < entries.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-[calc(100%+3rem)] bg-slate-200" />
                  )}

                  <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-[14px] font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-[20px] font-bold text-slate-900 mb-1">
                            {entry.version}
                          </div>
                          <div className="text-[14px] text-slate-500">{entry.date}</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${badge.color}`}>
                        <BadgeIcon className="w-4 h-4" />
                        <span className="text-[13px] font-semibold">{badge.label}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="px-8 py-6 space-y-4">
                      {entry.items.map((item, itemIdx) => {
                        const itemIcon = getItemIcon(item.type);
                        const ItemIcon = itemIcon.icon;

                        return (
                          <div key={itemIdx} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${itemIcon.color}`}>
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-[16px] font-semibold text-slate-900">
                                  {item.title}
                                </h3>
                                <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                                  item.type === "new" ? "bg-violet-100 text-violet-700" :
                                  item.type === "improved" ? "bg-blue-100 text-blue-700" :
                                  "bg-green-100 text-green-700"
                                }`}>
                                  {item.type}
                                </span>
                              </div>
                              <p className="text-[14px] text-slate-600 leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subscribe CTA */}
          <div className="mt-16 bg-slate-900 rounded-2xl border border-slate-700 p-10 text-center text-white">
            <h2 className="text-[24px] font-bold mb-3">
              Get changelog updates
            </h2>
            <p className="text-[15px] text-slate-300 mb-6 max-w-[500px] mx-auto">
              Beta customers are automatically added to our shared Slack channel where we announce updates in real-time. No email spam.
            </p>
            <a
              href="/beta"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-[16px] font-semibold hover:bg-blue-700 transition-colors no-underline"
            >
              Join Beta Program
            </a>
          </div>

          {/* Coming soon */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8">
            <h3 className="text-[20px] font-bold text-blue-900 mb-4">Coming in March 2026</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Mobile app (iOS + Android)",
                "Advanced spend analytics with AI insights",
                "Multi-currency support",
                "Custom reporting builder",
                "API access for integrations",
                "SSO with Google Workspace and Microsoft"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-[14px] text-blue-800">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
