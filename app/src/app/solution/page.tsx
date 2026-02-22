"use client";

import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#09090b",
  bgLight: "#131316",
  surface: "#1a1a1f",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  accent: "#22d3ee",
  accentGlow: "rgba(34, 211, 238, 0.15)",
  warning: "#f59e0b",
  success: "#34d399",
  gradient1: "#22d3ee",
  gradient2: "#818cf8",
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
            fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}>Apply for Beta</a>
        </div>
      </div>
    </nav>
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

export default function SolutionPage() {
  const [ref1, isVisible1] = useScrollReveal(0.2);
  const [ref2, isVisible2] = useScrollReveal(0.2);

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

      {/* THE SOLUTION */}
      <section ref={ref1} style={{
        minHeight: "100vh", display: "flex", alignItems: "center", padding: "140px 32px 100px",
        opacity: isVisible1 ? 1 : 0,
        transform: isVisible1 ? "translateY(0)" : "translateY(50px)",
        transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
            The Solution
          </p>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 48, maxWidth: 800 }}>
            One front door.<br />
            <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Actually used.
            </span>
          </h1>

          {/* 3-step flow */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 64 }}>
            {[
              {
                num: "01",
                title: "Request from Slack",
                desc: "Type /reqflow buy in Slack. Fill a simple form. Submit in 30 seconds.",
                note: "Beta: Manual form, no AI yet"
              },
              {
                num: "02",
                title: "Approve via email",
                desc: "Approvers get email with context. One click to approve.",
                note: "Beta: Manual routing setup"
              },
              {
                num: "03",
                title: "Synced to books",
                desc: "Approved purchases log to QuickBooks or Xero. Full audit trail.",
                note: "Beta: Manual sync trigger"
              },
            ].map((step, i) => (
              <div key={i} style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 16, padding: 32,
                opacity: isVisible1 ? 1 : 0,
                transform: isVisible1 ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.accent, marginBottom: 16, letterSpacing: "0.05em" }}>{step.num}</div>
                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontSize: 16, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 16 }}>{step.desc}</p>
                <p style={{ fontSize: 13, color: COLORS.warning }}>⚠ {step.note}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href="/features" style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
              color: COLORS.bg, padding: "16px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700,
              textDecoration: "none", boxShadow: `0 4px 20px ${COLORS.accentGlow}`,
            }}>See all features →</a>
            <a href="/beta" style={{
              display: "inline-block",
              background: "transparent", border: `1px solid ${COLORS.border}`,
              color: COLORS.text, padding: "16px 32px", borderRadius: 12, fontSize: 16, fontWeight: 600,
              textDecoration: "none",
            }}>Apply for beta</a>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET TODAY */}
      <section ref={ref2} style={{
        minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 32px",
        background: COLORS.bgLight,
        opacity: isVisible2 ? 1 : 0,
        transform: isVisible2 ? "translateY(0)" : "translateY(50px)",
        transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.warning, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
            Beta — What Works Today
          </p>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, maxWidth: 900 }}>
            The basics work. The smart stuff is coming.
          </h2>
          <p style={{ fontSize: 18, color: COLORS.textMuted, lineHeight: 1.7, maxWidth: 800, marginBottom: 56 }}>
            We're honest about what's ready and what's not. ✓ means it works today. "Coming" means we're building it with beta feedback.
          </p>

          <div style={{ display: "grid", gap: 20 }}>
            {[
              {
                title: "Slack-based request intake",
                desc: "Submit purchase requests via /reqflow buy. Simple form with tool name, cost, justification.",
                working: ["Slack integration", "Simple intake form"],
                coming: ["AI classification", "Duplicate detection"],
              },
              {
                title: "Basic approval routing",
                desc: "Email notifications to approvers with request context. Manual workflow setup.",
                working: ["Email notifications", "Manual routing"],
                coming: ["Workflow builder", "Auto-escalation"],
              },
              {
                title: "QuickBooks & Xero sync",
                desc: "Export approved purchases to your accounting system. Manual trigger for now.",
                working: ["QB/Xero integration", "Manual sync"],
                coming: ["Auto-sync", "Real-time budgets"],
              },
            ].map((feature, i) => (
              <div key={i} style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 16, padding: 40,
                opacity: isVisible2 ? 1 : 0,
                transform: isVisible2 ? "translateX(0)" : "translateX(-30px)",
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
                    <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Working</div>
                    {feature.working.map((item, j) => (
                      <div key={j} style={{ fontSize: 14, color: COLORS.success, marginBottom: 4 }}>✓ {item}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Coming</div>
                    {feature.coming.map((item, j) => (
                      <div key={j} style={{ fontSize: 14, color: COLORS.warning, marginBottom: 4 }}>⏳ {item}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
