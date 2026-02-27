/**
 * Agentic Request Analyzer
 *
 * Proactively analyzes purchase requests before an approver sees them.
 * Detects anomalies, duplicates, budget pressure, and risk patterns.
 * Returns a structured analysis with confidence scores and recommendations.
 *
 * Architecture:
 *   Rule-based detection (deterministic, fast, auditable)
 *   + Structure ready for Claude API enrichment (Phase 2)
 *
 * The agent runs automatically when an approver views a request.
 * It doesn't make decisions — it surfaces insights so humans decide faster.
 */

import { eq, and, gte, desc } from "drizzle-orm";
import { db } from "../db";
import { requests } from "../db/schema";
import type { Request, Budget } from "../db/schema";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RiskSignal {
  type: "anomaly" | "duplicate" | "budget" | "vendor" | "pattern" | "compliance";
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
}

export interface RequestAnalysis {
  requestId: string;
  riskScore: number; // 0-100 (0 = no risk, 100 = highest risk)
  recommendation: "approve" | "review" | "flag";
  confidence: number; // 0-1
  signals: RiskSignal[];
  budgetImpact: {
    currentUtilization: number;
    postApprovalUtilization: number;
    remaining: number;
    wouldExceed: boolean;
  } | null;
  spendingContext: {
    categoryAverage: number;
    categoryMedian: number;
    totalCategorySpend: number;
    requestCount: number;
    isAboveAverage: boolean;
    percentile: number;
  } | null;
  similarRequests: Array<{
    id: string;
    title: string;
    amount: string;
    status: string;
    createdAt: Date;
    similarity: "exact_vendor" | "similar_title" | "same_category_amount";
  }>;
  summary: string; // Human-readable one-liner
  analyzedAt: Date;
}

/* ------------------------------------------------------------------ */
/*  Category benchmarks (will be computed from data in production)      */
/* ------------------------------------------------------------------ */

const CATEGORY_BENCHMARKS: Record<string, { avgAmount: number; maxTypical: number }> = {
  saas: { avgAmount: 500, maxTypical: 5000 },
  services: { avgAmount: 3000, maxTypical: 25000 },
  office: { avgAmount: 150, maxTypical: 1000 },
  travel: { avgAmount: 800, maxTypical: 5000 },
  hardware: { avgAmount: 1200, maxTypical: 10000 },
  other: { avgAmount: 500, maxTypical: 5000 },
};

/* ------------------------------------------------------------------ */
/*  Main Analysis Function                                             */
/* ------------------------------------------------------------------ */

export async function analyzeRequest(
  tenantId: string,
  requestId: string
): Promise<RequestAnalysis> {
  // Load request
  const request = await db.query.requests.findFirst({
    where: and(eq(requests.id, requestId), eq(requests.tenantId, tenantId)),
    with: { requester: true, department: true, budget: true },
  });

  if (!request) throw new Error(`Request ${requestId} not found`);

  const signals: RiskSignal[] = [];

  // Run all detectors in parallel
  const [
    amountSignals,
    duplicateResults,
    budgetImpact,
    spendingContext,
    patternSignals,
  ] = await Promise.all([
    detectAmountAnomalies(request),
    detectDuplicates(tenantId, request),
    computeBudgetImpact(request),
    computeSpendingContext(tenantId, request),
    detectPatterns(tenantId, request),
  ]);

  signals.push(...amountSignals, ...patternSignals);

  // Add duplicate signals
  if (duplicateResults.length > 0) {
    signals.push({
      type: "duplicate",
      severity: duplicateResults.some((d) => d.similarity === "exact_vendor") ? "high" : "medium",
      title: `${duplicateResults.length} similar request${duplicateResults.length > 1 ? "s" : ""} found`,
      detail: duplicateResults
        .map((d) => `"${d.title}" (${d.status}, €${parseFloat(d.amount).toFixed(2)})`)
        .join("; "),
    });
  }

  // Budget signals
  if (budgetImpact) {
    if (budgetImpact.wouldExceed) {
      signals.push({
        type: "budget",
        severity: "high",
        title: "Would exceed budget",
        detail: `Budget at ${(budgetImpact.currentUtilization * 100).toFixed(0)}%, this request would push it to ${(budgetImpact.postApprovalUtilization * 100).toFixed(0)}%`,
      });
    } else if (budgetImpact.postApprovalUtilization > 0.9) {
      signals.push({
        type: "budget",
        severity: "medium",
        title: "Budget nearly exhausted",
        detail: `After approval, budget will be ${(budgetImpact.postApprovalUtilization * 100).toFixed(0)}% utilized (€${budgetImpact.remaining.toFixed(2)} remaining)`,
      });
    }
  }

  // Spending context signals
  if (spendingContext && spendingContext.isAboveAverage) {
    signals.push({
      type: "anomaly",
      severity: spendingContext.percentile > 90 ? "high" : "medium",
      title: "Above average for category",
      detail: `This request is in the ${spendingContext.percentile.toFixed(0)}th percentile for ${request.category} purchases (avg: €${spendingContext.categoryAverage.toFixed(2)})`,
    });
  }

  // Compute risk score
  const riskScore = computeRiskScore(signals);

  // Generate recommendation
  const recommendation = riskScore >= 70 ? "flag" : riskScore >= 30 ? "review" : "approve";
  const confidence = signals.length === 0 ? 0.9 : Math.max(0.5, 1 - riskScore / 200);

  // Generate summary
  const summary = generateSummary(request, signals, recommendation, budgetImpact);

  return {
    requestId,
    riskScore,
    recommendation,
    confidence,
    signals,
    budgetImpact,
    spendingContext,
    similarRequests: duplicateResults,
    summary,
    analyzedAt: new Date(),
  };
}

