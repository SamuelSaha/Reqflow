import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Layers, Eye, DollarSign, Calendar, ArrowRight, Check, Shield, Bell } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SaaS Spend Management - Track Software Subscriptions",
  description: "Track all SaaS subscriptions in one place. Know what you pay, who owns it, when renewals hit. Catch duplicate tools before you buy. Built for small teams.",
  alternates: {
    canonical: "/features/saas",
  },
  openGraph: {
    title: "SaaS Spend Management Software - Reqflow",
    description: "Track all software subscriptions. Know what you pay and when renewals hit.",
    url: "/features/saas",
    type: "website",
  },
};

export default function SaaSManagementPage() {
  return (
    <PageShell>
      <Section background="warm">
        <Container size="default">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 mb-6">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-caption font-semibold text-blue-900">SaaS Management</span>
            </div>
            <h1 className="text-hero font-extrabold tracking-[-1.5px] text-slate-900 mb-6 leading-[1.1]">
              Track all software subscriptions
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed">
              Built for teams of 5-50: Know exactly what SaaS tools you're paying for, who owns them, and when renewals hit. The connected record for every subscription.
            </p>
          </div>

          {/* The problem */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-10 mb-16">
            <h2 className="text-h4 font-bold text-slate-900 mb-6 text-center">
              The SaaS sprawl problem
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-body-lg font-bold text-slate-900 mb-3">What usually happens:</h3>
                <ul className="space-y-2 text-body text-slate-700">
                  <li>• Engineer signs up for a tool with company credit card</li>
                  <li>• Trial converts to paid subscription automatically</li>
                  <li>• Finance sees the charge but has no context</li>
                  <li>• 6 months later, engineer left the company</li>
                  <li>• Tool is still being paid for. No one owns it</li>
                  <li>• Multiply this by 50+ tools</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-red-200 p-6">
                <div className="text-h2 font-bold text-red-600 mb-2">€15K–25K</div>
                <div className="text-body text-slate-600 leading-relaxed">
                  Average annual waste on unused/duplicate SaaS tools for a 50-person company
                </div>
              </div>
            </div>
          </div>

          {/* How Reqflow solves it */}
          <div className="mb-16 space-y-6">
            <h2 className="text-h3 font-bold text-slate-900 mb-8 text-center">
              How Reqflow tracks every subscription
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Complete SaaS inventory
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Every tool purchase flows through Reqflow. From request to approval to first invoice, we track: who requested it, why, who approved it, who owns it, and when it renews.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Tool name & category",
                    "Owner (and fallback if they leave)",
                    "Monthly/annual cost",
                    "Renewal date & notice window",
                    "Number of seats/licenses",
                    "Contract terms & cancellation policy",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-body-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Trial & renewal tracking
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Log trials with success criteria. Get reminded before trials convert. Track notice windows (not just renewal dates) so you know when you MUST decide.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-body-sm font-semibold text-slate-900 mb-2">Example renewal alert:</div>
                  <div className="text-caption text-slate-600 leading-relaxed">
                    "Notion annual renewal in 60 days (€4,800). Notice window closes in 30 days. Owner: Sarah Chen. Current usage: 48/50 seats."
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Spend analysis & optimization
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  See total SaaS spend by category, department, or owner. Identify duplicate tools (3 project management apps?). Flag underutilized licenses.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    "Duplicate tool detection",
                    "Cost per employee by category",
                    "Unused seat identification",
                  ].map((item) => (
                    <div key={item} className="text-caption text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-center">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cross-link to related features */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-16">
            <h3 className="text-h5 font-bold text-slate-900 mb-4">
              SaaS management connects to budgets and renewals
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/features/budgets" className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow group">
                <Shield className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-body font-semibold text-slate-900 group-hover:text-blue-600">Budget Control →</div>
                  <div className="text-body-sm text-slate-600">Track SaaS spend against department budgets automatically</div>
                </div>
              </Link>
              <Link href="/features/renewals" className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow group">
                <Bell className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-body font-semibold text-slate-900 group-hover:text-blue-600">Renewal Tracking →</div>
                  <div className="text-body-sm text-slate-600">Get alerted before SaaS subscriptions auto-renew</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Results */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-12 text-white mb-16">
            <h2 className="text-h4 font-bold mb-8 text-center">What you get back</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-h2 font-bold text-blue-400 mb-2">100%</div>
                <div className="text-body text-slate-300">
                  SaaS tools with an owner and renewal date
                </div>
              </div>
              <div className="text-center">
                <div className="text-h2 font-bold text-green-400 mb-2">15-20%</div>
                <div className="text-body text-slate-300">
                  SaaS cost reduction (cancelled unused tools)
                </div>
              </div>
              <div className="text-center">
                <div className="text-h2 font-bold text-violet-400 mb-2">Zero</div>
                <div className="text-body text-slate-300">
                  Missed cancellation windows
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-blue-50 border border-blue-200 rounded-2xl p-10">
            <h2 className="text-h4 font-bold text-slate-900 mb-4">
              Get SaaS sprawl under control
            </h2>
            <p className="text-body text-slate-600 mb-6 max-w-[600px] mx-auto">
              Know what you're paying for, who owns it, and when you can leave. Start tracking every subscription.
            </p>
            <a
              href="/beta"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-body font-semibold hover:bg-blue-700 transition-colors no-underline"
            >
              Apply for beta access
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
