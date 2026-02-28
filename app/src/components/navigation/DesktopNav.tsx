"use client";

import Link from "next/link";
import { ChevronDown, Rocket, Settings, DollarSign, Shield, Bell, BookOpen, PenLine, Building2, Code } from "lucide-react";
import { useNavigationPrefetch } from "@/hooks/useNavigationPrefetch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ================================================================
   NAVIGATION DATA
   ================================================================ */

const featuresDropdown = {
  byRole: [
    { label: "For Founders", href: "/features/founders", description: "Move fast without losing control", icon: Rocket, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "For Ops Teams", href: "/features/ops", description: "Streamline every purchase request", icon: Settings, iconBg: "bg-green-50", iconColor: "text-green-600" },
    { label: "For Finance", href: "/features/finance", description: "Full visibility on every dollar spent", icon: DollarSign, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  ],
  byFeature: [
    { label: "Budget Control", href: "/features/budgets", description: "Set guardrails before money goes out", icon: Shield, iconBg: "bg-orange-50", iconColor: "text-orange-600" },
    { label: "Renewal Alerts", href: "/features/renewals", description: "Never miss a contract renewal again", icon: Bell, iconBg: "bg-yellow-50", iconColor: "text-yellow-600" },
  ],
};

const resourcesDropdown = [
  { label: "Documentation", href: "/documentation", icon: BookOpen },
  { label: "Blog", href: "/blog", icon: PenLine },
  { label: "Case Studies", href: "/about#case-studies", icon: Building2 },
  { label: "API Reference", href: "/api-reference", icon: Code },
];

/* ================================================================
   FEATURES MEGA MENU
   ================================================================ */

function FeaturesMegaMenu() {
  const { createHoverHandler } = useNavigationPrefetch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-body-sm font-medium text-slate-600 hover:text-slate-900 transition-colors outline-none">
        Features
        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[600px] p-6 z-[60]"
        align="start"
        sideOffset={8}
      >
        <div className="grid grid-cols-2 gap-8">
          {/* By Role Column */}
          <div>
            <DropdownMenuLabel className="text-caption font-semibold text-slate-500 uppercase tracking-wider mb-3">
              By Role
            </DropdownMenuLabel>
            <div className="space-y-1">
              {featuresDropdown.byRole.map((item) => {
                const hoverProps = createHoverHandler(item.href, 50);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} {...hoverProps}>
                    <DropdownMenuItem className="p-3 cursor-pointer hover:bg-slate-50 rounded-lg flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${item.iconColor}`} />
                      </div>
                      <div>
                        <span className="text-body-sm font-semibold text-slate-900 block">
                          {item.label}
                        </span>
                        <span className="text-caption text-slate-500">
                          {item.description}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* By Feature Column */}
          <div>
            <div className="space-y-1">
              {featuresDropdown.byFeature.map((item) => {
                const hoverProps = createHoverHandler(item.href, 50);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} {...hoverProps}>
                    <DropdownMenuItem className="p-3 cursor-pointer hover:bg-slate-50 rounded-lg flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${item.iconColor}`} />
                      </div>
                      <div>
                        <span className="text-body-sm font-semibold text-slate-900 block">
                          {item.label}
                        </span>
                        <span className="text-caption text-slate-500">
                          {item.description}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ================================================================
   RESOURCES DROPDOWN
   ================================================================ */

function ResourcesDropdown() {
  const { createHoverHandler } = useNavigationPrefetch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-body-sm font-medium text-slate-600 hover:text-slate-900 transition-colors outline-none">
        Resources
        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-52 z-[60]"
        align="start"
        sideOffset={8}
      >
        {resourcesDropdown.map((item) => {
          const hoverProps = createHoverHandler(item.href, 50);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} {...hoverProps}>
              <DropdownMenuItem className="text-body-sm cursor-pointer hover:bg-slate-50 flex items-center gap-2.5 p-2.5">
                <Icon className="w-4 h-4 text-slate-400" />
                {item.label}
              </DropdownMenuItem>
            </Link>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ================================================================
   DESKTOP NAVIGATION
   ================================================================ */

export function DesktopNav() {
  const { createHoverHandler } = useNavigationPrefetch();
  const pricingHover = createHoverHandler("/pricing", 100);
  const integrationsHover = createHoverHandler("/integrations", 100);
  const aboutHover = createHoverHandler("/about", 100);

  return (
    <nav className="hidden lg:flex items-center gap-8">
      <FeaturesMegaMenu />

      <Link
        href="/pricing"
        {...pricingHover}
        className="text-body-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150"
      >
        Pricing
      </Link>

      <Link
        href="/integrations"
        {...integrationsHover}
        className="text-body-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150"
      >
        Integrations
      </Link>

      <ResourcesDropdown />

      <Link
        href="/about"
        {...aboutHover}
        className="text-body-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150"
      >
        About
      </Link>
    </nav>
  );
}
