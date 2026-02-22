"use client";

import { useEffect } from "react";
import { ScrollProgress, Nav, Footer, COLORS, useScrollReveal } from "../../components/shared";

/* ───── HOW IT WORKS (FULL DETAIL) ───── */
const HowItWorks = () => {
  const [ref, isVisible] = useScrollReveal(0.2);

  return (
    <section ref={ref} style={{
      minHeight: "100vh", display: "flex", alignItems: "center", padding: "140px 32px 100px",
      background: COLORS.bg,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(50px)",
      transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
            How it works
          </p>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
            Request → Approve → Synced
          </h1>
          <p style={{ fontSize: 18, color: COLORS.textMuted, lineHeight: 1.7, maxWidth: 700, margin: "0 auto" }}>
            Three steps that actually get used. No complex workflows, no training required.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {[
            {
              num: "01",
              title: "Request from Slack",
              desc: "Type /reqflow buy in Slack. Fill out a simple form (tool name, cost, justification). Submit in under 30 seconds.",
              note: "Beta: Manual form, no AI yet",
              details: ["Slack integration ✓", "Simple intake form ✓", "Coming: AI classification", "Coming: Duplicate detection"],
            },
            {
              num: "02",
              title: "Approved via email",
              desc: "Approvers get email notifications with request details. They review and approve. One click, done.",
              note: "Beta: Manual routing setup",
              details: ["Email notifications ✓", "Manual routing ✓", "Coming: Workflow builder", "Coming: Auto-escalation"],
            },
            {
              num: "03",
              title: "Synced to books",
              desc: "Approved purchases are logged. You trigger sync to QuickBooks or Xero manually. Full audit trail maintained.",
              note: "Beta: Manual sync trigger",
              details: ["QB/Xero integration ✓", "Manual sync trigger ✓", "Coming: Auto-sync", "Coming: Real-time budgets"],
            },
          ].map((step, i) => (
            <div key={i} style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: 40,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(30px)",
              transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`,
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.accent, marginBottom: 16, letterSpacing: "0.05em" }}>{step.num}</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{step.title}</h3>
              <p style={{ fontSize: 16, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>{step.desc}</p>
              <p style={{ fontSize: 13, color: COLORS.warning, marginBottom: 24 }}>⚠ {step.note}</p>

              <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
                {step.details.map((detail, j) => (
                  <div key={j} style={{
                    fontSize: 14,
                    color: detail.startsWith("Coming") ? COLORS.warning : COLORS.success,
                    marginBottom: 8,
                  }}>
                    {detail.startsWith("Coming") ? "⏳" : "✓"} {detail}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ───── FEATURE STATUS GRID (WHAT WORKS VS COMING) ───── */
const FeatureStatus = () => {
  const [ref, isVisible] = useScrollReveal(0.2);

  return (
    <section ref={ref} style={{
      minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 32px",
      background: COLORS.bgLight,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(50px)",
      transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.warning, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
            Beta — Feature Status
          </p>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
            The basics work.<br />
            <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              The smart stuff is coming.
            </span>
          </h2>
          <p style={{ fontSize: 18, color: COLORS.textMuted, lineHeight: 1.7, maxWidth: 800, margin: "0 auto" }}>
            We're honest about what's ready and what's not. ✓ means it works today. "Coming" means we're building it with beta feedback.
          </p>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          {[
            {
              status: "working",
              title: "Slack-based request intake",
              desc: "Submit purchase requests via /reqflow buy. Simple form with tool name, cost, justification. Manual form fill for now.",
              working: ["Slack integration", "Simple intake form", "Request submission"],
              coming: ["AI classification", "Duplicate detection", "Smart suggestions"],
            },
            {
              status: "working",
              title: "Basic approval routing",
              desc: "Email notifications to approvers with request context. Manual workflow setup during onboarding.",
              working: ["Email notifications", "Manual routing setup", "Approval tracking"],
              coming: ["Visual workflow builder", "Auto-escalation", "OOO delegation"],
            },
            {
              status: "working",
              title: "QuickBooks & Xero sync",
              desc: "Export approved purchases to your accounting system. Manual sync trigger for now, auto-sync coming post-beta.",
              working: ["QB/Xero integration", "Manual sync trigger", "Audit trail export"],
              coming: ["Auto-sync", "Real-time budgets", "Budget enforcement"],
            },
            {
              status: "working",
              title: "Full audit trail",
              desc: "Every request, approval, and action is logged with timestamps and context. Export anytime. This works today.",
              working: ["Complete audit log", "Timestamp tracking", "One-click export", "GDPR compliant"],
              coming: [],
            },
          ].map((feature, i) => (
            <div key={i} style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: 40,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(-30px)",
              transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: COLORS.success,
                  background: "rgba(52,211,153,0.1)", padding: "4px 12px",
                  borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em",
                }}>✓ Working</span>
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{feature.title}</h3>
              <p style={{ fontSize: 16, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 24 }}>{feature.desc}</p>

              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Working Today</div>
                  {feature.working.map((item, j) => (
                    <div key={j} style={{ fontSize: 14, color: COLORS.success, marginBottom: 4 }}>✓ {item}</div>
                  ))}
                </div>
                {feature.coming.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Coming Soon</div>
                    {feature.coming.map((item, j) => (
                      <div key={j} style={{ fontSize: 14, color: COLORS.warning, marginBottom: 4 }}>⏳ {item}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ───── CTA ───── */
const CTA = () => {
  const [ref, isVisible] = useScrollReveal(0.3);

  return (
    <section ref={ref} style={{
      minHeight: "50vh", display: "flex", alignItems: "center", padding: "100px 32px",
      background: COLORS.bg,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <div style={{
        maxWidth: 700, margin: "0 auto", textAlign: "center",
        background: `radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)`,
        padding: "60px 40px", borderRadius: 20,
      }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, marginBottom: 20 }}>
          Help us decide what to build next
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 32, lineHeight: 1.6 }}>
          Beta customers have direct input on the roadmap. We're building features based on real needs, not a pre-set plan.
        </p>
        <a href="/beta" style={{
          display: "inline-block",
          background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
          color: COLORS.bg, padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700,
          textDecoration: "none", boxShadow: `0 0 40px ${COLORS.accentGlow}`,
        }}>Apply for Beta (10 Spots Left) →</a>
      </div>
    </section>
  );
};

/* ───── MAIN APP ───── */
export default function FeaturesPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", color: COLORS.text,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <ScrollProgress />
      <Nav />
      <HowItWorks />
      <FeatureStatus />
      <CTA />
      <Footer />
    </div>
  );
}