/* ------------------------------------------------------------------ */
/*  Detector: Amount Anomalies                                         */
/* ------------------------------------------------------------------ */

function detectAmountAnomalies(request: Request): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const amount = parseFloat(request.amount);
  const category = request.category || "other";
  const benchmark = CATEGORY_BENCHMARKS[category as keyof typeof CATEGORY_BENCHMARKS] ?? CATEGORY_BENCHMARKS.other;

  // Unusually high for category
  if (amount > benchmark.maxTypical * 2) {
    signals.push({
      type: "anomaly",
      severity: "high",
      title: "Unusually high amount",
      detail: `€${amount.toFixed(2)} is ${(amount / benchmark.avgAmount).toFixed(1)}x the average ${category} purchase`,
    });
  } else if (amount > benchmark.maxTypical) {
    signals.push({
      type: "anomaly",
      severity: "medium",
      title: "Above typical range",
      detail: `€${amount.toFixed(2)} exceeds the typical max (€${benchmark.maxTypical.toFixed(2)}) for ${category}`,
    });
  }

  // Recurring cost multiplier
  if (request.frequency === "monthly") {
    const annualCost = amount * 12;
    signals.push({
      type: "pattern",
      severity: annualCost > benchmark.maxTypical ? "medium" : "low",
      title: "Recurring cost",
      detail: `Monthly charge of €${amount.toFixed(2)} = €${annualCost.toFixed(2)}/year`,
    });
  } else if (request.frequency === "annually") {
    signals.push({
      type: "pattern",
      severity: "low",
      title: "Annual commitment",
      detail: `Annual charge of €${amount.toFixed(2)} — consider negotiating multi-year discount`,
    });
  }

  // Round number check (potential estimate, not a real quote)
  if (amount >= 1000 && amount % 1000 === 0) {
    signals.push({
      type: "pattern",
      severity: "low",
      title: "Round number amount",
      detail: `€${amount.toFixed(2)} may be an estimate — consider requesting a formal quote`,
    });
  }

  return signals;
}

/* ------------------------------------------------------------------ */
/*  Detector: Duplicates & Similar Requests                            */
/* ------------------------------------------------------------------ */

async function detectDuplicates(
  tenantId: string,
  request: Request
): Promise<RequestAnalysis["similarRequests"]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Find recent requests in the same tenant
  const recent = await db.query.requests.findMany({
    where: and(
      eq(requests.tenantId, tenantId),
      gte(requests.createdAt, thirtyDaysAgo)
    ),
    orderBy: [desc(requests.createdAt)],
    limit: 100,
  });

  const similar: RequestAnalysis["similarRequests"] = [];

  for (const r of recent) {
    if (r.id === request.id) continue;

    // Exact vendor match
    if (
      request.vendorName &&
      r.vendorName &&
      request.vendorName.toLowerCase() === r.vendorName.toLowerCase()
    ) {
      similar.push({
        id: r.id,
        title: r.title,
        amount: r.amount,
        status: r.status,
        createdAt: r.createdAt,
        similarity: "exact_vendor",
      });
      continue;
    }

    // Similar title (3+ word overlap)
    const titleWords = new Set(request.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
    const otherWords = r.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const overlap = otherWords.filter((w) => titleWords.has(w)).length;
    if (overlap >= 3 || (titleWords.size <= 4 && overlap >= 2)) {
      similar.push({
        id: r.id,
        title: r.title,
        amount: r.amount,
        status: r.status,
        createdAt: r.createdAt,
        similarity: "similar_title",
      });
      continue;
    }

    // Same category + similar amount (within 20%)
    if (r.category === request.category) {
      const amountDiff = Math.abs(parseFloat(r.amount) - parseFloat(request.amount));
      const maxAmount = Math.max(parseFloat(r.amount), parseFloat(request.amount));
      if (maxAmount > 0 && amountDiff / maxAmount < 0.2) {
        similar.push({
          id: r.id,
          title: r.title,
          amount: r.amount,
          status: r.status,
          createdAt: r.createdAt,
          similarity: "same_category_amount",
        });
      }
    }
  }

  return similar.slice(0, 5); // Cap at 5 results
}

/* ------------------------------------------------------------------ */
/*  Detector: Budget Impact                                            */
/* ------------------------------------------------------------------ */

