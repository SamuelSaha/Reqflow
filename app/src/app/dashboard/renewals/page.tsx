"use client";

import { useState } from "react";
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
  Calendar as CalendarIcon,
  List,
  AlertCircle,
  Building2,
  TrendingDown,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { RequestListSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { getErrorMessage } from "@/lib/utils/error-messages";
import {
  getUrgencyBadgeClass,
  getReadinessBadgeClass,
  getReadinessStatus,
} from "@/lib/utils/renewal-readiness";
// Design tokens available for future use
// import { TYPOGRAPHY, PRESETS } from "@/lib/design/tokens";

export const dynamic = "force-dynamic";

type ViewMode = "list" | "calendar";

export default function RenewalsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [urgencyFilter, setUrgencyFilter] = useState<"green" | "yellow" | "red" | undefined>();

  const renewals = trpc.renewals.list.useQuery({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: statusFilter as any,
    urgency: urgencyFilter,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Renewals
          </h1>
          <p className="text-slate-600 mt-2">
            Track contract renewals and notice deadlines
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={!statusFilter ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter(undefined)}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("upcoming")}
        >
          Upcoming
        </Button>
        <Button
          variant={statusFilter === "in_review" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("in_review")}
        >
          In Review
        </Button>

        <div className="mx-4 h-6 w-px bg-slate-200" />

        <Button
          variant={!urgencyFilter ? "default" : "outline"}
          size="sm"
          onClick={() => setUrgencyFilter(undefined)}
        >
          All Priority
        </Button>
        <Button
          variant={urgencyFilter === "red" ? "default" : "outline"}
          size="sm"
          onClick={() => setUrgencyFilter("red")}
          className="text-red-600"
        >
          Urgent
        </Button>
        <Button
          variant={urgencyFilter === "yellow" ? "default" : "outline"}
          size="sm"
          onClick={() => setUrgencyFilter("yellow")}
          className="text-yellow-600"
        >
          Action Needed
        </Button>
      </div>

      {/* Loading state */}
      {renewals.isLoading && <RequestListSkeleton rows={5} />}

      {/* Error state */}
      {renewals.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(renewals.error)}
            </p>
            <Button onClick={() => renewals.refetch()} variant="outline" className="mt-2">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {renewals.data && renewals.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingDown className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900">No renewals found</p>
            <p className="text-sm text-slate-500 mt-1">
              {statusFilter || urgencyFilter ? "Try adjusting your filters" : "No upcoming contract renewals"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* List view */}
      {viewMode === "list" && renewals.data && renewals.data.length > 0 && (
        <div className="space-y-4">
          {renewals.data.map((renewal) => {
            const contract = renewal.contract;
            const vendor = contract?.vendor;

            return (
              <Link key={renewal.id} href={`/dashboard/renewals/${renewal.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-slate-400" />
                          <CardTitle className="text-lg">
                            {vendor?.name || "Unknown Vendor"}
                          </CardTitle>
                        </div>
                        <CardDescription className="mt-1">
                          {contract?.title || "Contract"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getUrgencyBadgeClass(renewal.urgencyColor)}>
                          {renewal.daysUntilDeadline < 0
                            ? "Overdue"
                            : renewal.daysUntilDeadline === 0
                              ? "Due today"
                              : renewal.daysUntilDeadline === 1
                                ? "1 day left"
                                : `${renewal.daysUntilDeadline}d left`}
                        </Badge>
                        <Badge variant="outline" className={getReadinessBadgeClass(renewal.readinessScore)}>
                          {renewal.readinessScore}% ready
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Notice Deadline
                        </p>
                        <p className="text-sm font-medium text-slate-900 mt-1">
                          {format(parseISO(renewal.noticeDeadline), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Renewal Date
                        </p>
                        <p className="text-sm font-medium text-slate-900 mt-1">
                          {format(parseISO(renewal.renewalDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Annual Value
                        </p>
                        <p className="text-sm font-medium text-slate-900 mt-1">
                          €{contract?.totalValue ? parseFloat(contract.totalValue).toLocaleString("en") : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Status
                        </p>
                        <p className="text-sm font-medium text-slate-900 mt-1 capitalize">
                          {getReadinessStatus(renewal.readinessScore)}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            renewal.readinessScore >= 60
                              ? "bg-green-500"
                              : renewal.readinessScore >= 30
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${renewal.readinessScore}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Calendar view */}
      {viewMode === "calendar" && renewals.data && renewals.data.length > 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-slate-500">
              Calendar view coming soon
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
