"use client";

import { useState, useEffect } from "react";
import { ScrollProgress, Nav, Footer, COLORS, useScrollReveal } from "../../components/shared";

export default function BetaPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    size: "",
    role: "",
    useCase: "",
    timeline: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [ref1, isVisible1] = useScrollReveal(0.2);
  const [ref2, isVisible2] = useScrollReveal(0.2);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Actually submit to backend/email
    console.log("Beta application:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text }}>
        <Nav />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 32px" }}>
          <div style={{ maxWidth: 600, textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
              margin: "0 auto 32px", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40,
            }}>✓</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Application Received</h1>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
              Thanks for applying to the Reqflow beta program. We review applications within 48 hours and prioritize companies that match our current development focus.
            </p>
            <p style={{ fontSize: 15, color: COLORS.textDim }}>
              Check your email ({formData.email}) for next steps.
            </p>
            <a href="/" style={{
              display: "inline-block", marginTop: 32,
              background: COLORS.surface, color: COLORS.text, padding: "12px 24px",
              borderRadius: 8, textDecoration: "none", border: `1px solid ${COLORS.border}`,
            }}>← Back to home</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", color: COLORS.text,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <ScrollProgress />
      <Nav />

      {/* BETA PROGRAM DETAILS */}
      <section style={{ padding: "140px 32px 100px", background: COLORS.bg }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "rgba(245,158,11,0.12)",
            border: `1px solid rgba(245,158,11,0.3)`, borderRadius: 100,
            padding: "8px 20px", marginBottom: 32, fontSize: 13, fontWeight: 600, color: COLORS.warning,
          }}>Early Beta Program</div>

          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, marginBottom: 24, lineHeight: 1.1 }}>
            Help Us Build the Right Product
          </h1>
          <p style={{ fontSize: 19, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 48 }}>
            Reqflow is in early beta. We're looking for 10 companies (50-250 employees, no procurement team) to help us validate the core workflow and shape the product direction.
          </p>

          {/* What Works / What Doesn't */}
          <div ref={ref1} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 64,
            opacity: isVisible1 ? 1 : 0,
            transform: isVisible1 ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: COLORS.success }}>✓ What Works Today</h3>
              <ul style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.8, paddingLeft: 20 }}>
                <li>Slack-based request intake form</li>
                <li>Basic approval routing (manual setup)</li>
                <li>QuickBooks/Xero sync (manual trigger)</li>
                <li>Full audit trail of all actions</li>
                <li>Email notifications to approvers</li>
              </ul>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: COLORS.warning }}>⚠ What's Coming (Not Ready)</h3>
              <ul style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.8, paddingLeft: 20 }}>
                <li>AI-powered categorization</li>
                <li>Automatic duplicate detection</li>
                <li>Mobile push notifications</li>
                <li>Real-time budget enforcement</li>
                <li>Auto-escalation timers</li>
              </ul>
            </div>
          </div>

          {/* The Deal */}
          <div ref={ref2} style={{
            background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 40, marginBottom: 64,
            opacity: isVisible2 ? 1 : 0,
            transform: isVisible2 ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>The Deal</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: COLORS.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>You Get</h4>
                <ul style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.8, paddingLeft: 20 }}>
                  <li>€99/mo founding member rate (locked forever)</li>
                  <li>Direct access to founders</li>
                  <li>Priority feature requests</li>
                  <li>Shape the roadmap</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: COLORS.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>We Need</h4>
                <ul style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.8, paddingLeft: 20 }}>
                  <li>30-min onboarding call</li>
                  <li>Slack feedback channel with us</li>
                  <li>Tolerance for bugs & missing features</li>
                  <li>Monthly check-in (15 min)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section style={{ padding: "100px 32px", background: COLORS.bgLight }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Apply for Beta Access</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 8,
                      background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                      color: COLORS.text, fontSize: 15,
                    }}
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Work Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 8,
                      background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                      color: COLORS.text, fontSize: 15,
                    }}
                    placeholder="jane@company.com"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Company</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 8,
                      background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                      color: COLORS.text, fontSize: 15,
                    }}
                    placeholder="Acme SaaS Inc"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Company Size</label>
                  <select
                    required
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 8,
                      background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                      color: COLORS.text, fontSize: 15,
                    }}
                  >
                    <option value="">Select size...</option>
                    <option value="10-50">10-50 employees</option>
                    <option value="50-100">50-100 employees</option>
                    <option value="100-250">100-250 employees</option>
                    <option value="250+">250+ employees</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Your Role</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 8,
                      background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                      color: COLORS.text, fontSize: 15,
                    }}
                    placeholder="Head of Finance / Operations Manager"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    What's your current procurement "process"?
                  </label>
                  <textarea
                    required
                    value={formData.useCase}
                    onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                    rows={4}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 8,
                      background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                      color: COLORS.text, fontSize: 15, fontFamily: "inherit",
                    }}
                    placeholder="e.g., People Slack the CFO, sometimes there's an email thread, nothing formal..."
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    When do you want to start?
                  </label>
                  <select
                    required
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 8,
                      background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                      color: COLORS.text, fontSize: 15,
                    }}
                  >
                    <option value="">Select timeline...</option>
                    <option value="asap">This week (we're in pain)</option>
                    <option value="soon">Next 2-4 weeks</option>
                    <option value="exploring">Just exploring for now</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%", padding: "16px", borderRadius: 10,
                    background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
                    color: COLORS.bg, fontSize: 16, fontWeight: 700,
                    border: "none", cursor: "pointer",
                    boxShadow: `0 4px 20px ${COLORS.accentGlow}`,
                    marginTop: 8,
                  }}
                >
                  Submit Application
                </button>
              </div>
            </form>

            <p style={{ fontSize: 13, color: COLORS.textDim, marginTop: 16, textAlign: "center" }}>
              We review applications within 48 hours. Priority given to companies with clear pain + commitment to feedback.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
