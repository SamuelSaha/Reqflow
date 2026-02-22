const COLORS = {
  bg: "#09090b",
  surface: "#131316",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  accent: "#22d3ee",
  success: "#34d399",
  warning: "#f59e0b",
};

export default function SecurityPage() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: "80px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 16 }}>Security Practices</h1>
        <p style={{ fontSize: 15, color: COLORS.textDim, marginBottom: 48 }}>
          Last updated: February 2026 · Beta version
        </p>

        <div style={{
          background: "rgba(245,158,11,0.12)", border: `1px solid rgba(245,158,11,0.3)`,
          borderRadius: 12, padding: 24, marginBottom: 48,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.warning }}>Beta Security Status</h3>
          <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
            We take security seriously, but we're in early beta. What this means:
          </p>
          <ul style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.8, paddingLeft: 20 }}>
            <li>✓ Production-grade security practices (RLS, encryption, EU hosting)</li>
            <li>⚠ No formal certifications yet (SOC 2 planned Q3 2026)</li>
            <li>⚠ No external security audit yet (planned for 50+ customers)</li>
            <li>⚠ Don't use Reqflow for highly sensitive procurement during beta</li>
          </ul>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Infrastructure Security</h2>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Hosting & Data Location</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>EU-only hosting:</strong> All data stored in Paris (France) on Oracle Cloud Free Tier infrastructure.
              </p>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.text }}>Database:</strong> PostgreSQL on Neon (EU region), encrypted at rest with AES-256.
              </p>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Data Encryption</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>At rest:</strong> PostgreSQL on Neon uses AES-256 encryption for all data at rest.
              </p>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.text }}>In transit:</strong> All connections use TLS 1.3 (HTTPS for web, encrypted connections for database/Redis).
              </p>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Backup & Recovery</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>Automated backups:</strong> Neon provides point-in-time recovery (PITR) with 7-day retention.
              </p>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.text }}>Recovery testing:</strong> We test backup restoration monthly (beta: not yet automated).
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Application Security</h2>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Authentication</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>Better Auth:</strong> Industry-standard auth library with secure session management.
              </p>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>MFA:</strong> TOTP-based multi-factor authentication available (beta: optional, will be mandatory for admins post-beta).
              </p>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.text }}>Password policy:</strong> Minimum 12 characters, checked against leaked password databases (HaveIBeenPwned).
              </p>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Access Control</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>Row-Level Security (RLS):</strong> PostgreSQL RLS ensures each company can only access their own data at the database level.
              </p>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>Role-based access:</strong> Admin, Finance, Approver, Employee roles with granular permissions.
              </p>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.text }}>Audit logging:</strong> Every sensitive action (approvals, data exports, permission changes) is logged with timestamps and user context.
              </p>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>API Security</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>tRPC with Zod:</strong> Type-safe API with runtime validation on all inputs. SQL injection and XSS prevention baked in.
              </p>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.text }}>Rate limiting:</strong> Upstash Redis-based rate limiting to prevent abuse (beta: basic, will be enhanced post-beta).
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Third-Party Services</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 20 }}>
            We use minimal third-party services, all with strong security practices:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { name: "Neon (PostgreSQL)", cert: "SOC 2 Type II" },
              { name: "Upstash (Redis)", cert: "SOC 2 Type II" },
              { name: "Cloudflare R2", cert: "SOC 2 Type II" },
              { name: "Resend (Email)", cert: "SOC 2 Type II" },
              { name: "Stripe (Payments)", cert: "PCI DSS Level 1" },
              { name: "Oracle Cloud", cert: "SOC 1/2/3, ISO 27001" },
            ].map(({ name, cert }) => (
              <div key={name} style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 10, padding: 20,
              }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>{name}</div>
                <div style={{ fontSize: 13, color: COLORS.success }}>✓ {cert}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Incident Response</h2>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
              <strong style={{ color: COLORS.text }}>Monitoring:</strong> Axiom for logs, Sentry for errors, Uptime Robot for availability (beta: basic monitoring, will be enhanced).
            </p>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
              <strong style={{ color: COLORS.text }}>Incident notification:</strong> If a security incident affects your data, we'll notify you within 24 hours via email.
            </p>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
              <strong style={{ color: COLORS.text }}>Beta-specific:</strong> During beta, founders have direct access to all systems. Minimal team = reduced insider risk.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Compliance Roadmap</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { status: "✓", label: "GDPR compliance (EU data residency, RLS, audit logs)", ready: true },
              { status: "⏳", label: "SOC 2 Type II certification (planned Q3 2026)", ready: false },
              { status: "⏳", label: "External penetration testing (planned for 50+ customers)", ready: false },
              { status: "⏳", label: "ISO 27001 certification (planned 2027)", ready: false },
            ].map(({ status, label, ready }) => (
              <div key={label} style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 10, padding: 18, display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 18 }}>{status}</span>
                <span style={{ fontSize: 15, color: ready ? COLORS.success : COLORS.textMuted }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Responsible Disclosure</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            Found a security vulnerability? Please report it responsibly:
          </p>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 28 }}>
            <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
              <strong style={{ color: COLORS.text }}>Email:</strong> <a href="mailto:security@reqflow.co" style={{ color: COLORS.accent, fontWeight: 600 }}>security@reqflow.co</a>
            </p>
            <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
              <strong style={{ color: COLORS.text }}>Response time:</strong> We'll acknowledge within 24 hours and provide updates within 72 hours.
            </p>
            <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
              <strong style={{ color: COLORS.text }}>Beta bounty:</strong> No formal bug bounty program yet, but we'll credit you publicly (if you want) and offer 3 months free for critical findings.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Questions?</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            Security questions or concerns: <a href="mailto:security@reqflow.co" style={{ color: COLORS.accent, fontWeight: 600 }}>security@reqflow.co</a>
          </p>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24 }}>
          <p style={{ fontSize: 14, color: COLORS.textDim, textAlign: "center" }}>
            <a href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>← Back to home</a>
            {" · "}
            <a href="/privacy" style={{ color: COLORS.textDim, textDecoration: "none" }}>Privacy Policy</a>
            {" · "}
            <a href="/terms" style={{ color: COLORS.textDim, textDecoration: "none" }}>Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
