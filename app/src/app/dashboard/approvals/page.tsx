"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApprovalCard } from "@/components/dashboard/ApprovalCard";
import { trpc } from "@/lib/api/react";
import { CheckSquare, Clock, XCircle, AlertCircle } from "lucide-react";
import { ApprovalCardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { getErrorMessage } from "@/lib/utils/error-messages";
import { EmptyState } from "@/components/ui/empty-state";
import { NoApprovalsIllustration } from "@/components/ui/illustrations";

export const dynamic = "force-dynamic";

type Tab = "pending" | "approved" | "rejected";

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const queue = trpc.approvals.myQueue.useQuery({ status: activeTab });
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

      {/* Tabs */}
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
