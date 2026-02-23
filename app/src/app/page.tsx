"use client";

import { useState, useEffect } from "react";

const COLORS = {
  bg: "#ffffff",
  bgLight: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  textMuted: "#475569",
  textDim: "#94a3b8",
  accent: "#3b82f6",
  accentDark: "#2563eb",
  accentLight: "#dbeafe",
  success: "#10b981",
  warning: "#f59e0b",
};

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      setProgress(scrolled);
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 999,
      background: "rgba(39, 39, 42, 0.3)",
    }}>
      <div style={{
        height: "100%", width: `${progress}%`,
        background: `linear-gradient(90deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
        transition: "width 0.1s ease-out",
      }} />
    </div>
  );
};

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(9,9,11,0.9)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${COLORS.border}` : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: COLORS.bg,
          }}>R</div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: COLORS.text }}>Reqflow</span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="/problem" style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Why</a>
          <a href="/solution" style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>How</a>
          <a href="/pricing" style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Pricing</a>
          <a href="/beta" style={{
            background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
            color: COLORS.bg, padding: "10px 24px", borderRadius: 8,
            fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "transform 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >Apply for Beta</a>
        </div>
      </div>
    </nav>
  );
};

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
          <span style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600 }}>Early Beta — First 10 Companies</span>
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
        <div style={{ animation: "fadeSlideUp 0.8s ease-out 0.3s backwards", marginBottom: 48 }}>
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

        {/* Quick links */}
        <div style={{
          display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap",
          animation: "fadeIn 1s ease-out 0.4s backwards",
        }}>
          <a href="/problem" style={{
            fontSize: 15, color: COLORS.textMuted, textDecoration: "none",
            borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2,
          }}>Why Reqflow?</a>
          <a href="/solution" style={{
            fontSize: 15, color: COLORS.textMuted, textDecoration: "none",
            borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2,
          }}>How it works</a>
          <a href="/features" style={{
            fontSize: 15, color: COLORS.textMuted, textDecoration: "none",
            borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2,
          }}>Features</a>
        </div>

        {/* Trust anchor */}
        <p style={{
          fontSize: 14, color: COLORS.textDim, marginTop: 32,
          animation: "fadeIn 1s ease-out 0.5s backwards",
        }}>
          €99/mo locked forever · GDPR native · EU hosted (Paris)
        </p>
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
      `}</style>
    </section>
  );
};

const Footer = () => {
  return (
    <footer style={{ background: COLORS.bgLight, borderTop: `1px solid ${COLORS.border}`, padding: "80px 32px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 64 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: COLORS.bg,
              }}>R</div>
              <span style={{ fontSize: 18, fontWeight: 700 }}>Reqflow</span>
            </div>
            <p style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.6 }}>
              Procurement for companies without procurement teams.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Product</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "Integrations", href: "/integrations" },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ color: COLORS.textDim, fontSize: 14, textDecoration: "none" }}>{label}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Company</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Beta Program", href: "/beta" },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ color: COLORS.textDim, fontSize: 14, textDecoration: "none" }}>{label}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Legal</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Security", href: "/security" },
                { label: "Status", href: "/status" },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ color: COLORS.textDim, fontSize: 14, textDecoration: "none" }}>{label}</a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontSize: 14, color: COLORS.textDim }}>
            © 2026 Reqflow · 🇪🇺 Hosted in Paris · GDPR native
          </div>
        </div>
      </div>
    </footer>
  );
};

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
      <Footer />
    </div>
  );
}
