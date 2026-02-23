"use client";

import { useState, useEffect, useRef } from "react";

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
};

function useScrollReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible, threshold]);

  return [ref, isVisible] as const;
}

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

export default function ProblemPage() {
  const [ref, isVisible] = useScrollReveal(0.2);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", color: COLORS.text,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <Nav />

      <section ref={ref} style={{
        minHeight: "100vh", display: "flex", alignItems: "center", padding: "140px 32px 100px",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(50px)",
        transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
            The Problem
          </p>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 32, maxWidth: 800 }}>
            Your "procurement process" is a Slack thread and a prayer
          </h1>
          <p style={{ fontSize: 20, color: COLORS.textMuted, lineHeight: 1.7, maxWidth: 700, marginBottom: 48 }}>
            Someone asks on Slack. Waits 3 days. Gets a vague "sure." Signs up with a card. Finance finds out on the statement.
          </p>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "40px", maxWidth: 700, marginBottom: 48 }}>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
              <strong style={{ color: COLORS.text }}>You're not alone.</strong> Companies with 50-250 employees hit this wall: procurement is chaos, but hiring a procurement team doesn't make sense yet.
            </p>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href="/solution" style={{
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
            >See the solution →</a>
            <a href="/beta" style={{
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
            >Apply for beta</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
