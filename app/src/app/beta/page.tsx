"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout";

export default function BetaPage() {
  const [formData, setFormData] = useState({ name: "", email: "", company: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Beta application:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageShell>
        <section className="flex-1 flex items-center justify-center py-32 px-6">
          <div className="max-w-[640px] text-center">
            <h1 className="text-[32px] font-semibold text-slate-900 mb-4">Application received</h1>
            <p className="text-[16px] text-slate-600 leading-relaxed">
              We'll review within 48 hours and email you at {formData.email}.
            </p>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="max-w-[640px] mx-auto pt-20 pb-20 px-6">
        <div className="mb-16">
          <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-slate-900 mb-8">Beta program</h1>
          <div className="text-[16px] leading-[1.8] text-slate-900 space-y-4">
            <p>You get: €99/mo locked forever, direct founder access, shape the roadmap.</p>
            <p>We need: 30-min onboarding, monthly check-in, tolerance for bugs.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 mb-8">
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" className="w-full py-3 text-[16px] bg-transparent border-b border-slate-200 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 transition-colors" />
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Work email" className="w-full py-3 text-[16px] bg-transparent border-b border-slate-200 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 transition-colors" />
            <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Company" className="w-full py-3 text-[16px] bg-transparent border-b border-slate-200 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 transition-colors" />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-3.5 px-8 text-[15px] font-medium cursor-pointer rounded-lg hover:bg-slate-800 transition-colors">
            Submit application
          </button>
        </form>
      </section>
    </PageShell>
  );
}
