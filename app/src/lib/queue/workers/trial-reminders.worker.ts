/**
 * Trial Reminders Worker
 * Sends automated reminders before trial expiry
 */

import { Worker, Job } from "bullmq";
import { defaultQueueOptions, QueueName } from "../config";
import type { TrialReminderJobData } from "../queues/trial-reminders";
import { sendEmail, EmailTemplate } from "../queues/email";
import { sql, eq } from "drizzle-orm";

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
    tenantId,
  } = job.data;

  // Check if trial is still active
  const { db } = await import("../../db");
  const { trials, users } = await import("../../db/schema");

  const trial = await db.query.trials.findFirst({
    where: eq(trials.id, trialId),
  });

  if (!trial || (trial.status !== "active" && trial.status !== "extended")) {
    console.log(`Trial ${trialId} no longer active, skipping reminder`);
    return;
  }

  // Get initiator details
  const initiator = await db.query.users.findFirst({
    where: eq(users.id, initiatedById),
  });

  if (!initiator) {
    console.error(`Initiator ${initiatedById} not found for trial ${trialId}`);
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
        trialUrl: `${process.env.APP_URL}/dashboard/trials/${trialId}`,
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

  console.log(
    `📧 Sent ${daysUntilExpiry}d reminder for trial ${trialId} to ${recipientEmails.length} recipients`
  );
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

  worker.on("completed", (job) => {
    console.log(`✅ Trial reminder ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Trial reminder ${job?.id} failed:`, err);
  });

  return worker;
}
