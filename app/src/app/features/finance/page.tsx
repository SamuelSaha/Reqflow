import { PageShell } from "@/components/layout";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Wallet, FileText, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";

export default function ForFinancePage() {
  return (
    <PageShell>
      <Section background="warm">
        <Container size="default">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-200 bg-violet-50 mb-6">
              <Wallet className="w-4 h-4 text-violet-600" />
              <span className="text-caption font-semibold text-violet-900">For Finance</span>
            </div>
            <h1 className="text-hero font-extrabold tracking-[-1.5px] text-slate-900 mb-6 leading-[1.1]">
              Budget tracking & compliance
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed">
              You're accountable for every dollar. Reqflow gives you real-time visibility, automated controls, and audit trails that actually work.
            </p>
          </div>

          {/* Pain points */}
          <div className="mb-16">
            <h2 className="text-h3 font-bold text-slate-900 mb-8 text-center">
              The finance team's nightmare
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-body-lg font-bold text-slate-900 mb-3">
                  "Budgets are always out of date"
                </h3>
                <p className="text-body text-slate-600 leading-relaxed">
                  Your budget spreadsheet is a snapshot from last week. By the time you update it, three more subscriptions got approved.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-body-lg font-bold text-slate-900 mb-3">
                  "Audit prep takes weeks"
                </h3>
                <p className="text-body text-slate-600 leading-relaxed">
                  Digging through email chains to prove who approved what. Reconciling invoices to purchase orders manually. Audit trail doesn't exist.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-body-lg font-bold text-slate-900 mb-3">
                  "No one knows what we're paying for"
                </h3>
                <p className="text-body text-slate-600 leading-relaxed">
                  SaaS tools appear on credit card statements. No idea who requested them, who owns them, or if we still need them.
                </p>
              </div>
            </div>
          </div>

          {/* Features for finance */}
          <div className="mb-16 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Live budget tracking
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Real-time budget consumption by department, project, and category. Soft warnings at 80%, hard stops at 100%. No more budget surprises.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    "Hierarchical budgets (department → project → category)",
                    "Automatic budget checks before approval",
                    "Monthly/quarterly budget reports with variance analysis",
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
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Complete audit trail
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Every purchase logged with requester, approvers, justification, timestamps. Full approval chain visible. Export to PDF for compliance in one click.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    "Immutable audit logs (who, what, when, why)",
                    "Role-based access control with RLS",
                    "GDPR-compliant data handling (EU hosting)",
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
                <FileText className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Accounting sync that closes the loop
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Approved requests → POs in QuickBooks/Xero → invoices match automatically. Complete purchase-to-pay cycle tracked in one system.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    "Two-way sync with QuickBooks & Xero",
                    "Automatic PO creation on approval",
                    "Invoice matching with exception flagging",
                  ].map((item) => (
                    <span key={item} className="text-body-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-12 text-white mb-16">
            <h2 className="text-h4 font-bold mb-8 text-center">What finance teams gain</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-h2 font-bold text-blue-400 mb-2">5x</div>
                <div className="text-body text-slate-300">
                  Faster audit prep (from weeks to days)
                </div>
              </div>
              <div className="text-center">
                <div className="text-h2 font-bold text-green-400 mb-2">100%</div>
                <div className="text-body text-slate-300">
                  Budget visibility (real-time, not monthly)
                </div>
              </div>
              <div className="text-center">
                <div className="text-h2 font-bold text-violet-400 mb-2">Zero</div>
                <div className="text-body text-slate-300">
                  Surprise spend (hard stops at budget limits)
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-violet-50 border border-violet-200 rounded-2xl p-10">
            <h2 className="text-h4 font-bold text-slate-900 mb-4">
              Get control without becoming a bottleneck
            </h2>
            <p className="text-body text-slate-600 mb-6 max-w-[600px] mx-auto">
              Real-time budgets, complete audit trails, and accounting sync that actually works. Free during early access.
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
