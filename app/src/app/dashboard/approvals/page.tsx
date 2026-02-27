"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ApprovalCard } from "@/components/dashboard/ApprovalCard";
import { trpc } from "@/lib/api/react";
import { CheckSquare, Clock, XCircle, AlertCircle, Search, Filter, X } from "lucide-react";
import { ApprovalCardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { getErrorMessage } from "@/lib/utils/error-messages";
import { EmptyState } from "@/components/ui/empty-state";
import { NoApprovalsIllustration } from "@/components/ui/illustrations";

export const dynamic = "force-dynamic";

type Tab = "pending" | "approved" | "rejected";
type SortOption = "createdAt" | "amount" | "title";

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [urgency, setUrgency] = useState<"low" | "normal" | "urgent" | "">("");
  const [amountRange, setAmountRange] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const utils = trpc.useUtils();

  // Build query parameters
  const queryParams: any = { status: activeTab };
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

  const queue = trpc.approvals.myQueue.useQuery(queryParams);

  const hasActiveFilters = searchTerm || category || urgency || amountRange || dateRange;

  const clearAllFilters = () => {
    setSearchTerm("");
    setCategory("");
    setUrgency("");
    setAmountRange("");
    setDateRange("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };
  const decideMutation = trpc.approvals.decide.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.approvals.myQueue.cancel();

      // Snapshot current data
      const previousQueue = utils.approvals.myQueue.getData({ status: activeTab });

      // Optimistically remove from queue
      utils.approvals.myQueue.setData(
        { status: activeTab },
        (old) => old?.filter(a => a.id !== variables.approvalId) ?? []
      );

      return { previousQueue };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQueue) {
        utils.approvals.myQueue.setData({ status: activeTab }, context.previousQueue);
      }
      toast.error("Failed to process approval", {
        description: err.message || "Please try again",
      });
    },

    onSuccess: (data, variables) => {
      const action = variables.decision === "approved" ? "approved" : "rejected";

      // Show enhanced toast with sync info for approved requests
      if (data.requestStatus === "approved" && data.syncQueued) {
        const providerName = data.syncProvider === "quickbooks" ? "QuickBooks" : "Xero";
        toast.success("Request approved", {
          description: `Syncing to ${providerName} in the background...`,
          duration: 5000,
        });
      } else {
        toast.success(`Request ${action}`, {
          description: `Successfully ${action} the purchase request`,
          duration: 4000,
        });
      }
    },

    onSettled: () => {
      // Refetch to ensure consistency
      utils.approvals.myQueue.invalidate({ status: activeTab });
    },
  });

  async function handleDecide(
    approvalId: string,
    decision: "approved" | "rejected",
    comments?: string
  ) {
    setDecidingId(approvalId);
    try {
      await decideMutation.mutateAsync({ approvalId, decision, comments });
    } finally {
      setDecidingId(null);
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof Clock }[] = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "approved", label: "Approved", icon: CheckSquare },
    { key: "rejected", label: "Rejected", icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Approvals
        </h1>
        <p className="text-slate-600 mt-2">
          Review purchase requests with AI-powered analysis
        </p>
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
                    {[category, urgency, amountRange, dateRange].filter(Boolean).length}
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

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(key)}
            >
              <Icon className="h-4 w-4 mr-1.5" />
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

      {/* Loading state */}
      {queue.isLoading && <ApprovalCardSkeleton count={4} />}

      {/* Error state */}
      {queue.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(queue.error)}
            </p>
            <Button onClick={() => queue.refetch()} variant="outline" className="mt-2">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {queue.data && queue.data.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              illustration={<NoApprovalsIllustration className="w-28 h-28" />}
              title={activeTab === "pending" ? "All caught up!" : `No ${activeTab} approvals`}
              description={
                activeTab === "pending"
                  ? "No requests waiting for your review. Great work staying on top of approvals!"
                  : `You haven't ${activeTab} any requests yet. They'll appear here once you take action.`
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Approval cards with AI analysis */}
      {queue.data && queue.data.length > 0 && (
        <div className="space-y-4">
          {queue.data.map((approval) => (
            <ApprovalCardWithAnalysis
              key={approval.id}
              approval={approval}
              onDecide={handleDecide}
              deciding={decidingId === approval.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Wrapper that auto-fetches AI analysis for each approval card
 */
function ApprovalCardWithAnalysis({
  approval,
  onDecide,
  deciding,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  approval: any;
  onDecide: (id: string, decision: "approved" | "rejected", comments?: string) => void;
  deciding: boolean;
}) {
  const analysis = trpc.approvals.analyze.useQuery(
    { requestId: approval.request.id },
    { enabled: approval.decision === "pending" }
  );

  return (
    <ApprovalCard
      approval={approval}
      analysis={analysis.data ?? null}
      analysisLoading={analysis.isLoading}
      onDecide={onDecide}
      deciding={deciding}
    />
  );
}
