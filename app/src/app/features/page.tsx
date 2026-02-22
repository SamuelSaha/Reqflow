"use client";

import { Nav, Footer, COLORS } from "../../components/shared";

export default function FeaturesPage() {
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
        {/* Three steps */}
        <div style={{ marginBottom: 120 }}>
          {[
            {
              title: "Request",
              desc: "Type /reqflow in Slack, fill out a form, submit in 30 seconds.",
            },
            {
              title: "Approve",
              desc: "Approvers get an email with context and approve with one click.",
            },
            {
              title: "Synced",
              desc: "Approved purchases log to QuickBooks or Xero automatically.",
            },
          ].map((step, i) => (
            <div key={i} style={{ marginBottom: 80 }}>
              <h2 style={{
                fontSize: 32,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                marginBottom: 16,
              }}>
                {step.title}
              </h2>
              <p style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: COLORS.textMuted,
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Single CTA */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <a href="/beta" style={{
            display: "inline-block",
            background: COLORS.text,
            color: COLORS.bg,
            padding: "14px 32px",
            fontSize: 15,
            fontWeight: 500,
            textDecoration: "none",
          }}>
            Apply for beta
          </a>
        </div>

        {/* Beta caveat - single line */}
        <p style={{
          fontSize: 13,
          lineHeight: 1.6,
          color: COLORS.textMuted,
          textAlign: "center",
        }}>
          Some features are in progress — AI classification, duplicate detection, and auto-sync coming post-beta.
        </p>
      </main>

      <Footer />
    </div>
  );
}
