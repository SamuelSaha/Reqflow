import { PageShell } from "@/components/layout";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Building2, FileText, TrendingUp, AlertTriangle, ArrowRight, Check } from "lucide-react";

export default function VendorTrackingPage() {
  return (
    <PageShell>
      <Section background="warm">
        <Container size="default">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 bg-green-50 mb-6">
              <Building2 className="w-4 h-4 text-green-600" />
              <span className="text-caption font-semibold text-green-900">Vendor Tracking</span>
            </div>
            <h1 className="text-hero font-extrabold tracking-[-1.5px] text-slate-900 mb-6 leading-[1.1]">
              Manage vendor relationships
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed">
              Keep all vendor data in one place: contracts, contacts, performance, and spending. Know who you work with and how they're performing.
            </p>
          </div>

          {/* The problem */}
          <div className="mb-16">
            <h2 className="text-h3 font-bold text-slate-900 mb-8 text-center">
              The vendor data problem
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-h5 font-bold text-slate-900 mb-4">Current state</h3>
                <ul className="space-y-3">
                  {[
                    "Contracts in random folders and email attachments",
                    "No central record of who we work with",
                    "Payment terms and contact info scattered",
                    "Can't answer 'How much do we spend with Vendor X?'",
                    "Duplicate vendors with slightly different names",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body text-slate-600">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                <h3 className="text-h5 font-bold text-slate-900 mb-4">With Reqflow</h3>
                <ul className="space-y-3">
                  {[
                    "Complete vendor database with all metadata",
                    "Contracts uploaded and searchable",
                    "Contact info, payment terms, and URLs centralized",
                    "Total spend by vendor (real-time)",
                    "Automatic vendor consolidation and matching",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body text-slate-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16 space-y-6">
            <h2 className="text-h3 font-bold text-slate-900 mb-8 text-center">
              Complete vendor profiles
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Centralized vendor database
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Every vendor gets a profile: company name, primary contact, payment terms, contract terms, website, and notes. All vendor data in one searchable place.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    "Contact information",
                    "Payment terms & methods",
                    "Contract & renewal dates",
                    "Website & support URLs",
                    "Internal notes & tags",
                    "Associated purchases",
                  ].map((item) => (
                    <div key={item} className="text-caption text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-center">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Contract management
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Upload contracts as PDFs. AI extracts key terms: start date, end date, renewal terms, cancellation policy, payment schedule. Get reminded before renewal.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-body-sm font-semibold text-slate-900 mb-2">Example extraction:</div>
                  <div className="text-caption text-slate-600 space-y-1">
                    <div>• Contract starts: Jan 1, 2026</div>
                    <div>• Term: 1 year, auto-renews unless cancelled 60 days prior</div>
                    <div>• Payment: Annual, due 30 days before renewal</div>
                    <div>• Cancellation: 60-day notice required</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-h5 font-bold text-slate-900 mb-3">
                  Vendor spend analysis
                </h3>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  See total spend by vendor across all purchases. Identify your top vendors. Track spending trends. Prepare for contract negotiations with data.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Total spend by vendor (YTD/all-time)",
                    "Number of active contracts",
                    "Upcoming renewals (30/60/90 days)",
                    "Vendor performance scoring (coming soon)",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-body-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Use cases */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 mb-16">
            <h2 className="text-h4 font-bold text-slate-900 mb-6 text-center">
              Questions you can finally answer
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Who is our Notion account rep?",
                "How much do we spend with AWS annually?",
                "What vendors have contracts expiring this quarter?",
                "Which vendors do we work with most?",
                "When does the GitHub contract auto-renew?",
                "What are our payment terms with Vendor X?",
              ].map((question) => (
                <div key={question} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-slate-200">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-body text-slate-700">{question}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-green-50 border border-green-200 rounded-2xl p-10">
            <h2 className="text-h4 font-bold text-slate-900 mb-4">
              Know who you work with
            </h2>
            <p className="text-body text-slate-600 mb-6 max-w-[600px] mx-auto">
              Centralize vendor data, track contracts, and analyze spending. One place for all vendor relationships.
            </p>
            <a
              href="/beta"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg text-body font-semibold hover:bg-green-700 transition-colors no-underline"
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
