/**
 * Email Queue
 * Handles all transactional emails via Resend
 */

import { Queue } from "bullmq";
import { defaultQueueOptions, QueueName } from "../config";

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
  priority?: number;
}

export const emailQueue = new Queue<EmailJobData>(
  QueueName.EMAIL,
  defaultQueueOptions
);

/**
 * Add email to queue
 */
export async function sendEmail(data: EmailJobData) {
  return emailQueue.add("send-email", data, {
    priority: data.priority || 1,
  });
}

/**
 * Email templates
 */
export const EmailTemplate = {
  // Request notifications
  REQUEST_SUBMITTED: "request-submitted",

  // Approval notifications
  APPROVAL_REQUESTED: "approval-requested",
  APPROVAL_REMINDER: "approval-reminder",
  REQUEST_APPROVED: "request-approved",
  REQUEST_REJECTED: "request-rejected",

  // Budget alerts
  BUDGET_WARNING: "budget-warning",
  BUDGET_EXCEEDED: "budget-exceeded",

  // Authentication
  VERIFY_EMAIL: "verify-email",
  PASSWORD_RESET: "password-reset",
  MFA_ENABLED: "mfa-enabled",

  // Team invites
  TEAM_INVITE: "team-invite",

  // Trial reminders
  TRIAL_REMINDER: "trial-reminder",

  // Renewal reminders
  RENEWAL_CHECKPOINT: "renewal-checkpoint",
  RENEWAL_ESCALATION: "renewal-escalation",
} as const;
