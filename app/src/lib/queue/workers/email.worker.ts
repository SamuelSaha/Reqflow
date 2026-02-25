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
import { logger } from "../../monitoring/logger";
import { monitorWorker } from "../../monitoring/worker";

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

    logger.info("Email sent successfully", {
      emailId: result.data?.id,
      template,
      recipient: to,
      jobId: job.id,
    });
    return result;
  } catch (error) {
    logger.error("Email send failed", error, {
      template,
      recipient: to,
      jobId: job.id,
    });
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

  // Attach monitoring
  monitorWorker(worker, QueueName.EMAIL);

  return worker;
}
