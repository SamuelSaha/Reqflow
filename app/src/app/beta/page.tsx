"use client";

import { useState } from "react";
import { Nav, Footer, COLORS } from "../../components/shared";

export default function BetaPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Beta application:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{
        background: COLORS.bg,
        minHeight: "100vh",
        color: COLORS.text,
        fontFamily: "'Manrope', -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}>
        <Nav />
        <main style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
        }}>
          <div style={{ maxWidth: 640, textAlign: "center" }}>
            <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 16 }}>
              Application received
            </h1>
            <p style={{ fontSize: 16, color: COLORS.textMuted, lineHeight: 1.6 }}>
              We'll review within 48 hours and email you at {formData.email}.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{
      background: COLORS.bg,
      minHeight: "100vh",
      color: COLORS.text,
      fontFamily: "'Manrope', -apple-system, sans-serif",
    }}>
      <Nav />

      <main style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "120px 24px 80px",
      }}>
        {/* Max 6 lines of copy total */}
        <div style={{ marginBottom: 64 }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: 32,
          }}>
            Beta program
          </h1>

          <div style={{ fontSize: 16, lineHeight: 1.8, color: COLORS.text, marginBottom: 24 }}>
            <p style={{ margin: 0, marginBottom: 16 }}>
              You get: €99/mo locked forever, direct founder access, shape the roadmap.
            </p>
            <p style={{ margin: 0 }}>
              We need: 30-min onboarding, monthly check-in, tolerance for bugs.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              style={{
                width: "100%",
                padding: "12px 0",
                fontSize: 16,
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                outline: "none",
              }}
            />

            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Work email"
              style={{
                width: "100%",
                padding: "12px 0",
                fontSize: 16,
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                outline: "none",
              }}
            />

            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Company"
              style={{
                width: "100%",
                padding: "12px 0",
                fontSize: 16,
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              background: COLORS.text,
              color: COLORS.bg,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Submit application
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
