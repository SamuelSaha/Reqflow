/**
 * Approval Timers Worker
 * Processes reminder and escalation jobs
 */

import { Worker, Job } from "bullmq";
import { defaultQueueOptions, QueueName } from "../config";
import type { ApprovalTimerJobData } from "../queues/approval-timers";
import { sendEmail, EmailTemplate } from "../queues/email";

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
    console.log(`Approval ${approvalId} already resolved, skipping timer`);
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

    console.log(`📧 Sent reminder for approval ${approvalId}`);
  } else if (type === "escalate") {
    // TODO: Implement escalation logic
    // Find backup approver or escalate to admin
    console.log(`⚠️ Escalating approval ${approvalId}`);
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

  worker.on("completed", (job) => {
    console.log(`✅ Approval timer ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Approval timer ${job?.id} failed:`, err);
  });

  return worker;
}
