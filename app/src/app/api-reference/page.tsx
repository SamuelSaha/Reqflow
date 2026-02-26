import { PageShell } from "@/components/layout";
import { Code, Key, Zap, Lock, Globe, ArrowRight, CheckCircle, Terminal } from "lucide-react";
import Link from "next/link";

export default function ApiReferencePage() {
  const endpoints = [
    {
      method: "POST",
      path: "/api/v1/requests",
      desc: "Create a new purchase request",
      category: "Requests",
    },
    {
      method: "GET",
      path: "/api/v1/requests",
      desc: "List all purchase requests",
      category: "Requests",
    },
    {
      method: "GET",
      path: "/api/v1/requests/:id",
      desc: "Get a specific request",
      category: "Requests",
    },
    {
      method: "PATCH",
      path: "/api/v1/requests/:id",
      desc: "Update request status or details",
      category: "Requests",
    },
    {
      method: "POST",
      path: "/api/v1/approvals/:id/approve",
      desc: "Approve a pending request",
      category: "Approvals",
    },
    {
      method: "POST",
      path: "/api/v1/approvals/:id/reject",
      desc: "Reject a pending request",
      category: "Approvals",
    },
    {
      method: "GET",
      path: "/api/v1/budgets",
      desc: "Get current budget status",
      category: "Budgets",
    },
    {
      method: "POST",
      path: "/api/v1/webhooks",
      desc: "Register a webhook endpoint",
      category: "Webhooks",
    },
  ];

  const webhookEvents = [
    { event: "request.created", desc: "Triggered when a new request is submitted" },
    { event: "request.approved", desc: "Triggered when a request is fully approved" },
    { event: "request.rejected", desc: "Triggered when a request is rejected" },
    { event: "budget.warning", desc: "Triggered when budget reaches 80% threshold" },
    { event: "renewal.upcoming", desc: "Triggered 30/60/90 days before renewal" },
  ];

  return (
    <PageShell>
      <section className="pt-20 pb-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white via-[var(--warm-50)] to-white">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-200 bg-violet-50 mb-6">
              <Code className="w-4 h-4 text-violet-600" />
              <span className="text-[13px] font-semibold text-violet-900">
                API Reference
              </span>
            </div>
            <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-4">
              Build on Reqflow
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed max-w-[600px] mx-auto">
              REST API with full CRUD operations, webhooks for real-time events, and SDKs for Node.js and Python (coming soon).
            </p>
          </div>

          {/* Beta notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
            <div className="flex items-start gap-3">
              <Terminal className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body font-bold text-amber-900 mb-2">API in Beta</h3>
                <p className="text-body-sm text-amber-800 leading-relaxed">
                  The API is functional but not publicly documented yet. Beta customers can request API access. We'll provide keys and work with you to build your integration.{" "}
                  <a href="mailto:api@reqflow.co" className="text-amber-900 font-semibold underline">
                    Email us for access
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Quick start */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-10 mb-12 text-white">
            <h2 className="text-h4 font-bold mb-6">Quick Start</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-body font-semibold text-slate-200 mb-3">
                  1. Get your API key
                </h3>
                <p className="text-body-sm text-slate-300 mb-4">
                  Navigate to Settings → Integrations → API and generate a new API key. Keep it secure — it grants full access to your Reqflow data.
                </p>
              </div>
              <div>
                <h3 className="text-body font-semibold text-slate-200 mb-3">
                  2. Make your first request
                </h3>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 overflow-x-auto">
                  <pre className="text-[13px] text-slate-200 font-mono">
{`curl https://api.reqflow.com/v1/requests \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </div>
              <div>
                <h3 className="text-body font-semibold text-slate-200 mb-3">
                  3. Create a purchase request
                </h3>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 overflow-x-auto">
                  <pre className="text-[13px] text-slate-200 font-mono">
{`curl -X POST https://api.reqflow.com/v1/requests \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "GitHub Copilot Business",
    "amount": 2736.00,
    "category": "dev_tools",
    "justification": "Team productivity tool for 12 engineers",
    "vendor": "GitHub"
  }'`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Key features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-body-lg font-bold text-slate-900 mb-2">
                Secure by Default
              </h3>
              <p className="text-body-sm text-slate-600 leading-relaxed">
                TLS 1.3 encryption, Bearer token auth, rate limiting (100 req/min), and audit logging for every API call.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-body-lg font-bold text-slate-900 mb-2">
                Real-Time Webhooks
              </h3>
              <p className="text-body-sm text-slate-600 leading-relaxed">
                Get instant notifications for request approvals, budget alerts, and renewals. Build reactive integrations.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-body-lg font-bold text-slate-900 mb-2">
                RESTful & JSON
              </h3>
              <p className="text-body-sm text-slate-600 leading-relaxed">
                Standard REST conventions, JSON payloads, consistent error codes. Works with any HTTP client.
              </p>
            </div>
          </div>

          {/* Endpoints */}
          <div className="mb-16">
            <h2 className="text-[28px] font-bold text-slate-900 mb-6">
              API Endpoints
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {endpoints.map((endpoint, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                          endpoint.method === "GET" ? "bg-blue-100 text-blue-700" :
                          endpoint.method === "POST" ? "bg-green-100 text-green-700" :
                          endpoint.method === "PATCH" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-[14px] font-mono text-slate-900">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-[14px] text-slate-600">
                        {endpoint.desc}
                      </p>
                    </div>
                    <span className="text-[12px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {endpoint.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhooks */}
          <div className="mb-16">
            <h2 className="text-[28px] font-bold text-slate-900 mb-6">
              Webhook Events
            </h2>
            <p className="text-body text-slate-600 mb-6">
              Register webhook endpoints to receive real-time notifications when events occur in Reqflow.
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {webhookEvents.map((webhook, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <code className="text-[14px] font-mono text-slate-900 font-semibold">
                        {webhook.event}
                      </code>
                      <p className="text-[14px] text-slate-600 mt-1">
                        {webhook.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Example response */}
          <div className="mb-16">
            <h2 className="text-[28px] font-bold text-slate-900 mb-6">
              Example Response
            </h2>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 overflow-x-auto">
              <pre className="text-[13px] text-slate-200 font-mono">
{`{
  "id": "req_1a2b3c4d",
  "title": "GitHub Copilot Business",
  "amount": 2736.00,
  "currency": "EUR",
  "status": "pending",
  "category": "dev_tools",
  "vendor": "GitHub",
  "requester": {
    "id": "usr_5e6f7g8h",
    "name": "Marc Dubois",
    "email": "marc@acme.com"
  },
  "approval_chain": [
    {
      "approver_id": "usr_9i0j1k2l",
      "approver_name": "Sarah Chen",
      "status": "approved",
      "approved_at": "2026-02-20T14:32:00Z"
    },
    {
      "approver_id": "usr_3m4n5o6p",
      "approver_name": "Claire Dupont",
      "status": "pending",
      "approved_at": null
    }
  ],
  "created_at": "2026-02-20T10:15:00Z",
  "updated_at": "2026-02-20T14:32:15Z"
}`}
              </pre>
            </div>
          </div>

          {/* SDKs coming soon */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
            <h3 className="text-h5 font-bold text-blue-900 mb-3">
              SDKs Coming Soon
            </h3>
            <p className="text-body-sm text-blue-800 mb-6">
              We're building official SDKs for Node.js and Python. In the meantime, the REST API works with any HTTP client (fetch, axios, requests, etc.).
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-blue-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-[18px]">📦</span>
                  </div>
                  <div>
                    <div className="text-body font-bold text-slate-900">Node.js SDK</div>
                    <div className="text-[13px] text-slate-600">Coming March 2026</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-blue-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-[18px]">🐍</span>
                  </div>
                  <div>
                    <div className="text-body font-bold text-slate-900">Python SDK</div>
                    <div className="text-[13px] text-slate-600">Coming March 2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Get API access */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-10 text-center text-white">
            <div className="w-16 h-16 bg-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-h4 font-bold mb-3">
              Request API Access
            </h2>
            <p className="text-body text-slate-300 mb-6 max-w-[500px] mx-auto">
              The API is available to beta customers. Email us with your use case and we'll get you set up with keys and documentation.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="mailto:api@reqflow.co"
                className="inline-block bg-white text-slate-900 px-6 py-3 rounded-lg text-body font-semibold hover:bg-slate-100 transition-colors no-underline"
              >
                Request Access
              </a>
              <Link
                href="/documentation"
                className="inline-flex items-center gap-2 text-white hover:text-slate-200 transition-colors no-underline text-body font-semibold"
              >
                View Docs
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