async function computeBudgetImpact(
  request: Request & { budget?: Budget | null }
): Promise<RequestAnalysis["budgetImpact"]> {
  const budget = request.budget;
  if (!budget) return null;

  const allocated = parseFloat(budget.allocated);
  const committed = parseFloat(budget.committed);
  const spent = parseFloat(budget.spent);
  const amount = parseFloat(request.amount);

  if (allocated === 0) return null;

  const currentUtilization = (committed + spent) / allocated;
  const postApprovalUtilization = (committed + spent + amount) / allocated;
  const remaining = allocated - committed - spent;

  return {
    currentUtilization,
    postApprovalUtilization,
    remaining,
    wouldExceed: postApprovalUtilization > 1,
  };
}

/* ------------------------------------------------------------------ */
/*  Detector: Spending Context                                         */
/* ------------------------------------------------------------------ */

async function computeSpendingContext(
  tenantId: string,
  request: Request
): Promise<RequestAnalysis["spendingContext"]> {
  // Get all approved requests in this category for this tenant
  if (!request.category) return null; // No category to compare against

  const categoryRequests = await db.query.requests.findMany({
    where: and(
      eq(requests.tenantId, tenantId),
      eq(requests.category, request.category),
      eq(requests.status, "approved")
    ),
  });

  if (categoryRequests.length < 3) return null; // Not enough data

  const amounts = categoryRequests.map((r) => parseFloat(r.amount)).sort((a, b) => a - b);
  const totalSpend = amounts.reduce((sum, a) => sum + a, 0);
  const avg = totalSpend / amounts.length;
  const median = amounts[Math.floor(amounts.length / 2)];
  const requestAmount = parseFloat(request.amount);

  // Compute percentile
  const belowCount = amounts.filter((a) => a < requestAmount).length;
  const percentile = (belowCount / amounts.length) * 100;

  return {
    categoryAverage: avg,
    categoryMedian: median,
    totalCategorySpend: totalSpend,
    requestCount: amounts.length,
    isAboveAverage: requestAmount > avg * 1.5,
    percentile,
  };
}

/* ------------------------------------------------------------------ */
/*  Detector: Behavioral Patterns                                      */
/* ------------------------------------------------------------------ */

async function detectPatterns(
  tenantId: string,
  request: Request
): Promise<RiskSignal[]> {
  const signals: RiskSignal[] = [];

  // Check if this is a first-time vendor
  if (request.vendorName) {
    const existingVendorRequests = await db.query.requests.findMany({
      where: and(
        eq(requests.tenantId, tenantId),
        eq(requests.vendorName, request.vendorName),
        eq(requests.status, "approved")
      ),
      limit: 1,
    });

    if (existingVendorRequests.length === 0) {
      signals.push({
        type: "vendor",
        severity: "medium",
        title: "First-time vendor",
        detail: `No previous approved purchases from "${request.vendorName}" — consider additional due diligence`,
      });
    }
  }

  // Urgency + high amount = extra scrutiny
  if (request.urgency === "urgent" && parseFloat(request.amount) > 5000) {
    signals.push({
      type: "compliance",
      severity: "medium",
      title: "Urgent high-value request",
      detail: `Urgent requests over €5,000 may bypass normal vendor evaluation — ensure this is justified`,
    });
  }

  // No description on high-value requests
  if (!request.description && parseFloat(request.amount) > 1000) {
    signals.push({
      type: "compliance",
      severity: "low",
      title: "No justification provided",
      detail: `Request over €1,000 has no description — consider asking the requester to explain the business need`,
    });
  }

  return signals;
}

/* ------------------------------------------------------------------ */
/*  Risk Score Computation                                             */
/* ------------------------------------------------------------------ */

function computeRiskScore(signals: RiskSignal[]): number {
  const weights = { low: 5, medium: 15, high: 30 };
  const total = signals.reduce((sum, s) => sum + weights[s.severity], 0);
  return Math.min(100, total);
}

/* ------------------------------------------------------------------ */
/*  Summary Generation                                                 */
/* ------------------------------------------------------------------ */

function generateSummary(
  request: Request,
  signals: RiskSignal[],
  recommendation: string,
  _budgetImpact: RequestAnalysis["budgetImpact"]
): string {
  const amount = parseFloat(request.amount);
  const highSignals = signals.filter((s) => s.severity === "high");

  if (signals.length === 0) {
    return `Standard ${request.category} purchase for €${amount.toFixed(2)}. No risk signals detected.`;
  }

  if (recommendation === "approve") {
    return `Low-risk ${request.category} purchase for €${amount.toFixed(2)}. ${signals.length} minor signal${signals.length > 1 ? "s" : ""} noted.`;
  }

  if (recommendation === "flag") {
    const topIssue = highSignals[0]?.title ?? signals[0].title;
    return `Needs attention: ${topIssue}. ${highSignals.length} high-risk signal${highSignals.length > 1 ? "s" : ""} detected for €${amount.toFixed(2)} ${request.category} purchase.`;
  }

  // "review"
  return `Review recommended: ${signals.length} signal${signals.length > 1 ? "s" : ""} detected for €${amount.toFixed(2)} ${request.category} purchase.`;
}
