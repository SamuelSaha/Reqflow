/**
 * AI Classification Worker
 * Processes background AI classification jobs: category tagging,
 * duplicate detection, and risk flag generation for purchase requests.
 */

import { Worker, Job } from "bullmq";
import Anthropic from "@anthropic-ai/sdk";
import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { requests, organizations } from "../../db/schema";
import { defaultQueueOptions, QueueName } from "../config";
import type { AIClassificationJobData } from "../queues/ai-classification";
import { decryptField, isFieldEncrypted } from "../../security/field-encryption";
import { analyzeRequest } from "../../ai/request-analyzer";
import { env } from "../../env";
import { logger } from "../../monitoring/logger";
import { monitorWorker } from "../../monitoring/worker";

/* ------------------------------------------------------------------ */
/*  Provider helpers                                                    */
/* ------------------------------------------------------------------ */

async function getApiKey(tenantId: string): Promise<string | null> {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, tenantId),
    columns: { aiProvider: true, aiApiKey: true, anthropicApiKey: true },
  });

  if (org?.aiApiKey && isFieldEncrypted(org.aiApiKey)) {
    try { return decryptField(org.aiApiKey); } catch { /* fall through */ }
  }
  if (org?.anthropicApiKey && isFieldEncrypted(org.anthropicApiKey)) {
    try { return decryptField(org.anthropicApiKey); } catch { /* fall through */ }
  }

  return env.ANTHROPIC_API_KEY ?? null;
}

/* ------------------------------------------------------------------ */
/*  Category classification via Claude                                  */
/* ------------------------------------------------------------------ */

const CATEGORIES = ["saas", "services", "office", "travel", "hardware", "other"] as const;
type Category = typeof CATEGORIES[number];

async function classifyCategory(
  text: string,
  apiKey: string
): Promise<{ category: Category; confidence: number }> {
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 64,
    messages: [
      {
        role: "user",
        content: `Classify this purchase request into exactly one category. Respond with JSON only.

Categories: saas, services, office, travel, hardware, other

Request: "${text}"

Respond: {"category": "<category>", "confidence": <0.0-1.0>}`,
      },
    ],
  });

  const raw = message.content[0];
  if (raw.type !== "text") throw new Error("Unexpected response type");

  const match = raw.text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");

  const parsed = JSON.parse(match[0]) as { category: string; confidence: number };
  const category = CATEGORIES.includes(parsed.category as Category)
    ? (parsed.category as Category)
    : "other";

  return { category, confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)) };
}

/* ------------------------------------------------------------------ */
/*  Job processor                                                       */
/* ------------------------------------------------------------------ */

async function processAiClassification(job: Job<AIClassificationJobData>) {
  const { requestId, tenantId, text, tasks } = job.data;

  logger.info("AI classification started", { requestId, tasks, jobId: job.id });

  const updates: Partial<{
    aiCategory: string;
    aiCategoryConfidence: string;
    duplicateCheckPerformed: boolean;
    potentialDuplicates: string[];
  }> = {};

  // 1. Category classification — calls Claude
  if (tasks.includes("category")) {
    const apiKey = await getApiKey(tenantId);
    if (apiKey) {
      try {
        const { category, confidence } = await classifyCategory(text, apiKey);
        updates.aiCategory = category;
        updates.aiCategoryConfidence = confidence.toFixed(2);
        logger.info("Category classified", { requestId, category, confidence });
      } catch (err) {
        // Non-fatal — log and continue with other tasks
        logger.error("Category classification failed", err, { requestId });
      }
    } else {
      logger.info("No API key configured for category classification", { tenantId });
    }
  }

  // 2. Duplicate detection — rule-based (no API key required)
  if (tasks.includes("duplicates")) {
    try {
      const analysis = await analyzeRequest(tenantId, requestId);
      updates.duplicateCheckPerformed = true;
      if (analysis.similarRequests.length > 0) {
        updates.potentialDuplicates = analysis.similarRequests.map((r) => r.id);
      }
      logger.info("Duplicate check complete", {
        requestId,
        duplicatesFound: analysis.similarRequests.length,
      });
    } catch (err) {
      logger.error("Duplicate detection failed", err, { requestId });
      updates.duplicateCheckPerformed = false;
    }
  }

  // 3. Persist updates (only if we have something to write)
  if (Object.keys(updates).length > 0) {
    await db
      .update(requests)
      .set(updates)
      .where(and(eq(requests.id, requestId), eq(requests.tenantId, tenantId)));
  }

  logger.info("AI classification complete", { requestId, updates: Object.keys(updates) });
  return updates;
}

/* ------------------------------------------------------------------ */
/*  Worker factory                                                      */
/* ------------------------------------------------------------------ */

export function startAiClassificationWorker() {
  const worker = new Worker<AIClassificationJobData>(
    QueueName.AI_CLASSIFICATION,
    processAiClassification,
    {
      ...defaultQueueOptions,
      concurrency: 5, // Claude Haiku handles high concurrency cheaply
    }
  );

  monitorWorker(worker, QueueName.AI_CLASSIFICATION);

  return worker;
}
