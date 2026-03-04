"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ================================================================
   NAVIGATION DATA
   ================================================================ */

const featuresLinks = [
  { label: "For Founders", href: "/features/founders" },
  { label: "For Ops Teams", href: "/features/ops" },
  { label: "For Finance", href: "/features/finance" },
  { label: "SaaS Management", href: "/features/saas" },
  { label: "Vendor Tracking", href: "/features/vendors" },
  { label: "Budget Control", href: "/features/budgets" },
  { label: "Renewal Alerts", href: "/features/renewals" },
];

const resourcesLinks = [
  { label: "Documentation", href: "/documentation" },
  { label: "Blog", href: "/blog" },
  { label: "Case Studies", href: "/about#case-studies" },
  { label: "API Reference", href: "/api-reference" },
];

/* ================================================================
   MOBILE ACCORDION SECTION
   ================================================================ */

interface AccordionSectionProps {
  title: string;
  links: Array<{ label: string; href: string }>;
  onLinkClick: () => void;
}

function AccordionSection({ title, links, onLinkClick }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `${title.toLowerCase().replace(/\s+/g, '-')}-content`;

  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-base font-semibold text-slate-900">{title}</span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-slate-600 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div id={contentId} className="pb-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className="block py-2 pl-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MOBILE NAVIGATION
   ================================================================ */

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Mobile Menu Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="fixed inset-0 z-60 bg-white p-0 sm:max-w-none">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <span className="text-lg font-bold text-slate-900">Menu</span>
            <button
              type="button"
              onClick={closeMenu}
              className="p-2 text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="overflow-y-auto p-6">
            <div className="space-y-0">
              {/* Features Accordion */}
              <AccordionSection
                title="Features"
                links={featuresLinks}
                onLinkClick={closeMenu}
              />

              {/* Pricing Link */}
              <div className="border-b border-slate-200">
                <Link
                  href="/pricing"
                  onClick={closeMenu}
                  className="block py-4 text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  Pricing
                </Link>
              </div>

              {/* Resources Accordion */}
              <AccordionSection
                title="Resources"
                links={resourcesLinks}
                onLinkClick={closeMenu}
              />

              {/* About Link */}
              <div className="border-b border-slate-200">
                <Link
                  href="/about"
                  onClick={closeMenu}
                  className="block py-4 text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  About
                </Link>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 space-y-3">
              <Link
                href="/login"
                onClick={closeMenu}
                className="block w-full text-center py-3 px-4 text-base font-semibold text-slate-900 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={closeMenu}
                className="block w-full text-center py-3 px-4 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
