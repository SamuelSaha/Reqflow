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
  warning: "#f59e0b",
  success: "#34d399",
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

export default function ProductPage() {
  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "60px 0 80px", maxWidth: 800, margin: "0 auto" }}>
          <FadeIn>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(245,158,11,0.12)", border: `1px solid rgba(245,158,11,0.3)`,
              borderRadius: 100, padding: "8px 20px", marginBottom: 32,
            }}>
              <span style={{ color: COLORS.warning, fontSize: 13, fontWeight: 600 }}>Early Beta Product</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.035em" }}>
              The procurement front door<br />
              <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                for companies without<br />a procurement team
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{ fontSize: 19, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 40 }}>
              Request from Slack. Approve from email. Sync to QuickBooks or Xero. Built for companies with 50-250 employees who need structure without hiring a procurement team.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/beta" style={{
                background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                color: COLORS.bg, padding: "16px 36px", borderRadius: 10, fontSize: 16, fontWeight: 700,
                textDecoration: "none", boxShadow: "0 4px 20px rgba(34,211,238,0.15)",
              }}>Apply for beta</a>
              <a href="/pricing" style={{
                background: "transparent", color: COLORS.textMuted, padding: "16px 32px", borderRadius: 10,
                fontSize: 15, fontWeight: 600, textDecoration: "none", border: `1px solid ${COLORS.border}`,
              }}>View pricing</a>
            </div>
          </FadeIn>
        </div>

        {/* The Problem */}
        <section style={{ padding: "80px 0", borderTop: `1px solid ${COLORS.border}` }}>
          <FadeIn>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>The problem</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
                Your &quot;procurement process&quot; is a Slack thread and a prayer
              </h2>
              <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.65, marginBottom: 32 }}>
                Someone asks on Slack. Waits 3 days. Gets a vague &quot;sure.&quot; Signs up with a card. Finance finds out on the statement. Sound familiar?
              </p>
              <div style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12,
                padding: "24px 32px", maxWidth: 600, margin: "0 auto",
              }}>
                <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
                  <strong style={{ color: COLORS.text }}>You're not alone.</strong> Companies with 50-250 employees hit this wall: procurement is chaos, but hiring a procurement team doesn't make sense yet.
                </p>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* How It Works */}
        <section style={{ padding: "80px 0", borderTop: `1px solid ${COLORS.border}` }}>
          <FadeIn>
            <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 72px" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>How it works</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.15 }}>
                Request → Approve → Synced.
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[
              {
                step: "01", title: "Request from Slack",
                desc: "Type /reqflow buy in Slack. Fill out a simple form (tool name, cost, justification). Submit in under 30 seconds. Beta: No AI auto-fill yet.",
                visual: "/reqflow buy → Form opens → Fill details → Submit",
              },
              {
                step: "02", title: "Approved via email",
                desc: "Approvers get email notifications with request details. They review and approve. Beta: Manual routing setup, no mobile app yet.",
                visual: "Email to Sarah → Approve ✓ → Email to CFO → Done",
              },
              {
                step: "03", title: "Manual sync to books",
                desc: "Approved purchases are logged. You trigger sync to QuickBooks/Xero manually. Full audit trail. Beta: No auto-sync yet.",
                visual: "Approved → Manual sync → QuickBooks updated ✓",
              },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div style={{
                  background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
                  padding: 40, height: "100%", display: "flex", flexDirection: "column",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.accent, marginBottom: 20, letterSpacing: "0.05em" }}>{s.step}</div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.65, marginBottom: 24, flex: 1 }}>{s.desc}</p>
                  <div style={{
                    background: COLORS.bg, borderRadius: 10, padding: "14px 18px",
                    fontFamily: "'SF Mono', monospace", fontSize: 13, color: COLORS.accent,
                    border: `1px solid ${COLORS.border}`,
                  }}>{s.visual}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* What You Get Today */}
        <section style={{ padding: "80px 0", borderTop: `1px solid ${COLORS.border}` }}>
          <FadeIn>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 72px" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.warning, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Beta — What works today</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
                The basics work. The smart stuff is coming.
              </h2>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.65 }}>
                We're honest about what's ready and what's not. Check marks (✓) mean it works today. "Coming" means we're building it with beta feedback.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                tag: "✓ Working", title: "Slack-based request intake",
                desc: "Submit purchase requests via /reqflow buy in Slack. Simple form with tool name, cost, justification. Beta: Manual form fill, no AI auto-complete yet.",
                details: ["Slack integration", "Simple intake form", "Coming: AI classification", "Coming: Duplicate detection"],
              },
              {
                tag: "✓ Working", title: "Basic approval routing",
                desc: "Email notifications to approvers with request context. Manual approval workflow setup. Beta: No visual workflow builder or auto-escalation yet.",
                details: ["Email notifications", "Manual routing setup", "Coming: Workflow builder", "Coming: Auto-escalation"],
              },
              {
                tag: "✓ Working", title: "QuickBooks & Xero sync",
                desc: "Export approved purchases to QuickBooks or Xero. Manual trigger for now. Beta: No real-time auto-sync or budget enforcement yet.",
                details: ["QB/Xero integration", "Manual sync trigger", "Coming: Auto-sync", "Coming: Real-time budgets"],
              },
              {
                tag: "✓ Working", title: "Full audit trail",
                desc: "Every request, approval, and action is logged with timestamps and context. Export anytime. This works today.",
                details: ["Complete audit log", "Timestamp tracking", "One-click export", "GDPR compliant"],
              },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{
                  background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
                  padding: "36px 40px", display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: COLORS.accent,
                      background: COLORS.accentSoft, padding: "4px 10px", borderRadius: 6,
                      display: "inline-block", marginBottom: 14,
                    }}>{f.tag}</span>
                    <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                    <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: 300 }}>
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

        {/* CTA */}
        <section style={{ padding: "80px 0", textAlign: "center" }}>
          <FadeIn>
            <div style={{
              maxWidth: 700, margin: "0 auto",
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
                textDecoration: "none", boxShadow: "0 0 40px rgba(34,211,238,0.15)",
              }}>Apply for beta (10 spots left)</a>
            </div>
          </FadeIn>
        </section>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24, marginTop: 40 }}>
          <p style={{ fontSize: 14, color: COLORS.textDim, textAlign: "center" }}>
            <a href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>← Back to home</a>
            {" · "}
            <a href="/pricing" style={{ color: COLORS.textDim, textDecoration: "none" }}>Pricing</a>
            {" · "}
            <a href="/features" style={{ color: COLORS.textDim, textDecoration: "none" }}>Features</a>
          </p>
        </div>
      </div>
    </div>
  );
}
