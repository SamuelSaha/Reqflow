const COLORS = {
  bg: "#09090b",
  surface: "#131316",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  accent: "#22d3ee",
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 24, lineHeight: 1.1 }}>
          Why We're Building Reqflow
        </h1>

        <div style={{ fontSize: 19, color: COLORS.textMuted, lineHeight: 1.8, marginBottom: 48 }}>
          <p style={{ marginBottom: 24 }}>
            Every company with 50-250 employees hits the same wall: procurement becomes a bottleneck, but hiring a dedicated procurement team doesn't make sense yet.
          </p>
          <p style={{ marginBottom: 24 }}>
            The finance team ends up spending 8+ hours per week chasing approvals, reconciling purchases, and wondering what subscriptions they're actually paying for.
          </p>
          <p>
            We're building Reqflow to be the procurement "front door" for companies in this stage — structured enough to create visibility and control, simple enough that everyone actually uses it.
          </p>
        </div>

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 40, marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Where We Are Today</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: COLORS.text }}>Early beta.</strong> We have a working Slack-based intake form, basic approval routing, and manual QuickBooks/Xero sync. It's not polished, but it works.
          </p>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: COLORS.text }}>Seeking 10 beta customers.</strong> We're looking for companies willing to tolerate rough edges in exchange for €99/mo pricing (locked forever) and direct input on the roadmap.
          </p>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            <strong style={{ color: COLORS.text }}>Built for feedback.</strong> This isn't a "take it or leave it" product. We're actively shaping it based on what our first customers need.
          </p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Our Principles</h2>
          <div style={{ display: "grid", gap: 20 }}>
            {[
              {
                title: "€0 infrastructure obsession",
                desc: "We run on Oracle Always Free, Neon/Upstash free tiers, and open-source tools. This forces us to stay lean and pass savings to customers.",
              },
              {
                title: "Slack-native, not Slack-integrated",
                desc: "If it's not in Slack, people won't use it. We're building for where work actually happens, not where we think it should happen.",
              },
              {
                title: "No procurement jargon",
                desc: "You don't have a procurement team. We're not going to pretend you need one or use language designed for enterprise buyers.",
              },
              {
                title: "Honest about limitations",
                desc: "We'd rather lose a sale than promise something we can't deliver. If it's not ready, we'll tell you.",
              },
            ].map((item, i) => (
              <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: COLORS.accent }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 40, marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Who's Building This</h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            Reqflow is built by a small team who've experienced this problem firsthand — as the finance person drowning in Slack procurement requests, and as the eng manager waiting 11 days for a $500/mo SaaS approval.
          </p>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            We're based in Paris, hosting on EU infrastructure, and building for the European market first (though we welcome companies elsewhere).
          </p>
        </div>

        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 24 }}>
            Interested in shaping this with us?
          </p>
          <a href="/beta" style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${COLORS.accent}, #818cf8)`,
            color: COLORS.bg, padding: "14px 32px", borderRadius: 10,
            fontSize: 16, fontWeight: 700, textDecoration: "none",
          }}>
            Apply for beta access
          </a>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24, marginTop: 48 }}>
          <p style={{ fontSize: 14, color: COLORS.textDim, textAlign: "center" }}>
            <a href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>← Back to home</a>
            {" · "}
            <a href="/contact" style={{ color: COLORS.textDim, textDecoration: "none" }}>Contact</a>
          </p>
        </div>
      </div>
    </div>
  );
}
