/**
 * Feature Grid — 6 features on dark background
 * SSR, simple 3x2 grid
 */

import {
  FileText,
  Receipt,
  Users,
  Shield,
  Database,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Purchase Orders',
    description:
      'Generate POs automatically from approved requests. Track status from draft to paid with full audit trail.',
    iconBg: 'bg-blue-500',
  },
  {
    icon: Receipt,
    title: 'Invoice Processing',
    description:
      'Match invoices to POs automatically. Flag discrepancies before they become problems. Export to QuickBooks or Xero.',
    iconBg: 'bg-emerald-500',
  },
  {
    icon: Users,
    title: 'Vendor Management',
    description:
      'Centralized vendor directory with contracts, payment terms, and relationship history. Know every vendor at a glance.',
    iconBg: 'bg-amber-500',
  },
  {
    icon: Shield,
    title: 'Compliance & Audit',
    description:
      'Full audit trail for every purchase. GDPR compliant, EU-hosted, role-based access control. Export reports in one click.',
    iconBg: 'bg-red-500',
  },
  {
    icon: Database,
    title: 'Contract Management',
    description:
      'Upload contracts, extract key terms with AI. Link contracts to subscriptions and invoices. Never hunt for a contract again.',
    iconBg: 'bg-violet-500',
  },
  {
    icon: Sparkles,
    title: 'AI Copilot',
    description:
      'AI-powered spend analysis, duplicate detection, and business case generation. Built to save you hours, not add complexity.',
    iconBg: 'bg-indigo-500',
    premium: true,
  },
];

export function FeatureGrid() {
  return (
    <section className="py-20 lg:py-28 bg-slate-900 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-h2 text-white mb-4">
            Stop chasing approvals.
            <br />
            Start buying smarter.
          </h2>
          <p className="text-body-lg text-slate-400">
            Everything you need to manage procurement without enterprise bloat.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`relative rounded-2xl p-6 border transition-colors ${
                  feature.premium
                    ? 'bg-gradient-to-br from-violet-500/10 to-slate-800/80 border-violet-500/30 hover:border-violet-400/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/60'
                }`}
              >
                {feature.premium && (
                  <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-violet-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Premium
                  </div>
                )}

                <div
                  className={`mb-4 w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
