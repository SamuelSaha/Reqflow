"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApprovalCard } from "@/components/dashboard/ApprovalCard";
import { trpc } from "@/lib/api/react";
import { Loader2, CheckSquare, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

type Tab = "pending" | "approved" | "rejected";

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const queue = trpc.approvals.myQueue.useQuery({ status: activeTab });
  const decideMutation = trpc.approvals.decide.useMutation();

  async function handleDecide(
    approvalId: string,
    decision: "approved" | "rejected",
    comments?: string
  ) {
    setDecidingId(approvalId);
    try {
      await decideMutation.mutateAsync({ approvalId, decision, comments });
      queue.refetch();
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
      {queue.isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* Empty state */}
      {queue.data && queue.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900">
              {activeTab === "pending"
                ? "All caught up!"
                : `No ${activeTab} approvals`}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {activeTab === "pending"
                ? "No requests waiting for your review"
                : `You haven't ${activeTab} any requests yet`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Approval cards with AI analysis */}
      {queue.data && queue.data.length > 0 && (
        <div className="space-y-4">
          {queue.data.map((approval: any) => (
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
