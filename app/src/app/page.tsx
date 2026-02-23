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
      background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${COLORS.border}` : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: COLORS.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#ffffff",
          }}>R</div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: COLORS.text }}>Reqflow</span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="/problem" style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textMuted)}
          >Why</a>
          <a href="/solution" style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textMuted)}
          >How</a>
          <a href="/pricing" style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textMuted)}
          >Pricing</a>
          <a href="/beta" style={{
            background: COLORS.accent,
            color: "#ffffff", padding: "10px 24px", borderRadius: 8,
            fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "all 0.2s",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.accentDark;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLORS.accent;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >Apply for Beta</a>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section style={{
      minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "120px 32px 80px", position: "relative", overflow: "hidden",
      background: COLORS.bg,
    }}>
      <div style={{ maxWidth: 1200, textAlign: "center", position: "relative", zIndex: 1, width: "100%" }}>
        {/* H1 */}
        <h1 style={{
          fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24,
          letterSpacing: "-0.02em", color: COLORS.text,
        }}>
          Every purchase.<br />
          One front door.
        </h1>

        {/* Sub-headline */}
        <p style={{
          fontSize: 20, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 48,
          maxWidth: 680, margin: "0 auto 48px",
        }}>
          Request from Slack. Approve from email. Synced to your accounting system.<br />
          The procurement front door for companies without a procurement team.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 80 }}>
          <a href="/beta" style={{
            display: "inline-block",
            background: COLORS.accent,
            color: "#ffffff", padding: "16px 32px", borderRadius: 8, fontSize: 16, fontWeight: 600,
            textDecoration: "none", boxShadow: "0 4px 12px rgba(59,130,246,0.2)",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.accentDark;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLORS.accent;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >Get started</a>
          <a href="/solution" style={{
            display: "inline-block",
            background: "transparent", border: `2px solid ${COLORS.border}`,
            color: COLORS.text, padding: "14px 32px", borderRadius: 8, fontSize: 16, fontWeight: 600,
            textDecoration: "none", transition: "all 0.2s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.accent;
              e.currentTarget.style.color = COLORS.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.color = COLORS.text;
            }}
          >See how it works</a>
        </div>

        {/* Product Screenshot Placeholder */}
        <div style={{
          maxWidth: 1000, margin: "0 auto",
          background: COLORS.bgLight,
          borderRadius: 16, padding: 40,
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 12,
            padding: 32,
            border: `1px solid ${COLORS.border}`,
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.textDim,
            fontSize: 18,
          }}>
            Product Dashboard Preview
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: "💬",
      title: "Request from Slack",
      description: "Type /reqflow buy in any Slack channel. Fill a simple form in 30 seconds. No more hunting for approval forms."
    },
    {
      icon: "✉️",
      title: "Approve via email",
      description: "Approvers get email with full context. One-click approve. No login required. Works on mobile."
    },
    {
      icon: "📊",
      title: "Synced to books",
      description: "Approved purchases automatically log to QuickBooks or Xero. Complete audit trail built in."
    },
    {
      icon: "🔒",
      title: "GDPR native",
      description: "EU-hosted in Paris. Full GDPR compliance out of the box. Your data never leaves Europe."
    },
  ];

  return (
    <section style={{
      padding: "100px 32px",
      background: COLORS.bgLight,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, marginBottom: 16, color: COLORS.text }}>
            Your team buys like a FAANG
          </h2>
          <p style={{ fontSize: 20, color: COLORS.textMuted, maxWidth: 600, margin: "0 auto" }}>
            Without hiring a procurement team or learning new software
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          {features.map((feature, i) => (
            <div key={i} style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 32,
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.accent;
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(59,130,246,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>{feature.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: COLORS.text }}>{feature.title}</h3>
              <p style={{ fontSize: 16, color: COLORS.textMuted, lineHeight: 1.6, margin: 0 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingPreview = () => {
  return (
    <section style={{ padding: "100px 32px", background: COLORS.bg }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, marginBottom: 16, color: COLORS.text }}>
          From €99/mo.<br />
          Unlimited users. <span style={{ color: COLORS.accent }}>Forever.</span>
        </h2>
        <p style={{ fontSize: 20, color: COLORS.textMuted, marginBottom: 48, lineHeight: 1.6 }}>
          First 10 companies lock in founding member pricing that never expires.<br />
          Everyone submits. That's the point.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/pricing" style={{
            display: "inline-block",
            background: COLORS.accent,
            color: "#ffffff", padding: "16px 32px", borderRadius: 8, fontSize: 16, fontWeight: 600,
            textDecoration: "none",
          }}>View pricing</a>
          <a href="/beta" style={{
            display: "inline-block",
            background: "transparent", border: `2px solid ${COLORS.accent}`,
            color: COLORS.accent, padding: "14px 32px", borderRadius: 8, fontSize: 16, fontWeight: 600,
            textDecoration: "none",
          }}>Apply for beta</a>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const footerBg = "#0f172a";
  const footerText = "#cbd5e1";
  const footerTextMuted = "#64748b";

  return (
    <footer style={{ background: footerBg, borderTop: "none", padding: "80px 32px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 64 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: COLORS.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: "#ffffff",
              }}>R</div>
              <span style={{ fontSize: 18, fontWeight: 700, color: footerText }}>Reqflow</span>
            </div>
            <p style={{ fontSize: 14, color: footerTextMuted, lineHeight: 1.6 }}>
              Procurement for companies without procurement teams.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em", color: footerText }}>Product</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "Integrations", href: "/integrations" },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ color: footerTextMuted, fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = footerText)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = footerTextMuted)}
                >{label}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em", color: footerText }}>Company</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Beta Program", href: "/beta" },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ color: footerTextMuted, fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = footerText)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = footerTextMuted)}
                >{label}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em", color: footerText }}>Legal</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Security", href: "/security" },
                { label: "Status", href: "/status" },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ color: footerTextMuted, fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = footerText)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = footerTextMuted)}
                >{label}</a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(100,116,139,0.2)", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontSize: 14, color: footerTextMuted }}>
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
      <Nav />
      <Hero />
      <FeaturesSection />
      <PricingPreview />
      <Footer />
    </div>
  );
}
