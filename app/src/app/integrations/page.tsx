"use client";

import { useEffect } from "react";
import { ScrollProgress, Nav, Footer, COLORS, useScrollReveal } from "../../components/shared";

export default function IntegrationsPage() {
  const [refHero, isVisibleHero] = useScrollReveal(0.2);
  const [refWorking, isVisibleWorking] = useScrollReveal(0.2);
  const [refComing, isVisibleComing] = useScrollReveal(0.2);
  const [refAPI, isVisibleAPI] = useScrollReveal(0.2);
  const [refCTA, isVisibleCTA] = useScrollReveal(0.2);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);
  const workingIntegrations = [
    {
      name: "Slack", color: "#E01E5A", status: "working",
      desc: "Request intake via /reqflow buy command. Submit requests directly from Slack channels.",
      features: ["Slash commands", "Rich forms", "Channel notifications", "Beta: Manual routing"],
      logo: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>,
    },
    {
      name: "QuickBooks", color: "#2CA01C", status: "working",
      desc: "Sync approved purchases to QuickBooks Online. Manual trigger during beta.",
      features: ["Chart of accounts sync", "Vendor mapping", "CSV fallback", "Beta: Manual trigger"],
      logo: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.2"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-13h-2v2h2V7zm-4 0H9v2h2V7zm4 4h-2v2h2v-2zm-4 0H9v2h2v-2z"/></svg>,
    },
    {
      name: "Xero", color: "#13B5EA", status: "working",
      desc: "Sync approved purchases to Xero accounting. Manual trigger during beta.",
      features: ["Tracking categories", "Tax mapping", "CSV fallback", "Beta: Manual trigger"],
      logo: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    },
    {
      name: "Resend", color: "#000000", status: "working",
      desc: "Transactional emails for approval notifications and request updates.",
      features: ["Approval emails", "Request updates", "Digest emails", "Delivery tracking"],
      logo: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
    },
  ];

  const comingIntegrations = [
    {
      name: "Microsoft Teams", color: "#5558AF", status: "coming",
      desc: "Submit requests via Teams bot. Same experience as Slack.",
      features: ["Teams bot", "Adaptive cards", "Channel posts", "Approval actions"],
      logo: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 3A2.5 2.5 0 0 1 22 5.5V16a2.5 2.5 0 0 1-2.5 2.5h-14A2.5 2.5 0 0 1 3 16V5.5A2.5 2.5 0 0 1 5.5 3h14m-7 1.5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/></svg>,
    },
    {
      name: "Google Workspace", color: "#4285F4", status: "coming",
      desc: "SSO via Google OAuth. Submit requests via Gmail extension.",
      features: ["Google SSO", "Gmail extension", "Calendar integration", "Drive storage"],
      logo: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/></svg>,
    },
    {
      name: "Microsoft Entra", color: "#00A4EF", status: "coming",
      desc: "SSO via Microsoft Entra ID (formerly Azure AD). SAML support.",
      features: ["Entra SSO", "SAML", "Group sync", "Auto-provisioning"],
      logo: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/></svg>,
    },
    {
      name: "NetSuite", color: "#1D252D", status: "coming",
      desc: "ERP sync for larger companies using NetSuite instead of QB/Xero.",
      features: ["Purchase orders", "Vendor records", "Budget tracking", "Custom fields"],
      logo: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.3"/><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>,
    },
  ];

  return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", color: COLORS.text,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <ScrollProgress />
      <Nav />

      {/* Hero */}
      <section ref={refHero} style={{
        textAlign: "center", padding: "140px 32px 80px", maxWidth: 800, margin: "0 auto",
        opacity: isVisibleHero ? 1 : 0,
        transform: isVisibleHero ? "translateY(0)" : "translateY(40px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.035em" }}>
          Integrations that<br />
          <span style={{ background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            plug into your stack
          </span>
        </h1>
        <p style={{ fontSize: 19, color: COLORS.textMuted, lineHeight: 1.7 }}>
          Slack for requests. QuickBooks or Xero for accounting. Resend for emails. If the API hiccups, a perfect CSV fallback is always ready.
        </p>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Working Integrations */}
        <section ref={refWorking} style={{
          marginBottom: 80,
          opacity: isVisibleWorking ? 1 : 0,
          transform: isVisibleWorking ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40, textAlign: "center", color: COLORS.success }}>
            ✓ Working Today
          </h2>
          <div style={{ display: "grid", gap: 20 }}>
            {workingIntegrations.map((integration, i) => (
              <div key={i} style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  borderRadius: 16, padding: 40, display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap",
                }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: 16, flexShrink: 0,
                    background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: integration.color,
                  }}>
                    {integration.logo}
                  </div>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <h3 style={{ fontSize: 24, fontWeight: 700 }}>{integration.name}</h3>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: COLORS.success,
                        background: "rgba(52,211,153,0.1)", padding: "3px 10px",
                        borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>Working</span>
                    </div>
                    <p style={{ fontSize: 16, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 20 }}>
                      {integration.desc}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {integration.features.map((feature, j) => (
                        <span key={j} style={{
                          background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                          borderRadius: 8, padding: "6px 12px", fontSize: 13,
                          color: feature.startsWith("Beta") ? COLORS.warning : COLORS.textMuted,
                        }}>
                          {feature.startsWith("Beta") ? "⚠ " : "✓ "}
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section ref={refComing} style={{
          marginBottom: 80,
          opacity: isVisibleComing ? 1 : 0,
          transform: isVisibleComing ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40, textAlign: "center", color: COLORS.warning }}>
            ⏳ Coming Post-Beta
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {comingIntegrations.map((integration, i) => (
              <div key={i} style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  borderRadius: 16, padding: 32, opacity: 0.8,
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 12,
                    background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: integration.color, marginBottom: 20,
                  }}>
                    {integration.logo}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700 }}>{integration.name}</h3>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: COLORS.warning,
                      background: "rgba(245,158,11,0.12)", padding: "3px 10px",
                      borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>Soon</span>
                  </div>
                  <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
                    {integration.desc}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {integration.features.map((feature, j) => (
                      <div key={j} style={{ fontSize: 13, color: COLORS.textDim }}>
                        <span style={{ color: COLORS.warning }}>⏳</span> {feature}
                      </div>
                    ))}
                  </div>
                </div>
            ))}
          </div>
        </section>

        {/* API Access */}
        <div ref={refAPI} style={{
          opacity: isVisibleAPI ? 1 : 0,
          transform: isVisibleAPI ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{
            background: COLORS.surface, border: `1px solid ${COLORS.border}`,
            borderRadius: 20, padding: 48, marginBottom: 80,
          }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Need a custom integration?</h2>
            <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
              API access is planned for the Scale tier (post-beta). We'll provide REST endpoints for building custom integrations, webhooks for real-time events, and full documentation.
            </p>
            <p style={{ fontSize: 15, color: COLORS.textDim, lineHeight: 1.7 }}>
              During beta, if you need a specific integration, let us know. We'll prioritize based on customer demand.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div ref={refCTA} style={{
          opacity: isVisibleCTA ? 1 : 0,
          transform: isVisibleCTA ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{
            maxWidth: 700, margin: "0 auto", textAlign: "center",
            background: `radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)`,
            padding: "60px 40px", borderRadius: 20,
          }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, marginBottom: 20 }}>
              Start with what works
            </h2>
            <p style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 32, lineHeight: 1.6 }}>
              Slack, QB/Xero, and email notifications work today. Join beta and help us prioritize what to build next.
            </p>
            <a href="/beta" style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
              color: COLORS.bg, padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700,
              textDecoration: "none", boxShadow: `0 0 40px ${COLORS.accentGlow}`,
            }}>Apply for beta →</a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
