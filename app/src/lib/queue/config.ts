/**
 * BullMQ Configuration
 * Background job processing with Redis
 */

import { Queue, Worker, QueueEvents } from "bullmq";
import { env } from "../env";

/**
 * Redis connection options
 * BullMQ creates its own connection from this config
 */
export const redisConnection = {
  host: new URL(env.REDIS_URL).hostname,
  port: parseInt(new URL(env.REDIS_URL).port || "6379"),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

/**
 * Default queue options
 */
export const defaultQueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential" as const,
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs for debugging
    },
  },
};

/**
 * Queue names
 */
export const QueueName = {
  EMAIL: "email",
  APPROVAL_TIMERS: "approval-timers",
  SYNC: "sync",
  AI_CLASSIFICATION: "ai-classification",
} as const;

export type QueueName = (typeof QueueName)[keyof typeof QueueName];
