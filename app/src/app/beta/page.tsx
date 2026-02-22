"use client";

import { useState } from "react";

const COLORS = {
  bg: "#09090b",
  surface: "#131316",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  accent: "#22d3ee",
  accentGlow: "rgba(34, 211, 238, 0.15)",
  accentSoft: "rgba(34, 211, 238, 0.08)",
  warning: "#f59e0b",
  success: "#34d399",
};

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Actually submit to backend/email
    console.log("Beta application:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ maxWidth: 600, textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: `linear-gradient(135deg, #22d3ee, #818cf8)`,
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
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Beta Program Header */}
        <div style={{ marginBottom: 64 }}>
          <div style={{
            display: "inline-block", background: COLORS.accentSoft,
            border: `1px solid rgba(34,211,238,0.2)`, borderRadius: 100,
            padding: "8px 20px", marginBottom: 24, fontSize: 13, fontWeight: 600, color: COLORS.accent,
          }}>Early Beta Program</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 24, lineHeight: 1.1 }}>
            Help Us Build the Right Product
          </h1>
          <p style={{ fontSize: 19, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 32 }}>
            Reqflow is in early beta. We're looking for 10 companies (50-250 employees, no procurement team) to help us validate the core workflow and shape the product direction.
          </p>
        </div>

        {/* What Works / What Doesn't */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 64 }}>
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
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 40, marginBottom: 48 }}>
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

        {/* Application Form */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 40 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Apply for Beta Access</h3>
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
                  background: `linear-gradient(135deg, #22d3ee, #818cf8)`,
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
    </div>
  );
}
