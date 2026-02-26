import { PageShell } from "@/components/layout";

export default function SecurityPage() {
  return (
    <PageShell>
      <section className="pt-20 pb-20 px-20">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-[48px] font-extrabold tracking-tight text-slate-900 mb-4">Security Practices</h1>
          <p className="text-[15px] text-slate-500 mb-12">Last updated: February 2026 · Beta version</p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
            <h3 className="text-body-lg font-bold text-amber-600 mb-3">Beta Security Status</h3>
            <p className="text-body text-slate-600 leading-[1.7] mb-3">We take security seriously, but we're in early beta. What this means:</p>
            <ul className="text-body text-slate-600 leading-[1.8] pl-5 list-disc">
              <li>Production-grade security practices (RLS, encryption, EU hosting)</li>
              <li>No formal certifications yet (SOC 2 planned Q3 2026)</li>
              <li>No external security audit yet (planned for 50+ customers)</li>
              <li>Don't use Reqflow for highly sensitive procurement during beta</li>
            </ul>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Infrastructure Security</h2>
            <div className="grid gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-7">
                <h3 className="text-body-lg font-bold text-blue-600 mb-3">Hosting & Data Location</h3>
                <p className="text-body text-slate-600 leading-[1.7] mb-3"><strong className="text-slate-900">EU-only hosting:</strong> All data stored in Paris (France) on Oracle Cloud Free Tier infrastructure.</p>
                <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Database:</strong> PostgreSQL on Neon (EU region), encrypted at rest with AES-256.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-7">
                <h3 className="text-body-lg font-bold text-blue-600 mb-3">Data Encryption</h3>
                <p className="text-body text-slate-600 leading-[1.7] mb-3"><strong className="text-slate-900">At rest:</strong> PostgreSQL on Neon uses AES-256 encryption for all data at rest.</p>
                <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">In transit:</strong> All connections use TLS 1.3 (HTTPS for web, encrypted connections for database/Redis).</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-7">
                <h3 className="text-body-lg font-bold text-blue-600 mb-3">Backup & Recovery</h3>
                <p className="text-body text-slate-600 leading-[1.7] mb-3"><strong className="text-slate-900">Automated backups:</strong> Neon provides point-in-time recovery (PITR) with 7-day retention.</p>
                <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Recovery testing:</strong> We test backup restoration monthly (beta: not yet automated).</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Application Security</h2>
            <div className="grid gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-7">
                <h3 className="text-body-lg font-bold text-blue-600 mb-3">Authentication</h3>
                <div className="space-y-3 text-body text-slate-600 leading-[1.7]">
                  <p><strong className="text-slate-900">Better Auth:</strong> Industry-standard auth library with secure session management.</p>
                  <p><strong className="text-slate-900">MFA:</strong> TOTP-based multi-factor authentication available (beta: optional, will be mandatory for admins post-beta).</p>
                  <p><strong className="text-slate-900">Password policy:</strong> Minimum 12 characters, checked against leaked password databases (HaveIBeenPwned).</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-7">
                <h3 className="text-body-lg font-bold text-blue-600 mb-3">Access Control</h3>
                <div className="space-y-3 text-body text-slate-600 leading-[1.7]">
                  <p><strong className="text-slate-900">Row-Level Security (RLS):</strong> PostgreSQL RLS ensures each company can only access their own data at the database level.</p>
                  <p><strong className="text-slate-900">Role-based access:</strong> Admin, Finance, Approver, Employee roles with granular permissions.</p>
                  <p><strong className="text-slate-900">Audit logging:</strong> Every sensitive action (approvals, data exports, permission changes) is logged with timestamps and user context.</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-7">
                <h3 className="text-body-lg font-bold text-blue-600 mb-3">API Security</h3>
                <div className="space-y-3 text-body text-slate-600 leading-[1.7]">
                  <p><strong className="text-slate-900">tRPC with Zod:</strong> Type-safe API with runtime validation on all inputs. SQL injection and XSS prevention baked in.</p>
                  <p><strong className="text-slate-900">Rate limiting:</strong> Upstash Redis-based rate limiting to prevent abuse (beta: basic, will be enhanced post-beta).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Third-Party Services</h2>
            <p className="text-[17px] text-slate-600 leading-[1.7] mb-5">We use minimal third-party services, all with strong security practices:</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Neon (PostgreSQL)", cert: "SOC 2 Type II" },
                { name: "Upstash (Redis)", cert: "SOC 2 Type II" },
                { name: "Cloudflare R2", cert: "SOC 2 Type II" },
                { name: "Resend (Email)", cert: "SOC 2 Type II" },
                { name: "Stripe (Payments)", cert: "PCI DSS Level 1" },
                { name: "Oracle Cloud", cert: "SOC 1/2/3, ISO 27001" },
              ].map(({ name, cert }) => (
                <div key={name} className="bg-slate-50 border border-slate-200 rounded-[10px] p-5">
                  <div className="text-[15px] font-semibold text-slate-900 mb-1.5">{name}</div>
                  <div className="text-[13px] text-emerald-600 font-medium">{cert}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Incident Response</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 space-y-4">
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Monitoring:</strong> Axiom for logs, Sentry for errors, Uptime Robot for availability (beta: basic monitoring, will be enhanced).</p>
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Incident notification:</strong> If a security incident affects your data, we'll notify you within 24 hours via email.</p>
              <p className="text-body text-slate-600 leading-[1.7]"><strong className="text-slate-900">Beta-specific:</strong> During beta, founders have direct access to all systems. Minimal team = reduced insider risk.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Compliance Roadmap</h2>
            <div className="grid gap-3">
              {[
                { status: "\u2713", label: "GDPR compliance (EU data residency, RLS, audit logs)", ready: true },
                { status: "\u23F3", label: "SOC 2 Type II certification (planned Q3 2026)", ready: false },
                { status: "\u23F3", label: "External penetration testing (planned for 50+ customers)", ready: false },
                { status: "\u23F3", label: "ISO 27001 certification (planned 2027)", ready: false },
              ].map(({ status, label, ready }) => (
                <div key={label} className="bg-slate-50 border border-slate-200 rounded-[10px] p-[18px] flex items-center gap-3">
                  <span className="text-[18px]">{status}</span>
                  <span className={`text-[15px] ${ready ? "text-emerald-600" : "text-slate-600"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Responsible Disclosure</h2>
            <p className="text-[17px] text-slate-600 leading-[1.7] mb-4">Found a security vulnerability? Please report it responsibly:</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-7 space-y-3">
              <p className="text-[15px] text-slate-600 leading-[1.7]"><strong className="text-slate-900">Email:</strong> <a href="mailto:security@reqflow.co" className="text-blue-600 font-semibold no-underline">security@reqflow.co</a></p>
              <p className="text-[15px] text-slate-600 leading-[1.7]"><strong className="text-slate-900">Response time:</strong> We'll acknowledge within 24 hours and provide updates within 72 hours.</p>
              <p className="text-[15px] text-slate-600 leading-[1.7]"><strong className="text-slate-900">Beta bounty:</strong> No formal bug bounty program yet, but we'll credit you publicly (if you want) and offer 3 months free for critical findings.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Questions?</h2>
            <p className="text-[17px] text-slate-600 leading-[1.7]">Security questions or concerns: <a href="mailto:security@reqflow.co" className="text-blue-600 font-semibold no-underline">security@reqflow.co</a></p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
