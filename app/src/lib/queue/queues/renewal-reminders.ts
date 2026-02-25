/**
 * Renewal Reminders Queue
 * Schedules reminder emails at 120/90/60/30/14/7/3/1 days before notice deadline
 */

import { Queue } from "bullmq";
import { subDays, parseISO, differenceInMilliseconds } from "date-fns";
import { QueueName, redisConnection } from "../config";

export interface RenewalReminderJobData {
  renewalId: string;
  contractId: string | null;
  subscriptionId: string | null;
  vendorName: string;
  toolName: string;
  noticeDeadline: string; // ISO date string
  renewalDate: string; // ISO date string
  daysBeforeDeadline: number; // 120, 90, 60, 30, 14, 7, 3, 1
  reminderType: "checkpoint" | "escalation";
  ownerId?: string;
  stakeholderIds: string[];
  tenantId: string;
}

export const renewalRemindersQueue = new Queue<RenewalReminderJobData>(
  QueueName.RENEWAL_REMINDERS,
  {
    connection: redisConnection,
  }
);

/**
 * Schedule all reminder jobs for a renewal
 * Checkpoints: 120d, 90d, 60d, 30d (to owner + stakeholders)
 * Escalations: 14d, 7d, 3d, 1d (to finance + admin)
 */
export async function scheduleRenewalReminders(data: Omit<
  RenewalReminderJobData,
  "daysBeforeDeadline" | "reminderType"
>) {
  const deadline = parseISO(data.noticeDeadline);
  const today = new Date();

  // Define reminder schedule
  const reminderSchedule: Array<{
    days: number;
    type: "checkpoint" | "escalation";
  }> = [
    { days: 120, type: "checkpoint" },
    { days: 90, type: "checkpoint" },
    { days: 60, type: "checkpoint" },
    { days: 30, type: "checkpoint" },
    { days: 14, type: "escalation" },
    { days: 7, type: "escalation" },
    { days: 3, type: "escalation" },
    { days: 1, type: "escalation" },
  ];

  const scheduledJobs: string[] = [];

  for (const { days, type } of reminderSchedule) {
    const reminderDate = subDays(deadline, days);

    // Only schedule if reminder date is in the future
    if (reminderDate > today) {
      const delayMs = differenceInMilliseconds(reminderDate, today);

      const jobId = `renewal-${data.renewalId}-${days}d`;

      await renewalRemindersQueue.add(
        `renewal-reminder-${days}d`,
        {
          ...data,
          daysBeforeDeadline: days,
          reminderType: type,
        },
        {
          delay: delayMs,
          jobId,
          removeOnComplete: {
            count: 100, // Keep last 100 completed jobs
            age: 60 * 60 * 24 * 7, // 7 days
          },
          removeOnFail: false, // Keep failed jobs for debugging
        }
      );

      scheduledJobs.push(jobId);
    }
  }

  return scheduledJobs;
}

/**
 * Cancel all scheduled reminders for a renewal
 * Used when a decision is made before deadline
 */
export async function cancelRenewalReminders(renewalId: string) {
  const reminderDays = [120, 90, 60, 30, 14, 7, 3, 1];

  for (const days of reminderDays) {
    const jobId = `renewal-${renewalId}-${days}d`;

    try {
      const job = await renewalRemindersQueue.getJob(jobId);
      if (job) {
        await job.remove();
      }
    } catch (error) {
      console.error(`Failed to cancel reminder job ${jobId}:`, error);
    }
  }
}

/**
 * Reschedule reminders (e.g., if notice deadline changes)
 */
export async function rescheduleRenewalReminders(
  data: Omit<RenewalReminderJobData, "daysBeforeDeadline" | "reminderType">
) {
  // Cancel existing reminders
  await cancelRenewalReminders(data.renewalId);

  // Schedule new reminders with updated deadline
  return scheduleRenewalReminders(data);
}
