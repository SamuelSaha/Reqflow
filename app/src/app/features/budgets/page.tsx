import { PageShell } from "@/components/layout";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Shield, TrendingUp, AlertCircle, Lock, ArrowRight, Check } from "lucide-react";

export default function BudgetControlPage() {
  return (
    <PageShell>
      <Section background="warm">
        <Container size="default">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-200 bg-violet-50 mb-6">
              <Shield className="w-4 h-4 text-violet-600" />
              <span className="text-[13px] font-semibold text-violet-900">Budget Control</span>
            </div>
            <h1 className="text-[52px] font-extrabold tracking-[-1.5px] text-slate-900 mb-6 leading-[1.1]">
              Set spending guardrails
            </h1>
            <p className="text-[19px] text-slate-600 leading-relaxed">
              Enforce budgets automatically. Soft warnings when teams get close, hard stops when they hit the limit. No more budget surprises.
            </p>
          </div>

          {/* The problem */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-10 mb-16">
            <h2 className="text-[28px] font-bold text-slate-900 mb-6 text-center">
              The budget control problem
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-4">Without guardrails:</h3>
                <ul className="space-y-3 text-[15px] text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">×</span>
                    Marketing blows through Q1 budget in 6 weeks
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">×</span>
                    No one knows they're over budget until month-end
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">×</span>
                    "Can we get budget approval?" becomes a 3-day email thread
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">×</span>
                    Finance discovers overspend when reconciling invoices
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-red-200 p-6 flex flex-col justify-center">
                <div className="text-[48px] font-bold text-red-600 mb-2">23%</div>
                <div className="text-[16px] text-slate-600 leading-relaxed">
                  Average budget overrun for teams without automated controls (CFO Survey, 2025)
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="mb-16 space-y-6">
            <h2 className="text-[32px] font-bold text-slate-900 mb-8 text-center">
              How budget control works in Reqflow
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-slate-900 mb-3">
                  Hierarchical budgets
                </h3>
                <p className="text-[16px] text-slate-600 leading-relaxed mb-4">
                  Set budgets at multiple levels: company-wide, by department, by project, or by category. Budgets roll up automatically. Overspend in one area doesn't hide in the aggregate.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-[14px] font-mono text-slate-700 space-y-1">
                    <div>Company: €650K/year</div>
                    <div className="ml-4">├─ Engineering: €300K/year</div>
                    <div className="ml-8">│&nbsp;&nbsp;├─ Dev Tools: €120K/year</div>
                    <div className="ml-8">│&nbsp;&nbsp;└─ Infrastructure: €180K/year</div>
                    <div className="ml-4">├─ Marketing: €200K/year</div>
                    <div className="ml-4">└─ Operations: €150K/year</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-slate-900 mb-3">
                  Soft warnings at 80%
                </h3>
                <p className="text-[16px] text-slate-600 leading-relaxed mb-4">
                  When a budget hits 80%, Reqflow notifies the budget owner and department head. Requests still get approved, but everyone knows they're close to the limit.
                </p>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-[14px] font-semibold text-amber-900 mb-2">Example warning:</div>
                  <div className="text-[13px] text-amber-800">
                    "Engineering Dev Tools budget: 82% consumed (€98.4K of €120K). Remaining: €21.6K. 45 days left in Q1."
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-slate-900 mb-3">
                  Hard stops at 100%
                </h3>
                <p className="text-[16px] text-slate-600 leading-relaxed mb-4">
                  At 100%, budget is exhausted. New requests automatically require CFO/founder approval regardless of amount. No surprise overspend.
                </p>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-[14px] font-semibold text-red-900 mb-2">Hard stop message:</div>
                  <div className="text-[13px] text-red-800">
                    "Marketing budget exhausted (€200K/€200K). This request requires CFO approval to proceed. Reason: Budget limit reached."
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration options */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 mb-16">
            <h2 className="text-[24px] font-bold text-slate-900 mb-6">
              Flexible budget policies
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-[16px] font-semibold text-slate-900 mb-3">Budget periods</h3>
                <ul className="space-y-2 text-[14px] text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Monthly, quarterly, or annual
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Custom fiscal year start dates
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Rolling 12-month budgets
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-slate-900 mb-3">Warning thresholds</h3>
                <ul className="space-y-2 text-[14px] text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Configurable warning levels (default 80%)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Optional hard stops (or just warnings)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Slack/email notifications to budget owners
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-12 text-white mb-16">
            <h2 className="text-[28px] font-bold mb-8 text-center">Results with budget guardrails</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-[48px] font-bold text-blue-400 mb-2">Zero</div>
                <div className="text-[16px] text-slate-300">
                  Surprise budget overruns
                </div>
              </div>
              <div className="text-center">
                <div className="text-[48px] font-bold text-green-400 mb-2">&lt;2%</div>
                <div className="text-[16px] text-slate-300">
                  Budget variance (vs 23% industry average)
                </div>
              </div>
              <div className="text-center">
                <div className="text-[48px] font-bold text-violet-400 mb-2">100%</div>
                <div className="text-[16px] text-slate-300">
                  Budget visibility (real-time, not monthly)
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-violet-50 border border-violet-200 rounded-2xl p-10">
            <h2 className="text-[28px] font-bold text-slate-900 mb-4">
              Enforce budgets automatically
            </h2>
            <p className="text-[16px] text-slate-600 mb-6 max-w-[600px] mx-auto">
              Set guardrails once, let them run forever. Soft warnings at 80%, hard stops at 100%. No more surprise overspend.
            </p>
            <a
              href="/beta"
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-8 py-4 rounded-lg text-[16px] font-semibold hover:bg-violet-700 transition-colors no-underline"
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
