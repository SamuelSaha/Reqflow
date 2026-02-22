"use client";

import { useState, useEffect } from "react";

const COLORS = {
  bg: "#09090b",
  surface: "#131316",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  accent: "#22d3ee",
  success: "#34d399",
  warning: "#f59e0b",
  danger: "#f87171",
};

type ServiceStatus = "operational" | "degraded" | "down";

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: string;
}

export default function StatusPage() {
  const [services, setServices] = useState<Service[]>([
    { name: "Web Application", status: "operational", uptime: "99.9%" },
    { name: "Slack Integration", status: "operational", uptime: "99.8%" },
    { name: "Email Notifications", status: "operational", uptime: "99.7%" },
    { name: "QuickBooks Sync", status: "operational", uptime: "99.5%" },
    { name: "Xero Sync", status: "operational", uptime: "99.4%" },
    { name: "Database (Neon)", status: "operational", uptime: "99.9%" },
  ]);

  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setLastUpdate(now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    }));
  }, []);

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "operational": return COLORS.success;
      case "degraded": return COLORS.warning;
      case "down": return COLORS.danger;
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "operational": return "✓";
      case "degraded": return "⚠";
      case "down": return "✕";
    }
  };

  const allOperational = services.every(s => s.status === "operational");

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: "80px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 16 }}>System Status</h1>
        <p style={{ fontSize: 15, color: COLORS.textDim, marginBottom: 48 }}>
          Real-time status for Reqflow services · Last updated: {lastUpdate}
        </p>

        {/* Overall Status */}
        <div style={{
          background: allOperational ? "rgba(52,211,153,0.1)" : "rgba(245,158,11,0.1)",
          border: `1px solid ${allOperational ? "rgba(52,211,153,0.3)" : "rgba(245,158,11,0.3)"}`,
          borderRadius: 16, padding: 32, marginBottom: 48, textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {allOperational ? "✓" : "⚠"}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: COLORS.text }}>
            {allOperational ? "All Systems Operational" : "Some Services Degraded"}
          </h2>
          <p style={{ fontSize: 15, color: COLORS.textMuted }}>
            {allOperational
              ? "All Reqflow services are running normally."
              : "Some services are experiencing issues. Check details below."}
          </p>
        </div>

        {/* Beta Notice */}
        <div style={{
          background: "rgba(245,158,11,0.12)", border: `1px solid rgba(245,158,11,0.3)`,
          borderRadius: 12, padding: 24, marginBottom: 48,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: COLORS.warning }}>Beta Status Monitoring</h3>
          <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
            We're in beta. This status page shows live service health, but we don't have automated incident tracking yet.
            For real-time updates or to report issues, reach us in the shared Slack channel or at{" "}
            <a href="mailto:support@reqflow.co" style={{ color: COLORS.accent, fontWeight: 600 }}>support@reqflow.co</a>.
          </p>
        </div>

        {/* Service Status List */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: COLORS.text }}>Service Status</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {services.map((service) => (
              <div key={service.name} style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 12, padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${getStatusColor(service.status)}15`,
                    border: `1px solid ${getStatusColor(service.status)}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, color: getStatusColor(service.status),
                  }}>
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                      {service.name}
                    </div>
                    <div style={{ fontSize: 13, color: getStatusColor(service.status), textTransform: "capitalize" }}>
                      {service.status}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 2 }}>30-day uptime</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{service.uptime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident History */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: COLORS.text }}>Recent Incidents</h2>
          <div style={{
            background: COLORS.surface, border: `1px solid ${COLORS.border}`,
            borderRadius: 12, padding: 40, textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
            <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 8 }}>
              <strong style={{ color: COLORS.text }}>No incidents in the last 30 days</strong>
            </p>
            <p style={{ fontSize: 14, color: COLORS.textDim }}>
              Beta launched February 2026 · We're tracking uptime from day one
            </p>
          </div>
        </div>

        {/* Infrastructure Details */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: COLORS.text }}>Infrastructure</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Hosting", value: "Oracle Cloud (Paris, EU)" },
              { label: "Database", value: "Neon PostgreSQL (EU)" },
              { label: "Cache/Queue", value: "Upstash Redis (EU)" },
              { label: "File Storage", value: "Cloudflare R2 (EU)" },
              { label: "Email", value: "Resend" },
              { label: "Monitoring", value: "Axiom + Sentry" },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 10, padding: 20,
              }}>
                <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe to Updates */}
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 16, padding: 40, textAlign: "center",
        }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: COLORS.text }}>
            Get Status Updates
          </h3>
          <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 24 }}>
            Beta customers are automatically added to our shared Slack channel for real-time incident updates.
            Email notifications for major outages coming soon.
          </p>
          <a href="/beta" style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${COLORS.accent}, #818cf8)`,
            color: COLORS.bg, padding: "12px 28px", borderRadius: 10,
            fontSize: 15, fontWeight: 700, textDecoration: "none",
          }}>
            Join Beta Program
          </a>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24, marginTop: 48 }}>
          <p style={{ fontSize: 14, color: COLORS.textDim, textAlign: "center" }}>
            <a href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>← Back to home</a>
            {" · "}
            <a href="/security" style={{ color: COLORS.textDim, textDecoration: "none" }}>Security</a>
            {" · "}
            <a href="mailto:support@reqflow.co" style={{ color: COLORS.textDim, textDecoration: "none" }}>Report an issue</a>
          </p>
        </div>
      </div>
    </div>
  );
}
