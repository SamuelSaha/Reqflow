/**
 * Trial Reminders Worker
 * Sends automated reminders before trial expiry
 */

import { Worker, Job } from "bullmq";
import { defaultQueueOptions, QueueName } from "../config";
import type { TrialReminderJobData } from "../queues/trial-reminders";
import { sendEmail, EmailTemplate } from "../queues/email";
import { sql, eq } from "drizzle-orm";
import { logger } from "../../monitoring/logger";
import { monitorWorker } from "../../monitoring/worker";
import { env } from "../../env";

/**
 * Process trial reminder job
 */
async function processTrialReminder(job: Job<TrialReminderJobData>) {
  const {
    trialId,
    toolName,
    daysUntilExpiry,
    endDate,
    initiatedById,
    stakeholders,
  } = job.data;

  // Check if trial is still active
  const { db } = await import("../../db");
  const { trials, users } = await import("../../db/schema");

  const trial = await db.query.trials.findFirst({
    where: eq(trials.id, trialId),
  });

  if (!trial || (trial.status !== "active" && trial.status !== "extended")) {
    logger.info("Trial no longer active, skipping reminder", {
      trialId,
      status: trial?.status,
      jobId: job.id,
    });
    return;
  }

  // Get initiator details
  const initiator = await db.query.users.findFirst({
    where: eq(users.id, initiatedById),
  });

  if (!initiator) {
    logger.error("Trial initiator not found", new Error("Initiator not found"), {
      initiatedById,
      trialId,
      jobId: job.id,
    });
    return;
  }

  // Build recipient list: initiator + stakeholders
  const stakeholderIds = stakeholders.map((s) => s.userId);
  const recipientEmails = [initiator.email];

  if (stakeholderIds.length > 0) {
    const stakeholderUsers = await db.query.users.findMany({
      where: sql`${users.id} = ANY(${stakeholderIds})`,
    });
    recipientEmails.push(...stakeholderUsers.map((u) => u.email));
  }

  // Send reminder emails
  for (const email of recipientEmails) {
    await sendEmail({
      to: email,
      subject:
        daysUntilExpiry === 1
          ? `Trial expiring tomorrow: ${toolName}`
          : `Trial expiring in ${daysUntilExpiry} days: ${toolName}`,
      template: EmailTemplate.TRIAL_REMINDER,
      data: {
        toolName,
        daysUntilExpiry,
        endDate,
        trialUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/trials/${trialId}`,
      },
    });
  }

  // Update remindersSent field in trial record
  await db
    .update(trials)
    .set({
      remindersSent: sql`
        coalesce(${trials.remindersSent}, '[]'::jsonb) ||
        ${JSON.stringify({
          date: new Date().toISOString(),
          type: `${daysUntilExpiry}d`,
        })}::jsonb
      `,
      updatedAt: new Date(),
    })
    .where(eq(trials.id, trialId));

  logger.info("Trial reminder sent successfully", {
    trialId,
    toolName,
    daysUntilExpiry,
    recipientCount: recipientEmails.length,
    jobId: job.id,
  });
}

/**
 * Create and start trial reminders worker
 */
export function startTrialRemindersWorker() {
  const worker = new Worker<TrialReminderJobData>(
    QueueName.TRIAL_REMINDERS,
    processTrialReminder,
    defaultQueueOptions
  );

  // Attach monitoring
  monitorWorker(worker, QueueName.TRIAL_REMINDERS);

  return worker;
}
