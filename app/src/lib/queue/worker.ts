/**
 * Worker Entry Point
 * Starts all BullMQ workers
 *
 * This file is used by the worker Docker container
 */

import { startEmailWorker } from "./workers/email.worker";
import { startApprovalTimersWorker } from "./workers/approval-timers.worker";
import { startTrialRemindersWorker } from "./workers/trial-reminders.worker";
import { startRenewalRemindersWorker } from "./workers/renewal-reminders.worker";
import { startSyncWorker } from "./workers/sync.worker";
import { startAiClassificationWorker } from "./workers/ai-classification.worker";
import { logger } from "../monitoring/logger";

logger.info("Starting Reqflow workers");

// Start all workers
const workers = [
  startEmailWorker(),
  startApprovalTimersWorker(),
  startTrialRemindersWorker(),
  startRenewalRemindersWorker(),
  startSyncWorker(),
  startAiClassificationWorker(),
];

logger.info("All workers started successfully", {
  workerCount: workers.length,
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("Graceful shutdown initiated");
  await Promise.all(workers.map((w) => w.close()));
  logger.info("All workers closed successfully");
  process.exit(0);
});
