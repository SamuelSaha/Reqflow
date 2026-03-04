'use client';

/**
 * Marketing Navigation - Refined Brutalism
 * Design: Minimalist nav with bold CTA
 */

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Docs', href: '/documentation' }
];

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-mkt-deep">
      <div className="section-container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-mkt-deep flex items-center justify-center border-2 border-mkt-deep transition-transform group-hover:-translate-y-1">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-display text-2xl text-mkt-deep">Reqflow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body-bold text-mkt-slate-700 hover:text-mkt-deep transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-body-bold text-mkt-slate-700 hover:text-mkt-deep transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 text-body-bold bg-mkt-accent text-white border-2 border-mkt-deep shadow-brutal hover:shadow-brutal-md hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-mkt-deep"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t-2 border-mkt-slate-200">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-body-bold text-mkt-slate-700 hover:text-mkt-deep py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t-2 border-mkt-slate-200 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="text-body-bold text-mkt-slate-700 hover:text-mkt-deep py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-3 text-body-bold text-center bg-mkt-accent text-white border-2 border-mkt-deep shadow-brutal"
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
  );
}
