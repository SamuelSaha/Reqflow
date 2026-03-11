import { MarketingNav } from '@/components/marketing/nav/MarketingNav';
import { MarketingFooter } from '@/components/marketing/footer/MarketingFooter';
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Settings, Workflow, Clock, CheckCircle, ArrowRight } from "lucide-react";

export default function ForOpsTeamsPage() {
  return (
    <><MarketingNav />
      <Section background="warm">
        <Container size="default">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 bg-green-50 mb-6">
              <Settings className="w-4 h-4 text-green-600" />
              <span className="text-caption font-semibold text-green-900">For Ops Teams</span>
            </div>
            <h1 className="text-hero font-extrabold tracking-[-1.5px] text-slate-900 mb-6 leading-[1.1]">
              Streamline procurement workflows
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed">
              You keep the company running. Reqflow takes procurement chaos and turns it into a predictable, automated process.
            </p>
          </div>

          {/* Current state */}
          <div className="mb-16">
            <h2 className="text-h3 font-bold text-slate-900 mb-8 text-center">
              The operations bottleneck
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-h5 font-bold text-slate-900 mb-4">Before Reqflow</h3>
                <ul className="space-y-3">
                  {[
                    "Requests arrive via Slack DMs, email, and meetings",
                    "Chasing signatures for approvals takes days",
                    "Manual entry into QuickBooks/Xero",
                    "No visibility into approval status",
                    "Vendor data scattered across spreadsheets",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body text-slate-600">
                      <span className="text-red-500 flex-shrink-0">×</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                <h3 className="text-h5 font-bold text-slate-900 mb-4">With Reqflow</h3>
                <ul className="space-y-3">
                  {[
                    "All requests flow through one intake form (Slack/browser)",
                    "Automatic routing to the right approver",
                    "One-click sync to accounting systems",
                    "Real-time approval tracking and notifications",
                    "Complete vendor database with contract terms",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Features for ops */}
          <div className="mb-16 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Workflow className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Visual workflow builder
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Drag-and-drop approval chains with conditional routing. Under €500? Manager approves. Over €500? Add finance and founder. Set it once, let it run forever.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Auto-escalation and delegation
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Approver on vacation? Reqflow auto-delegates to their backup. Request stuck for 48 hours? Auto-escalate to the next level. No manual babysitting required.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Accounting sync that actually works
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Approved requests become purchase orders in QuickBooks/Xero automatically. Invoices match to POs. Accounting stays in sync without manual data entry.
                </p>
              </div>
            </div>
          </div>

          {/* Time savings */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-12 text-white mb-16">
            <h2 className="text-h4 font-bold mb-8 text-center">Time back in your week</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-h2 font-bold text-blue-400 mb-2">8h</div>
                <div className="text-body text-slate-300">
                  Saved per week chasing approvals
                </div>
              </div>
              <div className="text-center">
                <div className="text-h2 font-bold text-green-400 mb-2">90%</div>
                <div className="text-body text-slate-300">
                  Reduction in manual data entry
                </div>
              </div>
              <div className="text-center">
                <div className="text-h2 font-bold text-violet-400 mb-2">&lt;30min</div>
                <div className="text-body text-slate-300">
                  Average approval time (from days)
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-green-50 border border-green-200 rounded-2xl p-10">
            <h2 className="text-h4 font-bold text-slate-900 mb-4">
              Stop being the procurement bottleneck
            </h2>
            <p className="text-body text-slate-600 mb-6 max-w-[600px] mx-auto">
              Set up workflows once, let them run automatically. Get 8 hours back every week.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-body font-semibold hover:bg-blue-700 transition-colors no-underline"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </Container>
      </Section>
    <MarketingFooter /></>
  );
}
