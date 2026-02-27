/**
 * Approval Routing Engine
 * Determines the approval chain for a purchase request
 *
 * Architecture:
 *   1. findMatchingWorkflow()  — picks the most specific workflow template
 *   2. buildApprovalChain()    — converts template steps to concrete approvers
 *   3. addDynamicApprovers()   — injects extra approvers based on live state
 *   4. routeApproval()         — orchestrates 1→2→3 and returns the final chain
 *
 * The engine is deterministic: same inputs → same chain. This is critical for
 * audit trails — you must be able to explain why any approver was selected.
 */

import { eq, and } from "drizzle-orm";
import { db } from "../db";
import {
  type Request,
  type User,
  type Budget,
  approvalWorkflows,
  approvals,
  requests,
  users,
} from "../db/schema";
import type { ApprovalWorkflow } from "../db/schema";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ApprovalStep {
  step: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  required: "required" | "optional" | "parallel";
  reason: string;
}

export interface RoutingContext {
  request: Request;
  requester: User;
  department: { id: string; name: string; headId?: string | null };
  budget: Budget | null;
  workflows: ApprovalWorkflow[];
  departmentHead?: User;
  financeUsers: User[];
  adminUsers: User[];
}

export interface RoutingResult {
  steps: ApprovalStep[];
  workflowId: string | null;
  workflowName: string;
  flags: {
    securityReview: boolean;
    legalReview: boolean;
    budgetEscalation: boolean;
    budgetOverrun: boolean;
    autoApproved: boolean;
  };
  /** Warnings surfaced to approvers — never block, always inform */
  warnings: string[];
}

/* ------------------------------------------------------------------ */
/*  Constants — Business Rules                                         */
/* ------------------------------------------------------------------ */

/** Requests at or below this amount get auto-approved (no human in the loop) */
const AUTO_APPROVE_THRESHOLD = 0;

/** Requests above this amount require finance sign-off */
const FINANCE_REVIEW_THRESHOLD = 1000;

/** Requests above this amount require executive/admin sign-off */
const EXECUTIVE_REVIEW_THRESHOLD = 10000;

/** Budget utilization above this level escalates to finance */
const BUDGET_ESCALATION_THRESHOLD = 0.9;

/** Categories that always need security review */
const SECURITY_REVIEW_CATEGORIES = ["saas"];

/** Categories that always need legal review */
const LEGAL_REVIEW_CATEGORIES = ["services"];

/** Amount threshold for legal review on non-service purchases */
const LEGAL_REVIEW_AMOUNT = 25000;

/* ------------------------------------------------------------------ */
/*  1. Workflow Matching                                               */
/* ------------------------------------------------------------------ */

/**
 * Find the most specific workflow that matches this request.
 *
 * Specificity ranking (highest wins):
 *   1. Matches department + category + amount range
 *   2. Matches department + amount range
 *   3. Matches category + amount range
 *   4. Matches amount range only
 *   5. Default workflow (isDefault = true)
 *
 * If no workflow matches at all, we fall back to built-in rules.
 */
function findMatchingWorkflow(
  context: RoutingContext
): ApprovalWorkflow | null {
  const { request, workflows } = context;
  const amount = parseFloat(request.amount);

  type ScoredWorkflow = { workflow: ApprovalWorkflow; score: number };
  const scored: ScoredWorkflow[] = [];

  for (const wf of workflows) {
    if (!wf.isActive) continue;

    const conditions = wf.conditions;
    let score = 0;
    let disqualified = false;

    // Amount range check
    if (conditions.amountMin !== undefined && amount < conditions.amountMin) {
      disqualified = true;
    }
    if (conditions.amountMax !== undefined && amount > conditions.amountMax) {
      disqualified = true;
    }
    if (!disqualified && (conditions.amountMin !== undefined || conditions.amountMax !== undefined)) {
      score += 1; // Matched an amount constraint
    }

    // Category check
    if (conditions.categories && conditions.categories.length > 0) {
      if (request.category && conditions.categories.includes(request.category)) {
        score += 2; // Category match is worth more
      } else {
        disqualified = true;
      }
    }

    // Department check
    if (conditions.departments && conditions.departments.length > 0) {
      if (conditions.departments.includes(context.department.id)) {
        score += 4; // Department match is most specific
      } else {
        disqualified = true;
      }
    }

    if (disqualified) continue;

    // Default workflows get score 0 (lowest priority)
    if (wf.isDefault && score === 0) {
      score = 0;
    }

    scored.push({ workflow: wf, score });
  }

  if (scored.length === 0) return null;

  // Sort by score descending — most specific wins
  scored.sort((a, b) => b.score - a.score);
  return scored[0].workflow;
}

