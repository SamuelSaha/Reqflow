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
import { VendorAvatar } from "@/components/ui/vendor-avatar";

export const dynamic = "force-dynamic";

const statusBadge = STATUS_STYLES;

const STAT_ICON_STYLES: Record<string, { iconBg: string; iconColor: string }> = {
  pendingRequests:  { iconBg: "bg-amber-50",  iconColor: "text-amber-500" },
  myRequests:       { iconBg: "bg-blue-50",   iconColor: "text-blue-500" },
  pendingApprovals: { iconBg: "bg-violet-50", iconColor: "text-violet-500" },
  activeTrials:     { iconBg: "bg-cyan-50",   iconColor: "text-cyan-500" },
  upcomingRenewals: { iconBg: "bg-orange-50", iconColor: "text-orange-500" },
  approvedMonth:    { iconBg: "bg-green-50",  iconColor: "text-green-500" },
};

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6">
        <StatCard
          title="Pending Requests"
          value={stats.data?.myPending ?? 0}
          icon={Clock}
          subtitle="Awaiting approval"
          loading={stats.isLoading}
          iconBg={STAT_ICON_STYLES.pendingRequests.iconBg}
          iconColor={STAT_ICON_STYLES.pendingRequests.iconColor}
        />
        <StatCard
          title="My Requests"
          value={stats.data?.myRequests ?? 0}
          icon={FileText}
          subtitle="Total submitted"
          loading={stats.isLoading}
          iconBg={STAT_ICON_STYLES.myRequests.iconBg}
          iconColor={STAT_ICON_STYLES.myRequests.iconColor}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.data?.pendingApprovals ?? 0}
          icon={CheckSquare}
          subtitle="Require your review"
          highlight={(stats.data?.pendingApprovals ?? 0) > 0}
          loading={stats.isLoading}
          iconBg={STAT_ICON_STYLES.pendingApprovals.iconBg}
          iconColor={STAT_ICON_STYLES.pendingApprovals.iconColor}
        />
        <StatCard
          title="Active Trials"
          value={activeTrials.data?.length ?? 0}
          icon={FlaskConical}
          subtitle={expiringSoonCount > 0 ? `${expiringSoonCount} expiring soon` : "Being evaluated"}
          highlight={expiringSoonCount > 0}
          loading={activeTrials.isLoading}
          iconBg={STAT_ICON_STYLES.activeTrials.iconBg}
          iconColor={STAT_ICON_STYLES.activeTrials.iconColor}
        />
        <StatCard
          title="Upcoming Renewals"
          value={renewalsStats.data?.total ?? 0}
          icon={CalendarIcon}
          subtitle={urgentRenewalsCount > 0 ? `${urgentRenewalsCount} urgent` : "Next 90 days"}
          highlight={urgentRenewalsCount > 0}
          loading={renewalsStats.isLoading}
          iconBg={STAT_ICON_STYLES.upcomingRenewals.iconBg}
          iconColor={STAT_ICON_STYLES.upcomingRenewals.iconColor}
        />
        <StatCard
          title="Approved This Month"
          value={stats.data ? `€${stats.data.approvedThisMonth.toLocaleString("en", { minimumFractionDigits: 0 })}` : "€0"}
          icon={TrendingUp}
          subtitle="Total value approved"
          loading={stats.isLoading}
          iconBg={STAT_ICON_STYLES.approvedMonth.iconBg}
          iconColor={STAT_ICON_STYLES.approvedMonth.iconColor}
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
        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
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
              <div className="divide-y divide-slate-100">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-4 w-16 ml-4" />
                    <Skeleton className="h-6 w-16 rounded-full ml-2" />
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
              <div className="divide-y divide-slate-100">
                {recentRequests.data.map((req) => {
                  const badge = statusBadge[req.status as keyof typeof statusBadge] ?? statusBadge.draft;
                  return (
                    <Link
                      key={req.id}
                      href={`/dashboard/requests/${req.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50/50 transition-colors group"
                    >
                      <VendorAvatar name={req.vendorName || req.category || req.title} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                          {req.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.vendorName || req.category || "Request"} &middot; {req.requestNumber}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900">
                          &euro;{parseFloat(req.amount).toLocaleString("en", { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <Badge variant="pill" className={badge.className}>{badge.label}</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Required */}
        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
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
              <div className="divide-y divide-slate-100">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
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
              <div className="divide-y divide-slate-100">
                {pendingApprovals.data.slice(0, 5).map((approval) => (
                  <Link
                    key={approval.id}
                    href="/dashboard/approvals"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50/50 transition-colors group"
                  >
                    <VendorAvatar name={approval.request.requester.name || approval.request.title} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                        {approval.request.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {approval.request.requester.name} &middot;{" "}
                        &euro;{parseFloat(approval.request.amount).toLocaleString("en", { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                    {(approval.context?.riskFlags?.length ?? 0) > 0 && (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
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
  iconBg,
  iconColor,
}: {
  title: string;
  value: number | string;
  icon: typeof Clock;
  subtitle: string;
  highlight?: boolean;
  loading?: boolean;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card
      className={
        highlight
          ? "ring-2 ring-blue-200 bg-blue-50/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          : "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      }
    >
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div
              className={`text-3xl md:text-4xl font-bold tracking-tight ${
                highlight ? "text-blue-700" : "text-slate-900"
              } ${loading ? "text-slate-300" : ""}`}
            >
              {value}
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600">
              {title}
            </p>
          </div>
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
          >
            {loading ? (
              <InlineLoader size="sm" />
            ) : (
              <Icon className={`h-5 w-5 ${iconColor}`} />
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
