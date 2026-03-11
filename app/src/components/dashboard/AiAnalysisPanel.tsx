"use client";

import { trpc } from "@/lib/api/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, CheckCircle2, Eye, Flag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AiAnalysisPanelProps {
  requestId: string;
}

const riskConfig = {
  low: { label: "Low risk", className: "bg-green-100 text-green-800" },
  medium: { label: "Medium risk", className: "bg-amber-100 text-amber-800" },
  high: { label: "High risk", className: "bg-red-100 text-red-800" },
};

const recommendationConfig = {
  approve: { label: "Approve", icon: CheckCircle2, color: "text-green-600" },
  review: { label: "Review carefully", icon: Eye, color: "text-amber-600" },
  flag: { label: "Flag for investigation", icon: Flag, color: "text-red-600" },
};

export function AiAnalysisPanel({ requestId }: AiAnalysisPanelProps) {
  const { data: aiStatus } = trpc.ai.status.useQuery();
  const configured = aiStatus?.configured ?? false;

  const { data, isLoading, error } = trpc.ai.analyzeRequest.useQuery(
    { requestId },
    { enabled: configured }
  );

  // Not configured — show a soft nudge
  if (!configured) {
    return (
      <Card className="border-dashed border-slate-300 bg-slate-50">
        <CardContent className="py-5 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700">AI analysis available</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Add your Anthropic API key in{" "}
              <Link
                href="/dashboard/settings/ai"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Settings → AI
              </Link>{" "}
              to enable instant risk assessment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600 animate-pulse" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null; // Silent fail — don't disrupt the main UX
  }

  const risk = riskConfig[data.riskLevel];
  const rec = recommendationConfig[data.recommendation];
  const RecIcon = rec.icon;

  return (
    <Card className={cn(
      "border",
      data.riskLevel === "high" && "border-red-200 bg-red-50/30",
      data.riskLevel === "medium" && "border-amber-200 bg-amber-50/20",
      data.riskLevel === "low" && "border-green-200 bg-green-50/20",
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            AI Analysis
          </CardTitle>
          <Badge variant="pill" className={risk.className}>{risk.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommendation */}
        <div className={cn("flex items-center gap-2 text-sm font-medium", rec.color)}>
          <RecIcon className="h-4 w-4" />
          <span>{rec.label}</span>
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-700 leading-relaxed">{data.summary}</p>

        {/* Concerns */}
        {data.concerns.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Concerns</p>
            <ul className="space-y-1">
              {data.concerns.map((concern, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                  <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested questions */}
        {data.suggestedQuestions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Questions to ask
            </p>
            <ul className="space-y-1">
              {data.suggestedQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                  <ChevronRight className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Insights */}
        {data.insights && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed italic">{data.insights}</p>
          </div>
        )}

        <p className="text-[10px] text-slate-400">
          Powered by{" "}
          {data.provider === "openai" ? "GPT-4o mini" : data.provider === "gemini" ? "Gemini 1.5 Flash" : "Claude AI"}
          {" "}· Not a substitute for human judgment
        </p>
      </CardContent>
    </Card>
  );
}
