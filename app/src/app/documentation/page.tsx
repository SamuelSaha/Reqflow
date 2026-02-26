import { PageShell } from "@/components/layout";
import { BookOpen, Zap, Settings, Users, ArrowRight, Code, MessageSquare, FileText, Bell } from "lucide-react";
import Link from "next/link";

export default function DocumentationPage() {
  const sections = [
    {
      title: "Getting Started",
      icon: Zap,
      color: "text-green-600 bg-green-50",
      guides: [
        {
          title: "Quickstart Guide",
          desc: "Get Reqflow running in under 10 minutes. Connect Slack, set up your first approval workflow, and submit a test request.",
          link: "#quickstart",
          time: "10 min",
        },
        {
          title: "Connecting Slack",
          desc: "Install the Reqflow Slack app and configure request intake. Your team submits requests directly from Slack.",
          link: "#slack-setup",
          time: "5 min",
        },
        {
          title: "First Approval Workflow",
          desc: "Create a simple approval chain: team member → manager → finance. Configure thresholds and routing rules.",
          link: "#first-workflow",
          time: "8 min",
        },
      ],
    },
    {
      title: "Core Features",
      icon: Settings,
      color: "text-blue-600 bg-blue-50",
      guides: [
        {
          title: "Approval Workflows",
          desc: "Build multi-level approval chains with conditional routing. Auto-delegate when approvers are out, escalate overdue requests.",
          link: "#approval-workflows",
          time: "12 min",
        },
        {
          title: "Budget Tracking",
          desc: "Set department and project budgets. Configure soft warnings (80%) and hard stops (100%). Track spend in real-time.",
          link: "#budget-tracking",
          time: "10 min",
        },
        {
          title: "Case Builder (AI)",
          desc: "Automatically trigger vendor comparisons for purchases over €500. AI researches alternatives and builds structured cases.",
          link: "#case-builder",
          time: "6 min",
        },
        {
          title: "Trial Management",
          desc: "Track every trial with success criteria and auto-reminders. Decide before trials auto-convert to paid subscriptions.",
          link: "#trial-management",
          time: "8 min",
        },
        {
          title: "Renewal Tracking",
          desc: "Track notice windows, not just renewal dates. Get notified when you must decide — before auto-renew locks you in.",
          link: "#renewal-tracking",
          time: "7 min",
        },
      ],
    },
    {
      title: "Integrations",
      icon: Code,
      color: "text-violet-600 bg-violet-50",
      guides: [
        {
          title: "QuickBooks Sync",
          desc: "Connect QuickBooks and sync approved requests as purchase orders. Match invoices to POs automatically.",
          link: "#quickbooks",
          time: "10 min",
        },
        {
          title: "Xero Sync",
          desc: "Connect Xero and push approved purchases. Two-way sync keeps accounting in lockstep with Reqflow.",
          link: "#xero",
          time: "10 min",
        },
        {
          title: "Slack Notifications",
          desc: "Configure Slack notifications for approvals, budget alerts, and renewal reminders. Keep your team in the loop.",
          link: "#slack-notifications",
          time: "5 min",
        },
      ],
    },
    {
      title: "Team & Permissions",
      icon: Users,
      color: "text-orange-600 bg-orange-50",
      guides: [
        {
          title: "Inviting Team Members",
          desc: "Add teammates and assign roles: Admin, Finance, Approver, Employee. Control who can approve and who can view budgets.",
          link: "#team-invites",
          time: "5 min",
        },
        {
          title: "Role-Based Permissions",
          desc: "Understand the four roles and what each can do. Configure granular access for sensitive data.",
          link: "#permissions",
          time: "8 min",
        },
      ],
    },
  ];

  return (
    <PageShell>
      <section className="pt-20 pb-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white via-[var(--warm-50)] to-white">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 mb-6">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-[13px] font-semibold text-blue-900">
                Documentation
              </span>
            </div>
            <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-4">
              Guides & Tutorials
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed max-w-[600px] mx-auto">
              Everything you need to get the most out of Reqflow. Step-by-step guides, best practices, and integration docs.
            </p>
          </div>

          {/* Beta notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body font-bold text-amber-900 mb-2">Docs in progress</h3>
                <p className="text-body-sm text-amber-800 leading-relaxed">
                  We're building docs as we ship features. Beta customers get hands-on onboarding with founders (no docs required). Need help?{" "}
                  <a href="mailto:support@reqflow.co" className="text-amber-900 font-semibold underline">
                    support@reqflow.co
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Link
              href="#quickstart"
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-3 no-underline group"
            >
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-body-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Quickstart Guide
              </h3>
              <p className="text-body-sm text-slate-600 leading-relaxed">
                Get running in under 10 minutes. Connect Slack, create a workflow, submit a request.
              </p>
              <div className="flex items-center gap-2 text-[14px] font-semibold text-blue-600">
                Start here
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="#slack-setup"
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-3 no-underline group"
            >
              <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-body-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Slack Integration
              </h3>
              <p className="text-body-sm text-slate-600 leading-relaxed">
                Install the Slack app and configure request intake in 5 minutes.
              </p>
              <div className="flex items-center gap-2 text-[14px] font-semibold text-blue-600">
                Learn more
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/api-reference"
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-3 no-underline group"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-body-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                API Reference
              </h3>
              <p className="text-body-sm text-slate-600 leading-relaxed">
                Build custom integrations with the Reqflow API. Full REST + webhooks.
              </p>
              <div className="flex items-center gap-2 text-[14px] font-semibold text-blue-600">
                View docs
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Documentation sections */}
          <div className="space-y-12">
            {sections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <div key={section.title}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                      <SectionIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-h4 font-bold text-slate-900">
                      {section.title}
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {section.guides.map((guide) => (
                      <Link
                        key={guide.link}
                        href={guide.link}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-3 no-underline group"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-body-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {guide.title}
                          </h3>
                          <span className="text-[12px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {guide.time}
                          </span>
                        </div>
                        <p className="text-[14px] text-slate-600 leading-relaxed flex-1">
                          {guide.desc}
                        </p>
                        <div className="flex items-center gap-2 text-[14px] font-semibold text-blue-600">
                          Read guide
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Need help CTA */}
          <div className="mt-16 bg-slate-900 rounded-2xl border border-slate-700 p-10 text-center text-white">
            <h2 className="text-h4 font-bold mb-3">
              Can't find what you're looking for?
            </h2>
            <p className="text-body text-slate-300 mb-6 max-w-[500px] mx-auto">
              Beta customers get direct Slack access to founders. We respond within hours (usually minutes). No support tickets, no waiting.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="mailto:support@reqflow.co"
                className="inline-block bg-white text-slate-900 px-6 py-3 rounded-lg text-body font-semibold hover:bg-slate-100 transition-colors no-underline"
              >
                Email Support
              </a>
              <Link
                href="/beta"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-body font-semibold hover:bg-blue-700 transition-colors no-underline"
              >
                Join Beta Program
              </Link>
            </div>
          </div>

          {/* Video tutorials coming soon */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-h5 font-bold text-blue-900 mb-2">
              📹 Video tutorials coming soon
            </h3>
            <p className="text-body-sm text-blue-800 max-w-[600px] mx-auto">
              We're recording screen captures for every major workflow. In the meantime, beta customers get live onboarding calls with founders.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
