"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* ================================================================
   NAVIGATION DATA
   ================================================================ */

const featuresDropdown = {
  byRole: [
    { label: "For Founders", href: "/features/founders", description: "Take control of company spend" },
    { label: "For Ops Teams", href: "/features/ops", description: "Streamline procurement workflows" },
    { label: "For Finance", href: "/features/finance", description: "Budget tracking & compliance" },
  ],
  byUseCase: [
    { label: "SaaS Management", href: "/features/saas", description: "Track all software subscriptions" },
    { label: "Vendor Tracking", href: "/features/vendors", description: "Manage vendor relationships" },
    { label: "Budget Control", href: "/features/budgets", description: "Set spending guardrails" },
    { label: "Renewal Alerts", href: "/features/renewals", description: "Never miss a renewal" },
  ],
};

const resourcesDropdown = [
  { label: "Documentation", href: "/documentation" },
  { label: "Blog", href: "/blog" },
  { label: "Case Studies", href: "/about#case-studies" },
  { label: "API Reference", href: "/api-reference" },
];

/* ================================================================
   FEATURES MEGA MENU (Grid Layout)
   ================================================================ */

function FeaturesMegaMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors outline-none">
        Features
        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[560px] p-6"
        align="start"
        sideOffset={8}
      >
        <div className="grid grid-cols-2 gap-6">
          {/* By Role Column */}
          <div>
            <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              By Role
            </DropdownMenuLabel>
            <div className="space-y-1">
              {featuresDropdown.byRole.map((item) => (
                <Link key={item.href} href={item.href}>
                  <DropdownMenuItem className="flex flex-col items-start gap-0.5 p-3 cursor-pointer">
                    <span className="text-sm font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-600">
                      {item.description}
                    </span>
                  </DropdownMenuItem>
                </Link>
              ))}
            </div>
          </div>

          {/* By Use Case Column */}
          <div>
            <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              By Use Case
            </DropdownMenuLabel>
            <div className="space-y-1">
              {featuresDropdown.byUseCase.map((item) => (
                <Link key={item.href} href={item.href}>
                  <DropdownMenuItem className="flex flex-col items-start gap-0.5 p-3 cursor-pointer">
                    <span className="text-sm font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-600">
                      {item.description}
                    </span>
                  </DropdownMenuItem>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ================================================================
   RESOURCES SIMPLE DROPDOWN (List)
   ================================================================ */

function ResourcesDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors outline-none">
        Resources
        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48"
        align="start"
        sideOffset={8}
      >
        {resourcesDropdown.map((item) => (
          <Link key={item.href} href={item.href}>
            <DropdownMenuItem className="text-sm cursor-pointer">
              {item.label}
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ================================================================
   DESKTOP NAVIGATION
   ================================================================ */

export function DesktopNav() {
  return (
    <nav className="hidden lg:flex items-center gap-8">
      <FeaturesMegaMenu />

      <Link
        href="/pricing"
        className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        Pricing
      </Link>

      <ResourcesDropdown />

      <Link
        href="/about"
        className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        About
      </Link>
    </nav>
  );
}
