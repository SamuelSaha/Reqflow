/**
 * Approval Timers Worker
 * Processes reminder and escalation jobs
 */

import { Worker, Job } from "bullmq";
import { defaultQueueOptions, QueueName } from "../config";
import type { ApprovalTimerJobData } from "../queues/approval-timers";
import { sendEmail, EmailTemplate } from "../queues/email";
import { logger } from "../../monitoring/logger";
import { monitorWorker } from "../../monitoring/worker";

/**
 * Process approval timer job
 */
async function processApprovalTimer(job: Job<ApprovalTimerJobData>) {
  const { approvalId, type } = job.data;

  // Check if approval is still pending
  const { db } = await import("../../db");
  const { approvals } = await import("../../db/schema");
  const { eq } = await import("drizzle-orm");

  const approval = await db.query.approvals.findFirst({
    where: eq(approvals.id, approvalId),
    with: {
      request: true,
      approver: true,
    },
  });

  if (!approval || approval.decision !== "pending") {
    logger.info("Approval already resolved, skipping timer", {
      approvalId,
      decision: approval?.decision,
      jobId: job.id,
    });
    return;
  }

  if (type === "reminder") {
    // Send reminder email
    await sendEmail({
      to: approval.approver.email,
      subject: `Reminder: Approval needed for ${approval.request.title}`,
      template: EmailTemplate.APPROVAL_REMINDER,
      data: {
        approverName: approval.approver.name,
        requestTitle: approval.request.title,
        requestNumber: approval.request.requestNumber,
        amount: approval.request.amount,
      },
    });

    // Update reminder sent timestamp
    await db
      .update(approvals)
      .set({ reminderSentAt: new Date() })
      .where(eq(approvals.id, approvalId));

    logger.info("Approval reminder sent successfully", {
      approvalId,
      requestTitle: approval.request.title,
      approverEmail: approval.approver.email,
      jobId: job.id,
    });
  } else if (type === "escalate") {
    // TODO: Implement escalation logic
    // Find backup approver or escalate to admin
    logger.warn("Approval escalation triggered", {
      approvalId,
      requestTitle: approval.request.title,
      approverEmail: approval.approver.email,
      jobId: job.id,
    });
  }
}

/**
 * Create and start approval timers worker
 */
export function startApprovalTimersWorker() {
  const worker = new Worker<ApprovalTimerJobData>(
    QueueName.APPROVAL_TIMERS,
    processApprovalTimer,
    defaultQueueOptions
  );

  // Attach monitoring
  monitorWorker(worker, QueueName.APPROVAL_TIMERS);

  return worker;
}
