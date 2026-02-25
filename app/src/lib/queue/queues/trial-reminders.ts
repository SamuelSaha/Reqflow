/**
 * Trial Reminders Queue
 * Sends automated reminders at 7d, 3d, 1d before trial expiry
 */

import { Queue } from "bullmq";
import { defaultQueueOptions, QueueName } from "../config";
import { subDays, parseISO } from "date-fns";

export interface TrialReminderJobData {
  trialId: string;
  toolName: string;
  endDate: string; // ISO date string
  daysUntilExpiry: number; // 7, 3, or 1
  initiatedById: string;
  stakeholders: Array<{ userId: string; role: string }>;
  tenantId: string;
}

export const trialRemindersQueue = new Queue<TrialReminderJobData>(
  QueueName.TRIAL_REMINDERS,
  defaultQueueOptions
);

/**
 * Schedule all 3 reminder jobs for a trial (7d, 3d, 1d before expiry)
 */
export async function scheduleTrialReminders(data: Omit<TrialReminderJobData, "daysUntilExpiry">) {
  const endDate = parseISO(data.endDate);
  const today = new Date();

  // Calculate when each reminder should fire
  const reminderDays = [7, 3, 1];
  const jobs = [];

  for (const days of reminderDays) {
    const reminderDate = subDays(endDate, days);

    // Only schedule if reminder date is in the future
    if (reminderDate > today) {
      const delayMs = reminderDate.getTime() - today.getTime();

      const job = await trialRemindersQueue.add(
        `trial-reminder-${days}d`,
        { ...data, daysUntilExpiry: days },
        {
          delay: delayMs,
          jobId: `trial-${data.trialId}-${days}d`,
        }
      );

      jobs.push(job);
    }
  }

  return jobs;
}

/**
 * Cancel all scheduled reminders for a trial
 */
export async function cancelTrialReminders(trialId: string) {
  await Promise.all([
    trialRemindersQueue.remove(`trial-${trialId}-7d`).catch(() => {}),
    trialRemindersQueue.remove(`trial-${trialId}-3d`).catch(() => {}),
    trialRemindersQueue.remove(`trial-${trialId}-1d`).catch(() => {}),
  ]);
}

/**
 * Reschedule reminders when trial is extended
 */
export async function rescheduleTrialReminders(
  data: Omit<TrialReminderJobData, "daysUntilExpiry">
) {
  // Cancel old reminders
  await cancelTrialReminders(data.trialId);

  // Schedule new reminders with updated end date
  return scheduleTrialReminders(data);
}
