"use client";

import { useEffect } from "react";
import { ScrollProgress, Nav, Footer, COLORS } from "../components/shared";

/* ───── HERO SECTION ───── */
const Hero = () => {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 32px", position: "relative", overflow: "hidden",
      background: COLORS.bg,
    }}>
      {/* Ambient gradient orbs */}
      <div style={{ position: "absolute", top: "-20%", left: "30%", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)", pointerEvents: "none", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "20%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.04) 0%, transparent 70%)", pointerEvents: "none", filter: "blur(60px)" }} />

      <div style={{ maxWidth: 900, textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Beta badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(245,158,11,0.12)", border: `1px solid rgba(245,158,11,0.3)`,
          borderRadius: 100, padding: "8px 20px", marginBottom: 32,
          animation: "fadeSlideDown 0.6s ease-out",
        }}>
          <span style={{ color: COLORS.warning, fontSize: 13, fontWeight: 600 }}>Early Beta — First 10 Companies</span>
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: "clamp(48px, 7vw, 72px)", fontWeight: 800, lineHeight: 1, marginBottom: 32,
          letterSpacing: "-0.04em", animation: "fadeSlideUp 0.8s ease-out 0.1s backwards",
        }}>
          Stop chasing approvals.<br />
          <span style={{
            background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Start buying.</span>
        </h1>

        {/* Sub-headline */}
        <p style={{
          fontSize: 20, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 48,
          maxWidth: 700, margin: "0 auto 48px",
          animation: "fadeSlideUp 0.8s ease-out 0.2s backwards",
        }}>
          Request from Slack. Approve from email. Synced to your accounting system.<br />
          The procurement front door for companies without a procurement team.
        </p>

        {/* Primary CTA */}
        <div style={{ animation: "fadeSlideUp 0.8s ease-out 0.3s backwards" }}>
          <a href="/beta" style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
            color: COLORS.bg, padding: "18px 48px", borderRadius: 12, fontSize: 18, fontWeight: 700,
            textDecoration: "none", boxShadow: `0 8px 30px ${COLORS.accentGlow}`,
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 12px 40px rgba(34,211,238,0.25)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 8px 30px ${COLORS.accentGlow}`;
            }}
          >Apply for Beta (10 Spots Left) →</a>
        </div>

        {/* Trust anchor */}
        <p style={{
          fontSize: 14, color: COLORS.textDim, marginTop: 24,
          animation: "fadeIn 1s ease-out 0.5s backwards",
        }}>
          €99/mo locked forever · GDPR native · EU hosted (Paris)
        </p>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
        animation: "bounce 2s infinite",
      }}>
        <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 8 }}>Scroll to explore</div>
        <div style={{ width: 2, height: 40, background: `linear-gradient(180deg, ${COLORS.accent}, transparent)`, margin: "0 auto" }} />
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </section>
  );
};

/* ───── PROBLEM (ONE-LINER) ───── */
const ProblemOneLiner = () => {
  return (
    <section style={{
      minHeight: "40vh", display: "flex", alignItems: "center", padding: "80px 32px",
      background: COLORS.bgLight,
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
          The Problem
        </p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>
          Your "procurement process" is a Slack thread and a prayer
        </h2>
        <p style={{ fontSize: 18, color: COLORS.textMuted, lineHeight: 1.7 }}>
          Someone asks on Slack. Waits 3 days. Gets a vague "sure." Signs up with a card. Finance finds out on the statement.
        </p>
      </div>
    </section>
  );
};

/* ───── SOLUTION OVERVIEW (BRIEF) ───── */
const SolutionOverview = () => {
  return (
    <section style={{
      minHeight: "60vh", display: "flex", alignItems: "center", padding: "100px 32px",
      background: COLORS.bg,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
            The Solution
          </p>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            Request → Approve → Synced
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {[
            { num: "01", title: "Request from Slack", desc: "Type /reqflow buy in Slack. Submit in 30 seconds." },
            { num: "02", title: "Approve via email", desc: "Approvers get email with context. One click to approve." },
            { num: "03", title: "Synced to books", desc: "Approved purchases log to QuickBooks or Xero." },
          ].map((step) => (
            <div key={step.num} style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: 32, textAlign: "center",
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.accent, marginBottom: 16, letterSpacing: "0.05em" }}>{step.num}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{step.title}</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <a href="/features" style={{
            display: "inline-block",
            color: COLORS.accent, fontSize: 16, fontWeight: 600, textDecoration: "none",
            borderBottom: `2px solid ${COLORS.accent}`, paddingBottom: 4,
          }}>Learn how it works in detail →</a>
        </div>
      </div>
    </section>
  );
};

/* ───── FINAL CTA ───── */
const FinalCTA = () => {
  return (
    <section style={{
      minHeight: "50vh", display: "flex", alignItems: "center", padding: "100px 32px",
      background: COLORS.bgLight,
    }}>
      <div style={{
        maxWidth: 700, margin: "0 auto", textAlign: "center",
        background: `radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)`,
        padding: "60px 40px", borderRadius: 20,
      }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, marginBottom: 20 }}>
          Ready to help us build this?
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 32, lineHeight: 1.6 }}>
          Join the beta. €99/mo locked forever. Work directly with founders.
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
export default function HomePage() {
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
      <Hero />
      <ProblemOneLiner />
      <SolutionOverview />
      <FinalCTA />
      <Footer />
    </div>
  );
}
