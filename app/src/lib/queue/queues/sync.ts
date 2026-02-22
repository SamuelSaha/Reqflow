/**
 * Sync Queue
 * Handles accounting system integrations (QuickBooks, Xero)
 */

import { Queue } from "bullmq";
import { defaultQueueOptions, QueueName } from "../config";

export interface SyncJobData {
  tenantId: string;
  provider: "quickbooks" | "xero";
  entity: "purchase_order" | "invoice" | "payment";
  entityId: string;
  action: "create" | "update" | "delete";
  data: Record<string, unknown>;
}

export const syncQueue = new Queue<SyncJobData>(
  QueueName.SYNC,
  defaultQueueOptions
);

/**
 * Queue sync operation
 */
export async function queueSync(data: SyncJobData) {
  return syncQueue.add("sync", data, {
    attempts: 5, // More retries for sync operations
    backoff: {
      type: "exponential",
      delay: 5000, // Start with 5 second delay
    },
  });
}

/**
 * Queue batch sync
 */
export async function queueBatchSync(items: SyncJobData[]) {
  const jobs = items.map((data, index) => ({
    name: `sync-${index}`,
    data,
  }));

  return syncQueue.addBulk(jobs);
}
