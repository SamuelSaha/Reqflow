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
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyRequestsIllustration, NoResultsIllustration } from "@/components/ui/illustrations";
import { VendorAvatar } from "@/components/ui/vendor-avatar";

import { getErrorMessage } from "@/lib/utils/error-messages";
import Papa from "papaparse";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

type StatusFilter = "all" | "draft" | "pending" | "approved" | "rejected";
type SortOption = "createdAt" | "amount" | "status" | "title";

const statusConfig: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700", icon: Edit3 },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800", icon: Clock },
  approved: { label: "Approved", className: "bg-green-100 text-green-800", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800", icon: XCircle },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-600", icon: XCircle },
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
  type QueryParams = {
    status?: "draft" | "pending" | "approved" | "rejected" | "cancelled";
    search?: string;
    category?: string;
    urgency?: "low" | "normal" | "urgent";
    minAmount?: string;
    maxAmount?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: SortOption;
    sortOrder?: "asc" | "desc";
  };
  const queryParams: QueryParams = {};
  if (statusFilter !== "all") queryParams.status = statusFilter as Exclude<StatusFilter, "all">;
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
  const utils = trpc.useUtils();

  const deleteMutation = trpc.requests.delete.useMutation({
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await utils.requests.myList.cancel();

      // Snapshot current state
      const previousRequests = utils.requests.myList.getData(queryParams);

      // Optimistically remove
      utils.requests.myList.setData(queryParams, (old) =>
        old?.filter((r) => r.id !== id)
      );

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRequests) {
        utils.requests.myList.setData(queryParams, context.previousRequests);
      }
      toast.error("Failed to delete", { description: err.message });
    },
    onSuccess: (data, variables, context) => {
      // Show undo toast
      toast.success("Request deleted", {
        action: {
          label: "Undo",
          onClick: () => {
            // Restore snapshot
            if (context?.previousRequests) {
              utils.requests.myList.setData(queryParams, context.previousRequests);
            }
          },
        },
        duration: 5000,
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      utils.requests.myList.invalidate(queryParams);
    },
  });

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

  const exportToCSV = () => {
    if (!requestList.data || requestList.data.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Format data for CSV
    const csvData = requestList.data.map((req) => ({
      "Request Number": req.requestNumber,
      "Title": req.title,
      "Vendor": req.vendorName || "N/A",
      "Department": req.department?.name || "N/A",
      "Category": req.category || "N/A",
      "Amount": `€${parseFloat(req.amount).toFixed(2)}`,
      "Status": req.status,
      "Urgency": req.urgency,
      "Frequency": req.frequency,
      "Created Date": new Date(req.createdAt).toLocaleDateString("en-GB"),
      "Approved Date": req.approvedAt
        ? new Date(req.approvedAt).toLocaleDateString("en-GB")
        : "N/A",
    }));

    // Generate CSV
    const csv = Papa.unparse(csvData);

    // Create download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `requests-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${requestList.data.length} requests to CSV`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-h3 font-bold tracking-tight text-slate-900">
            My Requests
          </h1>
          <p className="text-body text-slate-600 mt-1 md:mt-2">
            View and manage your purchase requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={!requestList.data || requestList.data.length === 0}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/dashboard/requests/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t">
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
                  <Select value={urgency} onValueChange={(v) => setUrgency(v as "low" | "normal" | "urgent" | "")}>
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

      {/* Filter tabs + sort controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
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

        <div className="flex items-center justify-between gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-slate-600"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 hidden sm:inline">Sort:</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[110px] md:w-[140px] h-8">
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
              className="h-8 w-8 p-0"
              title={sortOrder === "asc" ? "Ascending — click to sort descending" : "Descending — click to sort ascending"}
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="h-4 w-4 text-blue-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-blue-600" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {requestList.error && !requestList.isLoading && (
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
      {!requestList.error && (!requestList.data || requestList.data.length === 0) && (
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
                const isDraft = req.status === "draft";

                return (
                  <div
                    key={req.id}
                    className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:gap-4 md:px-6 md:py-4 hover:bg-slate-50 transition-colors group"
                  >
                    <Link
                      href={`/dashboard/requests/${req.id}`}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <VendorAvatar name={req.vendorName || req.category || req.title} className="flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-body-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                            {req.title}
                          </p>
                          <Badge variant="outline" className="text-[10px] py-0 flex-shrink-0 hidden sm:inline-flex">
                            {req.requestNumber}
                          </Badge>
                        </div>
                        <p className="text-caption text-slate-500 mt-0.5 truncate">
                          {req.department?.name ?? " - "} &middot;{" "}
                          {req.category} &middot;{" "}
                          {new Date(req.createdAt).toLocaleDateString()}
                          {req.vendorName ? ` · ${req.vendorName}` : ""}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center justify-between gap-3 pl-8 md:pl-0 md:flex-shrink-0">
                      <div className="md:text-right">
                        <p className="text-body-sm font-semibold text-slate-900">
                          €{parseFloat(req.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
                        </p>
                        {req.frequency !== "one-time" && (
                          <p className="text-[10px] text-slate-500">{req.frequency}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 md:flex-col md:gap-1.5">
                        <Badge variant="pill" className={config.className}>{config.label}</Badge>
                        {req.status === "approved" && req.syncedToAccounting && (
                          <Badge variant="pill" className="bg-green-100 text-green-800 text-[10px]">
                            <Receipt className="h-3 w-3 mr-1" />
                            Synced
                          </Badge>
                        )}
                        {req.status === "approved" && req.accountingSyncError && (
                          <Badge variant="pill" className="bg-red-100 text-red-800 text-[10px]">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Sync failed
                          </Badge>
                        )}
                      </div>
                      {isDraft ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          onClick={(e) => {
                            e.preventDefault();
                            deleteMutation.mutate({ id: req.id });
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors hidden md:block" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
