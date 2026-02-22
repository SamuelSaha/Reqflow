const COLORS = {
  bg: "#09090b",
  surface: "#131316",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  accent: "#22d3ee",
  warning: "#f59e0b",
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 16 }}>Terms of Service</h1>
        <p style={{ fontSize: 15, color: COLORS.textDim, marginBottom: 48 }}>
          Last updated: February 2026 · Beta version
        </p>

        <div style={{
          background: "rgba(245,158,11,0.12)", border: `1px solid rgba(245,158,11,0.3)`,
          borderRadius: 12, padding: 24, marginBottom: 48,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.warning }}>⚡ Beta Terms</h3>
          <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
            These are beta terms. We're being as fair as possible while acknowledging this is early-stage software. If something doesn't work as described, we'll refund you. No questions asked.
          </p>
        </div>

        <div style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.8, marginBottom: 32 }}>
          <p style={{ marginBottom: 24 }}>
            These Terms of Service ("Terms") govern your use of Reqflow ("Service"), provided by Reqflow (in formation) ("we", "us", "Company"). By using Reqflow, you agree to these terms.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>1. Service Description</h2>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
            <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
              <strong style={{ color: COLORS.text }}>What Reqflow does:</strong> Provides a procurement request intake and approval system with accounting sync. During beta, features are limited to:
            </p>
            <ul style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.8, paddingLeft: 20 }}>
              <li>Slack-based request intake</li>
              <li>Basic email approval workflows (manual setup)</li>
              <li>QuickBooks/Xero sync (manual trigger)</li>
              <li>Audit trail and export</li>
            </ul>
            <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginTop: 16 }}>
              <strong style={{ color: COLORS.text }}>What Reqflow does NOT do (yet):</strong> AI classification, duplicate detection, real-time budgets, mobile push notifications, auto-escalation.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>2. Beta Program Terms</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: COLORS.text }}>Founding Member Pricing:</strong> First 10 beta customers pay €99/month. This rate is locked forever, even after we raise prices post-beta.
          </p>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: COLORS.text }}>No Long-Term Commitment:</strong> Month-to-month subscription. Cancel anytime. No penalties.
          </p>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: COLORS.text }}>Beta Expectations:</strong> You acknowledge this is beta software. There will be bugs. Features will be missing. We'll communicate honestly about limitations and fix issues quickly.
          </p>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            <strong style={{ color: COLORS.text }}>Beta Participation:</strong> You agree to monthly 15-min check-ins and a shared Slack channel with founders for feedback.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>3. Payment & Billing</h2>
          <ul style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.9, paddingLeft: 24 }}>
            <li><strong style={{ color: COLORS.text }}>Billing:</strong> Monthly subscription charged on the first day of each month via Stripe.</li>
            <li><strong style={{ color: COLORS.text }}>Refund Policy:</strong> If something doesn't work as described, email us within 7 days for a full refund.</li>
            <li><strong style={{ color: COLORS.text }}>Price Lock:</strong> Beta customers (€99/mo) are locked in forever. We will never increase your rate.</li>
            <li><strong style={{ color: COLORS.text }}>Failed Payments:</strong> If payment fails, we'll email you. Service paused after 7 days, canceled after 30 days.</li>
          </ul>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>4. Acceptable Use</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>You may not:</p>
          <ul style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.9, paddingLeft: 24 }}>
            <li>Use Reqflow for illegal activities or to violate others' rights</li>
            <li>Attempt to hack, disrupt, or reverse-engineer the service</li>
            <li>Resell or sublicense access to Reqflow without written permission</li>
            <li>Upload malware, spam, or abusive content</li>
            <li>Scrape or exfiltrate data beyond your organization's own data</li>
          </ul>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>5. Data Ownership & Privacy</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: COLORS.text }}>Your Data:</strong> You own your data. We store it securely (EU region, encryption at rest) and never sell it.
          </p>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: COLORS.text }}>Data Portability:</strong> Export your data anytime as JSON via the app (feature in progress) or by emailing us.
          </p>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            See our <a href="/privacy" style={{ color: COLORS.accent }}>Privacy Policy</a> for full details on data handling.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>6. Service Availability & Warranties</h2>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
              <strong style={{ color: COLORS.text }}>Beta Disclaimer:</strong> Reqflow is provided "as is" during beta. We make no warranties about uptime, data accuracy, or feature completeness.
            </p>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
              <strong style={{ color: COLORS.text }}>No SLA:</strong> We don't have a formal SLA yet (planned for post-beta). We aim for 99% uptime but can't guarantee it.
            </p>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
              <strong style={{ color: COLORS.text }}>Best Effort Support:</strong> We respond to support requests within 48 hours (business days, CET). Critical issues get priority.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>7. Limitation of Liability</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            To the maximum extent permitted by law, Reqflow is not liable for indirect, incidental, or consequential damages arising from your use of the service (e.g., lost revenue, data loss).
          </p>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            Our total liability is limited to the amount you paid in the last 3 months (max €297 for beta customers).
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>8. Account Termination</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: COLORS.text }}>You can cancel anytime:</strong> No penalties. We'll delete your data 90 days after cancellation (compliance retention).
          </p>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            <strong style={{ color: COLORS.text }}>We can terminate for cause:</strong> If you violate these terms (spam, abuse, illegal use), we'll suspend your account and provide 7 days to export data before deletion.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>9. Changes to Terms</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            We'll notify you 30 days before any material changes via email. Continued use after changes means acceptance. If you don't agree, cancel before the changes take effect.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>10. Governing Law</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            These Terms are governed by French law. Any disputes will be resolved in Paris, France. (We're based here, and our data is hosted in the EU.)
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>Contact</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            Questions about these terms: <a href="mailto:legal@reqflow.co" style={{ color: COLORS.accent, fontWeight: 600 }}>legal@reqflow.co</a>
          </p>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24 }}>
          <p style={{ fontSize: 14, color: COLORS.textDim, textAlign: "center" }}>
            <a href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>← Back to home</a>
            {" · "}
            <a href="/privacy" style={{ color: COLORS.textDim, textDecoration: "none" }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
