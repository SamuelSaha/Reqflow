/**
 * Approval Routing Engine
 * Determines the approval chain for a purchase request
 *
 * This is a CRITICAL business logic component.
 * The routing decisions here directly impact:
 * - Request approval speed
 * - Budget compliance
 * - User experience
 * - Audit trail integrity
 */

import type { Request, User, ApprovalWorkflow, Department, Budget } from "../db/schema";

export interface ApprovalStep {
  step: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  required: "required" | "optional" | "parallel";
  reason: string; // Why this approver was selected
}

export interface RoutingContext {
  request: Request;
  requester: User;
  department: Department;
  budget: Budget | null;
  workflows: ApprovalWorkflow[];
  departmentHead?: User;
  financeUsers: User[];
  adminUsers: User[];
}

/**
 * TODO: Implement the approval routing logic
 *
 * This function decides who needs to approve a request and in what order.
 *
 * Consider these scenarios:
 * 1. Small requests (<$1K): Just manager approval
 * 2. Medium requests ($1K-$10K): Manager + Finance
 * 3. Large requests (>$10K): Manager + Finance + CEO
 * 4. SaaS purchases: Add IT/Security review
 * 5. Services: Add Legal review
 * 6. Budget >90% consumed: Add CFO to chain
 *
 * Trade-offs to consider:
 * - Speed vs. governance: More approvers = slower but more controlled
 * - Flexibility vs. consistency: Custom rules vs. standard templates
 * - Auto-routing vs. manual override: When to escalate to admin?
 *
 * @param context - All the data needed to make routing decisions
 * @returns Array of approval steps in order
 */
export async function routeApproval(
  context: RoutingContext
): Promise<ApprovalStep[]> {
  const steps: ApprovalStep[] = [];

  // TODO: Implement your routing logic here!
  //
  // Example starter logic (replace with your business rules):
  //
  // 1. Find matching workflow based on request conditions
  // const workflow = findMatchingWorkflow(context);
  //
  // 2. Build approval chain from workflow definition
  // const chain = buildApprovalChain(workflow, context);
  //
  // 3. Add dynamic approvers based on current state
  // if (budgetUtilization > 0.9) {
  //   chain.push({ type: "role", value: "finance", step: chain.length + 1 });
  // }
  //
  // 4. Resolve approver IDs from roles/departments
  // const steps = await resolveApprovers(chain, context);
  //
  // 5. Return the final approval chain

  // PLACEHOLDER - Remove this when you implement real logic
  throw new Error(
    "Approval routing not implemented. See src/lib/workflows/approval-router.ts"
  );
}

/**
 * Helper: Find the workflow that matches the request
 */
function findMatchingWorkflow(
  context: RoutingContext
): ApprovalWorkflow | null {
  const { request, workflows } = context;

  // TODO: Implement workflow matching logic
  // Check amount, category, department against workflow conditions
  // Return the most specific matching workflow

  return null; // Placeholder
}

/**
 * Helper: Build approval chain from workflow definition
 */
function buildApprovalChain(
  workflow: ApprovalWorkflow,
  context: RoutingContext
): ApprovalStep[] {
  // TODO: Implement chain building
  // Parse workflow.approvalChain
  // Resolve "department_head", "role", "user" to actual user IDs
  // Consider parallel vs. sequential steps

  return []; // Placeholder
}

/**
 * Helper: Check if request needs additional security review
 */
function needsSecurityReview(request: Request): boolean {
  // TODO: Implement security review logic
  // SaaS purchases should always get security review
  // High-risk vendors should trigger review
  // First-time vendors should be reviewed

  return false; // Placeholder
}

/**
 * Helper: Check if request needs legal review
 */
function needsLegalReview(request: Request): boolean {
  // TODO: Implement legal review logic
  // Service contracts over certain amount
  // International vendors
  // Multi-year commitments

  return false; // Placeholder
}

/**
 * Helper: Get budget utilization percentage
 */
function getBudgetUtilization(budget: Budget | null): number {
  if (!budget) return 0;

  const allocated = parseFloat(budget.allocated);
  const committed = parseFloat(budget.committed);
  const spent = parseFloat(budget.spent);

  if (allocated === 0) return 0;

  return (committed + spent) / allocated;
}

/**
 * Helper: Find user by role in department
 */
async function findUserByRole(
  departmentId: string,
  role: string,
  context: RoutingContext
): Promise<User | null> {
  // TODO: Query database for user with role in department
  // This would typically use the db client

  return null; // Placeholder
}
