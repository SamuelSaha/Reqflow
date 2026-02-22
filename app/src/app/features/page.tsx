"use client";

import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#09090b",
  surface: "#131316",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  accent: "#22d3ee",
  accentSoft: "rgba(34, 211, 238, 0.08)",
  warning: "#f59e0b",
  success: "#34d399",
  gradient1: "#22d3ee",
  gradient2: "#818cf8",
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>{children}</div>
  );
};

export default function FeaturesPage() {
  const workingFeatures = [
    {
      tag: "✓ Working", title: "Slack-based request intake",
      desc: "Submit purchase requests via /reqflow buy in Slack. Simple form with tool name, cost, justification. Beta: Manual form fill, no AI auto-complete yet.",
      details: ["Slack integration", "Simple intake form", "Coming: AI classification", "Coming: Duplicate detection"],
    },
    {
      tag: "✓ Working", title: "Basic approval routing",
      desc: "Email notifications to approvers with request context. Manual approval workflow setup. Beta: No visual workflow builder or auto-escalation yet.",
      details: ["Email notifications", "Manual routing setup", "Coming: Workflow builder", "Coming: Auto-escalation"],
    },
    {
      tag: "✓ Working", title: "QuickBooks & Xero sync",
      desc: "Export approved purchases to QuickBooks or Xero. Manual trigger for now. Beta: No real-time auto-sync or budget enforcement yet.",
      details: ["QB/Xero integration", "Manual sync trigger", "Coming: Auto-sync", "Coming: Real-time budgets"],
    },
    {
      tag: "✓ Working", title: "Full audit trail",
      desc: "Every request, approval, and action is logged with timestamps and context. Export anytime. This works today.",
      details: ["Complete audit log", "Timestamp tracking", "One-click export", "GDPR compliant"],
    },
  ];

  const comingFeatures = [
    {
      tag: "Coming Soon", title: "AI-powered categorization",
      desc: "Automatically classify purchases by category, department, and budget code. Learns from your historical data.",
      details: ["Auto-categorize", "Smart suggestions", "Budget code mapping", "Custom training"],
    },
    {
      tag: "Coming Soon", title: "Duplicate detection",
      desc: "Automatically flag duplicate subscriptions across teams. Prevent paying for the same tool twice.",
      details: ["Cross-team scanning", "Similar tool detection", "Cost savings alerts", "Consolidation suggestions"],
    },
    {
      tag: "Coming Soon", title: "Real-time budget enforcement",
      desc: "Track spending against budgets in real-time. Soft warnings at 80%, hard stops at 100%. See burn rate instantly.",
      details: ["Live budget tracking", "Threshold alerts", "Burn rate analytics", "Department budgets"],
    },
    {
      tag: "Coming Soon", title: "Mobile approvals",
      desc: "Native iOS and Android apps for one-tap approvals. Push notifications. Biometric authentication (Face ID / Touch ID).",
      details: ["iOS app", "Android app", "Push notifications", "Biometric approve"],
    },
    {
      tag: "Coming Soon", title: "Visual workflow builder",
      desc: "Drag-and-drop approval routing. Conditional logic based on amount, department, category. No-code customization.",
      details: ["Drag-drop builder", "Conditional routing", "Multi-step approvals", "OOO delegation"],
    },
    {
      tag: "Coming Soon", title: "Auto-escalation",
      desc: "Automatically escalate stalled requests. Configurable timers (24h, 48h, 72h). Notify next-level approvers.",
      details: ["Escalation timers", "Auto-delegation", "Skip rules", "Reminder emails"],
    },
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "60px 0 80px", maxWidth: 800, margin: "0 auto" }}>
          <FadeIn>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(245,158,11,0.12)", border: `1px solid rgba(245,158,11,0.3)`,
              borderRadius: 100, padding: "8px 20px", marginBottom: 32,
            }}>
              <span style={{ color: COLORS.warning, fontSize: 13, fontWeight: 600 }}>Beta Feature Status</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.035em" }}>
              The basics work.<br />
              <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                The smart stuff is coming.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{ fontSize: 19, color: COLORS.textMuted, lineHeight: 1.7 }}>
              We're honest about what's ready and what's not. ✓ means it works today. "Coming Soon" means we're building it with beta customer feedback.
            </p>
          </FadeIn>
        </div>

        {/* What Works Today */}
        <section style={{ marginBottom: 80 }}>
          <FadeIn>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40, textAlign: "center", color: COLORS.success }}>
              ✓ What Works Today
            </h2>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {workingFeatures.map((f, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{
                  background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
                  padding: "36px 40px", display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: COLORS.success,
                      background: "rgba(52,211,153,0.1)", padding: "4px 10px", borderRadius: 6,
                      display: "inline-block", marginBottom: 14,
                    }}>{f.tag}</span>
                    <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                    <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: 300 }}>
                    {f.details.map((d, j) => (
                      <div key={j} style={{
                        background: COLORS.bg, borderRadius: 8, padding: "10px 14px",
                        fontSize: 13, color: COLORS.textMuted, fontWeight: 500,
                        border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <span style={{ color: d.startsWith("Coming") ? COLORS.warning : COLORS.accent, fontSize: 11 }}>
                          {d.startsWith("Coming") ? "⏳" : "✦"}
                        </span> {d}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section style={{ marginBottom: 80 }}>
          <FadeIn>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40, textAlign: "center", color: COLORS.warning }}>
              ⏳ Coming Soon (Post-Beta)
            </h2>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {comingFeatures.map((f, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{
                  background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
                  padding: "36px 40px", display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap",
                  opacity: 0.8,
                }}>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: COLORS.warning,
                      background: "rgba(245,158,11,0.12)", padding: "4px 10px", borderRadius: 6,
                      display: "inline-block", marginBottom: 14,
                    }}>{f.tag}</span>
                    <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                    <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: 300 }}>
                    {f.details.map((d, j) => (
                      <div key={j} style={{
                        background: COLORS.bg, borderRadius: 8, padding: "10px 14px",
                        fontSize: 13, color: COLORS.textMuted, fontWeight: 500,
                        border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <span style={{ color: COLORS.warning, fontSize: 11 }}>⏳</span> {d}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Beta Program CTA */}
        <FadeIn>
          <div style={{
            maxWidth: 800, margin: "0 auto", textAlign: "center",
            background: `radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)`,
            padding: "60px 40px", borderRadius: 20,
          }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, marginBottom: 20 }}>
              Help us decide what to build next
            </h2>
            <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 32, lineHeight: 1.6 }}>
              Beta customers have direct input on the roadmap. We're building features based on real customer needs, not a pre-set plan.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/beta" style={{
                display: "inline-block",
                background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                color: COLORS.bg, padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700,
                textDecoration: "none", boxShadow: "0 0 40px rgba(34,211,238,0.15)",
              }}>Apply for beta (10 spots left)</a>
              <a href="/product" style={{
                display: "inline-block", background: "transparent",
                color: COLORS.textMuted, padding: "16px 32px", borderRadius: 12, fontSize: 16, fontWeight: 600,
                textDecoration: "none", border: `1px solid ${COLORS.border}`,
              }}>Learn more about the product</a>
            </div>
          </div>
        </FadeIn>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24, marginTop: 80 }}>
          <p style={{ fontSize: 14, color: COLORS.textDim, textAlign: "center" }}>
            <a href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>← Back to home</a>
            {" · "}
            <a href="/product" style={{ color: COLORS.textDim, textDecoration: "none" }}>Product</a>
            {" · "}
            <a href="/pricing" style={{ color: COLORS.textDim, textDecoration: "none" }}>Pricing</a>
          </p>
        </div>
      </div>
    </div>
  );
}