/* ------------------------------------------------------------------ */
/*  2. Chain Building                                                  */
/* ------------------------------------------------------------------ */

/**
 * Convert a workflow template's approval chain into concrete ApprovalSteps
 * by resolving role/department_head/user references to actual user records.
 */
async function buildApprovalChain(
  workflow: ApprovalWorkflow,
  context: RoutingContext
): Promise<ApprovalStep[]> {
  const steps: ApprovalStep[] = [];
  const chain = workflow.approvalChain;

  for (const link of chain) {
    // If this step has a condition, evaluate it
    if (link.condition && !evaluateCondition(link.condition, context)) {
      continue;
    }

    const resolved = await resolveApprover(link.type, link.value, context);
    if (!resolved) continue;

    steps.push({
      step: steps.length + 1,
      approverId: resolved.id,
      approverName: resolved.name,
      approverRole: resolved.role,
      required: link.required,
      reason: `Workflow "${workflow.name}" step ${link.step}: ${link.type} = ${link.value}`,
    });
  }

  return steps;
}

/**
 * Build a default chain using built-in rules when no workflow template matches.
 * This is the fallback that ensures every request gets routed somewhere.
 */
function buildDefaultChain(context: RoutingContext): ApprovalStep[] {
  const steps: ApprovalStep[] = [];
  const amount = parseFloat(context.request.amount);

  // Step 1: Department head (if exists and isn't the requester)
  if (
    context.departmentHead &&
    context.departmentHead.id !== context.requester.id
  ) {
    steps.push({
      step: 1,
      approverId: context.departmentHead.id,
      approverName: context.departmentHead.name,
      approverRole: "manager",
      required: "required",
      reason: `Department head for ${context.department.name}`,
    });
  }

  // Step 2: Finance review for medium+ requests
  if (amount >= FINANCE_REVIEW_THRESHOLD && context.financeUsers.length > 0) {
    const finance = context.financeUsers[0];
    steps.push({
      step: steps.length + 1,
      approverId: finance.id,
      approverName: finance.name,
      approverRole: "finance",
      required: "required",
      reason: `Amount €${amount.toLocaleString()} exceeds finance review threshold (€${FINANCE_REVIEW_THRESHOLD})`,
    });
  }

  // Step 3: Executive for large requests
  if (amount >= EXECUTIVE_REVIEW_THRESHOLD && context.adminUsers.length > 0) {
    const exec = context.adminUsers[0];
    // Don't duplicate if already in chain
    if (!steps.some((s) => s.approverId === exec.id)) {
      steps.push({
        step: steps.length + 1,
        approverId: exec.id,
        approverName: exec.name,
        approverRole: "admin",
        required: "required",
        reason: `Amount €${amount.toLocaleString()} exceeds executive review threshold (€${EXECUTIVE_REVIEW_THRESHOLD})`,
      });
    }
  }

  // Edge case: requester IS the department head and no one else was added
  if (steps.length === 0 && context.adminUsers.length > 0) {
    const admin = context.adminUsers[0];
    steps.push({
      step: 1,
      approverId: admin.id,
      approverName: admin.name,
      approverRole: "admin",
      required: "required",
      reason: "Fallback: requester is department head, routed to admin",
    });
  }

  return steps;
}

/* ------------------------------------------------------------------ */
/*  3. Dynamic Approvers                                               */
/* ------------------------------------------------------------------ */

/**
 * Inject additional approvers based on live state that the workflow
 * template can't predict at configuration time.
 *
 * Returns flags indicating which dynamic rules fired.
 */
