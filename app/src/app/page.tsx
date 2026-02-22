"use client";

import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#09090b",
  surface: "#131316",
  surfaceHover: "#1a1a1f",
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
  danger: "#f87171",
  gradient1: "#22d3ee",
  gradient2: "#818cf8",
  slackBg: "#1a1d21",
  slackSurface: "#222529",
  slackBorder: "#383a3f",
  slackPurple: "#4a154b",
  slackGreen: "#2bac76",
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

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>{children}</div>
  );
};

/* ───── NAV ───── */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(9,9,11,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
        borderBottom: scrolled ? `1px solid ${COLORS.border}` : "1px solid transparent",
        transition: "all 0.35s ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: COLORS.bg,
            }}>R</div>
            <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.03em" }}>Reqflow</span>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">
            {["Product", "Pricing", "Docs"].map(l => (
              <a key={l} href="#" style={{ color: COLORS.textMuted, textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textMuted)}
              >{l}</a>
            ))}
            <a href="#" style={{ color: COLORS.textMuted, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Log in</a>
            <a href="#" style={{
              background: COLORS.text, color: COLORS.bg, padding: "9px 20px", borderRadius: 8,
              fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
            >Get early access</a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "none", background: "none", border: "none", cursor: "pointer",
              width: 40, height: 40, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
            }}
            className="mobile-menu-btn"
            aria-label="Menu"
          >
            <span style={{ width: 24, height: 2, background: COLORS.text, borderRadius: 2, transition: "all 0.3s" }} />
            <span style={{ width: 24, height: 2, background: COLORS.text, borderRadius: 2, transition: "all 0.3s" }} />
            <span style={{ width: 24, height: 2, background: COLORS.text, borderRadius: 2, transition: "all 0.3s" }} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed", top: 72, left: 0, right: 0, bottom: 0, zIndex: 99,
          background: "rgba(9,9,11,0.98)", backdropFilter: "blur(20px)",
          padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24,
        }}
          onClick={() => setMobileMenuOpen(false)}
        >
          {["Product", "Pricing", "Docs", "Log in"].map(l => (
            <a key={l} href="#" style={{
              color: COLORS.text, textDecoration: "none", fontSize: 24, fontWeight: 600,
              padding: "12px 0", borderBottom: `1px solid ${COLORS.border}`,
            }}>{l}</a>
          ))}
          <a href="#" style={{
            background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
            color: COLORS.bg, padding: "16px", borderRadius: 12, fontSize: 18, fontWeight: 700,
            textDecoration: "none", textAlign: "center", marginTop: "auto",
          }}>Get early access</a>
        </div>
      )}

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 1023px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};

/* ───── Responsive Styles ───── */
const GlobalStyles = () => (
  <style jsx global>{`
    @media (max-width: 1199px) {
      .pricing-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }

    @media (max-width: 899px) {
      .steps-grid {
        grid-template-columns: 1fr !important;
      }
    }

    @media (max-width: 767px) {
      .pricing-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `}</style>
);

