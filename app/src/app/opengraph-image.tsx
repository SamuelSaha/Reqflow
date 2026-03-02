import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Reqflow — Procurement workflows for growing teams";

// Generates /opengraph-image.png — replaces the missing /og-image.jpg reference
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          gap: "32px",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            background: "#2563EB",
            borderRadius: "24px",
            width: "96px",
            height: "96px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#F8FAFC",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            Reqflow
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#94A3B8",
              letterSpacing: "0px",
              lineHeight: 1.4,
              textAlign: "center",
            }}
          >
            Procurement workflows for growing teams
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
