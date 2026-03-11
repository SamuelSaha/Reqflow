"use client";

import { useState } from "react";
import { MarketingNav } from '@/components/marketing/nav/MarketingNav';
import { MarketingFooter } from '@/components/marketing/footer/MarketingFooter';

type ServiceStatus = "operational" | "degraded" | "down";

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: string;
}

export default function StatusPage() {
  const [services] = useState<Service[]>([
    { name: "Web Application", status: "operational", uptime: "99.9%" },
    { name: "Slack Integration", status: "operational", uptime: "99.8%" },
    { name: "Email Notifications", status: "operational", uptime: "99.7%" },
    { name: "QuickBooks Sync", status: "operational", uptime: "99.5%" },
    { name: "Xero Sync", status: "operational", uptime: "99.4%" },
    { name: "Database (Neon)", status: "operational", uptime: "99.9%" },
  ]);

  const [lastUpdate] = useState(() =>
    new Date().toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    })
  );

  const statusColor = (s: ServiceStatus) =>
    s === "operational" ? "text-emerald-600" : s === "degraded" ? "text-amber-500" : "text-red-500";

  const statusBg = (s: ServiceStatus) =>
    s === "operational" ? "bg-emerald-50 border-emerald-200" : s === "degraded" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  const allOperational = services.every((s) => s.status === "operational");

  return (
    <><MarketingNav />
      <section className="pt-20 pb-20 px-20">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-4">System Status</h1>
          <p className="text-body text-slate-500 mb-12">Real-time status for Reqflow services · Last updated: {lastUpdate}</p>

          <div className={`rounded-2xl p-8 mb-12 text-center border ${allOperational ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="text-h2 mb-4">{allOperational ? "\u2713" : "\u26A0"}</div>
            <h2 className="text-h4 font-bold text-slate-900 mb-2">
              {allOperational ? "All Systems Operational" : "Some Services Degraded"}
            </h2>
            <p className="text-body text-slate-600">
              {allOperational ? "All Reqflow services are running normally." : "Some services are experiencing issues. Check details below."}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
            <h3 className="text-body-lg font-bold text-amber-600 mb-3">Beta Status Monitoring</h3>
            <p className="text-body text-slate-600 leading-[1.7]">
              We're in beta. This status page shows live service health, but we don't have automated incident tracking yet.
              For real-time updates or to report issues, reach us in the shared Slack channel or at{" "}
              <a href="mailto:support@reqflow.co" className="text-blue-600 font-semibold no-underline">support@reqflow.co</a>.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-6">Service Status</h2>
            <div className="grid gap-3">
              {services.map((service) => (
                <div key={service.name} className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-[10px] border flex items-center justify-center text-body-lg ${statusBg(service.status)} ${statusColor(service.status)}`}>
                      {service.status === "operational" ? "\u2713" : service.status === "degraded" ? "\u26A0" : "\u2715"}
                    </div>
                    <div>
                      <div className="text-body font-semibold text-slate-900 mb-1">{service.name}</div>
                      <div className={`text-caption capitalize ${statusColor(service.status)}`}>{service.status}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-caption text-slate-500 mb-0.5">30-day uptime</div>
                    <div className="text-body-lg font-bold text-slate-900">{service.uptime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-6">Recent Incidents</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center">
              <p className="text-body text-slate-600 mb-2"><strong className="text-slate-900">No incidents in the last 30 days</strong></p>
              <p className="text-body-sm text-slate-500">Beta launched February 2026 · We're tracking uptime from day one</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-6">Infrastructure</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Hosting", value: "Oracle Cloud (Paris, EU)" },
                { label: "Database", value: "Neon PostgreSQL (EU)" },
                { label: "Cache/Queue", value: "Upstash Redis (EU)" },
                { label: "File Storage", value: "Cloudflare R2 (EU)" },
                { label: "Email", value: "Resend" },
                { label: "Monitoring", value: "Axiom + Sentry" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 border border-slate-200 rounded-[10px] p-5">
                  <div className="text-caption text-slate-500 mb-1.5 uppercase tracking-[0.05em]">{label}</div>
                  <div className="text-body font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
            <h3 className="text-h4 font-bold text-slate-900 mb-3">Get Status Updates</h3>
            <p className="text-body text-slate-600 mb-6">Beta customers are automatically added to our shared Slack channel for real-time incident updates. Email notifications for major outages coming soon.</p>
            <a href="/beta" className="inline-block bg-blue-600 text-white py-3 px-7 rounded-lg text-body font-bold no-underline hover:bg-blue-700 transition-colors">
              Join Beta Program
            </a>
          </div>
        </div>
      </section>
    <MarketingFooter /></>
  );
}
