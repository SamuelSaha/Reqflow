"use client";

/**
 * Dashboard Stats Component
 * Displays key metrics in stat cards
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Stats cards component
 */
export function DashboardStats({
  stats,
  activeTrials,
  renewalsStats,
}: {
  stats: { pending: number; approved: number; rejected: number };
  activeTrials: { count: number; expiringSoon: number };
  renewalsStats: { red: number };
}) {
  const statCards = [
    {
      title: "Pending",
      value: stats.pending ?? 0,
      subtitle: "Awaiting approval",
      color: "text-amber-600",
    },
    {
      title: "Approved",
      value: stats.approved ?? 0,
      subtitle: "This month",
      color: "text-green-600",
    },
    {
      title: "Rejected",
      value: stats.rejected ?? 0,
      subtitle: "Requires action",
      color: "text-red-600",
    },
    {
      title: "Active Trials",
      value: activeTrials.count ?? 0,
      subtitle: `${activeTrials.expiringSoon} expiring soon`,
      color: "text-blue-600",
    },
    {
      title: "Urgent Renewals",
      value: renewalsStats.red ?? 0,
      subtitle: "Needs immediate attention",
      color: "text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
