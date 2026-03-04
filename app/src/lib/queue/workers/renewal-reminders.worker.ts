/**
 * Renewal Reminders Worker
 * Processes renewal reminder jobs and sends emails to appropriate recipients
 */

import { Worker, Job } from "bullmq";
import { eq, and } from "drizzle-orm";
import { QueueName, defaultQueueOptions } from "../config";
import { workerDb as db } from "@/lib/db"; // Use worker pool for background jobs
import { renewalEvents, users } from "@/lib/db/schema";
import { emailQueue, EmailTemplate } from "../queues/email";
import type { RenewalReminderJobData } from "../queues/renewal-reminders";
import { logger } from "../../monitoring/logger";
import { monitorWorker } from "../../monitoring/worker";
import { env } from "@/lib/env";

async function processRenewalReminder(job: Job<RenewalReminderJobData>) {
  const {
    renewalId,
    vendorName,
    toolName,
    noticeDeadline,
    renewalDate,
    daysBeforeDeadline,
    reminderType,
    ownerId,
    stakeholderIds,
    tenantId,
  } = job.data;

  logger.info("Processing renewal reminder", {
    renewalId,
    reminderType,
    daysBeforeDeadline,
    toolName,
    jobId: job.id,
  });

  // Fetch renewal to check if still active
  const renewal = await db.query.renewalEvents.findFirst({
    where: and(
      eq(renewalEvents.id, renewalId),
      eq(renewalEvents.tenantId, tenantId)
    ),
  });

  if (!renewal) {
    logger.info("Renewal not found, skipping reminder", {
      renewalId,
      jobId: job.id,
    });
    return;
  }

  // Skip if decision already made
  if (renewal.status === "decided") {
    logger.info("Renewal already decided, skipping reminder", {
      renewalId,
      status: renewal.status,
      jobId: job.id,
    });
    return;
  }

  // Determine recipients based on reminder type
  let recipientIds: string[] = [];

  if (reminderType === "checkpoint") {
    // Send to owner + stakeholders
    if (ownerId) {
      recipientIds.push(ownerId);
    }
    recipientIds.push(...stakeholderIds);
  } else {
    // Escalation: Send to finance + admin roles
    const financeAdminUsers = await db.query.users.findMany({
      where: and(
        eq(users.tenantId, tenantId),
        eq(users.isActive, true)
      ),
    });

    recipientIds = financeAdminUsers
      .filter((u) => u.role === "finance" || u.role === "admin")
      .map((u) => u.id);
  }

  // Remove duplicates
  recipientIds = Array.from(new Set(recipientIds));

  if (recipientIds.length === 0) {
    logger.warn("No recipients found for renewal reminder", {
      renewalId,
      reminderType,
      jobId: job.id,
    });
    return;
  }

  // Fetch recipient details
  const recipients = await db.query.users.findMany({
    where: and(
      eq(users.tenantId, tenantId),
      eq(users.isActive, true)
    ),
  });

  const recipientEmails = recipients
    .filter((u) => recipientIds.includes(u.id))
    .map((u) => u.email);

  // Get readiness score
  const readiness = renewal.readinessScore as Record<string, number> | null;
  const totalScore = readiness?.totalScore ?? 0;

  // Send emails
  for (const email of recipientEmails) {
    const subject =
      reminderType === "checkpoint"
        ? `Renewal Checkpoint: ${toolName} (${daysBeforeDeadline} days until deadline)`
        : `URGENT: Renewal Decision Required - ${toolName} (${daysBeforeDeadline} days left)`;

    await emailQueue.add(`renewal-reminder-${reminderType}`, {
      to: email,
      subject,
      template:
        reminderType === "checkpoint"
          ? EmailTemplate.RENEWAL_CHECKPOINT
          : EmailTemplate.RENEWAL_ESCALATION,
      data: {
        vendorName,
        toolName,
        noticeDeadline,
        renewalDate,
        daysBeforeDeadline,
        readinessScore: totalScore,
        renewalUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/renewals/${renewalId}`,
      },
    });
  }

  // Update renewal reminders tracking
  const reminders = (renewal.reminders as Record<string, unknown>[]) || [];
  reminders.push({
    daysBeforeDeadline,
    type: reminderType,
    scheduledFor: noticeDeadline,
    sentAt: new Date().toISOString(),
    jobId: job.id,
  });

  await db
    .update(renewalEvents)
    .set({
      reminders: reminders as unknown as typeof renewal.reminders,
      updatedAt: new Date(),
    })
    .where(eq(renewalEvents.id, renewalId));

  logger.info("Renewal reminder sent successfully", {
    renewalId,
    reminderType,
    recipientCount: recipientEmails.length,
    toolName,
    daysBeforeDeadline,
    jobId: job.id,
  });
}

export function startRenewalRemindersWorker() {
  const worker = new Worker<RenewalReminderJobData>(
    QueueName.RENEWAL_REMINDERS,
    processRenewalReminder,
    defaultQueueOptions
  );

  // Attach monitoring
  monitorWorker(worker, QueueName.RENEWAL_REMINDERS);

  logger.info("Renewal reminders worker started", {
    queue: QueueName.RENEWAL_REMINDERS,
  });

  return worker;
}
