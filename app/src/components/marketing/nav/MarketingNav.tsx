'use client';

/**
 * Marketing Nav — Sticky nav with mega-menu dropdowns
 * Features (By Role + feature items) and Resources dropdowns
 */

import Link from 'next/link';
import { useState } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  Users,
  BarChart3,
  Briefcase,
  DollarSign,
  Bell,
  Shield,
  FileText,
  BookOpen,
  Newspaper,
  Code,
} from 'lucide-react';

const roleItems = [
  {
    label: 'For Founders',
    description: 'Full visibility into every dollar spent',
    href: '/features/founders',
    icon: Briefcase,
  },
  {
    label: 'For Ops Teams',
    description: 'Automate procurement workflows',
    href: '/features/ops',
    icon: Users,
  },
  {
    label: 'For Finance',
    description: 'Budget tracking and compliance',
    href: '/features/finance',
    icon: DollarSign,
  },
];

const featureItems = [
  {
    label: 'Budget Control',
    description: 'Real-time budget tracking and enforcement',
    href: '/features/budgets',
    icon: BarChart3,
  },
  {
    label: 'Renewal Alerts',
    description: 'Never miss a contract renewal deadline',
    href: '/features/renewals',
    icon: Bell,
  },
  {
    label: 'Compliance & Audit',
    description: 'Full audit trail for every purchase',
    href: '/features/saas',
    icon: Shield,
  },
];

const resourceItems = [
  { label: 'Documentation', href: '/documentation', icon: BookOpen },
  { label: 'Blog', href: '/blog', icon: Newspaper },
  { label: 'Case Studies', href: '/case-studies', icon: FileText },
  { label: 'API Reference', href: '/api-reference', icon: Code },
];

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const closeDropdown = () => setOpenDropdown(null);

  return (
    <>
      {/* Backdrop — closes dropdown on outside click, sits below the nav */}
      {openDropdown !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeDropdown}
          aria-hidden="true"
        />
      )}

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-semibold text-slate-900">Reqflow</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Features dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('features')}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50"
                  aria-expanded={openDropdown === 'features'}
                  aria-haspopup="true"
                >
                  Features
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'features' ? 'rotate-180' : ''}`}
                  />
                </button>

                {openDropdown === 'features' && (
                  <div className="absolute top-full left-0 mt-2 w-[520px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 z-[9999]">
                    <div className="grid grid-cols-2 gap-6">
                      {/* By Role */}
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[1.5px] mb-3 block">
                          By Role
                        </span>
                        <div className="space-y-1">
                          {roleItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={closeDropdown}
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                              >
                                <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors flex-shrink-0">
                                  <Icon className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    {item.label}
                                  </div>
                                  <div className="text-xs text-slate-500">{item.description}</div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[1.5px] mb-3 block">
                          Features
                        </span>
                        <div className="space-y-1">
                          {featureItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={closeDropdown}
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                              >
                                <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors flex-shrink-0">
                                  <Icon className="w-4 h-4 text-slate-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    {item.label}
                                  </div>
                                  <div className="text-xs text-slate-500">{item.description}</div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/pricing"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50"
              >
                Pricing
              </Link>

              <Link
                href="/integrations"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50"
              >
                Integrations
              </Link>

              {/* Resources dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('resources')}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50"
                  aria-expanded={openDropdown === 'resources'}
                  aria-haspopup="true"
                >
                  Resources
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'resources' ? 'rotate-180' : ''}`}
                  />
                </button>

                {openDropdown === 'resources' && (
                  <div className="absolute top-full right-0 mt-2 w-[240px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-[9999]">
                    <div className="space-y-0.5">
                      {resourceItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={closeDropdown}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                Start Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-slate-100 mt-2 pt-4">
              <div className="flex flex-col gap-1">
                <Link
                  href="/features"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-3 py-2.5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-3 py-2.5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/integrations"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-3 py-2.5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Integrations
                </Link>
                <Link
                  href="/documentation"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-3 py-2.5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Documentation
                </Link>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-3 py-2.5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2.5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-3 text-sm font-semibold text-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Start Free
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
