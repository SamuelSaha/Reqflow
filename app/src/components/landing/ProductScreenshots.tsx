/**
 * Product Screenshots Section - Showcase actual product UI
 * Layout: 2x2 grid with browser chrome mockups
 * Background: Warm palette for brand consistency
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import Image from "next/image";
import { LayoutDashboard, FileText, Building2, Wallet } from "lucide-react";

/* ================================================================
   SCREENSHOT DATA
   ================================================================ */

const screenshots = [
  {
    title: "Dashboard Overview",
    description: "Real-time metrics, approvals, and activity feed",
    icon: LayoutDashboard,
    // Replace with actual screenshot path once available
    imagePath: "/screenshots/dashboard.png",
    alt: "Reqflow Dashboard showing metrics and recent requests",
  },
  {
    title: "Request Creation",
    description: "Submit purchase requests in under 2 minutes",
    icon: FileText,
    imagePath: "/screenshots/request-form.png",
    alt: "Purchase request form with budget checks",
  },
  {
    title: "Vendor Management",
    description: "Track all vendors and their contracts in one place",
    icon: Building2,
    imagePath: "/screenshots/vendors.png",
    alt: "Vendor management table with contract details",
  },
  {
    title: "Budget Tracking",
    description: "Monitor spend vs. budget with visual alerts",
    icon: Wallet,
    imagePath: "/screenshots/budgets.png",
    alt: "Budget tracking view with spending breakdown",
  },
];

/* ================================================================
   BROWSER CHROME MOCKUP
   ================================================================ */

function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white border border-slate-200">
      {/* Browser chrome header */}
      <div className="h-10 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 px-4 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="w-3 h-3 bg-amber-400 rounded-full" />
          <span className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-slate-100 rounded-md px-3 py-1 text-xs text-slate-600 font-medium max-w-xs truncate">
            app.reqflow.com
          </div>
        </div>
      </div>
      {/* Screenshot content */}
      <div className="relative bg-slate-50">
        {children}
      </div>
    </div>
  );
}

/* ================================================================
   SCREENSHOT CARD
   ================================================================ */

interface ScreenshotCardProps {
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
  imagePath: string;
  alt: string;
}

function ScreenshotCard({
  title,
  description,
  icon: Icon,
  imagePath,
  alt,
}: ScreenshotCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <BrowserChrome>
        {/* Placeholder with icon - replace with actual screenshot */}
        <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <Icon className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">
              Screenshot placeholder
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Replace with: {imagePath}
            </p>
          </div>
          {/* Uncomment when screenshots are available */}
          {/* <Image
            src={imagePath}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            loading="lazy"
          /> */}
        </div>
      </BrowserChrome>

      {/* Caption */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {title}
        </h3>
        <p className="text-sm text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   PRODUCT SCREENSHOTS SECTION
   ================================================================ */

export function ProductScreenshots() {
  return (
    <Section background="warm" className="relative">
      <Container size="default">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 mb-4">
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                See It In Action
              </span>
            </div>
            <h2 className="text-h2 text-slate-900 mb-4">
              Built for real workflows
            </h2>
            <p className="text-body-lg text-slate-600">
              Every feature designed to save time and reduce chaos. See how Reqflow
              helps teams manage procurement without the overhead.
            </p>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {screenshots.map((screenshot) => (
              <ScreenshotCard
                key={screenshot.title}
                {...screenshot}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-8">
            <p className="text-slate-600 mb-4">
              Ready to see your workflow transform?
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="/signup"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
              </a>
              <a
                href="/demo"
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Watch Demo →
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
