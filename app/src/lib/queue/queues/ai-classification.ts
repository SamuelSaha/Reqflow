/**
 * AI Classification Queue
 * Handles request categorization and duplicate detection
 */

import { Queue } from "bullmq";
import { defaultQueueOptions, QueueName } from "../config";

export interface AIClassificationJobData {
  requestId: string;
  tenantId: string;
  text: string; // Title + description
  tasks: Array<"category" | "duplicates" | "risk_flags">;
}

export const aiClassificationQueue = new Queue<AIClassificationJobData>(
  QueueName.AI_CLASSIFICATION,
  defaultQueueOptions
);

/**
 * Queue AI classification
 */
export async function queueClassification(data: AIClassificationJobData) {
  return aiClassificationQueue.add("classify", data, {
    priority: 2, // Higher priority than sync
  });
}