/* ───── HERO (Slack-First) ───── */
const Hero = () => (
  <section style={{
    minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "120px 32px 80px", position: "relative", overflow: "hidden",
  }}>
    <div style={{ position: "absolute", top: "-20%", left: "30%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", top: "10%", right: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

    <FadeIn>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: COLORS.accentSoft, border: `1px solid rgba(34,211,238,0.2)`,
        borderRadius: 100, padding: "8px 20px", marginBottom: 32,
      }}>
        <span style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>Early Access — Founding member pricing available</span>
      </div>
    </FadeIn>

    <FadeIn delay={0.08}>
      <h1 style={{
        fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 800, color: COLORS.text,
        textAlign: "center", lineHeight: 1.05, letterSpacing: "-0.035em",
        maxWidth: 900, margin: "0 0 24px",
      }}>
        Stop chasing approvals.<br />
        <span style={{
          background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>Start buying.</span>
      </h1>
    </FadeIn>

    <FadeIn delay={0.16}>
      <p style={{
        fontSize: 19, color: COLORS.textMuted, textAlign: "center", maxWidth: 580,
        lineHeight: 1.6, margin: "0 0 40px", fontWeight: 400,
      }}>
        Request from Slack. Approve from anywhere. Synced to your accounting system. The procurement front door for companies without a procurement team.
      </p>
    </FadeIn>

    <FadeIn delay={0.24}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <a href="#" style={{
          background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
          color: COLORS.bg, padding: "16px 36px", borderRadius: 10, fontSize: 16, fontWeight: 700,
          textDecoration: "none", transition: "all 0.2s",
          boxShadow: `0 4px 20px ${COLORS.accentGlow}`,
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
            e.currentTarget.style.boxShadow = `0 6px 30px rgba(34,211,238,0.3)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = `0 4px 20px ${COLORS.accentGlow}`;
          }}
        >Start 14-day free trial</a>
        <a href="#" style={{
          background: "transparent", color: COLORS.textMuted, padding: "16px 32px", borderRadius: 10,
          fontSize: 15, fontWeight: 600, textDecoration: "none", border: `1px solid ${COLORS.border}`,
          transition: "all 0.2s",
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = COLORS.accent;
            e.currentTarget.style.color = COLORS.text;
            e.currentTarget.style.background = COLORS.accentSoft;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = COLORS.border;
            e.currentTarget.style.color = COLORS.textMuted;
            e.currentTarget.style.background = "transparent";
          }}
        >View pricing</a>
      </div>
    </FadeIn>

    <FadeIn delay={0.35}>
      <p style={{ fontSize: 13, color: COLORS.textDim, marginTop: 20, textAlign: "center" }}>
        No credit card required · GDPR native · EU hosted (Paris) · Founding member rate: €99/mo
      </p>
    </FadeIn>

    {/* ───── HERO VISUAL: Slack Modal + Mobile Approval ───── */}
    <FadeIn delay={0.45}>
      <div style={{ marginTop: 64, display: "flex", gap: 24, alignItems: "flex-start", maxWidth: 960, width: "100%", justifyContent: "center" }}>

        {/* LEFT: Slack Interface Mockup */}
        <div style={{
          flex: "1 1 600px", maxWidth: 620, borderRadius: 16,
          border: `1px solid ${COLORS.slackBorder}`, background: COLORS.slackBg,
          overflow: "hidden", boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 120px ${COLORS.accentGlow}`,
        }}>
          {/* Slack top bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 18px",
            background: COLORS.slackPurple, borderBottom: `1px solid rgba(255,255,255,0.1)`,
          }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
            <div style={{ flex: 1, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}># engineering</div>
          </div>

          <div style={{ padding: "20px 24px 24px" }}>
            {/* User message */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#fff",
              }}>M</div>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Marc Dupont</span>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>11:42 AM</span>
                </div>
                <div style={{
                  background: COLORS.slackSurface, borderRadius: "4px 12px 12px 12px",
                  padding: "10px 14px", display: "inline-block",
                }}>
                  <span style={{ color: "#e8912d", fontWeight: 600, fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 13 }}>/reqflow buy</span>
                  <span style={{ color: COLORS.textMuted, fontSize: 14, marginLeft: 8 }}>GitHub Copilot Business</span>
                </div>
              </div>
            </div>

            {/* Reqflow Bot Response — The Smart Intake Modal */}
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: COLORS.bg,
              }}>R</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Reqflow</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.slackGreen, background: "rgba(43,172,118,0.15)", padding: "1px 6px", borderRadius: 4 }}>APP</span>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>11:42 AM</span>
                </div>

                {/* The intake card */}
                <div style={{
                  background: COLORS.slackSurface, borderRadius: 12, border: `1px solid ${COLORS.slackBorder}`,
                  overflow: "hidden", maxWidth: 440,
                }}>
                  {/* Card accent bar */}
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${COLORS.gradient1}, ${COLORS.gradient2})` }} />

                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>New Purchase Request</div>
                    <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 16 }}>Auto-detected from your message</div>

                    {/* Auto-filled fields */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                      {[
                        ["Tool", "GitHub Copilot Business"],
                        ["Category", "Dev Tools (AI-detected)"],
                        ["Users", "12 seats"],
                        ["Est. Cost", "€2,736/yr"],
                      ].map(([label, val], i) => (
                        <div key={i} style={{ background: COLORS.slackBg, borderRadius: 8, padding: "9px 12px" }}>
                          <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: i === 1 ? COLORS.accent : "#fff" }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* AI insight */}
                    <div style={{
                      background: COLORS.accentSoft, border: `1px solid rgba(34,211,238,0.15)`,
                      borderRadius: 8, padding: "10px 12px", marginBottom: 14,
                      display: "flex", gap: 8, alignItems: "flex-start",
                    }}>
                      <span style={{ fontSize: 13, flexShrink: 0 }}>✦</span>
                      <span style={{ fontSize: 12, color: COLORS.accent, lineHeight: 1.5 }}>
                        No duplicate found. Eng budget: €8,200 remaining of €15K. Will route to Sarah (Eng Lead) → Claire (Finance).
                      </span>
                    </div>

                    {/* Budget bar */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textDim, marginBottom: 5 }}>
                        <span>Engineering Q1 Budget</span>
                        <span>€8,200 left → €5,464 after</span>
                      </div>
                      <div style={{ height: 6, background: COLORS.slackBg, borderRadius: 100, overflow: "hidden", position: "relative" }}>
                        <div style={{ position: "absolute", height: "100%", width: "55%", borderRadius: 100, background: `linear-gradient(90deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, opacity: 0.5 }} />
                        <div style={{ position: "absolute", height: "100%", width: "64%", borderRadius: 100, background: `linear-gradient(90deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, borderRight: "2px dashed rgba(255,255,255,0.3)" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4 }}>
                        <span style={{ color: COLORS.success }}>● Current: 55%</span>
                        <span style={{ color: COLORS.textDim }}>After: 64% — on pace</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{
                        flex: 1, textAlign: "center", padding: "9px 0", borderRadius: 8,
                        background: COLORS.slackGreen, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}>Submit Request</div>
                      <div style={{
                        padding: "9px 16px", borderRadius: 8,
                        border: `1px solid ${COLORS.slackBorder}`, color: COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}>Edit</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Mobile Approval Mockup */}
        <div style={{
          flex: "0 0 220px", width: 220,
          borderRadius: 28, border: `3px solid ${COLORS.borderLight}`,
          background: COLORS.bg, overflow: "hidden",
          boxShadow: `0 30px 60px rgba(0,0,0,0.4)`,
          position: "relative",
        }}>
          {/* Phone notch */}
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 0" }}>
            <div style={{ width: 80, height: 22, borderRadius: 20, background: COLORS.surface }} />
          </div>

          {/* Phone screen */}
          <div style={{ padding: "16px 14px 20px" }}>
            {/* Time & status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>9:41</span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <div style={{ width: 14, height: 10, borderRadius: 2, border: `1px solid ${COLORS.textDim}`, position: "relative" }}>
                  <div style={{ position: "absolute", top: 1, left: 1, bottom: 1, width: "70%", background: COLORS.success, borderRadius: 1 }} />
                </div>
              </div>
            </div>

            {/* Notification card */}
            <div style={{
              background: COLORS.surface, borderRadius: 14, border: `1px solid ${COLORS.border}`,
              padding: "14px 12px", marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, color: COLORS.bg,
                }}>R</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>Reqflow</span>
                <span style={{ fontSize: 10, color: COLORS.textDim, marginLeft: "auto" }}>now</span>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>Approval needed</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5, marginBottom: 4 }}>
                GitHub Copilot Business
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10 }}>
                12 seats · €2,736/yr
              </div>

              <div style={{ display: "flex", gap: 5, fontSize: 11, color: COLORS.textDim, marginBottom: 12 }}>
                <span style={{ background: COLORS.accentSoft, color: COLORS.accent, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>Budget OK</span>
                <span style={{ background: "rgba(52,211,153,0.1)", color: COLORS.success, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>No duplicates</span>
              </div>

              {/* Biometric approve */}
              <div style={{
                background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                borderRadius: 10, padding: "10px 0", textAlign: "center",
                color: COLORS.bg, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8,
              }}>✓ Approve</div>
              <div style={{
                borderRadius: 10, padding: "9px 0", textAlign: "center",
                border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, fontSize: 12, fontWeight: 600,
              }}>Reject ▾</div>
            </div>

            {/* FaceID indicator */}
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 6px", display: "block", opacity: 0.5 }}>
                <path d="M7 3H5a2 2 0 00-2 2v2M17 3h2a2 2 0 012 2v2M7 21H5a2 2 0 01-2-2v-2M17 21h2a2 2 0 002-2v-2M9 10v1M15 10v1M9.5 15.5c.83.5 1.5.5 2.5.5s1.67 0 2.5-.5" stroke={COLORS.accent} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div style={{ fontSize: 10, color: COLORS.textDim }}>Face ID to approve</div>
            </div>
          </div>

          {/* Home indicator */}
          <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 10px" }}>
            <div style={{ width: 100, height: 4, borderRadius: 100, background: COLORS.borderLight }} />
          </div>
        </div>
      </div>
    </FadeIn>

    {/* Caption under hero visual */}
    <FadeIn delay={0.55}>
      <div style={{ display: "flex", gap: 32, marginTop: 24, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: COLORS.textDim }}>
          <span style={{ color: COLORS.accent }}>←</span> Request from Slack in 30 seconds
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: COLORS.textDim }}>
          Approve from your phone with Face ID <span style={{ color: COLORS.accent }}>→</span>
        </div>
      </div>
    </FadeIn>
  </section>
);

/* ───── PROBLEM ───── */
const Problem = () => (
  <section style={{ padding: "100px 32px", maxWidth: 1200, margin: "0 auto" }}>
    <FadeIn>
      <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 72px" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>The problem</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 20 }}>
          Your &quot;procurement process&quot; is a Slack thread and a prayer
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.65 }}>
          Someone asks on Slack. Waits 3 days. Gets a vague &quot;sure.&quot; Signs up with a card. Finance finds out on the statement. Sound familiar?
        </p>
      </div>
    </FadeIn>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
      {[
        { metric: "40–60%", label: "of purchases have zero approval trail", icon: "⚡" },
        { metric: "11.4 days", label: "average time to buy a $500/mo tool", icon: "⏱" },
        { metric: "29%", label: "of SaaS tools are duplicates across teams", icon: "♻" },
      ].map((s, i) => (
        <FadeIn key={i} delay={i * 0.1}>
          <div style={{
            background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
            padding: 36, textAlign: "center", transition: "border-color 0.3s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.borderLight)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
          >
            <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em", marginBottom: 8 }}>{s.metric}</div>
            <div style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.5 }}>{s.label}</div>
          </div>
        </FadeIn>
      ))}
    </div>
  </section>
);

/* ───── HOW IT WORKS ───── */
const HowItWorks = () => (
  <section style={{ padding: "100px 32px", position: "relative" }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent, ${COLORS.accentSoft}, transparent)`, pointerEvents: "none" }} />
    <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
      <FadeIn>
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 72px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>How it works</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Request → Approve → Synced.
          </h2>
        </div>
      </FadeIn>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="steps-grid">
        {[
          {
            step: "01", title: "Request from Slack",
            desc: "Type /reqflow buy in Slack. AI auto-fills the category, budget code, cost estimate, and checks for duplicates. Submit in under 30 seconds.",
            visual: "/reqflow buy → Auto-detected: Dev Tools, €2,736/yr",
          },
          {
            step: "02", title: "Approved in minutes",
            desc: "The right people get notified with full context — budget impact, AI insights, prior approvals. One-tap approve from Slack, email, or phone.",
            visual: "Sarah ✓ (12min) → Claire ✓ (47min) → Done",
          },
          {
            step: "03", title: "Synced to your books",
            desc: "Approved purchases sync directly to QuickBooks or Xero. Full audit trail. No re-entry. No reconciliation spreadsheets.",
            visual: "Approved → QuickBooks synced → Audit trail ✓",
          },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.12}>
            <div style={{
              background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
              padding: 40, height: "100%", display: "flex", flexDirection: "column",
              transition: "border-color 0.3s, transform 0.3s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(34,211,238,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.accent, marginBottom: 20, fontVariantNumeric: "tabular-nums", letterSpacing: "0.05em" }}>{s.step}</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 12, letterSpacing: "-0.02em" }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.65, marginBottom: 24, flex: 1 }}>{s.desc}</p>
              <div style={{
                background: COLORS.bg, borderRadius: 10, padding: "14px 18px",
                fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 13, color: COLORS.accent,
                border: `1px solid ${COLORS.border}`, letterSpacing: "-0.01em",
              }}>{s.visual}</div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

/* ───── FEATURES ───── */
const Features = () => {
  const features = [
    {
      tag: "Intake", title: "One front door for every purchase",
      desc: "Slack, Teams, email, or web — every request enters one system. AI classifies, detects duplicates, and checks existing subscriptions before you finish typing.",
      details: ["Adaptive smart forms", "Duplicate detection", "Slack & Teams native", "Email forwarding intake"],
    },
    {
      tag: "Approvals", title: "Approved in minutes, not days",
      desc: "Visual workflow builder routes requests based on amount, department, and category. Auto-delegates when approvers are OOO. Escalates when things stall.",
      details: ["Conditional routing", "One-tap mobile approve", "Escalation timers", "OOO auto-delegation"],
    },
    {
      tag: "Budgets", title: "Guardrails that prevent overspend",
      desc: "Real-time budget tracking by department. Soft warnings at 80%. Hard stops at 100%. Every request shows the budget impact before it's submitted.",
      details: ["Department budgets", "Real-time burn rate", "Threshold alerts", "Upload from spreadsheet"],
    },
    {
      tag: "Sync", title: "Synced to QuickBooks & Xero from day one",
      desc: "Approved purchases push directly to your general ledger. No re-entry. No reconciliation. If the API hiccups, a perfect CSV export is always ready.",
      details: ["QuickBooks Online sync", "Xero sync", "Fallback CSV export", "Cost center mapping"],
    },
    {
      tag: "Compliance", title: "Audit trail without the work",
      desc: "Every request, approval, and decision is logged with timestamps, approvers, and context. Vendors submit invoices via PDF email — no portal required.",
      details: ["Full audit trail", "Configurable policies", "PDF invoice intake", "One-click export"],
    },
  ];

  return (
    <section style={{ padding: "100px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <FadeIn>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 72px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>What you get today</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Intake. Approvals. Budgets. Accounting sync.
          </h2>
        </div>
      </FadeIn>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {features.map((f, i) => (
          <FadeIn key={i} delay={i * 0.06}>
            <div style={{
              background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
              padding: "36px 40px", display: "flex", gap: 40, alignItems: "flex-start",
              transition: "border-color 0.3s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.borderLight)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
            >
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: COLORS.accent, textTransform: "uppercase",
                  letterSpacing: "0.08em", background: COLORS.accentSoft, padding: "4px 10px", borderRadius: 6,
                  display: "inline-block", marginBottom: 14,
                }}>{f.tag}</span>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 10, letterSpacing: "-0.02em" }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.65, maxWidth: 520 }}>{f.desc}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flexShrink: 0, width: 300 }}>
                {f.details.map((d, j) => (
                  <div key={j} style={{
                    background: COLORS.bg, borderRadius: 8, padding: "10px 14px",
                    fontSize: 13, color: COLORS.textMuted, fontWeight: 500,
                    border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ color: COLORS.accent, fontSize: 11 }}>✦</span> {d}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};

/* ───── SOCIAL PROOF ───── */
const SocialProof = () => (
  <section style={{ padding: "100px 32px" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <FadeIn>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Why it matters</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            What changes when you have a front door
          </h2>
        </div>
      </FadeIn>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, maxWidth: 800, margin: "0 auto" }}>
        {[
          { before: "2.3 days", after: "<4 hrs", label: "Approval time" },
          { before: "40–60%", after: "<10%", label: "Maverick spend" },
          { before: "8+ hrs/wk", after: "<2 hrs", label: "Finance time on procurement" },
          { before: "Spreadsheets", after: "1-click", label: "Audit export" },
        ].map((m, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div style={{
              background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 32, textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: COLORS.danger, textDecoration: "line-through", marginBottom: 8, fontWeight: 500 }}>{m.before}</div>
              <div style={{
                fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8,
                background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{m.after}</div>
              <div style={{ fontSize: 14, color: COLORS.textMuted }}>{m.label}</div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

/* ───── PRICING ───── */
const Pricing = () => {
  const plans = [
    {
      name: "Founding", price: "99", target: "< 20 employees",
      features: ["Unlimited users", "50 requests/month", "Core approval workflows", "1 accounting integration", "Slack integration", "Early adopter support", "Shape the roadmap"],
      cta: "Join early access", highlighted: false, badge: "Limited spots",
    },
    {
      name: "Starter", price: "399", target: "20–75 employees",
      features: ["Unlimited users", "100 requests/month", "3 approval workflows", "Slack + 1 accounting", "Department budgets", "Email support"],
      cta: "Start free trial", highlighted: false, badge: null,
    },
    {
      name: "Growth", price: "899", target: "75–250 employees",
      features: ["Unlimited users", "500 requests/month", "Unlimited workflows", "All integrations", "Full budget hierarchy", "Invoice processing (250/mo)", "Mobile approvals", "Email + chat support"],
      cta: "Start free trial", highlighted: true, badge: "Most popular",
    },
    {
      name: "Scale", price: "1,799", target: "250–500 employees",
      features: ["Unlimited everything", "AI copilot + forecasting", "API access", "SSO / SAML", "Custom reports", "Dedicated CSM"],
      cta: "Talk to sales", highlighted: false, badge: null,
    },
  ];

  return (
    <section style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto" }}>
      <FadeIn>
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 64px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Pricing</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16 }}>
            Unlimited users. Always.
          </h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.6 }}>
            If only 3 people can submit, you don&apos;t have a front door — you have a side entrance. Everyone submits. That&apos;s the point.
          </p>
        </div>
      </FadeIn>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignItems: "stretch" }} className="pricing-grid">
        {plans.map((p, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div style={{
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
                  fontSize: 11, fontWeight: 700, color: p.name === "Founding" ? COLORS.warning : COLORS.accent,
                  background: p.name === "Founding" ? "rgba(245,158,11,0.12)" : COLORS.accentSoft,
                  padding: "3px 10px", borderRadius: 100, display: "inline-block",
                  alignSelf: "flex-start", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em",
                }}>{p.badge}</div>
              )}
              <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 4 }}>{p.target}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>€{p.price}</span>
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
              <a href="#" style={{
                display: "block", textAlign: "center", padding: "11px 0", borderRadius: 10,
                fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 0.2s",
                background: p.highlighted ? `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})` : "transparent",
                color: p.highlighted ? COLORS.bg : COLORS.text,
                border: p.highlighted ? "none" : `1px solid ${COLORS.border}`,
              }}>{p.cta}</a>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};

/* ───── INTEGRATIONS ───── */
const Integrations = () => (
  <section style={{ padding: "80px 32px", maxWidth: 1200, margin: "0 auto" }}>
    <FadeIn>
      <div style={{
        background: COLORS.surface, borderRadius: 20, border: `1px solid ${COLORS.border}`,
        padding: "56px 64px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 40,
      }}>
        <div style={{ maxWidth: 440 }}>
          <h3 style={{ fontSize: 26, fontWeight: 700, color: COLORS.text, marginBottom: 12, letterSpacing: "-0.02em" }}>Plugs into your stack on day one</h3>
          <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.65 }}>
            Slack for requests. QuickBooks or Xero for accounting. Google or Microsoft for SSO. If the API hiccups, a perfect CSV fallback is always ready.
          </p>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { name: "Slack", color: "#E01E5A", logo: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg> },
            { name: "QuickBooks", color: "#2CA01C", logo: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.2"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-13h-2v2h2V7zm-4 0H9v2h2V7zm4 4h-2v2h2v-2zm-4 0H9v2h2v-2z"/></svg> },
            { name: "Xero", color: "#13B5EA", logo: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
            { name: "Google", color: "#4285F4", logo: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
            { name: "Microsoft", color: "#00A4EF", logo: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/></svg> },
          ].map(({ name, color, logo }) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 14, background: COLORS.bg,
                border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center",
                justifyContent: "center", color: color, transition: "all 0.2s",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.background = `${color}15`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.background = COLORS.bg;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {logo}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  </section>
);

/* ───── CTA FOOTER ───── */
const CTAFooter = () => (
  <section style={{ padding: "120px 32px 80px" }}>
    <FadeIn>
      <div style={{
        maxWidth: 800, margin: "0 auto", textAlign: "center",
        background: `radial-gradient(ellipse at center, ${COLORS.accentSoft} 0%, transparent 70%)`,
        padding: "80px 40px", borderRadius: 24,
      }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 20 }}>
          Setup in minutes.<br />First request, same day.
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 36, lineHeight: 1.6 }}>
          14-day free trial. No credit card required.<br />Connect Slack, set your approval rules, and go.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#" style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
            color: COLORS.bg, padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700,
            textDecoration: "none", boxShadow: `0 0 40px ${COLORS.accentGlow}`,
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 0 60px rgba(34,211,238,0.3)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 0 40px ${COLORS.accentGlow}`; }}
          >Start free trial →</a>
          <a href="#" style={{
            display: "inline-block", background: "transparent",
            color: COLORS.textMuted, padding: "16px 32px", borderRadius: 12, fontSize: 16, fontWeight: 600,
            textDecoration: "none", border: `1px solid ${COLORS.border}`, transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.borderLight; e.currentTarget.style.color = COLORS.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted; }}
          >Join as founding member — €99/mo</a>
        </div>
      </div>
    </FadeIn>

    {/* Footer */}
    <div style={{ maxWidth: 1200, margin: "80px auto 0", padding: "32px 24px", borderTop: `1px solid ${COLORS.border}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: COLORS.bg,
            }}>R</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>Reqflow</span>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.6 }}>
            AI-powered procurement for companies without procurement teams.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Product</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Features", "Pricing", "Integrations", "Changelog"].map(l => (
              <a key={l} href="#" style={{ color: COLORS.textDim, fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textDim)}
              >{l}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Company</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["About", "Contact", "Careers", "Blog"].map(l => (
              <a key={l} href="#" style={{ color: COLORS.textDim, fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textDim)}
              >{l}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Legal</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Privacy", "Terms", "Security", "Status"].map(l => (
              <a key={l} href="#" style={{ color: COLORS.textDim, fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textDim)}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ fontSize: 13, color: COLORS.textDim }}>
          © 2026 Reqflow · 🇪🇺 Hosted in Paris · GDPR native
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { name: "GitHub", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
            { name: "Twitter", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            { name: "LinkedIn", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg> },
          ].map(({ name, icon }) => (
            <a key={name} href="#" aria-label={name} style={{ color: COLORS.textDim, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textDim)}
            >{icon}</a>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ───── APP ───── */
export default function HomePage() {
  return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", color: COLORS.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      <GlobalStyles />
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <SocialProof />
      <Pricing />
      <Integrations />
      <CTAFooter />
    </div>
  );
}
