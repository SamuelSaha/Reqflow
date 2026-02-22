"use client";

import { Nav, Footer, COLORS } from "../components/shared";

export default function HomePage() {
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

      {/* Single screen hero */}
      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
      }}>
        <div style={{ maxWidth: 640, textAlign: "center" }}>
          <h1 style={{
            fontSize: "clamp(40px, 8vw, 64px)",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: 24,
          }}>
            Stop chasing approvals.
          </h1>

          <p style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: COLORS.textMuted,
            marginBottom: 48,
          }}>
            Request from Slack. Approve from email. Synced to your books.
          </p>

          <a href="/beta" style={{
            display: "inline-block",
            background: COLORS.text,
            color: COLORS.bg,
            padding: "14px 32px",
            fontSize: 15,
            fontWeight: 500,
            textDecoration: "none",
            border: "none",
            cursor: "pointer",
          }}>
            Apply for beta (10 spots)
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
