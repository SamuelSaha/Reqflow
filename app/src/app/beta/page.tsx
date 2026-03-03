"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout";
import { Check, Sparkles, Users, Lock, MessageSquare, TrendingUp, ArrowRight } from "lucide-react";

export default function BetaPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "",
    currentProcess: "",
    painPoint: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageShell>
        <section className="flex-1 flex items-center justify-center py-32 px-6 bg-[var(--warm-50)]">
          <div className="max-w-[700px] text-center bg-white rounded-2xl border border-slate-200 shadow-lg p-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-h3 font-bold text-slate-900 mb-4">
              Application received
            </h1>
            <p className="text-body text-slate-600 leading-relaxed mb-8">
              We'll review within 48 hours and email you at <strong className="text-slate-900">{formData.email}</strong>.
            </p>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-left">
              <h3 className="text-body font-bold text-blue-900 mb-3">What happens next:</h3>
              <ul className="text-body-sm text-blue-800 leading-relaxed space-y-2">
                <li>• We'll schedule a 20-min intro call to understand your workflow</li>
                <li>• If it's a good fit, we'll get you set up the same day</li>
                <li>• You'll join our shared Slack channel with other beta customers</li>
                <li>• €99/mo locked forever, no contract, cancel anytime</li>
              </ul>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="bg-gradient-to-b from-white via-[var(--warm-50)] to-white pt-20 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1200px] mx-auto">
          {/* Hero */}
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-caption font-semibold text-blue-900">
                Founding Member Program
              </span>
            </div>
            <h1 className="text-hero font-extrabold tracking-[-1.5px] text-slate-900 mb-6 leading-[1.1]">
              Help us build the procurement tool you've always wanted.
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed mb-8">
              Reqflow is in early beta. We're looking for 10 teams willing to tolerate rough edges in exchange for locked-in pricing and direct input on what we build next.
            </p>
            <div className="flex items-center justify-center gap-8 text-body font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-500" />
                <span>€99/mo locked forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>7 of 10 spots filled</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Left: What you get */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8">
              <h2 className="text-h4 font-bold text-slate-900 mb-6">
                What you get
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: Lock,
                    title: "€99/mo locked forever",
                    desc: "First 10 beta customers pay €99/month. This rate never changes, even when we raise prices post-beta."
                  },
                  {
                    icon: MessageSquare,
                    title: "Direct founder access",
                    desc: "Shared Slack channel with founders. We respond within hours (usually minutes). Your feedback shapes the roadmap."
                  },
                  {
                    icon: TrendingUp,
                    title: "Shape the product",
                    desc: "Monthly 15-min check-ins. Tell us what's working, what's broken, what's missing. We build what you actually need."
                  },
                  {
                    icon: Sparkles,
                    title: "Early access to new features",
                    desc: "Get features before anyone else. Test AI case builder, renewal tracking, and trial management in beta."
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-body font-semibold text-slate-900 mb-1">{title}</h3>
                      <p className="text-body-sm text-slate-600 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: What we need */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-md p-8 text-white">
              <h2 className="text-h4 font-bold mb-6">
                What we need from you
              </h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-body font-semibold text-white mb-2">
                    Honest feedback
                  </h3>
                  <p className="text-body-sm text-slate-300 leading-relaxed">
                    Tell us when something doesn't work. Don't sugarcoat it. We need to know what's broken so we can fix it.
                  </p>
                </div>
                <div>
                  <h3 className="text-body font-semibold text-white mb-2">
                    Monthly check-ins (15 min)
                  </h3>
                  <p className="text-body-sm text-slate-300 leading-relaxed">
                    Quick sync once a month to discuss what's working and what needs attention. That's it.
                  </p>
                </div>
                <div>
                  <h3 className="text-body font-semibold text-white mb-2">
                    Patience with bugs
                  </h3>
                  <p className="text-body-sm text-slate-300 leading-relaxed">
                    This is beta software. Things will break. Some features are half-built. We'll fix issues fast, but they'll happen.
                  </p>
                </div>
                <div>
                  <h3 className="text-body font-semibold text-white mb-2">
                    30-min onboarding
                  </h3>
                  <p className="text-body-sm text-slate-300 leading-relaxed">
                    We'll walk you through setup, connect Slack and accounting, and configure your first approval workflow together.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Who this is for */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-10 mb-16">
            <h2 className="text-h4 font-bold text-slate-900 mb-6 text-center">
              Is this for you?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-body-lg font-bold text-green-600 mb-4">✓ Good fit if you:</h3>
                <ul className="space-y-3 text-body text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                    <span>Have 15–100 employees and procurement is becoming a mess</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                    <span>Currently manage purchase requests via Slack DMs and email threads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                    <span>Use QuickBooks, Xero, or Pennylane for accounting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                    <span>Approve at least 5–10 tool purchases per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                    <span>Want to know what you're paying for and when renewals hit</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-body-lg font-bold text-red-600 mb-4">✗ Not for you if:</h3>
                <ul className="space-y-3 text-body text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 flex-shrink-0">×</span>
                    <span>You need a polished, production-ready system right now</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 flex-shrink-0">×</span>
                    <span>You're under 10 people (spreadsheets still work fine)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 flex-shrink-0">×</span>
                    <span>You already have SAP Ariba or Coupa (you don't need us)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 flex-shrink-0">×</span>
                    <span>You need SOC 2 compliance today (we're working on it for Q3 2026)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 flex-shrink-0">×</span>
                    <span>You want hands-off software with no feedback required</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Application form */}
          <div className="max-w-[700px] mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-10">
              <h2 className="text-h4 font-bold text-slate-900 mb-3">
                Apply for beta access
              </h2>
              <p className="text-body text-slate-600 mb-8 leading-relaxed">
                We review applications within 48 hours. If it's a fit, we'll schedule a quick intro call and get you set up the same day.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-body-sm font-medium text-slate-700 mb-2">
                    Your name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Claire Dupont"
                    className="w-full px-4 py-3 text-body bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-slate-700 mb-2">
                    Work email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="claire@yourcompany.com"
                    className="w-full px-4 py-3 text-body bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-slate-700 mb-2">
                    Company name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 text-body bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-slate-700 mb-2">
                    Team size *
                  </label>
                  <select
                    required
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    className="w-full px-4 py-3 text-body bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="">Select team size</option>
                    <option value="5-15">5–15 people</option>
                    <option value="15-30">15–30 people</option>
                    <option value="30-50">30–50 people</option>
                    <option value="50-100">50–100 people</option>
                    <option value="100+">100+ people</option>
                  </select>
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-slate-700 mb-2">
                    How do you handle purchase requests today? *
                  </label>
                  <textarea
                    required
                    value={formData.currentProcess}
                    onChange={(e) => setFormData({ ...formData, currentProcess: e.target.value })}
                    placeholder="e.g., Slack DMs to our CFO, approval via email, then we manually log it in QuickBooks"
                    rows={3}
                    className="w-full px-4 py-3 text-body bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-slate-700 mb-2">
                    What's your biggest procurement pain point? *
                  </label>
                  <textarea
                    required
                    value={formData.painPoint}
                    onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                    placeholder="e.g., We have no idea what SaaS tools we're paying for. Renewals sneak up on us and we forget to cancel trials."
                    rows={3}
                    className="w-full px-4 py-3 text-body bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 px-8 text-body font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Submit application
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-caption text-slate-500 text-center">
                  We'll respond within 48 hours (business days, CET). Questions? Email{" "}
                  <a href="mailto:beta@reqflow.co" className="text-blue-600 font-semibold no-underline">
                    beta@reqflow.co
                  </a>
                </p>
              </form>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 text-center max-w-[800px] mx-auto">
            <p className="text-body-sm font-medium text-slate-500 mb-6">
              WHAT BETA CUSTOMERS ARE SAYING
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-left">
                <p className="text-body text-slate-700 italic leading-relaxed mb-4">
                  "We went from 2-week approval cycles to same-day approvals. The founders are incredibly responsive - they fixed a bug we reported within 3 hours."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-caption font-bold">
                    MT
                  </div>
                  <div>
                    <div className="text-body-sm font-semibold text-slate-900">Marc T.</div>
                    <div className="text-caption text-slate-500">COO, 35-person SaaS company</div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-left">
                <p className="text-body text-slate-700 italic leading-relaxed mb-4">
                  "Finally, we know what subscriptions we're paying for. The renewal tracking alone saves us €15K/year in forgotten trials that auto-converted."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-caption font-bold">
                    SL
                  </div>
                  <div>
                    <div className="text-body-sm font-semibold text-slate-900">Sophie L.</div>
                    <div className="text-caption text-slate-500">Finance Lead, 50-person agency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