function addDynamicApprovers(
  steps: ApprovalStep[],
  context: RoutingContext
): { securityReview: boolean; legalReview: boolean; budgetEscalation: boolean; budgetOverrun: boolean; warnings: string[] } {
  const flags = {
    securityReview: false,
    legalReview: false,
    budgetEscalation: false,
    budgetOverrun: false,
  };
  const warnings: string[] = [];

  const existingIds = new Set(steps.map((s) => s.approverId));

  // Budget checks: escalate at soft limit, warn at hard limit (never block)
  if (context.budget) {
    const utilization = getBudgetUtilization(context.budget);
    const requestAmount = parseFloat(context.request.amount);
    const allocated = parseFloat(context.budget.allocated);
    const committed = parseFloat(context.budget.committed);
    const spent = parseFloat(context.budget.spent);
    const remaining = allocated - committed - spent;
    const postApprovalUtilization = allocated > 0 ? (committed + spent + requestAmount) / allocated : 0;

    // Soft limit: escalate to finance
    if (utilization >= BUDGET_ESCALATION_THRESHOLD) {
      const finance = context.financeUsers.find((u) => !existingIds.has(u.id));
      if (finance) {
        steps.push({
          step: steps.length + 1,
          approverId: finance.id,
          approverName: finance.name,
          approverRole: "finance",
          required: "required",
          reason: `Budget ${(utilization * 100).toFixed(0)}% utilized — exceeds ${BUDGET_ESCALATION_THRESHOLD * 100}% escalation threshold`,
        });
        existingIds.add(finance.id);
        flags.budgetEscalation = true;
      }
      warnings.push(`Budget is ${(utilization * 100).toFixed(0)}% consumed (€${remaining.toFixed(2)} remaining)`);
    }

    // Hard limit: warn if this request would push over 100% (but don't block)
    if (postApprovalUtilization > 1) {
      flags.budgetOverrun = true;
      warnings.push(`This request (€${requestAmount.toFixed(2)}) would exceed the budget by €${(requestAmount - remaining).toFixed(2)}`);
    }
  }

  // Security review: flag for approver awareness, don't add separate step
  if (needsSecurityReview(context.request)) {
    flags.securityReview = true;
    warnings.push(`Security review recommended: ${context.request.category || 'this'} purchase`);
  }

  // Legal review: flag for approver awareness, don't add separate step
  if (needsLegalReview(context.request)) {
    flags.legalReview = true;
    const reasons: string[] = [];
    if (context.request.category && LEGAL_REVIEW_CATEGORIES.includes(context.request.category)) reasons.push("service contract");
    if (parseFloat(context.request.amount) >= LEGAL_REVIEW_AMOUNT) reasons.push(`amount ≥ €${LEGAL_REVIEW_AMOUNT.toLocaleString()}`);
    if (context.request.frequency !== "one-time") reasons.push("recurring commitment");
    warnings.push(`Legal review recommended: ${reasons.join(", ")}`);
  }

  return { ...flags, warnings };
}

/* ------------------------------------------------------------------ */
/*  4. Main Entry Point                                                */
/* ------------------------------------------------------------------ */

/**
 * Route a purchase request through the approval workflow.
 *
 * This is the single entry point called by the request submission flow.
 * It returns a deterministic, auditable approval chain.
 */
export async function routeApproval(
  context: RoutingContext
): Promise<RoutingResult> {
  const amount = parseFloat(context.request.amount);

  // Auto-approve if below threshold (currently disabled — every request needs a human)
  if (AUTO_APPROVE_THRESHOLD > 0 && amount <= AUTO_APPROVE_THRESHOLD) {
    return {
      steps: [],
      workflowId: null,
      workflowName: "Auto-approved",
      flags: {
        securityReview: false,
        legalReview: false,
        budgetEscalation: false,
        budgetOverrun: false,
        autoApproved: true,
      },
      warnings: [],
    };
  }

  // 1. Find matching workflow
  const workflow = findMatchingWorkflow(context);

  // 2. Build approval chain
  let steps: ApprovalStep[];
  if (workflow) {
    steps = await buildApprovalChain(workflow, context);
  } else {
    steps = buildDefaultChain(context);
  }

  // 3. Add dynamic approvers + compute warnings
  const { warnings, ...dynamicFlags } = addDynamicApprovers(steps, context);

  // Re-number steps sequentially
  steps.forEach((s, i) => {
    s.step = i + 1;
  });

  return {
    steps,
    workflowId: workflow?.id ?? null,
    workflowName: workflow?.name ?? "Default (built-in rules)",
    flags: {
      ...dynamicFlags,
      autoApproved: false,
    },
    warnings,
  };
}

/* ------------------------------------------------------------------ */
/*  Integration: Create approval records + update request status       */
/* ------------------------------------------------------------------ */

/**
 * Execute the routing result: persist approval steps to the database
 * and transition the request to "pending" status.
 *
 * This is called from the tRPC submit mutation.
 */
