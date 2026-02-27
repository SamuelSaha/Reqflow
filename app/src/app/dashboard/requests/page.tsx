"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/api/react";
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  ArrowUpRight,
  AlertCircle,
  Receipt,
  AlertTriangle,
  Search,
  Filter,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyRequestsIllustration, NoResultsIllustration } from "@/components/ui/illustrations";
import { RequestListSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { getErrorMessage } from "@/lib/utils/error-messages";

export const dynamic = "force-dynamic";

type StatusFilter = "all" | "draft" | "pending" | "approved" | "rejected";
type SortOption = "createdAt" | "amount" | "status" | "title";

const statusConfig: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700", icon: Edit3 },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700", icon: XCircle },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-500", icon: XCircle },
};

const filters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [urgency, setUrgency] = useState<"low" | "normal" | "urgent" | "">("");
  const [amountRange, setAmountRange] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Build query parameters
  const queryParams: any = {};
  if (statusFilter !== "all") queryParams.status = statusFilter;
  if (searchTerm) queryParams.search = searchTerm;
  if (category) queryParams.category = category;
  if (urgency) queryParams.urgency = urgency;
  if (sortBy) queryParams.sortBy = sortBy;
  if (sortOrder) queryParams.sortOrder = sortOrder;

  // Amount range mapping
  if (amountRange === "< €1K") {
    queryParams.maxAmount = "1000";
  } else if (amountRange === "€1K-€10K") {
    queryParams.minAmount = "1000";
    queryParams.maxAmount = "10000";
  } else if (amountRange === "> €10K") {
    queryParams.minAmount = "10000";
  }

  // Date range mapping
  const now = new Date();
  if (dateRange === "7d") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    queryParams.dateFrom = sevenDaysAgo.toISOString();
  } else if (dateRange === "30d") {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    queryParams.dateFrom = thirtyDaysAgo.toISOString();
  } else if (dateRange === "90d") {
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    queryParams.dateFrom = ninetyDaysAgo.toISOString();
  }

  const requestList = trpc.requests.myList.useQuery(queryParams);

  const hasActiveFilters = searchTerm || category || urgency || amountRange || dateRange || statusFilter !== "all";

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategory("");
    setUrgency("");
    setAmountRange("");
    setDateRange("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-bold tracking-tight text-slate-900">
            My Requests
          </h1>
          <p className="text-body text-slate-600 mt-2">
            View and manage your purchase requests
          </p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by request number, title, or vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-shrink-0"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="default" className="ml-2 px-1.5 py-0 text-xs">
                    {[category, urgency, amountRange, dateRange, statusFilter !== "all" ? "status" : ""].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Category
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Urgency
                  </label>
                  <Select value={urgency} onValueChange={(v) => setUrgency(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All urgency levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All urgency levels</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Amount
                  </label>
                  <Select value={amountRange} onValueChange={setAmountRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All amounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All amounts</SelectItem>
                      <SelectItem value="< €1K">Less than €1K</SelectItem>
                      <SelectItem value="€1K-€10K">€1K - €10K</SelectItem>
                      <SelectItem value="> €10K">More than €10K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Date Range
                  </label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All time</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {filters.map(({ key, label }) => (
            <Button
              key={key}
              variant={statusFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-slate-600"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all filters
          </Button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Sort:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="h-8 px-2"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {requestList.isLoading && <RequestListSkeleton rows={5} />}

      {/* Error state */}
      {requestList.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-body-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(requestList.error)}
            </p>
            <Button onClick={() => requestList.refetch()} variant="outline" className="mt-2">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {requestList.data && requestList.data.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              illustration={
                statusFilter === "all" ? (
                  <EmptyRequestsIllustration className="w-32 h-32" />
                ) : (
                  <NoResultsIllustration className="w-32 h-32" />
                )
              }
              title={
                statusFilter === "all"
                  ? "No requests yet"
                  : `No ${statusFilter} requests`
              }
              description={
                statusFilter === "all"
                  ? "Create your first purchase request to start tracking company spend."
                  : statusFilter === "draft"
                  ? "You don't have any draft requests. Start a new one or check other filters."
                  : `No ${statusFilter} requests found. Try adjusting your filters.`
              }
              action={
                statusFilter === "all"
                  ? {
                      label: "Create Request",
                      href: "/dashboard/requests/new",
                    }
                  : undefined
              }
              secondaryAction={
                statusFilter !== "all"
                  ? {
                      label: "Clear Filters",
                      onClick: () => setStatusFilter("all"),
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Request list */}
      {requestList.data && requestList.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-body">
              {requestList.data.length} request{requestList.data.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {requestList.data.map((req) => {
                const config = statusConfig[req.status] ?? statusConfig.draft;
                const StatusIcon = config.icon;
                return (
                  <Link
                    key={req.id}
                    href={`/dashboard/requests/${req.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      <StatusIcon className={`h-5 w-5 ${
                        req.status === "approved" ? "text-green-500" :
                        req.status === "rejected" ? "text-red-500" :
                        req.status === "pending" ? "text-amber-500" :
                        "text-slate-400"
                      }`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-body-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                          {req.title}
                        </p>
                        <Badge variant="outline" className="text-[10px] py-0 flex-shrink-0">
                          {req.requestNumber}
                        </Badge>
                      </div>
                      <p className="text-caption text-slate-500 mt-0.5">
                        {req.department?.name ?? "—"} &middot;{" "}
                        {req.category} &middot;{" "}
                        {new Date(req.createdAt).toLocaleDateString()}
                        {req.vendorName ? ` · ${req.vendorName}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-body-sm font-semibold text-slate-900">
                          €{parseFloat(req.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
                        </p>
                        {req.frequency !== "one-time" && (
                          <p className="text-[10px] text-slate-500">{req.frequency}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Badge className={config.className}>{config.label}</Badge>
                        {req.status === "approved" && req.syncedToAccounting && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                            <Receipt className="h-3 w-3 mr-1" />
                            Synced
                          </Badge>
                        )}
                        {req.status === "approved" && req.accountingSyncError && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Sync failed
                          </Badge>
                        )}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
