/**
 * Approval Timers Queue
 * Handles escalation and reminder timers for pending approvals
 */

import { Queue } from "bullmq";
import { defaultQueueOptions, QueueName } from "../config";

export interface ApprovalTimerJobData {
  approvalId: string;
  requestId: string;
  approverId: string;
  type: "reminder" | "escalate";
  tenantId: string;
}

export const approvalTimersQueue = new Queue<ApprovalTimerJobData>(
  QueueName.APPROVAL_TIMERS,
  defaultQueueOptions
);

/**
 * Schedule reminder for pending approval
 */
export async function scheduleApprovalReminder(
  data: Omit<ApprovalTimerJobData, "type">,
  delayHours: number = 24
) {
  return approvalTimersQueue.add(
    "approval-reminder",
    { ...data, type: "reminder" },
    {
      delay: delayHours * 60 * 60 * 1000, // Convert hours to milliseconds
      jobId: `reminder-${data.approvalId}`, // Prevent duplicates
    }
  );
}

/**
 * Schedule escalation for stalled approval
 */
export async function scheduleApprovalEscalation(
  data: Omit<ApprovalTimerJobData, "type">,
  delayHours: number = 48
) {
  return approvalTimersQueue.add(
    "approval-escalate",
    { ...data, type: "escalate" },
    {
      delay: delayHours * 60 * 60 * 1000,
      jobId: `escalate-${data.approvalId}`,
    }
  );
}

/**
 * Cancel scheduled timers for an approval
 */
export async function cancelApprovalTimers(approvalId: string) {
  // Remove both reminder and escalation jobs
  await Promise.all([
    approvalTimersQueue.remove(`reminder-${approvalId}`),
    approvalTimersQueue.remove(`escalate-${approvalId}`),
  ]);
}