export async function executeApprovalRouting(
  tenantId: string,
  requestId: string,
  result: RoutingResult
): Promise<void> {
  if (result.flags.autoApproved) {
    // Auto-approve: skip the chain, mark request as approved
    await db
      .update(requests)
      .set({
        status: "approved",
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(requests.id, requestId), eq(requests.tenantId, tenantId)));
    return;
  }

  // Insert approval records for each step
  for (const step of result.steps) {
    await db.insert(approvals).values({
      tenantId,
      requestId,
      approverId: step.approverId,
      step: step.step,
      required: step.required,
      decision: "pending",
      context: {
        riskFlags: [
          ...(result.flags.securityReview ? ["Security review recommended"] : []),
          ...(result.flags.legalReview ? ["Legal review recommended"] : []),
          ...(result.flags.budgetEscalation ? ["Budget near limit — escalated"] : []),
          ...(result.flags.budgetOverrun ? ["WARNING: Would exceed budget"] : []),
          ...result.warnings,
        ],
        aiSuggestion: step.reason,
      },
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: Build full routing context from a request ID               */
/* ------------------------------------------------------------------ */

/**
 * Load all the data needed for routing from the database.
 * This is the bridge between the tRPC layer and the routing engine.
 */
export async function buildRoutingContext(
  tenantId: string,
  requestId: string
): Promise<RoutingContext> {
  // Load request with relations
  const request = await db.query.requests.findFirst({
    where: and(eq(requests.id, requestId), eq(requests.tenantId, tenantId)),
    with: {
      requester: true,
      department: true,
      budget: true,
    },
  });

  if (!request) {
    throw new Error(`Request ${requestId} not found`);
  }

  // Load active workflows for this tenant
  const workflows = await db.query.approvalWorkflows.findMany({
    where: and(
      eq(approvalWorkflows.tenantId, tenantId),
      eq(approvalWorkflows.isActive, true)
    ),
  });

  // Load department head
  let departmentHead: User | undefined;
  if (request.department) {
    // Department head is a manager-role user in this department
    const head = await db.query.users.findFirst({
      where: and(
        eq(users.tenantId, tenantId),
        eq(users.departmentId, request.departmentId),
        eq(users.role, "manager"),
        eq(users.isActive, true)
      ),
    });
    if (head) departmentHead = head;
  }

  // Load finance and admin users
  const financeUsers = await db.query.users.findMany({
    where: and(
      eq(users.tenantId, tenantId),
      eq(users.role, "finance"),
      eq(users.isActive, true)
    ),
  });

  const adminUsers = await db.query.users.findMany({
    where: and(
      eq(users.tenantId, tenantId),
      eq(users.role, "admin"),
      eq(users.isActive, true)
    ),
  });

  return {
    request,
    requester: request.requester as User,
    department: request.department as { id: string; name: string; headId?: string | null },
    budget: (request.budget as Budget) ?? null,
    workflows,
    departmentHead,
    financeUsers,
    adminUsers,
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Resolve an approver reference (role/user/department_head) to a User */
async function resolveApprover(
  type: string,
  value: string,
  context: RoutingContext
): Promise<User | null> {
  switch (type) {
    case "department_head":
      return context.departmentHead ?? null;

    case "role":
      if (value === "finance") return context.financeUsers[0] ?? null;
      if (value === "admin") return context.adminUsers[0] ?? null;
      if (value === "manager") return context.departmentHead ?? null;
      return null;

    case "user":
      // Specific user ID
      const user = await db.query.users.findFirst({
        where: and(
          eq(users.id, value),
          eq(users.tenantId, context.request.tenantId),
          eq(users.isActive, true)
        ),
      });
      return user ?? null;

    default:
      return null;
  }
}

/** Evaluate a step condition against the routing context */
function evaluateCondition(
  condition: { field: string; operator: string; value: unknown },
  context: RoutingContext
): boolean {
  const amount = parseFloat(context.request.amount);

  switch (condition.field) {
    case "amount": {
      const target = Number(condition.value);
      switch (condition.operator) {
        case "gt": return amount > target;
        case "gte": return amount >= target;
        case "lt": return amount < target;
        case "lte": return amount <= target;
        case "eq": return amount === target;
        default: return true;
      }
    }

    case "category":
      return condition.operator === "eq"
        ? context.request.category === condition.value
        : context.request.category !== condition.value;

    case "urgency":
      return condition.operator === "eq"
        ? context.request.urgency === condition.value
        : context.request.urgency !== condition.value;

    default:
      return true; // Unknown conditions pass by default
  }
}

function getBudgetUtilization(budget: Budget): number {
  const allocated = parseFloat(budget.allocated);
  const committed = parseFloat(budget.committed);
  const spent = parseFloat(budget.spent);
  if (allocated === 0) return 0;
  return (committed + spent) / allocated;
}

function needsSecurityReview(request: Request): boolean {
  return request.category ? SECURITY_REVIEW_CATEGORIES.includes(request.category) : false;
}

function needsLegalReview(request: Request): boolean {
  if (request.category && LEGAL_REVIEW_CATEGORIES.includes(request.category)) return true;
  if (parseFloat(request.amount) >= LEGAL_REVIEW_AMOUNT) return true;
  if (request.frequency !== "one-time") return true;
  return false;
}
