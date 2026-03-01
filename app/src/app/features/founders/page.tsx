import { PageShell } from "@/components/layout";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { TrendingUp, Shield, Eye, Zap, Check, ArrowRight } from "lucide-react";

export default function ForFoundersPage() {
  return (
    <PageShell>
      <Section background="warm">
        <Container size="default">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 mb-6">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-caption text-blue-900">For Founders</span>
            </div>
            <h1 className="text-hero text-slate-900 mb-6">
              Take control of company spend
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed">
              You're building a company, not managing procurement. Reqflow gives you visibility without turning you into a bottleneck.
            </p>
          </div>

          {/* Key problems */}
          <div className="mb-16">
            <h2 className="text-h3 text-slate-900 mb-8 text-center">
              The founder's procurement problem
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-body-lg font-bold text-slate-900 mb-3">
                  "I have no idea what we're paying for"
                </h3>
                <p className="text-body text-slate-600 leading-relaxed">
                  Tools get bought via Slack DMs. You find out about subscriptions when the invoice hits. SaaS sprawl is real.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-body-lg font-bold text-slate-900 mb-3">
                  "Approving everything kills velocity"
                </h3>
                <p className="text-body text-slate-600 leading-relaxed">
                  You want control, but being in every approval chain means your team waits days for a $50/mo tool.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-body-lg font-bold text-slate-900 mb-3">
                  "Renewals sneak up and auto-convert"
                </h3>
                <p className="text-body text-slate-600 leading-relaxed">
                  Trials become paid subscriptions. Annual renewals hit before you remember to cancel. You're bleeding money.
                </p>
              </div>
            </div>
          </div>

          {/* What Reqflow does */}
          <div className="mb-16">
            <h2 className="text-h3 text-slate-900 mb-8 text-center">
              How Reqflow helps founders
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-h5 text-slate-900 mb-3">
                    Real-time spend visibility
                  </h3>
                  <p className="text-body text-slate-600 leading-relaxed mb-4">
                    Dashboard shows exactly what you're paying for, who owns it, and when renewals hit. Every tool purchase is tracked from request to renewal.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Live budget tracking by department",
                      "Monthly recurring cost breakdown",
                      "Upcoming renewal calendar (30/60/90 days)",
                    ].map((item) => (
                      <span key={item} className="text-body-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-h5 text-slate-900 mb-3">
                    Delegate without losing control
                  </h3>
                  <p className="text-body text-slate-600 leading-relaxed mb-4">
                    Set approval thresholds: under €500 goes to managers, over €500 comes to you. Your team moves fast, you stay informed.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Automatic routing by amount/category",
                      "Slack notifications for high-value requests",
                      "One-click approve/reject from mobile",
                    ].map((item) => (
                      <span key={item} className="text-body-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
                <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-violet-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-h5 text-slate-900 mb-3">
                    Never miss a cancellation window
                  </h3>
                  <p className="text-body text-slate-600 leading-relaxed mb-4">
                    We track notice deadlines, not just renewal dates. Get alerted 60 days before you MUST decide - before auto-renew locks you in for another year.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Trial tracking with success criteria",
                      "Notice window alerts (30/60/90 days)",
                      "One-click cancellation requests",
                    ].map((item) => (
                      <span key={item} className="text-body-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-12 text-white mb-16">
            <h2 className="text-h4 mb-8 text-center">What founders get back</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-h2 text-blue-400 mb-2">4-8h</div>
                <div className="text-body text-slate-300">
                  Saved per month on procurement admin
                </div>
              </div>
              <div className="text-center">
                <div className="text-h2 font-bold text-green-400 mb-2">15-20%</div>
                <div className="text-body text-slate-300">
                  Reduction in SaaS spend (cancelled unused tools)
                </div>
              </div>
              <div className="text-center">
                <div className="text-h2 font-bold text-violet-400 mb-2">100%</div>
                <div className="text-body text-slate-300">
                  Visibility into who owns what
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-blue-50 border border-blue-200 rounded-2xl p-10">
            <h2 className="text-h3 font-bold text-slate-900 mb-4">
              Get procurement off your plate
            </h2>
            <p className="text-body text-slate-600 mb-6 max-w-[600px] mx-auto">
              Free during early access. 2-minute setup, no credit card required.
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
    </PageShell>
  );
}
