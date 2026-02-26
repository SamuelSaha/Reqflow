import Link from "next/link";
import { ArrowRight, Github, Twitter, Linkedin } from "lucide-react";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Integrations", href: "/integrations" },
  { label: "Changelog", href: "/changelog" },
  { label: "Beta Program", href: "/beta" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const resourceLinks = [
  { label: "Documentation", href: "/documentation" },
  { label: "API Reference", href: "/api-reference" },
  { label: "Security", href: "/security" },
  { label: "Status", href: "/status" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com/reqflow", icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com/company/reqflow", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/reqflow", icon: Github },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand column - spans 2 cols on desktop */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="group flex items-center gap-2.5 no-underline w-fit">
              <div className="w-7 h-7 bg-blue-600 rounded-[7px] flex items-center justify-center transition-all duration-200 group-hover:bg-blue-500 group-hover:scale-110">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              <span className="text-h5 text-white">Reqflow</span>
            </Link>
            <p className="text-body-sm text-slate-400 max-w-[280px]">
              Procurement for teams that move too fast for spreadsheets. From request to invoice, governed and trackable.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center transition-all duration-200 hover:bg-slate-700 hover:-translate-y-0.5"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns - each spans 1 col */}
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />

          {/* CTA column */}
          <div className="flex flex-col gap-4">
            <span className="text-caption text-slate-400">
              Get Started
            </span>
            <Link
              href="/beta"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-body-sm font-semibold transition-all duration-150 hover:bg-blue-500 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Apply for Beta
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-body-sm text-slate-500 mt-1">
              Free during early access. No credit card required.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <span className="text-caption text-slate-500 normal-case tracking-normal">
            &copy; 2026 Reqflow SAS. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {legalLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-body-sm text-slate-500 no-underline hover:text-white transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-caption text-slate-400">
        {title}
      </span>
      <div className="flex flex-col gap-2">
        {links.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="group text-body-sm text-slate-400 no-underline hover:text-white transition-colors duration-150 w-fit"
          >
            <span className="relative">
              {label}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-150 group-hover:w-full" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
