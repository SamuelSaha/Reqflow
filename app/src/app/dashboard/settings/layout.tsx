"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Workflow, Wallet } from "lucide-react";

const settingsTabs = [
  { href: "/dashboard/settings/team", label: "Team", icon: Users },
  { href: "/dashboard/settings/workflows", label: "Workflows", icon: Workflow },
  { href: "/dashboard/settings/budgets", label: "Budgets", icon: Wallet },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">
          Manage your team, workflows, and budget allocation
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-8">
          {settingsTabs.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600 font-medium"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}
