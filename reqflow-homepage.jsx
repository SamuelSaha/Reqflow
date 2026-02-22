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
};

function useInView(threshold = 0.15) {
  const ref = useRef(null);
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
  return [ref, inView];
}

const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

/* ───── NAV ───── */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(9,9,11,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
      borderBottom: scrolled ? `1px solid ${COLORS.border}` : "1px solid transparent",
      transition: "all 0.35s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: COLORS.bg,
          }}>R</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.03em" }}>Reqflow</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Product", "Pricing", "Docs"].map(l => (
            <a key={l} href="#" style={{ color: COLORS.textMuted, textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = COLORS.text}
              onMouseLeave={e => e.target.style.color = COLORS.textMuted}
            >{l}</a>
          ))}
          <a href="#" style={{ color: COLORS.textMuted, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Log in</a>
          <a href="#" style={{
            background: COLORS.text, color: COLORS.bg, padding: "9px 20px", borderRadius: 8,
            fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "opacity 0.2s",
          }}
            onMouseEnter={e => e.target.style.opacity = 0.88}
            onMouseLeave={e => e.target.style.opacity = 1}
          >Start free trial</a>
        </div>
      </div>
    </nav>
  );
};

/* ───── HERO ───── */
const Hero = () => (
  <section style={{
    minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "120px 32px 80px", position: "relative", overflow: "hidden",
  }}>
    {/* Glow orbs */}
    <div style={{ position: "absolute", top: "-20%", left: "30%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", top: "10%", right: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

    <FadeIn>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: COLORS.accentSoft, border: `1px solid rgba(34,211,238,0.2)`,
        borderRadius: 100, padding: "6px 16px 6px 8px", marginBottom: 32,
      }}>
        <span style={{ background: COLORS.accent, color: COLORS.bg, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>New</span>
        <span style={{ color: COLORS.accent, fontSize: 13, fontWeight: 500 }}>Now live for EU companies — SOC 2 Type 1 certified</span>
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
        The procurement front door for companies that buy without a procurement team. One place to request, approve, track, and pay — in hours, not weeks.
      </p>
    </FadeIn>

    <FadeIn delay={0.24}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <a href="#" style={{
          background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
          color: COLORS.bg, padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700,
          textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: `0 0 30px ${COLORS.accentGlow}`,
        }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 0 50px rgba(34,211,238,0.25)`; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 0 30px ${COLORS.accentGlow}`; }}
        >Start free — 14 days, no card</a>
        <a href="#" style={{
          background: "transparent", color: COLORS.textMuted, padding: "14px 28px", borderRadius: 10,
          fontSize: 15, fontWeight: 600, textDecoration: "none", border: `1px solid ${COLORS.border}`,
          transition: "border-color 0.2s, color 0.2s",
        }}
          onMouseEnter={e => { e.target.style.borderColor = COLORS.borderLight; e.target.style.color = COLORS.text; }}
          onMouseLeave={e => { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.textMuted; }}
        >Watch 2-min demo →</a>
      </div>
    </FadeIn>

    <FadeIn delay={0.35}>
      <p style={{ fontSize: 13, color: COLORS.textDim, marginTop: 20, textAlign: "center" }}>
        Trusted by 200+ finance teams across the EU · GDPR native · SOC 2 Type 1
      </p>
    </FadeIn>

    {/* Hero visual — the request card mockup */}
    <FadeIn delay={0.45}>
      <div style={{
        marginTop: 64, width: "100%", maxWidth: 880, borderRadius: 16,
        border: `1px solid ${COLORS.border}`, background: COLORS.surface,
        overflow: "hidden", boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 120px ${COLORS.accentGlow}`,
      }}>
        {/* Window bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f87171" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#34d399" }} />
          <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: COLORS.textDim }}>app.reqflow.com</div>
        </div>
        {/* Mockup content */}
        <div style={{ padding: "32px 40px 40px", display: "flex", gap: 32 }}>
          {/* Left — approval card */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 16 }}>Pending approval</div>
            <div style={{ background: COLORS.bg, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>GitHub Copilot Business</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>Marc Dupont · Engineering</div>
                </div>
                <div style={{ background: "rgba(245,158,11,0.12)", color: COLORS.warning, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>Pending</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[["Amount", "€2,736/yr"], ["Users", "12 seats"], ["Budget left", "€5,464"], ["Category", "Dev Tools"]].map(([l, v]) => (
                  <div key={l} style={{ background: COLORS.surface, borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: COLORS.accentSoft, borderRadius: 8, padding: "10px 14px", marginBottom: 20, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 14 }}>✦</span>
                <span style={{ fontSize: 13, color: COLORS.accent, lineHeight: 1.5 }}>AI: Same tool approved for Backend team 2 months ago at same price. Budget on track.</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{
                  flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 8,
                  background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                  color: COLORS.bg, fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}>✓ Approve</div>
                <div style={{
                  flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 8,
                  border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>✗ Reject</div>
              </div>
            </div>
          </div>

          {/* Right — budget + status */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 16 }}>Engineering budget · Q1 2026</div>
            <div style={{ background: COLORS.bg, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.text }}>€8,200</span>
                <span style={{ fontSize: 14, color: COLORS.textMuted, alignSelf: "flex-end" }}>of €15,000</span>
              </div>
              <div style={{ height: 8, background: COLORS.surface, borderRadius: 100, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ height: "100%", width: "55%", borderRadius: 100, background: `linear-gradient(90deg, ${COLORS.gradient1}, ${COLORS.gradient2})` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: COLORS.success }}>● 55% used — on pace</span>
                <span style={{ color: COLORS.textDim }}>6 weeks left</span>
              </div>
            </div>
            {/* Mini request feed */}
            <div style={{ background: COLORS.bg, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 20 }}>
              <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 14, fontWeight: 600 }}>Recent activity</div>
              {[
                { name: "Figma Enterprise", status: "Approved", color: COLORS.success, time: "2h ago" },
                { name: "AWS Reserved Instances", status: "PO Issued", color: COLORS.accent, time: "Yesterday" },
                { name: "Notion Team Plan", status: "Rejected", color: COLORS.danger, time: "2 days ago" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i > 0 ? `1px solid ${COLORS.border}` : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>{r.time}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.color }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  </section>
);

/* ───── PROBLEM ───── */
const Problem = () => (
  <section style={{ padding: "120px 32px", maxWidth: 1200, margin: "0 auto" }}>
    <FadeIn>
      <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 72px" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>The problem</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 20 }}>
          Your "procurement process" is a Slack thread and a prayer
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.65 }}>
          Every purchase at your company follows the same broken path. Someone asks on Slack, waits 3 days, gets a vague approval, signs up with a corporate card, and finance finds out on the credit card statement.
        </p>
      </div>
    </FadeIn>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      {[
        { metric: "40–60%", label: "of spend has no approval trail", icon: "⚡" },
        { metric: "11.4 days", label: "average time to buy a $500/mo tool", icon: "⏱" },
        { metric: "29%", label: "of SaaS tools are duplicates across teams", icon: "♻" },
      ].map((s, i) => (
        <FadeIn key={i} delay={i * 0.1}>
          <div style={{
            background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
            padding: 36, textAlign: "center", transition: "border-color 0.3s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderLight}
            onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
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
  <section style={{ padding: "120px 32px", position: "relative" }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent, ${COLORS.accentSoft}, transparent)`, pointerEvents: "none" }} />
    <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
      <FadeIn>
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 72px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>How it works</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Request → Approve → Done.
          </h2>
        </div>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {[
          {
            step: "01",
            title: "Request in 2 minutes",
            desc: "Type /reqflow buy in Slack, or click the web form. AI auto-fills the category, budget code, and vendor details. You just say what you need and why.",
            visual: "/reqflow buy → GitHub Copilot, 12 seats",
          },
          {
            step: "02",
            title: "Auto-routed approval",
            desc: "The right people get notified instantly — manager, finance, security — with full context and budget impact. One-click approve from Slack, email, or phone.",
            visual: "Sarah ✓ → Claire ✓ → Approved in 47min",
          },
          {
            step: "03",
            title: "PO, invoice, done",
            desc: "Purchase order auto-generated and sent. Invoice matched by AI when it arrives. Synced to QuickBooks or Xero. Full audit trail, zero spreadsheets.",
            visual: "PO-2026-0089 → Invoice matched → Paid ✓",
          },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.12}>
            <div style={{
              background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
              padding: 40, height: "100%", display: "flex", flexDirection: "column",
              transition: "border-color 0.3s, transform 0.3s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(34,211,238,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{
                fontSize: 13, fontWeight: 800, color: COLORS.accent, marginBottom: 20,
                fontVariantNumeric: "tabular-nums", letterSpacing: "0.05em",
              }}>{s.step}</div>
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
      desc: "Slack, Teams, email, web — every request enters one system. AI classifies, detects duplicates, checks existing subscriptions. No request falls through the cracks.",
      details: ["Adaptive smart forms", "Duplicate detection", "Slack & Teams native", "Email intake (forward to buy@)"],
    },
    {
      tag: "Approvals", title: "Approved in minutes, not days",
      desc: "Visual workflow builder routes requests to the right people based on amount, department, category, and 12 other conditions. Auto-delegation when someone's OOO.",
      details: ["Conditional routing engine", "One-click mobile approve", "Escalation timers", "OOO auto-delegation"],
    },
    {
      tag: "Budgets", title: "Guardrails that prevent overspend",
      desc: "Real-time budget tracking by department, category, and project. Soft warnings at 80%. Hard stops at 100%. AI forecasting predicts overruns before they happen.",
      details: ["Hierarchical budgets", "Real-time burn rate", "AI forecasting", "Anomaly alerts"],
    },
    {
      tag: "Execution", title: "PO to payment, fully automated",
      desc: "Approved request → auto-generated PO → AI invoice matching → synced to your accounting system. 3-way match. Zero manual entry.",
      details: ["Auto PO generation", "AI invoice OCR", "3-way matching", "QuickBooks & Xero sync"],
    },
    {
      tag: "Compliance", title: "Audit-ready from day one",
      desc: "Every request, approval, PO, and invoice is logged with timestamps, approvers, and context. Export a full audit trail in one click. SOC 2 and GDPR native.",
      details: ["Full audit trail", "Policy engine", "Vendor compliance tracking", "One-click export"],
    },
  ];

  return (
    <section style={{ padding: "120px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <FadeIn>
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 72px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Features</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Full intake-to-pay. No procurement team required.
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
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderLight}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
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
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Results</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            What changes when you have a front door
          </h2>
        </div>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
        {[
          { before: "2.3 days", after: "<4 hours", label: "Approval time" },
          { before: "40–60%", after: "<10%", label: "Maverick spend" },
          { before: "$15–40", after: "<$5", label: "Cost per invoice" },
          { before: "2–3 weeks", after: "1–2 days", label: "Audit prep time" },
        ].map((m, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div style={{
              background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
              padding: 32, textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: COLORS.danger, textDecoration: "line-through", marginBottom: 8, fontWeight: 500 }}>{m.before}</div>
              <div style={{
                fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8,
                background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{m.after}</div>
              <div style={{ fontSize: 14, color: COLORS.textMuted }}>{m.label}</div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Testimonial */}
      <FadeIn delay={0.3}>
        <div style={{
          marginTop: 48, background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
          padding: "48px 56px", maxWidth: 800, margin: "48px auto 0", position: "relative",
        }}>
          <div style={{ fontSize: 64, color: COLORS.accent, opacity: 0.2, position: "absolute", top: 16, left: 32, fontFamily: "Georgia, serif" }}>"</div>
          <p style={{ fontSize: 19, color: COLORS.text, lineHeight: 1.7, fontStyle: "italic", marginBottom: 20, position: "relative", fontWeight: 400 }}>
            I went from spending 30% of my week chasing approvals and reconciling invoices to having everything in one place. The first month, we caught €14K in duplicate subscriptions we didn't even know existed.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: COLORS.bg,
            }}>C</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>Claire M.</div>
              <div style={{ fontSize: 13, color: COLORS.textDim }}>Head of Finance · 180-person B2B SaaS</div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  </section>
);

/* ───── PRICING ───── */
const Pricing = () => {
  const plans = [
    {
      name: "Starter", price: "399", target: "20–75 employees",
      features: ["Unlimited users", "100 requests/month", "3 approval workflows", "Slack + 1 accounting integration", "Basic budget tracking", "Email support"],
      cta: "Start free trial", highlighted: false,
    },
    {
      name: "Growth", price: "899", target: "75–250 employees",
      features: ["Unlimited users", "500 requests/month", "Unlimited workflows", "All Priority 1 integrations", "Full budget hierarchy", "Invoice processing (250/mo)", "Mobile approvals", "Email + chat support"],
      cta: "Start free trial", highlighted: true,
    },
    {
      name: "Scale", price: "1,799", target: "250–500 employees",
      features: ["Unlimited everything", "3-way PO matching", "AI copilot + forecasting", "API access", "SSO / SAML", "Custom reports + scheduling", "Dedicated CSM"],
      cta: "Talk to sales", highlighted: false,
    },
  ];

  return (
    <section style={{ padding: "120px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <FadeIn>
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 64px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Pricing</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16 }}>
            Unlimited users. Always.
          </h2>
          <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.6 }}>
            Procurement tools fail when companies restrict who can request. Everyone at your company can submit — because that's the point.
          </p>
        </div>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "stretch" }}>
        {plans.map((p, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{
              background: COLORS.surface, borderRadius: 16, padding: "40px 32px",
              border: `1px solid ${p.highlighted ? "rgba(34,211,238,0.3)" : COLORS.border}`,
              boxShadow: p.highlighted ? `0 0 60px ${COLORS.accentGlow}` : "none",
              display: "flex", flexDirection: "column", height: "100%",
              position: "relative", overflow: "hidden",
            }}>
              {p.highlighted && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                }} />
              )}
              <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 4 }}>{p.target}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>€{p.price}</span>
                <span style={{ fontSize: 15, color: COLORS.textDim }}>/mo</span>
              </div>
              <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 28 }}>Save 17% with annual billing</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: COLORS.textMuted }}>
                    <span style={{ color: COLORS.accent, marginTop: 1, fontSize: 12 }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <a href="#" style={{
                display: "block", textAlign: "center", padding: "12px 0", borderRadius: 10,
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
          <h3 style={{ fontSize: 26, fontWeight: 700, color: COLORS.text, marginBottom: 12, letterSpacing: "-0.02em" }}>Plugs into your stack</h3>
          <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.65 }}>
            Slack, Teams, QuickBooks, Xero, Pennylane, Google Workspace, Microsoft 365. Connects where your team already works — syncs to your GL from day one.
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["Slack", "Teams", "QuickBooks", "Xero", "Google", "Pennylane"].map(name => (
            <div key={name} style={{
              width: 72, height: 72, borderRadius: 14, background: COLORS.bg,
              border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 11, fontWeight: 600, color: COLORS.textMuted,
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderLight}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
            >{name}</div>
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
          Your first request,<br />processed in 5 minutes.
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 36, lineHeight: 1.6 }}>
          14-day free trial. No credit card. No implementation project.<br />Connect Slack, set 3 approval rules, and go.
        </p>
        <a href="#" style={{
          display: "inline-block",
          background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
          color: COLORS.bg, padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700,
          textDecoration: "none", boxShadow: `0 0 40px ${COLORS.accentGlow}`,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 0 60px rgba(34,211,238,0.3)`; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 0 40px ${COLORS.accentGlow}`; }}
        >Start your free trial →</a>
      </div>
    </FadeIn>

    {/* Minimal footer */}
    <div style={{ maxWidth: 1200, margin: "80px auto 0", padding: "32px 0 0", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, color: COLORS.bg,
        }}>R</div>
        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDim }}>Reqflow</span>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {["Privacy", "Terms", "Security", "Status"].map(l => (
          <a key={l} href="#" style={{ color: COLORS.textDim, fontSize: 13, textDecoration: "none" }}>{l}</a>
        ))}
      </div>
      <div style={{ fontSize: 13, color: COLORS.textDim }}>
        🇪🇺 Hosted in Paris · GDPR native · SOC 2 Type 1
      </div>
    </div>
  </section>
);

/* ───── APP ───── */
export default function ReqflowHomepage() {
  return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", color: COLORS.text,
      fontFamily: "'Instrument Sans', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
