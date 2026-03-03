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
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
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
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const renewals = trpc.renewals.list.useQuery({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: statusFilter as any,
    urgency: urgencyFilter,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Renewals
          </h1>
          <p className="text-slate-600 mt-1 md:mt-2 text-sm md:text-base">
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
      <div className="flex flex-wrap items-center gap-2">
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
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          <CardTitle className="text-base md:text-lg truncate">
                            {vendor?.name || "Unknown Vendor"}
                          </CardTitle>
                        </div>
                        <CardDescription className="mt-1 truncate">
                          {contract?.title || "Contract"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
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
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
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
                          €{contract?.totalValue ? parseFloat(contract.totalValue).toLocaleString("en") : " - "}
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
      {viewMode === "calendar" && renewals.data && (
        <RenewalCalendar
          renewals={renewals.data}
          currentMonth={calendarMonth}
          onMonthChange={setCalendarMonth}
        />
      )}
    </div>
  );
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function RenewalCalendar({
  renewals,
  currentMonth,
  onMonthChange,
}: {
  renewals: Array<{
    id: string;
    renewalDate: string;
    noticeDeadline: string;
    urgencyColor: string;
    contract?: { vendor?: { name: string } | null; title?: string | null } | null;
  }>;
  currentMonth: Date;
  onMonthChange: (d: Date) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = getDay(monthStart); // 0=Sun

  // Group renewals by renewal date
  const renewalsByDate = new Map<string, typeof renewals>();
  for (const r of renewals) {
    const key = r.renewalDate.slice(0, 10);
    if (!renewalsByDate.has(key)) renewalsByDate.set(key, []);
    renewalsByDate.get(key)!.push(r);
  }

  // Also track notice deadlines separately
  const deadlinesByDate = new Map<string, typeof renewals>();
  for (const r of renewals) {
    const key = r.noticeDeadline.slice(0, 10);
    if (!deadlinesByDate.has(key)) deadlinesByDate.set(key, []);
    deadlinesByDate.get(key)!.push(r);
  }

  const today = new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {format(currentMonth, "MMMM yyyy")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange(subMonths(currentMonth, 1))}
              aria-label="Previous month"
            >
              ‹
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange(new Date())}
              className="text-xs"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange(addMonths(currentMonth, 1))}
              aria-label="Next month"
            >
              ›
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
            Renewal date
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
            Notice deadline
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-slate-400 py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
          {/* Empty offset cells */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`offset-${i}`} className="bg-white min-h-[72px]" />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayRenewals = renewalsByDate.get(key) || [];
            const dayDeadlines = deadlinesByDate.get(key) || [];
            const isToday = isSameDay(day, today);

            return (
              <div
                key={key}
                className={`bg-white min-h-[72px] p-1.5 ${
                  isToday ? "ring-2 ring-inset ring-blue-400" : ""
                }`}
              >
                <div
                  className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-blue-600 text-white"
                      : "text-slate-700"
                  }`}
                >
                  {format(day, "d")}
                </div>

                {/* Renewal date events */}
                {dayRenewals.slice(0, 2).map((r) => (
                  <Link key={`r-${r.id}`} href={`/dashboard/renewals/${r.id}`}>
                    <div
                      className={`text-[10px] font-medium truncate px-1 py-0.5 rounded mb-0.5 cursor-pointer hover:opacity-80 ${
                        r.urgencyColor === "red"
                          ? "bg-red-100 text-red-700"
                          : r.urgencyColor === "yellow"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                      title={r.contract?.vendor?.name || r.contract?.title || "Renewal"}
                    >
                      {r.contract?.vendor?.name || r.contract?.title || "Renewal"}
                    </div>
                  </Link>
                ))}

                {/* Notice deadline events (distinct color) */}
                {dayDeadlines
                  .filter((r) => !dayRenewals.find((x) => x.id === r.id))
                  .slice(0, 1)
                  .map((r) => (
                    <Link key={`d-${r.id}`} href={`/dashboard/renewals/${r.id}`}>
                      <div
                        className="text-[10px] font-medium truncate px-1 py-0.5 rounded mb-0.5 cursor-pointer bg-amber-50 text-amber-600 border border-amber-200 hover:opacity-80"
                        title={`Deadline: ${r.contract?.vendor?.name || "contract"}`}
                      >
                        ⚠ {r.contract?.vendor?.name || "Deadline"}
                      </div>
                    </Link>
                  ))}

                {dayRenewals.length + dayDeadlines.length > 3 && (
                  <div className="text-[10px] text-slate-400 pl-1">
                    +{dayRenewals.length + dayDeadlines.length - 3} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
