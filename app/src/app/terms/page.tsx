import { PageShell } from "@/components/layout";

export default function TermsPage() {
  return (
    <PageShell>
      <section className="pt-20 pb-20 px-20">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-body text-slate-500 mb-12">Last updated: February 2026 · Beta version</p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
            <h3 className="text-body-lg font-bold text-amber-600 mb-3">Beta Terms</h3>
            <p className="text-body text-slate-600 leading-[1.7]">These are beta terms. We're being as fair as possible while acknowledging this is early-stage software. If something doesn't work as described, we'll refund you. No questions asked.</p>
          </div>

          <p className="text-body-lg text-slate-600 leading-[1.8] mb-8">
            These Terms of Service ("Terms") govern your use of Reqflow ("Service"), provided by Reqflow (in formation) ("we", "us", "Company"). By using Reqflow, you agree to these terms.
          </p>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">1. Service Description</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
              <p className="text-body text-slate-600 leading-[1.7] mb-4"><strong className="text-slate-900">What Reqflow does:</strong> Provides a procurement request intake and approval system with accounting sync. During beta, features are limited to:</p>
              <ul className="text-body text-slate-600 leading-[1.8] pl-5 list-disc mb-4">
                <li>Slack-based request intake</li>
                <li>Basic email approval workflows (manual setup)</li>
                <li>QuickBooks/Xero sync (manual trigger)</li>
                <li>Audit trail and export</li>
              </ul>
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">What Reqflow does NOT do (yet):</strong> AI classification, duplicate detection, real-time budgets, mobile push notifications, auto-escalation.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">2. Beta Program Terms</h2>
            <div className="space-y-4 text-body-lg text-slate-600 leading-[1.7]">
              <p><strong className="text-slate-900">Founding Member Pricing:</strong> First 10 beta customers pay &euro;99/month. This rate is locked forever, even after we raise prices post-beta.</p>
              <p><strong className="text-slate-900">No Long-Term Commitment:</strong> Month-to-month subscription. Cancel anytime. No penalties.</p>
              <p><strong className="text-slate-900">Beta Expectations:</strong> You acknowledge this is beta software. There will be bugs. Features will be missing. We'll communicate honestly about limitations and fix issues quickly.</p>
              <p><strong className="text-slate-900">Beta Participation:</strong> You agree to monthly 15-min check-ins and a shared Slack channel with founders for feedback.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">3. Payment & Billing</h2>
            <ul className="text-body-lg text-slate-600 leading-[1.9] pl-6 list-disc">
              <li><strong className="text-slate-900">Billing:</strong> Monthly subscription charged on the first day of each month via Stripe.</li>
              <li><strong className="text-slate-900">Refund Policy:</strong> If something doesn't work as described, email us within 7 days for a full refund.</li>
              <li><strong className="text-slate-900">Price Lock:</strong> Beta customers (&euro;99/mo) are locked in forever. We will never increase your rate.</li>
              <li><strong className="text-slate-900">Failed Payments:</strong> If payment fails, we'll email you. Service paused after 7 days, canceled after 30 days.</li>
            </ul>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">4. Acceptable Use</h2>
            <p className="text-body-lg text-slate-600 leading-[1.7] mb-4">You may not:</p>
            <ul className="text-body-lg text-slate-600 leading-[1.9] pl-6 list-disc">
              <li>Use Reqflow for illegal activities or to violate others' rights</li>
              <li>Attempt to hack, disrupt, or reverse-engineer the service</li>
              <li>Resell or sublicense access to Reqflow without written permission</li>
              <li>Upload malware, spam, or abusive content</li>
              <li>Scrape or exfiltrate data beyond your organization's own data</li>
            </ul>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">5. Data Ownership & Privacy</h2>
            <div className="space-y-4 text-body-lg text-slate-600 leading-[1.7]">
              <p><strong className="text-slate-900">Your Data:</strong> You own your data. We store it securely (EU region, encryption at rest) and never sell it.</p>
              <p><strong className="text-slate-900">Data Portability:</strong> Export your data anytime as JSON via the app (feature in progress) or by emailing us.</p>
              <p>See our <a href="/privacy" className="text-blue-600 no-underline">Privacy Policy</a> for full details on data handling.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">6. Service Availability & Warranties</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 space-y-4">
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Beta Disclaimer:</strong> Reqflow is provided "as is" during beta. We make no warranties about uptime, data accuracy, or feature completeness.</p>
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">No SLA:</strong> We don't have a formal SLA yet (planned for post-beta). We aim for 99% uptime but can't guarantee it.</p>
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Best Effort Support:</strong> We respond to support requests within 48 hours (business days, CET). Critical issues get priority.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">7. Limitation of Liability</h2>
            <div className="space-y-4 text-body-lg text-slate-600 leading-[1.7]">
              <p>To the maximum extent permitted by law, Reqflow is not liable for indirect, incidental, or consequential damages arising from your use of the service (e.g., lost revenue, data loss).</p>
              <p>Our total liability is limited to the amount you paid in the last 3 months (max &euro;297 for beta customers).</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">8. Account Termination</h2>
            <div className="space-y-4 text-body-lg text-slate-600 leading-[1.7]">
              <p><strong className="text-slate-900">You can cancel anytime:</strong> No penalties. We'll delete your data 90 days after cancellation (compliance retention).</p>
              <p><strong className="text-slate-900">We can terminate for cause:</strong> If you violate these terms (spam, abuse, illegal use), we'll suspend your account and provide 7 days to export data before deletion.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">9. Changes to Terms</h2>
            <p className="text-body-lg text-slate-600 leading-[1.7]">We'll notify you 30 days before any material changes via email. Continued use after changes means acceptance. If you don't agree, cancel before the changes take effect.</p>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">10. Governing Law</h2>
            <p className="text-body-lg text-slate-600 leading-[1.7]">These Terms are governed by French law. Any disputes will be resolved in Paris, France. (We're based here, and our data is hosted in the EU.)</p>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Contact</h2>
            <p className="text-body-lg text-slate-600 leading-[1.7]">Questions about these terms: <a href="mailto:legal@reqflow.co" className="text-blue-600 font-semibold no-underline">legal@reqflow.co</a></p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
