"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CheckSquare, Clock, XCircle, AlertCircle, Search, Filter, X, RefreshCw, Loader2 } from "lucide-react";
import { useEffect, useState as useReactState } from "react";

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
  const [lastUpdated, setLastUpdated] = useReactState<Date>(new Date());

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  const utils = trpc.useUtils();

  // Build query parameters
  type QueryParams = {
    status: Tab;
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
  const queryParams: QueryParams = { status: activeTab };
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

  const queue = trpc.approvals.myQueue.useQuery(queryParams, {
    refetchInterval: 30000, // Poll every 30s for real-time updates
    refetchIntervalInBackground: false, // Stop polling when tab is inactive
  });

  // Track last update time
  useEffect(() => {
    if (queue.dataUpdatedAt) {
      setLastUpdated(new Date(queue.dataUpdatedAt));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.dataUpdatedAt]);

  // Format "last updated" text
  const getLastUpdatedText = () => {
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Update "last updated" text every 5 seconds
  const [, forceUpdate] = useReactState({});
  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    onSuccess: (data, variables, context) => {
      const action = variables.decision === "approved" ? "approved" : "rejected";

      // Show enhanced toast with sync info for approved requests
      if (data.requestStatus === "approved" && data.syncQueued) {
        const providerName = data.syncProvider === "quickbooks" ? "QuickBooks" : "Xero";
        toast.success("Request approved", {
          description: `Syncing to ${providerName} in the background...`,
          duration: 5000,
        });
      } else if (variables.decision === "rejected") {
        // Show undo toast for rejections
        toast.success("Request rejected", {
          description: "Successfully rejected the purchase request",
          action: {
            label: "Undo",
            onClick: () => {
              // Restore snapshot
              if (context?.previousQueue) {
                utils.approvals.myQueue.setData({ status: activeTab }, context.previousQueue);
              }
            },
          },
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

  // Bulk approve mutation
  const bulkApproveMutation = trpc.approvals.bulkApprove.useMutation({
    onMutate: async () => {
      await utils.approvals.myQueue.cancel();
      const previous = utils.approvals.myQueue.getData({ status: activeTab });

      // Optimistically remove selected items
      utils.approvals.myQueue.setData(
        { status: activeTab },
        (old) => old?.filter(a => !selectedIds.has(a.id)) ?? []
      );

      return { previous };
    },
    onSuccess: ({ succeeded, failed }) => {
      const successMsg = `✅ ${succeeded.length} approved`;
      if (failed.length > 0) {
        toast.success(successMsg);
        toast.error(`❌ ${failed.length} failed to approve`);
      } else {
        toast.success(successMsg);
      }
      setSelectedIds(new Set());
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        utils.approvals.myQueue.setData({ status: activeTab }, context.previous);
      }
      toast.error("Bulk approve failed", {
        description: err.message || "Please try again",
      });
    },
    onSettled: () => {
      utils.approvals.myQueue.invalidate({ status: activeTab });
    },
  });

  // Bulk reject mutation
  const bulkRejectMutation = trpc.approvals.bulkReject.useMutation({
    onMutate: async () => {
      await utils.approvals.myQueue.cancel();
      const previous = utils.approvals.myQueue.getData({ status: activeTab });

      // Optimistically remove selected items
      utils.approvals.myQueue.setData(
        { status: activeTab },
        (old) => old?.filter(a => !selectedIds.has(a.id)) ?? []
      );

      return { previous };
    },
    onSuccess: ({ succeeded, failed }) => {
      const successMsg = `✅ ${succeeded.length} rejected`;
      if (failed.length > 0) {
        toast.success(successMsg);
        toast.error(`❌ ${failed.length} failed to reject`);
      } else {
        toast.success(successMsg);
      }
      setSelectedIds(new Set());
      setRejectDialogOpen(false);
      setBulkRejectReason("");
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        utils.approvals.myQueue.setData({ status: activeTab }, context.previous);
      }
      toast.error("Bulk reject failed", {
        description: err.message || "Please try again",
      });
    },
    onSettled: () => {
      utils.approvals.myQueue.invalidate({ status: activeTab });
    },
  });

  const tabs: { key: Tab; label: string; icon: typeof Clock }[] = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "approved", label: "Approved", icon: CheckSquare },
    { key: "rejected", label: "Rejected", icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Approvals
          </h1>
          <p className="text-slate-600 mt-2">
            Review purchase requests with AI-powered analysis
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw className={`h-3.5 w-3.5 ${queue.isFetching ? "animate-spin" : ""}`} />
          <span>{getLastUpdatedText()}</span>
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
                    {[category, urgency, amountRange, dateRange].filter(Boolean).length}
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

      {/* Tabs + sort controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Error state */}
      {queue.error && !queue.isLoading && (
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
      {!queue.error && (!queue.data || queue.data.length === 0) && (
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

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && activeTab === "pending" && (
        <Card className="sticky top-0 z-10 border-blue-200 bg-blue-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedIds.size === (queue.data?.length ?? 0)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedIds(new Set(queue.data?.map(a => a.id) ?? []));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                />
                <span className="font-medium text-blue-900">
                  {selectedIds.size} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => bulkApproveMutation.mutate({
                    approvalIds: Array.from(selectedIds),
                  })}
                  disabled={bulkApproveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {bulkApproveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckSquare className="h-4 w-4 mr-1" />
                  )}
                  Approve ({selectedIds.size})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={bulkRejectMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject ({selectedIds.size})
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>
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
              isSelected={selectedIds.has(approval.id)}
              onToggleSelect={activeTab === "pending" ? (id: string) => {
                setSelectedIds(prev => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
              } : undefined}
            />
          ))}
        </div>
      )}

      {/* Bulk Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {selectedIds.size} Requests</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting these requests. This will be sent to all requesters.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={bulkRejectReason}
            onChange={(e) => setBulkRejectReason(e.target.value)}
            placeholder="Why are these requests being rejected?"
            rows={4}
            className="mt-4"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setRejectDialogOpen(false);
                setBulkRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (bulkRejectReason.length < 10) {
                  toast.error("Reason must be at least 10 characters");
                  return;
                }
                bulkRejectMutation.mutate({
                  approvalIds: Array.from(selectedIds),
                  reason: bulkRejectReason,
                });
              }}
              disabled={bulkRejectReason.length < 10 || bulkRejectMutation.isPending}
            >
              {bulkRejectMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Reject {selectedIds.size} Requests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  isSelected,
  onToggleSelect,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  approval: any;
  onDecide: (id: string, decision: "approved" | "rejected", comments?: string) => void;
  deciding: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
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
      isSelected={isSelected}
      onToggleSelect={onToggleSelect}
    />
  );
}
