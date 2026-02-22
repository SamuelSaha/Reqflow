"use client";

import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#09090b",
  bgLight: "#131316",
  surface: "#1a1a1f",
  border: "#27272a",
  borderLight: "#3f3f46",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  accent: "#22d3ee",
  accentGlow: "rgba(34, 211, 238, 0.15)",
  accentSoft: "rgba(34, 211, 238, 0.08)",
  warning: "#f59e0b",
  success: "#34d399",
  gradient1: "#22d3ee",
  gradient2: "#818cf8",
};

/* ───── SCROLL OBSERVER HOOK ───── */
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

/* ───── SCROLL PROGRESS INDICATOR ───── */
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

/* ───── STICKY NAV ───── */
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: COLORS.bg,
          }}>R</div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>Reqflow</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="#problem" style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}>Why</a>
          <a href="#how" style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}>How</a>
          <a href="#pricing" style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}>Pricing</a>
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

/* ───── SECTION 1: HERO (0vh-100vh) ───── */
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

/* ───── SECTION 2: SOCIAL PROOF (100vh-150vh) ───── */
const SocialProof = () => {
  const [ref, isVisible] = useScrollReveal(0.3);

  return (
    <section ref={ref} style={{
      minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 32px", background: COLORS.bgLight,
    }}>
      <div style={{
        maxWidth: 800, textAlign: "center",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 32 }}>
          Early Beta
        </p>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: COLORS.text }}>
          Helping the first 10 companies shape the product
        </h2>
        <div style={{
          display: "inline-block",
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 12, padding: "24px 40px",
        }}>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
            <strong style={{ color: COLORS.text }}>We're in early beta.</strong> Not showing fake logos or vanity metrics. Just honest positioning: we have a working product, real limitations, and we're looking for companies willing to shape it with us.
          </p>
        </div>
      </div>
    </section>
  );
};

/* ───── SECTION 3: PROBLEM → SOLUTION (150vh-400vh) ───── */
const ProblemSolution = () => {
  const [ref1, isVisible1] = useScrollReveal(0.2);
  const [ref2, isVisible2] = useScrollReveal(0.2);
  const [ref3, isVisible3] = useScrollReveal(0.2);

  return (
    <section id="problem" style={{ background: COLORS.bg }}>
      {/* THE PROBLEM */}
      <div ref={ref1} style={{
        minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 32px",
        opacity: isVisible1 ? 1 : 0,
        transform: isVisible1 ? "translateY(0)" : "translateY(50px)",
        transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
            The Problem
          </p>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 32, maxWidth: 800 }}>
            Your "procurement process" is a Slack thread and a prayer
          </h2>
          <p style={{ fontSize: 20, color: COLORS.textMuted, lineHeight: 1.7, maxWidth: 700, marginBottom: 48 }}>
            Someone asks on Slack. Waits 3 days. Gets a vague "sure." Signs up with a card. Finance finds out on the statement.
          </p>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "40px", maxWidth: 700 }}>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7 }}>
              <strong style={{ color: COLORS.text }}>You're not alone.</strong> Companies with 50-250 employees hit this wall: procurement is chaos, but hiring a procurement team doesn't make sense yet.
            </p>
          </div>
        </div>
      </div>

      {/* THE SOLUTION */}
      <div ref={ref2} style={{
        minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 32px",
        background: COLORS.bgLight,
        opacity: isVisible2 ? 1 : 0,
        transform: isVisible2 ? "translateY(0)" : "translateY(50px)",
        transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
            The Solution
          </p>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 48, maxWidth: 800 }}>
            One front door.<br />
            <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Actually used.
            </span>
          </h2>

          {/* 3-step flow */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
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
                opacity: isVisible2 ? 1 : 0,
                transform: isVisible2 ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.accent, marginBottom: 16, letterSpacing: "0.05em" }}>{step.num}</div>
                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontSize: 16, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 16 }}>{step.desc}</p>
                <p style={{ fontSize: 13, color: COLORS.warning }}>⚠ {step.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHAT YOU GET TODAY */}
      <div ref={ref3} id="how" style={{
        minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 32px",
        opacity: isVisible3 ? 1 : 0,
        transform: isVisible3 ? "translateY(0)" : "translateY(50px)",
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
                status: "working",
                title: "Slack-based request intake",
                desc: "Submit purchase requests via /reqflow buy. Simple form with tool name, cost, justification.",
                working: ["Slack integration", "Simple intake form"],
                coming: ["AI classification", "Duplicate detection"],
              },
              {
                status: "working",
                title: "Basic approval routing",
                desc: "Email notifications to approvers with request context. Manual workflow setup.",
                working: ["Email notifications", "Manual routing"],
                coming: ["Workflow builder", "Auto-escalation"],
              },
              {
                status: "working",
                title: "QuickBooks & Xero sync",
                desc: "Export approved purchases to your accounting system. Manual trigger for now.",
                working: ["QB/Xero integration", "Manual sync"],
                coming: ["Auto-sync", "Real-time budgets"],
              },
            ].map((feature, i) => (
              <div key={i} style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 16, padding: 40,
                opacity: isVisible3 ? 1 : 0,
                transform: isVisible3 ? "translateX(0)" : "translateX(-30px)",
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
      </div>
    </section>
  );
};

/* ───── SECTION 5: TESTIMONIALS (500vh-650vh) ───── */
const Testimonials = () => {
  const [ref, isVisible] = useScrollReveal(0.3);

  return (
    <section ref={ref} style={{
      minHeight: "50vh", display: "flex", alignItems: "center", padding: "120px 32px",
      background: COLORS.bgLight,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(50px)",
      transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", width: "100%" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
          Beta Program
        </p>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 56 }}>
          Help us build the right product
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 40, textAlign: "left" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: COLORS.success }}>✓ What Works Today</h3>
            <ul style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 2, paddingLeft: 20, margin: 0 }}>
              <li>Slack intake (working)</li>
              <li>Email approvals (working)</li>
              <li>QB/Xero sync (manual)</li>
              <li>Full audit trail</li>
            </ul>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 40, textAlign: "left" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: COLORS.warning }}>⏳ What's Coming</h3>
            <ul style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 2, paddingLeft: 20, margin: 0 }}>
              <li>AI categorization</li>
              <li>Duplicate detection</li>
              <li>Real-time budgets</li>
              <li>Mobile push notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ───── SECTION 6: PRICING (650vh-750vh) ───── */
const Pricing = () => {
  const [ref, isVisible] = useScrollReveal(0.2);

  return (
    <section ref={ref} id="pricing" style={{
      minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 32px",
      background: COLORS.bg,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "scale(0.95)" : "scale(1)",
      transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", width: "100%" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.warning, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
          Beta Pricing
        </p>
        <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
          €99/mo for beta.<br />
          <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Locked forever.
          </span>
        </h2>
        <p style={{ fontSize: 18, color: COLORS.textMuted, lineHeight: 1.7, maxWidth: 700, margin: "0 auto 64px" }}>
          First 10 companies get founding member pricing that never expires. Future tiers launch after beta.
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
            <li>All working features</li>
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

/* ───── FOOTER ───── */
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

/* ───── MAIN APP ───── */
export default function HomePage() {
  useEffect(() => {
    // Smooth scroll behavior
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
      <SocialProof />
      <ProblemSolution />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}
