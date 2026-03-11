"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  AlertCircle,
  Loader2,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { trpc } from "@/lib/api/react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyBoxIllustration } from "@/components/ui/illustrations";

export const dynamic = "force-dynamic";

const matchStatusColors = {
  unmatched: "bg-red-100 text-red-800",
  auto_matched: "bg-green-100 text-green-800",
  manual_matched: "bg-blue-100 text-blue-800",
  disputed: "bg-amber-100 text-amber-800",
};

const statusColors = {
  pending: "bg-slate-100 text-slate-700",
  approved: "bg-green-100 text-green-800",
  paid: "bg-blue-100 text-blue-800",
  disputed: "bg-red-100 text-red-800",
  overdue: "bg-amber-100 text-amber-800",
  cancelled: "bg-slate-100 text-slate-600",
};

export default function InvoicesPage() {
  const [matchStatusFilter, setMatchStatusFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [disputingId, setDisputingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  const utils = trpc.useUtils();

  const approveMutation = trpc.invoices.approve.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getMatchingStats.invalidate();
      toast.success("Invoice approved");
    },
    onError: (err) => toast.error(err.message),
  });

  const disputeMutation = trpc.invoices.dispute.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getMatchingStats.invalidate();
      setDisputingId(null);
      setDisputeReason("");
      toast.success("Invoice marked as disputed");
    },
    onError: (err) => toast.error(err.message),
  });

  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading, isError: invoicesError } = trpc.invoices.list.useQuery({
    matchStatus: matchStatusFilter as "unmatched" | "auto_matched" | "manual_matched" | "disputed" | undefined,
    status: statusFilter as "pending" | "approved" | "paid" | "disputed" | "overdue" | "cancelled" | undefined,
  });

  // Fetch matching stats — secondary, loads independently of the list
  const { data: stats, isLoading: statsLoading } = trpc.invoices.getMatchingStats.useQuery(
    undefined,
    { retry: 1 }
  );

  // Format currency
  function formatCurrency(amount: string | number): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `€${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Format date
  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Invoice Matching
        </h1>
        <p className="text-slate-600 mt-1 md:mt-2 text-sm md:text-base">
          3-way matching: Purchase Orders → Receipts → Invoices
        </p>
      </div>

      {/* Stats Cards */}
      {statsLoading && !stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-slate-100 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          <StatCard
            title="Total Invoices"
            value={stats.total}
            icon={FileText}
            subtitle="All invoices"
          />
          <StatCard
            title="Auto-Matched"
            value={stats.autoMatched}
            icon={CheckCircle2}
            subtitle={`${stats.total > 0 ? Math.round((stats.autoMatched / stats.total) * 100) : 0}% of total`}
            highlight={stats.autoMatched > 0}
            color="green"
          />
          <StatCard
            title="Unmatched"
            value={stats.unmatched}
            icon={AlertTriangle}
            subtitle="Require attention"
            highlight={stats.unmatched > 0}
            color="red"
          />
          <StatCard
            title="Total Variance"
            value={formatCurrency(stats.totalVariance)}
            icon={TrendingUp}
            subtitle={stats.totalVariance > 0 ? "Overcharges" : "Undercharges"}
            highlight={Math.abs(stats.totalVariance) > 100}
            color={stats.totalVariance > 0 ? "amber" : "blue"}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={matchStatusFilter} onValueChange={(val) => setMatchStatusFilter(val === "all" ? undefined : val)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Match Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Match Status</SelectItem>
            <SelectItem value="unmatched">Unmatched</SelectItem>
            <SelectItem value="auto_matched">Auto-Matched</SelectItem>
            <SelectItem value="manual_matched">Manual-Matched</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val === "all" ? undefined : val)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Invoice Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {invoices?.length || 0} invoice{invoices?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          )}

          {!invoicesLoading && invoicesError && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <AlertTriangle className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">Failed to load invoices.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-blue-600 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          {!invoicesLoading && !invoicesError && invoices && invoices.length === 0 && (
            <EmptyState
              illustration={<EmptyBoxIllustration className="w-32 h-32" />}
              title={
                matchStatusFilter || statusFilter
                  ? "No invoices match these filters"
                  : "No invoices yet"
              }
              description={
                matchStatusFilter || statusFilter
                  ? "Try clearing your filters to see all invoices."
                  : "Invoices will appear here once they are uploaded or synced from your accounting system. Reqflow automatically matches them against purchase orders and receipts."
              }
              secondaryAction={
                matchStatusFilter || statusFilter
                  ? {
                      label: "Clear filters",
                      onClick: () => {
                        setMatchStatusFilter(undefined);
                        setStatusFilter(undefined);
                      },
                    }
                  : undefined
              }
            />
          )}

          {!invoicesLoading && !invoicesError && invoices && invoices.length > 0 && (
            <div className="space-y-3">
              {invoices.map((invoice) => {
                const variance = invoice.varianceAmount ? parseFloat(invoice.varianceAmount) : 0;
                const confidence = invoice.matchConfidence ? parseFloat(invoice.matchConfidence) : 0;
                const hasVariance = Math.abs(variance) > 0;

                return (
                  <div
                    key={invoice.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      hasVariance && variance > 0
                        ? "border-amber-200 bg-amber-50/50 hover:shadow-md hover:-translate-y-0.5"
                        : "border-slate-200 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Invoice number and vendor */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}
                          </h3>
                          {invoice.vendor && (
                            <span className="text-sm text-slate-500">
                              • {invoice.vendor.name}
                            </span>
                          )}
                        </div>

                        {/* Amount and dates */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          <span className="font-medium text-slate-900">
                            {formatCurrency(invoice.totalAmount)}
                          </span>
                          <span className="text-slate-500">
                            Issued: {formatDate(invoice.issueDate)}
                          </span>
                          {invoice.dueDate && (
                            <span className="text-slate-500">
                              Due: {formatDate(invoice.dueDate)}
                            </span>
                          )}
                        </div>

                        {/* Variance warning */}
                        {hasVariance && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className={variance > 0 ? "text-amber-700" : "text-blue-700"}>
                              {variance > 0 ? "+" : ""}{formatCurrency(variance)} variance
                              {invoice.varianceReason && ` (${invoice.varianceReason})`}
                            </span>
                          </div>
                        )}

                        {/* Match confidence */}
                        {confidence > 0 && (
                          <div className="mt-2 text-sm text-slate-500">
                            Match confidence: {(confidence * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>

                      {/* Badges and actions */}
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Badge variant="pill" className={matchStatusColors[(invoice.matchStatus as keyof typeof matchStatusColors) || "unmatched"]}>
                            {invoice.matchStatus?.replace("_", " ") || "unmatched"}
                          </Badge>
                          <Badge variant="pill" className={statusColors[invoice.status as keyof typeof statusColors]}>
                            {invoice.status}
                          </Badge>
                        </div>

                        {invoice.status === "pending" && (
                          <div className="flex flex-col gap-2 items-end">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={approveMutation.isPending}
                                onClick={() => approveMutation.mutate({ invoiceId: invoice.id })}
                                aria-label={`Approve invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}`}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={disputeMutation.isPending}
                                onClick={() => {
                                  setDisputingId(invoice.id);
                                  setDisputeReason("");
                                }}
                                aria-label={`Dispute invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}`}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Dispute
                              </Button>
                            </div>
                            {disputingId === invoice.id && (
                              <div className="w-full mt-1 space-y-2">
                                <textarea
                                  className="w-full text-sm border border-slate-200 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows={2}
                                  placeholder="Reason for dispute (min 10 chars)"
                                  value={disputeReason}
                                  onChange={(e) => setDisputeReason(e.target.value)}
                                  aria-label="Dispute reason"
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => { setDisputingId(null); setDisputeReason(""); }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={disputeReason.length < 10 || disputeMutation.isPending}
                                    onClick={() => disputeMutation.mutate({ invoiceId: invoice.id, reason: disputeReason })}
                                  >
                                    Confirm Dispute
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const STAT_ICON_BG: Record<string, { iconBg: string; iconColor: string }> = {
  blue: { iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  green: { iconBg: "bg-green-50", iconColor: "text-green-500" },
  red: { iconBg: "bg-red-50", iconColor: "text-red-500" },
  amber: { iconBg: "bg-amber-50", iconColor: "text-amber-500" },
};

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  highlight,
  color = "blue",
}: {
  title: string;
  value: number | string;
  icon: typeof FileText;
  subtitle: string;
  highlight?: boolean;
  color?: "blue" | "green" | "red" | "amber";
}) {
  const highlightColors = {
    blue: "ring-2 ring-blue-200 bg-blue-50/20",
    green: "ring-2 ring-green-200 bg-green-50/20",
    red: "ring-2 ring-red-200 bg-red-50/20",
    amber: "ring-2 ring-amber-200 bg-amber-50/20",
  };

  const { iconBg, iconColor } = STAT_ICON_BG[color];

  return (
    <Card className={`hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${highlight ? highlightColors[color] : ""}`}>
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className={`text-3xl md:text-4xl font-bold tracking-tight ${highlight ? `${iconColor.replace("text-", "text-").replace("-500", "-700")}` : "text-slate-900"}`}>
              {value}
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600">{title}</p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
