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
  accentGlow: "rgba(34, 211, 238, 0.15)",
  warning: "#f59e0b",
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

export default function PricingPage() {
  const plans = [
    {
      name: "Beta", price: "99", target: "First 10 companies",
      features: ["Unlimited users", "Unlimited requests", "Slack intake (working)", "Email approvals (working)", "QB/Xero sync (working)", "Beta bugs & missing features", "Direct founder access", "Shape the product"],
      cta: "Apply for beta", highlighted: true, badge: "10 spots only",
    },
    {
      name: "Starter", price: "399", target: "Post-beta launch",
      features: ["Unlimited users", "100 requests/month", "All beta features", "+ AI categorization", "+ Duplicate detection", "+ Workflow builder", "Email support"],
      cta: "Coming soon", highlighted: false, badge: "After beta",
    },
    {
      name: "Growth", price: "899", target: "Post-beta launch",
      features: ["Unlimited users", "500 requests/month", "+ Real-time budgets", "+ Mobile approvals", "+ Auto-escalation", "+ Invoice processing", "Priority support"],
      cta: "Coming soon", highlighted: false, badge: "After beta",
    },
    {
      name: "Scale", price: "1,799", target: "Post-beta launch",
      features: ["Unlimited everything", "+ AI forecasting", "+ API access", "+ SSO / SAML", "+ Custom reports", "Dedicated CSM"],
      cta: "Coming soon", highlighted: false, badge: "After beta",
    },
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "60px 0 80px", maxWidth: 720, margin: "0 auto" }}>
          <FadeIn>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(245,158,11,0.12)", border: `1px solid rgba(245,158,11,0.3)`,
              borderRadius: 100, padding: "8px 20px", marginBottom: 32,
            }}>
              <span style={{ color: COLORS.warning, fontSize: 13, fontWeight: 600 }}>Beta Pricing</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.035em" }}>
              €99/mo for beta.<br />
              <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Locked forever.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{ fontSize: 19, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
              First 10 companies get founding member pricing that never expires. Future tiers shown for context — they'll launch after beta.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.6 }}>
              If only 3 people can submit, you don't have a front door — you have a side entrance. <strong style={{ color: COLORS.text }}>Everyone submits. That's the point.</strong> All plans include unlimited users.
            </p>
          </FadeIn>
        </div>

        {/* Pricing Grid */}
        <FadeIn delay={0.4}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "stretch", marginBottom: 80 }}>
            {plans.map((p, i) => (
              <div key={i} style={{
                background: COLORS.surface, borderRadius: 16, padding: "36px 28px",
                border: `1px solid ${p.highlighted ? "rgba(34,211,238,0.3)" : COLORS.border}`,
                boxShadow: p.highlighted ? `0 0 60px ${COLORS.accentGlow}` : "none",
                display: "flex", flexDirection: "column", height: "100%",
                position: "relative", overflow: "hidden",
              }}>
                {p.highlighted && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${COLORS.gradient1}, ${COLORS.gradient2})` }} />
                )}
                {p.badge && (
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: p.name === "Beta" ? COLORS.warning : COLORS.accent,
                    background: p.name === "Beta" ? "rgba(245,158,11,0.12)" : COLORS.accentSoft,
                    padding: "3px 10px", borderRadius: 100, display: "inline-block",
                    alignSelf: "flex-start", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>{p.badge}</div>
                )}
                <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 4 }}>{p.target}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em" }}>€{p.price}</span>
                  <span style={{ fontSize: 14, color: COLORS.textDim }}>/mo</span>
                </div>
                <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 24 }}>Billed annually (save 17%)</div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: COLORS.textMuted }}>
                      <span style={{ color: COLORS.accent, marginTop: 1, fontSize: 11 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <a href={p.cta === "Apply for beta" ? "/beta" : "#"} style={{
                  display: "block", textAlign: "center", padding: "11px 0", borderRadius: 10,
                  fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 0.2s",
                  background: p.highlighted ? `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})` : "transparent",
                  color: p.highlighted ? COLORS.bg : COLORS.text,
                  border: p.highlighted ? "none" : `1px solid ${COLORS.border}`,
                  cursor: p.cta === "Coming soon" ? "not-allowed" : "pointer",
                  opacity: p.cta === "Coming soon" ? 0.5 : 1,
                }}>{p.cta}</a>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* FAQ */}
        <section style={{ maxWidth: 900, margin: "0 auto 80px" }}>
          <FadeIn>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40, textAlign: "center" }}>Pricing FAQ</h2>
          </FadeIn>
          <div style={{ display: "grid", gap: 20 }}>
            {[
              {
                q: "What happens after the beta?",
                a: "Beta customers keep €99/mo forever. We'll never raise your price. When we launch publicly, new customers will pay the Starter tier (€399/mo) or higher."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Month-to-month, no penalties. If you cancel, we'll delete your data 90 days after (compliance retention)."
              },
              {
                q: "What if I need more than 100 requests/month?",
                a: "Beta customers have unlimited requests. Post-beta tiers have limits, but we'll never throttle beta customers — you're locked in with unlimited everything."
              },
              {
                q: "Do you offer annual discounts?",
                a: "Yes. All prices shown are monthly when billed annually (17% discount vs monthly billing). Beta customers pay €99/mo regardless."
              },
              {
                q: "What payment methods do you accept?",
                a: "Credit card via Stripe. We support Visa, Mastercard, Amex. Invoicing available for annual plans (€5K+)."
              },
              {
                q: "What's included in 'unlimited users'?",
                a: "Everyone at your company can submit requests. No per-seat fees, ever. Admins, approvers, requesters — all unlimited."
              },
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  borderRadius: 12, padding: 28,
                }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.text }}>{faq.q}</h3>
                  <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* CTA */}
        <FadeIn>
          <div style={{
            maxWidth: 700, margin: "0 auto", textAlign: "center",
            background: `radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)`,
            padding: "60px 40px", borderRadius: 20,
          }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, marginBottom: 20 }}>
              Lock in €99/mo forever
            </h2>
            <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 32, lineHeight: 1.6 }}>
              Only 10 spots available. Beta customers never pay more.
            </p>
            <a href="/beta" style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
              color: COLORS.bg, padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700,
              textDecoration: "none", boxShadow: "0 0 40px rgba(34,211,238,0.15)",
            }}>Apply for beta →</a>
          </div>
        </FadeIn>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24, marginTop: 80 }}>
          <p style={{ fontSize: 14, color: COLORS.textDim, textAlign: "center" }}>
            <a href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>← Back to home</a>
            {" · "}
            <a href="/product" style={{ color: COLORS.textDim, textDecoration: "none" }}>Product</a>
            {" · "}
            <a href="/beta" style={{ color: COLORS.textDim, textDecoration: "none" }}>Beta Program</a>
          </p>
        </div>
      </div>
    </div>
  );
}
