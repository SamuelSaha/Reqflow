/**
 * Marketing Footer - Refined Brutalism
 * Design: Grid-based footer with bold sections
 */

import Link from 'next/link';
import { Twitter, Linkedin, Github } from 'lucide-react';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Roadmap', href: '/roadmap' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Blog', href: '/blog' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/documentation' },
      { label: 'API Reference', href: '/api-reference' },
      { label: 'Status', href: '/status' },
      { label: 'Support', href: '/support' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '/security' },
      { label: 'GDPR', href: '/gdpr' }
    ]
  }
];

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/reqflow', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/reqflow', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/reqflow', label: 'GitHub' }
];

export function MarketingFooter() {
  return (
    <footer className="bg-mkt-deep text-white border-t-4 border-mkt-accent">
      <div className="section-container py-16">
        {/* Main footer grid */}
        <div className="grid md:grid-cols-6 gap-12 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 bg-mkt-accent flex items-center justify-center border-2 border-white transition-transform group-hover:-translate-y-1">
                <span className="text-white font-bold text-2xl">R</span>
              </div>
              <span className="text-display text-3xl">Reqflow</span>
            </Link>

            <p className="text-body text-mkt-slate-300 leading-relaxed mb-6 max-w-sm">
              The connected procurement workflow for small teams. Track what you own, know when to leave.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-mkt-slate-800 hover:bg-mkt-accent flex items-center justify-center border-2 border-mkt-slate-700 hover:border-mkt-accent transition-all hover:-translate-y-1"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-body-bold text-lg mb-4 text-white">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-mkt-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter signup */}
        <div className="mb-12 pb-12 border-b-2 border-mkt-slate-800">
          <div className="max-w-md">
            <h3 className="text-body-bold text-lg mb-3 text-white">
              Stay updated
            </h3>
            <p className="text-body text-sm text-mkt-slate-400 mb-4">
              Get product updates, procurement tips, and early access to new features.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-mkt-slate-800 border-2 border-mkt-slate-700 text-white placeholder-mkt-slate-500 focus:outline-none focus:border-mkt-accent transition-colors"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-mkt-accent text-white border-2 border-mkt-accent hover:bg-mkt-accent-dark font-bold transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-mkt-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Reqflow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-mkt-success rounded-full" />
              <span>All systems operational</span>
            </span>
            <span>•</span>
            <span>Made with ❤️ in EU</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
