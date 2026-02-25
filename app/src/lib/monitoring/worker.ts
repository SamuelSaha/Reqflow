/**
 * BullMQ Worker Monitoring
 * Attaches logging and error tracking to queue workers
 */

import type { Worker, Job } from "bullmq";
import { logger } from "./logger";
import { captureError } from "./sentry";

/**
 * Attach monitoring to BullMQ worker
 */
export function monitorWorker<T>(worker: Worker<T>, queueName: string) {
  worker.on("completed", (job: Job<T>) => {
    logger.info("Job completed", {
      queue: queueName,
      jobId: job.id,
      jobName: job.name,
      duration: job.processedOn ? Date.now() - job.processedOn : undefined,
    });
  });

  worker.on("failed", (job: Job<T> | undefined, err: Error) => {
    logger.error("Job failed", err, {
      queue: queueName,
      jobId: job?.id,
      jobName: job?.name,
      attemptsMade: job?.attemptsMade,
      failedReason: err.message,
    });

    captureError(err, {
      queue: queueName,
      jobId: job?.id,
      jobData: job?.data,
    });
  });

  worker.on("error", (err: Error) => {
    logger.error("Worker error", err, { queue: queueName });
    captureError(err, { queue: queueName });
  });

  worker.on("stalled", (jobId: string) => {
    logger.warn("Job stalled", {
      queue: queueName,
      jobId,
    });
  });

  logger.info("Worker monitoring attached", { queue: queueName });
}
