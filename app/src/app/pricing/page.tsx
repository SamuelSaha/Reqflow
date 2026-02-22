"use client";

import { useEffect } from "react";
import { ScrollProgress, Nav, Footer, COLORS, useScrollReveal } from "../../components/shared";

/* ───── PRICING HERO ───── */
const PricingHero = () => {
  const [ref, isVisible] = useScrollReveal(0.2);

  return (
    <section ref={ref} style={{
      minHeight: "100vh", display: "flex", alignItems: "center", padding: "140px 32px 100px",
      background: COLORS.bg,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "scale(0.95)" : "scale(1)",
      transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", width: "100%" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.warning, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
          Beta Pricing
        </p>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
          €99/mo for beta.<br />
          <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Locked forever.
          </span>
        </h1>
        <p style={{ fontSize: 18, color: COLORS.textMuted, lineHeight: 1.7, maxWidth: 700, margin: "0 auto 64px" }}>
          First 10 companies get founding member pricing that never expires.<br />Future tiers launch after beta.
        </p>

        {/* Pricing card */}
        <div style={{
          background: COLORS.surface, border: `2px solid rgba(34,211,238,0.3)`,
          borderRadius: 20, padding: 48, maxWidth: 500, margin: "0 auto",
          boxShadow: `0 0 60px ${COLORS.accentGlow}`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${COLORS.gradient1}, ${COLORS.gradient2})` }} />

          <div style={{
            fontSize: 12, fontWeight: 700, color: COLORS.warning,
            background: "rgba(245,158,11,0.12)", padding: "6px 16px",
            borderRadius: 100, display: "inline-block", marginBottom: 24,
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>10 Spots Only</div>

          <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 8 }}>First 10 companies</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Beta</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em" }}>€99</span>
            <span style={{ fontSize: 18, color: COLORS.textDim }}>/mo</span>
          </div>
          <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 32 }}>Billed annually (save 17%)</div>

          <ul style={{ textAlign: "left", fontSize: 15, color: COLORS.textMuted, lineHeight: 2, paddingLeft: 20, marginBottom: 32 }}>
            <li>Unlimited users</li>
            <li>Unlimited requests</li>
            <li>Slack intake (working)</li>
            <li>Email approvals (working)</li>
            <li>QB/Xero sync (working)</li>
            <li>Beta bugs & missing features</li>
            <li>Direct founder access</li>
            <li>Shape the product</li>
          </ul>

          <a href="/beta" style={{
            display: "block", textAlign: "center", padding: "16px 0", borderRadius: 12,
            fontSize: 16, fontWeight: 700, textDecoration: "none",
            background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
            color: COLORS.bg,
            boxShadow: `0 4px 20px ${COLORS.accentGlow}`,
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 30px rgba(34,211,238,0.3)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 20px ${COLORS.accentGlow}`;
            }}
          >Apply for Beta →</a>
        </div>

        <p style={{ fontSize: 14, color: COLORS.textDim, marginTop: 32 }}>
          No credit card · Month-to-month · Cancel anytime
        </p>
      </div>
    </section>
  );
};

/* ───── FAQ ───── */
const FAQ = () => {
  const [ref, isVisible] = useScrollReveal(0.2);

  return (
    <section ref={ref} style={{
      minHeight: "60vh", display: "flex", alignItems: "center", padding: "100px 32px",
      background: COLORS.bgLight,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(50px)",
      transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 48, textAlign: "center" }}>Pricing FAQ</h2>

        <div style={{ display: "grid", gap: 24 }}>
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
              q: "What if I need more features?",
              a: "Beta customers get all features we build, forever at €99/mo. There are no feature limits for beta customers — you're locked in with unlimited everything."
            },
            {
              q: "What payment methods do you accept?",
              a: "Credit card via Stripe. We support Visa, Mastercard, Amex. Invoicing available for annual plans (€5K+)."
            },
            {
              q: "What's included in 'unlimited users'?",
              a: "Everyone at your company can submit requests. No per-seat fees, ever. Admins, approvers, requesters — all unlimited."
            },
            {
              q: "What's the commitment?",
              a: "None. It's month-to-month. We ask for 30-min onboarding and monthly 15-min check-ins, but you can cancel anytime."
            },
          ].map((faq, i) => (
            <div key={i} style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 12, padding: 32,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.text }}>{faq.q}</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
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
          Lock in €99/mo forever
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 32, lineHeight: 1.6 }}>
          Only 10 spots available. Beta customers never pay more.
        </p>
        <a href="/beta" style={{
          display: "inline-block",
          background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
          color: COLORS.bg, padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700,
          textDecoration: "none", boxShadow: `0 0 40px ${COLORS.accentGlow}`,
        }}>Apply for Beta →</a>
      </div>
    </section>
  );
};

/* ───── MAIN APP ───── */
export default function PricingPage() {
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
      <PricingHero />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
