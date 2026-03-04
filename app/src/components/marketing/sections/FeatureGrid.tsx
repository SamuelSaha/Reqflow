'use client';

/**
 * Feature Grid - Expandable brutal cards
 * Design: Grid layout with click-to-expand cards showing feature details
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Shield, TrendingUp, Bell, Users, Link as LinkIcon,
  Database, FileText, Calendar, DollarSign, BarChart, Lock
} from 'lucide-react';

const features = [
  {
    id: 'smart-intake',
    icon: Zap,
    title: 'Smart Intake',
    tagline: 'AI-powered forms',
    description: 'Adaptive intake forms that understand context. Slack integration means requests happen where your team already works.',
    benefits: [
      'AI classifies tool type automatically',
      'Duplicate detection before approval',
      'Budget check in real-time',
      'Slack-native workflow'
    ],
    premium: false
  },
  {
    id: 'approval-workflows',
    icon: Shield,
    title: 'Approval Workflows',
    tagline: 'Rules that make sense',
    description: 'Auto-approve small purchases. Route big ones based on budget, category, or amount. No bottlenecks.',
    benefits: [
      'Auto-approve rules (e.g., <$100/mo)',
      'Budget-based routing',
      'Parallel approvals for speed',
      '1-click approve in Slack'
    ],
    premium: false
  },
  {
    id: 'budget-tracking',
    icon: TrendingUp,
    title: 'Budget Tracking',
    tagline: 'Real-time visibility',
    description: 'Department and category budgets with soft limits. See spend vs. budget before approving, not after the fact.',
    benefits: [
      'Department + category budgets',
      'Soft limits (warn) vs hard limits (block)',
      'Real-time budget consumption',
      'Forecast vs. actual tracking'
    ],
    premium: false
  },
  {
    id: 'renewal-tracking',
    icon: Bell,
    title: 'Renewal Tracking',
    tagline: 'Never miss a deadline',
    description: 'Automatic renewal alerts 60-90 days out. Know your exit window. Decide to renew, renegotiate, or cancel with time to spare.',
    benefits: [
      'Notice-window alerts (60-90 days)',
      'Exit strategy documented',
      'Auto-renewal flagging',
      'Renewal vs. replacement analysis'
    ],
    premium: false
  },
  {
    id: 'ownership',
    icon: Users,
    title: 'Ownership Tracking',
    tagline: 'Know who owns what',
    description: 'Every tool has an owner from day 1. Automatic handoff on employee exit. No orphaned subscriptions.',
    benefits: [
      'Requester = default owner',
      'Handoff workflows on exit',
      'Owner directory view',
      'Accountability without bureaucracy'
    ],
    premium: false
  },
  {
    id: 'integrations',
    icon: LinkIcon,
    title: 'Integrations',
    tagline: 'Connect your stack',
    description: 'Slack, Teams, QuickBooks, Xero, Google Workspace, Pennylane. We integrate with tools your team already uses.',
    benefits: [
      'Slack + Teams for approvals',
      'QuickBooks + Xero for accounting',
      'Google Workspace for SSO',
      'More integrations on request'
    ],
    premium: false
  },
  {
    id: 'case-builder',
    icon: FileText,
    title: 'Case Builder',
    tagline: 'Build a business case',
    description: 'Generate procurement business cases with AI. Pull in vendor comparisons, pricing research, and ROI calculations automatically.',
    benefits: [
      'AI-powered vendor research',
      'Pricing comparison tables',
      'ROI calculator with assumptions',
      'Export to PDF for leadership'
    ],
    premium: true
  },
  {
    id: 'contract-management',
    icon: Database,
    title: 'Contract Management',
    tagline: 'Centralize contracts',
    description: 'Upload contracts, extract key terms with AI, and link to subscriptions. Never hunt for a contract again.',
    benefits: [
      'AI extracts renewal dates, terms',
      'Link contract → subscription → invoice',
      'Version history tracking',
      'Automatic term expiry alerts'
    ],
    premium: false
  },
  {
    id: 'vendor-database',
    icon: DollarSign,
    title: 'Vendor Database',
    tagline: 'All vendors in one place',
    description: 'Centralized vendor directory with contact info, payment terms, and relationship history. Know who to call when things break.',
    benefits: [
      'Vendor contact directory',
      'Payment terms tracking',
      'Relationship notes',
      'Vendor spend rollup'
    ],
    premium: false
  },
  {
    id: 'analytics',
    icon: BarChart,
    title: 'Analytics & Reporting',
    tagline: 'Data you can use',
    description: 'Spend by category, department, vendor. Approval velocity. Budget utilization. Export to CSV for deeper analysis.',
    benefits: [
      'Spend breakdowns (category, dept, vendor)',
      'Approval time tracking',
      'Budget vs. actual reports',
      'CSV export for custom analysis'
    ],
    premium: false
  },
  {
    id: 'security',
    icon: Lock,
    title: 'Security & Compliance',
    tagline: 'Enterprise-grade security',
    description: 'GDPR compliant, EU-hosted, SOC 2 Type II in progress. Role-based access control. Audit logs for everything.',
    benefits: [
      'GDPR compliant, EU data centers',
      'Role-based access control',
      'Audit logs for all actions',
      'SOC 2 Type II (in progress)'
    ],
    premium: false
  },
  {
    id: 'api',
    icon: Calendar,
    title: 'API & Webhooks',
    tagline: 'Build custom workflows',
    description: 'RESTful API and webhooks for custom integrations. Connect Reqflow to your internal tools and workflows.',
    benefits: [
      'RESTful API with OpenAPI spec',
      'Webhooks for approval events',
      'Custom integration support',
      'Rate limits for fair use'
    ],
    premium: false
  }
];

export function FeatureGrid() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="py-24 bg-mkt-deep relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mkt-accent opacity-5 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mkt-premium opacity-5 blur-3xl rounded-full" />
      </div>

      <div className="section-container relative z-10">
        {/* Section heading */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-display text-6xl text-white mb-6 leading-tight">
            Everything you need.<br />
            Nothing you don't.
          </h2>
          <p className="text-body text-xl text-mkt-slate-300 leading-relaxed">
            Reqflow gives you the full procurement stack without enterprise bloat.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isExpanded = expandedId === feature.id;

            return (
              <motion.div
                key={feature.id}
                layout
                className="relative cursor-pointer"
                onClick={() => toggleExpand(feature.id)}
              >
                <div
                  className={`card-brutal h-full transition-all duration-300 ${
                    feature.premium
                      ? 'bg-gradient-to-br from-mkt-premium/20 to-mkt-deep border-mkt-premium'
                      : 'bg-mkt-slate-900 border-mkt-slate-700'
                  } hover:shadow-brutal-lg ${
                    isExpanded ? 'shadow-brutal-lg border-mkt-accent' : 'shadow-brutal'
                  }`}
                >
                  {/* Premium badge */}
                  {feature.premium && (
                    <div className="absolute -top-3 -right-3 bg-mkt-premium text-white text-xs font-bold px-3 py-1 border-2 border-white">
                      PREMIUM
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`mb-4 flex items-center justify-center w-14 h-14 ${
                    feature.premium ? 'bg-mkt-premium' : 'bg-mkt-accent'
                  } border-2 border-white`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-display text-2xl text-white mb-2">
                    {feature.title}
                  </h3>

                  {/* Tagline */}
                  <p className="text-body-bold text-mkt-accent mb-3">
                    {feature.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-body text-mkt-slate-300 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Expandable benefits */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t-2 border-mkt-slate-700">
                          <p className="text-xs text-mkt-slate-400 uppercase tracking-wide mb-3">
                            Key Benefits
                          </p>
                          <ul className="space-y-2">
                            {feature.benefits.map((benefit, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-start gap-2 text-sm text-mkt-slate-300"
                              >
                                <span className="text-mkt-accent mt-1">•</span>
                                <span>{benefit}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expand/collapse indicator */}
                  <div className="mt-4 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-6 h-6 border-2 border-mkt-slate-600 flex items-center justify-center"
                    >
                      <span className="text-mkt-slate-400 text-xs">▼</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
