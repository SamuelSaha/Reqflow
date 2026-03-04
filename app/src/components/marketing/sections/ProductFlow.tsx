'use client';

/**
 * Product Flow - Interactive 3-step demo
 * Shows: Request → Approve → Track workflow
 * Design: Horizontal cards with hover expansion and step progression
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, BarChart3, ArrowRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: MessageSquare,
    title: 'Request',
    headline: "Smart intake that doesn't feel like homework",
    description: "AI-powered forms that adapt to what you're buying. Slack integration means your team requests tools where they already work.",
    features: [
      'Slack-native intake flow',
      'AI classifies tool type automatically',
      'Duplicate detection before approval',
      'Budget check in real-time'
    ],
    color: 'accent',
    demo: {
      type: 'slack-message',
      content: {
        user: 'Sarah (Ops)',
        message: '/reqflow request',
        response: 'What tool do you need? (e.g., Figma, Notion, Slack)',
        userReply: 'Notion Team plan'
      }
    }
  },
  {
    id: 2,
    icon: CheckCircle,
    title: 'Approve',
    headline: 'Approval rules that make sense',
    description: 'Auto-approve small purchases. Route big ones to the right person. Budget owners get visibility without manual work.',
    features: [
      'Auto-approve under $100/mo',
      'Budget-based routing',
      'Parallel approvals for speed',
      '1-click approve in Slack'
    ],
    color: 'success',
    demo: {
      type: 'approval-card',
      content: {
        tool: 'Notion Team ($15/user/mo)',
        requester: 'Sarah',
        budget: 'Productivity Tools: $480 / $2,000',
        action: 'Approve'
      }
    }
  },
  {
    id: 3,
    icon: BarChart3,
    title: 'Track',
    headline: 'The connected record that follows you',
    description: 'From request to renewal, every tool gets one source of truth. Know why you bought it, who owns it, and when to renegotiate.',
    features: [
      'Contract → Subscription → Invoice linked',
      'Renewal alerts 60-90 days out',
      'Automatic cost tracking',
      'Exit strategy documented'
    ],
    color: 'premium',
    demo: {
      type: 'record-view',
      content: {
        tool: 'Notion Team',
        owner: 'Sarah (Ops)',
        cost: '$180/mo',
        renewal: 'Jan 15, 2027',
        exitWindow: '60 days notice'
      }
    }
  }
];

export function ProductFlow() {
  const [activeStep, setActiveStep] = useState(1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const getColorClass = (color: string, type: 'bg' | 'border' | 'text') => {
    const colors = {
      accent: {
        bg: 'bg-mkt-accent',
        border: 'border-mkt-accent',
        text: 'text-mkt-accent'
      },
      success: {
        bg: 'bg-mkt-success',
        border: 'border-mkt-success',
        text: 'text-mkt-success'
      },
      premium: {
        bg: 'bg-mkt-premium',
        border: 'border-mkt-premium',
        text: 'text-mkt-premium'
      }
    };
    return colors[color as keyof typeof colors]?.[type] || '';
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="section-container">
        {/* Section heading */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-display text-6xl text-mkt-deep mb-6 leading-tight">
            Three steps.<br />Zero busywork.
          </h2>
          <p className="text-body text-xl text-mkt-slate-600 leading-relaxed">
            Reqflow connects every step of procurement so nothing falls through the cracks.
          </p>
        </div>

        {/* Step cards - Horizontal layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isHovered = hoveredStep === step.id;

            return (
              <motion.div
                key={step.id}
                className="relative cursor-pointer"
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setActiveStep(step.id)}
                whileHover={{ y: -4 }}
              >
                <div
                  className={`card-brutal h-full transition-all duration-300 ${
                    isActive
                      ? `${getColorClass(step.color, 'border')} shadow-brutal-lg border-4`
                      : 'border-mkt-deep shadow-brutal hover:shadow-brutal-md'
                  }`}
                >
                  {/* Step number badge */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-mkt-deep text-white flex items-center justify-center border-2 border-white">
                    <span className="text-body-bold text-lg">{step.id}</span>
                  </div>

                  {/* Icon */}
                  <div className={`mb-4 flex items-center justify-center w-16 h-16 ${getColorClass(step.color, 'bg')} border-2 border-mkt-deep`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-display text-3xl text-mkt-deep mb-3">
                    {step.title}
                  </h3>

                  {/* Headline */}
                  <p className="text-body-bold text-lg text-mkt-slate-700 mb-4 leading-snug">
                    {step.headline}
                  </p>

                  {/* Description */}
                  <p className="text-body text-mkt-slate-600 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2">
                    {step.features.map((feature, featureIdx) => (
                      <motion.li
                        key={featureIdx}
                        className="flex items-start gap-2 text-sm text-mkt-slate-600"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isActive || isHovered ? { opacity: 1, x: 0 } : { opacity: 0.7, x: 0 }}
                        transition={{ delay: featureIdx * 0.05 }}
                      >
                        <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-0.5 ${getColorClass(step.color, 'text')}`} />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Active indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className={`absolute bottom-0 left-0 right-0 h-1 ${getColorClass(step.color, 'bg')}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Connector arrow (between cards) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10 -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-mkt-slate-400" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Demo visualization (below cards) */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            {steps.map((step) => {
              if (step.id !== activeStep) return null;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="card-brutal bg-mkt-slate-50 border-mkt-slate-300 p-8"
                >
                  <p className="text-xs text-mkt-slate-500 uppercase tracking-wide mb-4">
                    Demo: {step.title} Flow
                  </p>

                  {/* Simple demo content */}
                  <div className="bg-white border-2 border-mkt-slate-200 p-6 font-mono text-sm">
                    <pre className="text-mkt-slate-700 whitespace-pre-wrap">
                      {JSON.stringify(step.demo.content, null, 2)}
                    </pre>
                  </div>

                  <p className="text-xs text-mkt-slate-500 mt-4 italic">
                    * Interactive demo coming soon - this shows the data structure
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
