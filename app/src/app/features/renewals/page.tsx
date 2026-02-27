import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Bell, Calendar, Clock, Target, ArrowRight, Check, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Renewal Tracking Software - Never Miss a Renewal Deadline",
  description: "Track notice windows, not just renewal dates. Get alerted when you must decide—before auto-renew locks you in. Built for small teams managing SaaS subscriptions.",
  alternates: {
    canonical: "/features/renewals",
  },
  openGraph: {
    title: "Renewal Tracking Software - Reqflow",
    description: "Track notice windows and renewal deadlines. Get alerted before auto-renew traps you.",
    url: "/features/renewals",
    type: "website",
  },
};

export default function RenewalAlertsPage() {
  return (
    <PageShell>
      <Section background="warm">
        <Container size="default">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 bg-orange-50 mb-6">
              <Bell className="w-4 h-4 text-orange-600" />
              <span className="text-caption text-orange-900">Renewal Alerts</span>
            </div>
            <h1 className="text-hero text-slate-900 mb-6">
              Never miss a renewal
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed">
              Track notice windows, not just renewal dates. Get alerted when you MUST decide — before auto-renew locks you in for another year.
            </p>
          </div>

          {/* The problem */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-10 mb-16">
            <h2 className="text-h4 text-slate-900 mb-6 text-center">
              The renewal trap
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-red-200 p-6">
                <h3 className="text-body-lg font-bold text-slate-900 mb-3">
                  What usually happens:
                </h3>
                <div className="space-y-3 text-body text-slate-700">
                  <div className="flex items-start gap-3">
                    <span className="text-body-lg">1️⃣</span>
                    <span>You sign a 1-year contract with 60-day cancellation notice</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-body-lg">2️⃣</span>
                    <span>You put the renewal date (Jan 1, 2027) in your calendar</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-body-lg">3️⃣</span>
                    <span>Notice window closes (Nov 1, 2026) — you didn't get reminded</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-body-lg">4️⃣</span>
                    <span>Dec 15: You realize you wanted to cancel. TOO LATE.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-body-lg">💸</span>
                    <span className="font-semibold text-red-600">You're locked in for another year at €50K</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
                <div className="text-h2 text-red-600 mb-2">€12K–€30K</div>
                <div className="text-body text-slate-600">
                  Average annual cost of missed cancellation windows for a 50-person company
                </div>
              </div>
            </div>
          </div>

          {/* The wrong date */}
          <div className="mb-16">
            <h2 className="text-h3 text-slate-900 mb-8 text-center">
              You're tracking the wrong date
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-h5 text-slate-900">
                    Wrong: Renewal Date
                  </h3>
                </div>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Most tools only track when subscriptions renew (Jan 1, 2027). By the time renewal hits, it's too late — the notice window closed 60 days ago.
                </p>
                <div className="text-body-sm text-red-600 font-medium bg-red-50 rounded-lg p-3 border border-red-200">
                  "Notion renews tomorrow at €4,800. Cancel?" → TOO LATE. Notice window closed 60 days ago.
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-h5 text-slate-900">
                    Right: Notice Window
                  </h3>
                </div>
                <p className="text-body text-slate-700 leading-relaxed mb-4">
                  Reqflow tracks the notice deadline — when you MUST decide. We alert you 90/60/30 days before the window closes, so you have time to evaluate.
                </p>
                <div className="text-body-sm text-green-700 font-medium bg-green-100 rounded-lg p-3 border border-green-200">
                  "Notion renews in 90 days (€4,800). Notice window closes in 30 days. Decide now or auto-renew."
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="mb-16 space-y-6">
            <h2 className="text-h3 text-slate-900 mb-8 text-center">
              How Reqflow tracks renewals
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-h5 text-slate-900 mb-3">
                  Log contracts with notice windows
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Upload contracts or manually enter terms. Reqflow extracts renewal date, term length, and cancellation notice period (30/60/90 days).
                </p>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-body-sm font-mono text-slate-700 space-y-1">
                    <div>Contract: Notion Team Plan</div>
                    <div>Start: Jan 1, 2026</div>
                    <div>Term: 1 year</div>
                    <div>Renewal: Jan 1, 2027 (auto-renew)</div>
                    <div className="font-semibold text-blue-600">Notice: 60 days (must cancel by Nov 1, 2026)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-h5 text-slate-900 mb-3">
                  Multi-stage alerts (90/60/30 days)
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Reqflow sends alerts at three key milestones. First reminder at 90 days (start evaluating). Second at 60 days (make decision). Final at 30 days (last chance).
                </p>
                <div className="space-y-3">
                  {[
                    { days: 90, color: "blue", message: "90 days: Notion renewal coming. Start evaluation." },
                    { days: 60, color: "amber", message: "60 days: Decision time. Keep, cancel, or renegotiate?" },
                    { days: 30, color: "red", message: "30 days: LAST CHANCE. Notice window closes soon." },
                  ].map((alert) => (
                    <div key={alert.days} className={`text-caption bg-${alert.color}-50 border border-${alert.color}-200 rounded-lg p-3 text-${alert.color}-700 font-medium`}>
                      {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-h5 text-slate-900 mb-3">
                  Centralized renewal calendar
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Dashboard shows all upcoming renewals in a timeline view: 30-day window, 60-day window, 90-day window. Color-coded by urgency.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    "Next 30 days (RED - urgent)",
                    "31-60 days (AMBER - decide soon)",
                    "61-90 days (BLUE - start evaluating)",
                  ].map((item) => (
                    <div key={item} className="text-caption text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-center">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-12 text-white mb-16">
            <h2 className="text-h3 font-bold mb-8 text-center">What you get back</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-h2 font-bold text-blue-400 mb-2">Zero</div>
                <div className="text-body text-slate-300">
                  Missed cancellation windows
                </div>
              </div>
              <div className="text-center">
                <div className="text-h2 font-bold text-green-400 mb-2">€15K+</div>
                <div className="text-body text-slate-300">
                  Saved annually by cancelling on time
                </div>
              </div>
              <div className="text-center">
                <div className="text-h2 font-bold text-orange-400 mb-2">100%</div>
                <div className="text-body text-slate-300">
                  Renewals reviewed before auto-renew
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-orange-50 border border-orange-200 rounded-2xl p-10">
            <h2 className="text-h3 font-bold text-slate-900 mb-4">
              Stop missing notice windows
            </h2>
            <p className="text-body text-slate-600 mb-6 max-w-[600px] mx-auto">
              Track the dates that actually matter. Get reminded when you MUST decide, not when it's already too late.
            </p>
            <a
              href="/beta"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-lg text-body font-semibold hover:bg-orange-700 transition-colors no-underline"
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
