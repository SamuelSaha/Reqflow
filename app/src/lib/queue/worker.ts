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

console.log("🚀 Starting Reqflow workers...");

// Start all workers
const workers = [
  startEmailWorker(),
  startApprovalTimersWorker(),
  startTrialRemindersWorker(),
  startRenewalRemindersWorker(),
  // Add more workers as needed
];

console.log(`✅ Started ${workers.length} workers`);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("📴 Shutting down workers...");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
});
