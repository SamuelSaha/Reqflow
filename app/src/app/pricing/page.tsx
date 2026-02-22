"use client";

import { Nav, Footer, COLORS } from "../../components/shared";

export default function PricingPage() {
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
          {/* Price */}
          <div style={{
            fontSize: "clamp(56px, 10vw, 80px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            marginBottom: 8,
            fontFamily: "'DM Mono', monospace",
          }}>
            €99
          </div>

          <p style={{
            fontSize: 15,
            color: COLORS.textMuted,
            marginBottom: 64,
          }}>
            per month, locked forever
          </p>

          {/* What's included - max 4 bullets */}
          <div style={{
            fontSize: 16,
            lineHeight: 2,
            color: COLORS.text,
            marginBottom: 64,
            textAlign: "left",
            display: "inline-block",
          }}>
            <div>Unlimited users</div>
            <div>Slack intake + email approvals</div>
            <div>QuickBooks & Xero sync</div>
            <div>Full audit trail</div>
          </div>

          {/* Single CTA */}
          <div>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
