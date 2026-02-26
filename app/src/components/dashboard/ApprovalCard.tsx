"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  Eye,
  Loader2,
  Copy,
  TrendingUp,
  UserX,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import type { RequestAnalysis } from "@/lib/ai/request-analyzer";

interface ApprovalData {
  id: string;
  step: number;
  required: string;
  decision: string;
  context: {
    budgetRemaining?: string;
    similarRequests?: string[];
    aiSuggestion?: string;
    riskFlags?: string[];
  } | null;
  request: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    vendorName: string | null;
    amount: string;
    currency: string;
    frequency: string;
    urgency: string;
    requestNumber: string;
    createdAt: Date;
    requester: { name: string; email: string };
    department: { name: string };
  };
}

interface ApprovalCardProps {
  approval: ApprovalData;
  analysis: RequestAnalysis | null;
  analysisLoading: boolean;
  onDecide: (approvalId: string, decision: "approved" | "rejected", comments?: string) => void;
  deciding: boolean;
}

const severityColors = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

const signalIcons = {
  anomaly: TrendingUp,
  duplicate: Copy,
  budget: AlertTriangle,
  vendor: UserX,
  pattern: Eye,
  compliance: Shield,
};

const recommendationConfig = {
  approve: { color: "bg-green-50 border-green-200 text-green-700", icon: CheckCircle2, label: "AI: Approve" },
  review: { color: "bg-amber-50 border-amber-200 text-amber-700", icon: Eye, label: "AI: Review" },
  flag: { color: "bg-red-50 border-red-200 text-red-700", icon: AlertTriangle, label: "AI: Flag" },
};

export function ApprovalCard({
  approval,
  analysis,
  analysisLoading,
  onDecide,
  deciding,
}: ApprovalCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState("");
  const req = approval.request;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-body-lg">{req.title}</CardTitle>
              <Badge variant="outline" className="text-caption">
                {req.requestNumber}
              </Badge>
            </div>
            <p className="text-body-sm text-slate-600">
              {req.requester.name} &middot; {req.department.name} &middot;{" "}
              {new Date(req.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{req.category}</Badge>
            {req.urgency === "urgent" && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                Urgent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Financial details */}
        <div className="flex items-center gap-6 p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="text-caption text-slate-500 uppercase tracking-wider">Amount</p>
            <p className="text-xl font-bold text-slate-900">
              €{parseFloat(req.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-caption text-slate-500 uppercase tracking-wider">Frequency</p>
            <p className="text-body-sm font-medium text-slate-700">{req.frequency}</p>
          </div>
          {req.vendorName && (
            <div>
              <p className="text-caption text-slate-500 uppercase tracking-wider">Vendor</p>
              <p className="text-body-sm font-medium text-slate-700">{req.vendorName}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {req.description && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-caption text-slate-500 uppercase tracking-wider mb-1">Justification</p>
            <p className="text-body-sm text-slate-700">{req.description}</p>
          </div>
        )}

        {/* Risk flags from routing engine */}
        {approval.context?.riskFlags && approval.context.riskFlags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {approval.context.riskFlags.map((flag, i) => (
              <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                {flag}
              </Badge>
            ))}
          </div>
        )}

        {/* AI Analysis Section */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-body-sm font-semibold text-slate-700">AI Analysis</span>
            {analysis && (
              <Badge
                variant="outline"
                className={recommendationConfig[analysis.recommendation].color}
              >
                {(() => {
                  const Icon = recommendationConfig[analysis.recommendation].icon;
                  return <Icon className="h-3 w-3 mr-1" />;
                })()}
                {recommendationConfig[analysis.recommendation].label}
                <span className="ml-1 opacity-60">
                  ({(analysis.confidence * 100).toFixed(0)}%)
                </span>
              </Badge>
            )}
          </div>

          <div className="p-4">
            {analysisLoading && (
              <div className="flex items-center gap-2 text-body-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing request...
              </div>
            )}

            {analysis && (
              <div className="space-y-3">
                {/* Summary */}
                <p className="text-body-sm text-slate-700">{analysis.summary}</p>

                {/* Risk score bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-caption text-slate-500">
                    <span>Risk Score</span>
                    <span>{analysis.riskScore}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        analysis.riskScore >= 70
                          ? "bg-red-500"
                          : analysis.riskScore >= 30
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${analysis.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Signals */}
                {analysis.signals.length > 0 && (
                  <div className="space-y-2">
                    {analysis.signals.map((signal, i) => {
                      const Icon = signalIcons[signal.type] ?? AlertCircle;
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-2 p-2 rounded border ${severityColors[signal.severity]}`}
                        >
                          <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-body-sm font-medium">{signal.title}</p>
                            <p className="text-caption opacity-80">{signal.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Similar requests */}
                {analysis.similarRequests.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-caption text-slate-500 uppercase tracking-wider">Similar Requests</p>
                    {analysis.similarRequests.map((sr) => (
                      <div key={sr.id} className="flex items-center gap-2 text-caption text-slate-600">
                        <FileText className="h-3 w-3" />
                        <span>"{sr.title}"</span>
                        <span className="text-slate-400">€{parseFloat(sr.amount).toFixed(2)}</span>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {sr.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Budget impact */}
                {analysis.budgetImpact && (
                  <div className="space-y-1">
                    <p className="text-caption text-slate-500 uppercase tracking-wider">Budget Impact</p>
                    <div className="flex items-center gap-4 text-caption text-slate-600">
                      <span>Current: {(analysis.budgetImpact.currentUtilization * 100).toFixed(0)}%</span>
                      <span>→</span>
                      <span
                        className={
                          analysis.budgetImpact.wouldExceed
                            ? "text-red-600 font-semibold"
                            : ""
                        }
                      >
                        After: {(analysis.budgetImpact.postApprovalUtilization * 100).toFixed(0)}%
                      </span>
                      <span className="text-slate-400">
                        (€{analysis.budgetImpact.remaining.toFixed(2)} remaining)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!analysisLoading && !analysis && (
              <p className="text-body-sm text-slate-500">Analysis not available</p>
            )}
          </div>
        </div>

        {/* Comments */}
        {showComments && (
          <Textarea
            placeholder="Add a comment (optional)..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="h-20"
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => onDecide(approval.id, "approved", comments || undefined)}
            disabled={deciding}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {deciding ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!showComments) {
                setShowComments(true);
              } else {
                onDecide(approval.id, "rejected", comments || undefined);
              }
            }}
            disabled={deciding}
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {showComments ? "Confirm Reject" : "Reject"}
          </Button>
          {!showComments && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(true)}
              className="text-slate-500"
            >
              Comment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
