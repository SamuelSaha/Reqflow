"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import {
  Plus,
  FileText,
  CheckSquare,
  Clock,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  FlaskConical,
  Calendar as CalendarIcon,
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils/error-messages";
import { STATUS_STYLES } from "@/lib/design/tokens";
import { EmptyRecentRequests, EmptyPendingApprovals } from "@/components/dashboard/empty-dashboard-states";
import { InlineLoader } from "@/components/ui/inline-loader";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

const statusBadge = STATUS_STYLES;

export default function DashboardPage() {
  const [stats, recentRequests, pendingApprovals, activeTrials, renewalsStats] = trpc.useQueries((t) => [
    t.requests.stats(undefined, {
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
    }),
    t.requests.myList({ limit: 5 }, {
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
    }),
    t.approvals.myQueue({ status: "pending" }, {
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
    }),
    t.trials.list({ status: "active" }, {
      refetchInterval: 60000,
      refetchIntervalInBackground: false,
    }),
    t.renewals.getDashboardStats(undefined, {
      refetchInterval: 60000,
      refetchIntervalInBackground: false,
    }),
  ]);

  // Derive values — fall back to zero when data hasn't loaded yet
  const expiringSoonCount = activeTrials.data?.filter(t => t.daysRemaining < 7).length ?? 0;
  const urgentRenewalsCount = renewalsStats.data?.red ?? 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1 md:mt-2 text-sm md:text-base">
            Manage your purchase requests and approvals
          </p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stat cards — always rendered, show 0 while loading */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
        <StatCard
          title="Pending Requests"
          value={stats.data?.myPending ?? 0}
          icon={Clock}
          subtitle="Awaiting approval"
          loading={stats.isLoading}
        />
        <StatCard
          title="My Requests"
          value={stats.data?.myRequests ?? 0}
          icon={FileText}
          subtitle="Total submitted"
          loading={stats.isLoading}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.data?.pendingApprovals ?? 0}
          icon={CheckSquare}
          subtitle="Require your review"
          highlight={(stats.data?.pendingApprovals ?? 0) > 0}
          loading={stats.isLoading}
        />
        <StatCard
          title="Active Trials"
          value={activeTrials.data?.length ?? 0}
          icon={FlaskConical}
          subtitle={expiringSoonCount > 0 ? `${expiringSoonCount} expiring soon` : "Being evaluated"}
          highlight={expiringSoonCount > 0}
          loading={activeTrials.isLoading}
        />
        <StatCard
          title="Upcoming Renewals"
          value={renewalsStats.data?.total ?? 0}
          icon={CalendarIcon}
          subtitle={urgentRenewalsCount > 0 ? `${urgentRenewalsCount} urgent` : "Next 90 days"}
          highlight={urgentRenewalsCount > 0}
          loading={renewalsStats.isLoading}
        />
        <StatCard
          title="Approved This Month"
          value={stats.data ? `€${stats.data.approvedThisMonth.toLocaleString("en", { minimumFractionDigits: 0 })}` : "€0"}
          icon={TrendingUp}
          subtitle="Total value approved"
          loading={stats.isLoading}
        />
      </div>

      {/* Error banner — only if stats query actually errored */}
      {stats.error && !stats.isLoading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-slate-900 flex-1">
              {getErrorMessage(stats.error)}
            </p>
            <Button onClick={() => stats.refetch()} variant="outline" size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Two-column: recent requests + action required */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Recent Requests */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Recent Requests
              </CardTitle>
              <CardDescription>Your latest purchase requests</CardDescription>
            </div>
            <Link href="/dashboard/requests">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentRequests.isLoading && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full ml-4" />
                  </div>
                ))}
              </div>
            )}

            {!recentRequests.isLoading && recentRequests.error && (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-slate-900 font-medium mb-1">
                  {getErrorMessage(recentRequests.error)}
                </p>
                <Button onClick={() => recentRequests.refetch()} variant="link" size="sm">
                  Try again
                </Button>
              </div>
            )}

            {!recentRequests.isLoading && !recentRequests.error && (!recentRequests.data || recentRequests.data.length === 0) && (
              <EmptyRecentRequests />
            )}

            {recentRequests.data && recentRequests.data.length > 0 && (
              <div className="space-y-3">
                {recentRequests.data.map((req) => {
                  const badge = statusBadge[req.status as keyof typeof statusBadge] ?? statusBadge.draft;
                  return (
                    <Link
                      key={req.id}
                      href={`/dashboard/requests/${req.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                          {req.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.requestNumber} &middot;{" "}
                          €{parseFloat(req.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Required */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Action Required
              </CardTitle>
              <CardDescription>Approvals waiting for your review</CardDescription>
            </div>
            <Link href="/dashboard/approvals">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingApprovals.isLoading && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!pendingApprovals.isLoading && pendingApprovals.error && (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-slate-900 font-medium mb-1">
                  {getErrorMessage(pendingApprovals.error)}
                </p>
                <Button onClick={() => pendingApprovals.refetch()} variant="link" size="sm">
                  Try again
                </Button>
              </div>
            )}

            {!pendingApprovals.isLoading && !pendingApprovals.error && (!pendingApprovals.data || pendingApprovals.data.length === 0) && (
              <EmptyPendingApprovals />
            )}

            {pendingApprovals.data && pendingApprovals.data.length > 0 && (
              <div className="space-y-3">
                {pendingApprovals.data.slice(0, 5).map((approval) => (
                  <Link
                    key={approval.id}
                    href="/dashboard/approvals"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                        {approval.request.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {approval.request.requester.name} &middot;{" "}
                        €{parseFloat(approval.request.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {(approval.context?.riskFlags?.length ?? 0) > 0 && (
                      <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  highlight,
  loading,
}: {
  title: string;
  value: number | string;
  icon: typeof Clock;
  subtitle: string;
  highlight?: boolean;
  loading?: boolean;
}) {
  return (
    <Card className={highlight ? "ring-2 ring-blue-200 bg-blue-50/30 shadow-md" : "shadow-sm hover:shadow-md transition-shadow"}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-4 md:p-6">
        <CardTitle className="text-xs md:text-sm font-medium">{title}</CardTitle>
        {loading ? (
          <InlineLoader size="sm" />
        ) : (
          <Icon className={`h-4 w-4 ${highlight ? "text-blue-600" : "text-slate-600"}`} />
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className={`text-xl md:text-2xl font-bold ${highlight ? "text-blue-700" : ""} ${loading ? "text-slate-300" : ""}`}>
          {value}
        </div>
        <p className="text-[10px] md:text-xs text-slate-600 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
