/**
 * Slack Request Handler
 * Orchestrates request creation using existing workflows
 */

import { db } from "@/lib/db";
import { requests } from "@/lib/db/schema";
import { insertRequestSchema } from "@/lib/db/schema";
import {
  buildRoutingContext,
  routeApproval,
  executeApprovalRouting,
} from "@/lib/workflows/approval-router";
import { eq } from "drizzle-orm";
import type { z } from "zod";

export interface RequestInput {
  title: string;
  description?: string;
  category: string;
  vendorName?: string;
  amount: string;
  frequency?: string;
  quantity?: number;
  urgency?: string;
}

export interface RequestResult {
  requestNumber: string;
  workflowName: string;
  approvalSteps: number;
  autoApproved: boolean;
}

/**
 * Create and submit a purchase request from Slack
 * Reuses existing validation, approval routing, and workflow engine
 * @param userId - Reqflow user ID
 * @param tenantId - Organization/tenant ID
 * @param departmentId - Department ID
 * @param input - Request input data
 * @returns Created request details with workflow info
 */
export async function createSlackRequest(
  userId: string,
  tenantId: string,
  departmentId: string,
  input: RequestInput
): Promise<RequestResult> {
  // 1. Validate input using same schema as web app
  const validationSchema = insertRequestSchema.pick({
    title: true,
    description: true,
    category: true,
    vendorName: true,
    amount: true,
    frequency: true,
    quantity: true,
    urgency: true,
  });

  let validated: z.infer<typeof validationSchema>;
  try {
    validated = validationSchema.parse(input);
  } catch (error: unknown) {
    // Re-throw with clearer message for Slack users
    const zodError = error as { errors?: Array<{ path: string[]; message: string }> };
    const firstError = zodError.errors?.[0];
    if (firstError) {
      throw new Error(
        `Invalid ${firstError.path.join(".")}: ${firstError.message}`
      );
    }
    throw new Error("Validation failed");
  }

  // 2. Generate request number (REQ-YYYY-0001)
  const year = new Date().getFullYear();
  const count = await db
    .select({ count: requests.id })
    .from(requests)
    .where(eq(requests.tenantId, tenantId));

  const requestNumber = `REQ-${year}-${String(count.length + 1).padStart(4, "0")}`;

  // 3. Create draft request
  const [newRequest] = await db
    .insert(requests)
    .values({
      ...validated,
      requestNumber,
      tenantId,
      requesterId: userId,
      departmentId,
      status: "draft",
      currency: "EUR", // Default currency
    })
    .returning();

  // 4. Build routing context and route approval
  const routingContext = await buildRoutingContext(tenantId, newRequest.id);
  const routingResult = await routeApproval(routingContext);

  // 5. Update request status based on routing result
  const isAutoApproved = routingResult.flags.autoApproved || false;
  await db
    .update(requests)
    .set({
      status: isAutoApproved ? "approved" : "pending",
      submittedAt: new Date(),
      ...(isAutoApproved ? { approvedAt: new Date() } : {}),
    })
    .where(eq(requests.id, newRequest.id));

  // 6. Execute approval routing (create approval records)
  await executeApprovalRouting(tenantId, newRequest.id, routingResult);

  console.log(
    `[Slack] Created request ${requestNumber} for user ${userId}, routed via ${routingResult.workflowName}`
  );

  // 7. Return result for confirmation message
  return {
    requestNumber: newRequest.requestNumber,
    workflowName: routingResult.workflowName,
    approvalSteps: routingResult.steps.length,
    autoApproved: isAutoApproved,
  };
}

/**
 * Extract form values from Slack modal submission payload
 * @param values - Modal state values from Slack
 * @returns Request input data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractModalValues(values: any): RequestInput {
  return {
    title: values.title_block?.title?.value || "",
    description: values.description_block?.description?.value || undefined,
    category: values.category_block?.category?.selected_option?.value || "other",
    vendorName: values.vendor_block?.vendor_name?.value || undefined,
    amount: values.amount_block?.amount?.value || "0",
    frequency:
      values.frequency_block?.frequency?.selected_option?.value || "one-time",
    urgency:
      values.urgency_block?.urgency?.selected_option?.value || "normal",
  };
}
