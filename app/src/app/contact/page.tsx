const COLORS = {
  bg: "#09090b",
  surface: "#131316",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  accent: "#22d3ee",
};

export default function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: "80px 24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 24 }}>Contact Us</h1>

        <div style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 48 }}>
          <p>We're a small team in beta. Here's how to reach us:</p>
        </div>

        <div style={{ display: "grid", gap: 24, marginBottom: 48 }}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Beta Program Questions</h3>
            <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
              Want to join the beta or have questions about the program?
            </p>
            <a href="mailto:beta@reqflow.co" style={{ color: COLORS.accent, fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
              beta@reqflow.co
            </a>
            <p style={{ fontSize: 13, color: COLORS.textDim, marginTop: 12 }}>
              We respond within 48 hours during business days (CET).
            </p>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Customer Support</h3>
            <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
              Current beta customers can reach us via:
            </p>
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: COLORS.text }}>Email:</strong>{" "}
              <a href="mailto:support@reqflow.co" style={{ color: COLORS.accent, textDecoration: "none" }}>
                support@reqflow.co
              </a>
            </div>
            <div>
              <strong style={{ color: COLORS.text }}>Shared Slack:</strong>{" "}
              <span style={{ color: COLORS.textMuted }}>We add you to our customer Slack channel</span>
            </div>
            <p style={{ fontSize: 13, color: COLORS.textDim, marginTop: 12 }}>
              Beta support: Best effort, 48h response time. We're hands-on during beta.
            </p>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Security & Privacy</h3>
            <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
              Security concerns or data inquiries:
            </p>
            <a href="mailto:security@reqflow.co" style={{ color: COLORS.accent, fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
              security@reqflow.co
            </a>
            <p style={{ fontSize: 13, color: COLORS.textDim, marginTop: 12 }}>
              See our <a href="/security" style={{ color: COLORS.accent }}>security page</a> for details on our practices.
            </p>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>Everything Else</h3>
            <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
              Partnerships, press, general inquiries:
            </p>
            <a href="mailto:hello@reqflow.co" style={{ color: COLORS.accent, fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
              hello@reqflow.co
            </a>
          </div>
        </div>

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32, marginBottom: 48 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Company Information</h3>
          <div style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.8 }}>
            <p><strong style={{ color: COLORS.text }}>Legal name:</strong> Reqflow (in formation)</p>
            <p><strong style={{ color: COLORS.text }}>Location:</strong> Paris, France 🇫🇷</p>
            <p><strong style={{ color: COLORS.text }}>Data hosting:</strong> EU (Paris) via Oracle Cloud + EU services</p>
            <p><strong style={{ color: COLORS.text }}>Status:</strong> Early beta (pre-incorporation)</p>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24 }}>
          <p style={{ fontSize: 14, color: COLORS.textDim, textAlign: "center" }}>
            <a href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>← Back to home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
