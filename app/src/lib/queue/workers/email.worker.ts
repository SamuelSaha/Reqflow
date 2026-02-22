/**
 * Email Worker
 * Processes email jobs from the queue
 */

import { Worker, Job } from "bullmq";
import { Resend } from "resend";
import { defaultQueueOptions, QueueName } from "../config";
import type { EmailJobData } from "../queues/email";
import { env } from "../../env";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Process email job
 */
async function processEmail(job: Job<EmailJobData>) {
  const { to, subject, template, data } = job.data;

  try {
    // TODO: Implement email templates
    // For now, send a simple email
    const result = await resend.emails.send({
      from: "Reqflow <notifications@reqflow.com>",
      to,
      subject,
      html: `<div>
        <h1>${subject}</h1>
        <p>Template: ${template}</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>`,
    });

    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`);
    }

    console.log("Email sent:", result.data?.id);
    return result;
  } catch (error) {
    console.error("Email failed:", error);
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
