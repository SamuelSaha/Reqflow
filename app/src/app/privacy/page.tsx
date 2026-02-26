import { PageShell } from "@/components/layout";

export default function PrivacyPage() {
  return (
    <PageShell>
      <section className="pt-20 pb-20 px-20">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-body text-slate-500 mb-12">Last updated: February 2026 · Beta version</p>

          <p className="text-body text-slate-600 leading-[1.8] mb-8">
            This privacy policy explains how Reqflow ("we", "us") collects, uses, and protects your data. We're in beta, so this policy will evolve as the product matures.
          </p>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Data We Collect</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 space-y-6">
              <div>
                <h3 className="text-body-lg font-bold text-blue-600 mb-3">Account Information</h3>
                <p className="text-body text-slate-600 leading-[1.7]">Name, email, company name, role. Provided during signup and used for authentication and support.</p>
              </div>
              <div>
                <h3 className="text-body-lg font-bold text-blue-600 mb-3">Purchase Request Data</h3>
                <p className="text-body text-slate-600 leading-[1.7]">Request details (tool name, cost, justification), approval history, and audit logs. This is your operational data.</p>
              </div>
              <div>
                <h3 className="text-body-lg font-bold text-blue-600 mb-3">Usage Data</h3>
                <p className="text-body text-slate-600 leading-[1.7]">Basic analytics (page views, feature usage) to improve the product. No third-party trackers during beta.</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">How We Use Your Data</h2>
            <ul className="text-body text-slate-600 leading-[1.9] pl-6 list-disc">
              <li>Provide the Reqflow service (intake, approvals, sync)</li>
              <li>Send transactional emails (approval notifications, request updates)</li>
              <li>Sync approved purchases to your accounting system (when configured)</li>
              <li>Improve the product based on aggregate usage patterns</li>
              <li>Communicate with you about your account and beta program</li>
            </ul>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Data Location & Security</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 space-y-3">
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Hosting:</strong> All data stored in EU (Paris) on Oracle Cloud Free Tier infrastructure</p>
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Database:</strong> PostgreSQL on Neon (EU region), encrypted at rest</p>
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Cache/Queue:</strong> Redis on Upstash (EU region)</p>
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Access:</strong> Row-level security, audit logging, minimal team access (founders only during beta)</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Third-Party Services</h2>
            <p className="text-body text-slate-600 leading-[1.7] mb-4">We use minimal third-party services:</p>
            <ul className="text-body text-slate-600 leading-[1.9] pl-6 list-disc">
              <li><strong className="text-slate-900">Resend:</strong> Transactional emails (approval notifications)</li>
              <li><strong className="text-slate-900">Slack:</strong> Request intake (if you configure it)</li>
              <li><strong className="text-slate-900">QuickBooks/Xero:</strong> Accounting sync (if you configure it)</li>
              <li><strong className="text-slate-900">Cloudflare R2:</strong> File storage (for invoice attachments)</li>
            </ul>
            <p className="text-body text-slate-500 mt-4">Each service has its own privacy policy. We only share data necessary for functionality.</p>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Your Rights (GDPR)</h2>
            <p className="text-body text-slate-600 leading-[1.7] mb-4">You have the right to:</p>
            <ul className="text-body text-slate-600 leading-[1.9] pl-6 list-disc">
              <li>Access your data (export functionality in progress)</li>
              <li>Correct inaccurate data (via app settings)</li>
              <li>Delete your data (contact us: <a href="mailto:privacy@reqflow.co" className="text-blue-600 no-underline">privacy@reqflow.co</a>)</li>
              <li>Object to processing (contact us)</li>
              <li>Data portability (we'll provide JSON export)</li>
            </ul>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Data Retention</h2>
            <p className="text-body text-slate-600 leading-[1.7]">We retain your data while your account is active. After account deletion, we keep audit logs for 90 days (compliance), then permanently delete all data. During beta, we may ask permission to keep anonymized usage data for product development.</p>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Beta-Specific Note</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
              <p className="text-body text-slate-600 leading-[1.7]">We're in early beta. While we take security seriously (RLS, encryption, EU hosting), we don't have formal certifications yet (SOC 2 planned for Q3 2026). Don't use Reqflow for highly sensitive procurement until we complete our security audit.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Changes to This Policy</h2>
            <p className="text-body text-slate-600 leading-[1.7]">We'll notify you via email 30 days before any material changes. Continued use after changes means acceptance.</p>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Contact</h2>
            <p className="text-body text-slate-600 leading-[1.7]">Questions or requests: <a href="mailto:privacy@reqflow.co" className="text-blue-600 font-semibold no-underline">privacy@reqflow.co</a></p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
