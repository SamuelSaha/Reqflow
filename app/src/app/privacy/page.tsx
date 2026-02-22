const COLORS = {
  bg: "#09090b",
  surface: "#131316",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  accent: "#22d3ee",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 16 }}>Privacy Policy</h1>
        <p style={{ fontSize: 15, color: COLORS.textDim, marginBottom: 48 }}>
          Last updated: February 2026 · Beta version
        </p>

        <div style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.8, marginBottom: 32 }}>
          <p style={{ marginBottom: 24 }}>
            This privacy policy explains how Reqflow ("we", "us") collects, uses, and protects your data. We're in beta, so this policy will evolve as the product matures.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Data We Collect</h2>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Account Information</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
                Name, email, company name, role. Provided during signup and used for authentication and support.
              </p>
            </div>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Purchase Request Data</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
                Request details (tool name, cost, justification), approval history, and audit logs. This is your operational data.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Usage Data</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
                Basic analytics (page views, feature usage) to improve the product. No third-party trackers during beta.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>How We Use Your Data</h2>
          <ul style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.9, paddingLeft: 24 }}>
            <li>Provide the Reqflow service (intake, approvals, sync)</li>
            <li>Send transactional emails (approval notifications, request updates)</li>
            <li>Sync approved purchases to your accounting system (when configured)</li>
            <li>Improve the product based on aggregate usage patterns</li>
            <li>Communicate with you about your account and beta program</li>
          </ul>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Data Location & Security</h2>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>Hosting:</strong> All data stored in EU (Paris) on Oracle Cloud Free Tier infrastructure
              </p>
              <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>Database:</strong> PostgreSQL on Neon (EU region), encrypted at rest
              </p>
              <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: COLORS.text }}>Cache/Queue:</strong> Redis on Upstash (EU region)
              </p>
              <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.text }}>Access:</strong> Row-level security, audit logging, minimal team access (founders only during beta)
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Third-Party Services</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            We use minimal third-party services:
          </p>
          <ul style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.9, paddingLeft: 24 }}>
            <li><strong style={{ color: COLORS.text }}>Resend:</strong> Transactional emails (approval notifications)</li>
            <li><strong style={{ color: COLORS.text }}>Slack:</strong> Request intake (if you configure it)</li>
            <li><strong style={{ color: COLORS.text }}>QuickBooks/Xero:</strong> Accounting sync (if you configure it)</li>
            <li><strong style={{ color: COLORS.text }}>Cloudflare R2:</strong> File storage (for invoice attachments)</li>
          </ul>
          <p style={{ fontSize: 15, color: COLORS.textDim, marginTop: 16 }}>
            Each service has its own privacy policy. We only share data necessary for functionality.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Your Rights (GDPR)</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            You have the right to:
          </p>
          <ul style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.9, paddingLeft: 24 }}>
            <li>Access your data (export functionality in progress)</li>
            <li>Correct inaccurate data (via app settings)</li>
            <li>Delete your data (contact us: <a href="mailto:privacy@reqflow.co" style={{ color: COLORS.accent }}>privacy@reqflow.co</a>)</li>
            <li>Object to processing (contact us)</li>
            <li>Data portability (we'll provide JSON export)</li>
          </ul>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Data Retention</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            We retain your data while your account is active. After account deletion, we keep audit logs for 90 days (compliance), then permanently delete all data.
            During beta, we may ask permission to keep anonymized usage data for product development.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Beta-Specific Note</h2>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
              We're in early beta. While we take security seriously (RLS, encryption, EU hosting), we don't have formal certifications yet (SOC 2 planned for Q3 2026).
              Don't use Reqflow for highly sensitive procurement until we complete our security audit.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Changes to This Policy</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            We'll notify you via email 30 days before any material changes. Continued use after changes means acceptance.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Contact</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            Questions or requests: <a href="mailto:privacy@reqflow.co" style={{ color: COLORS.accent, fontWeight: 600 }}>privacy@reqflow.co</a>
          </p>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24 }}>
          <p style={{ fontSize: 14, color: COLORS.textDim, textAlign: "center" }}>
            <a href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>← Back to home</a>
            {" · "}
            <a href="/terms" style={{ color: COLORS.textDim, textDecoration: "none" }}>Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
