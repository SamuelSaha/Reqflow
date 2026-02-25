/**
 * Email Worker
 * Processes email jobs from the queue
 */

import { Worker, Job } from "bullmq";
import { Resend } from "resend";
import { defaultQueueOptions, QueueName } from "../config";
import type { EmailJobData } from "../queues/email";
import { env } from "../../env";
import { renderEmailTemplate } from "../../emails/render";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Process email job
 */
async function processEmail(job: Job<EmailJobData>) {
  const { to, subject, template, data } = job.data;

  try {
    // Render React Email template to HTML
    const html = await renderEmailTemplate(template, data);

    // Send via Resend
    const result = await resend.emails.send({
      from: "Reqflow <notifications@reqflow.com>",
      to,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`);
    }

    console.log(`✅ Email sent: ${result.data?.id} (${template} to ${to})`);
    return result;
  } catch (error) {
    console.error(`❌ Email failed (${template} to ${to}):`, error);
    throw error; // Will trigger retry
  }
}

/**
 * Create and start email worker
 */
export function startEmailWorker() {
  const worker = new Worker<EmailJobData>(
    QueueName.EMAIL,
    processEmail,
    defaultQueueOptions
  );

  worker.on("completed", (job) => {
    console.log(`✅ Email job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Email job ${job?.id} failed:`, err);
  });

  return worker;
}
