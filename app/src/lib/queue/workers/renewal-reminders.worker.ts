/**
 * Renewal Reminders Worker
 * Processes renewal reminder jobs and sends emails to appropriate recipients
 */

import { Worker, Job } from "bullmq";
import { eq, and } from "drizzle-orm";
import { QueueName, defaultQueueOptions } from "../config";
import { db } from "@/lib/db";
import { renewalEvents, users } from "@/lib/db/schema";
import { emailQueue, EmailTemplate } from "../queues/email";
import type { RenewalReminderJobData } from "../queues/renewal-reminders";

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

  console.log(
    `[RenewalReminders] Processing ${reminderType} reminder for renewal ${renewalId} (${daysBeforeDeadline}d before deadline)`
  );

  // Fetch renewal to check if still active
  const renewal = await db.query.renewalEvents.findFirst({
    where: and(
      eq(renewalEvents.id, renewalId),
      eq(renewalEvents.tenantId, tenantId)
    ),
  });

  if (!renewal) {
    console.log(`[RenewalReminders] Renewal ${renewalId} not found, skipping`);
    return;
  }

  // Skip if decision already made
  if (renewal.status === "decided") {
    console.log(
      `[RenewalReminders] Renewal ${renewalId} already decided, skipping`
    );
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
    console.warn(
      `[RenewalReminders] No recipients found for renewal ${renewalId}`
    );
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
        renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/renewals/${renewalId}`,
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

  console.log(
    `[RenewalReminders] Sent ${reminderType} reminder to ${recipientEmails.length} recipients for renewal ${renewalId}`
  );
}

export function startRenewalRemindersWorker() {
  const worker = new Worker<RenewalReminderJobData>(
    QueueName.RENEWAL_REMINDERS,
    processRenewalReminder,
    defaultQueueOptions
  );

  worker.on("completed", (job) => {
    console.log(`[RenewalReminders] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[RenewalReminders] Job ${job?.id} failed:`,
      err.message
    );
  });

  worker.on("error", (err) => {
    console.error("[RenewalReminders] Worker error:", err);
  });

  console.log("[RenewalReminders] Worker started");

  return worker;
}
