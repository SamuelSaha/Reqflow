/**
 * Sync Worker
 * Processes accounting integration sync jobs
 */

import { Worker, Job } from "bullmq";
import { defaultQueueOptions, QueueName } from "../config";
import type { SyncJobData } from "../queues/sync";
import { logger } from "../../monitoring/logger";
import { monitorWorker } from "../../monitoring/worker";
import { workerDb as db } from "../../db"; // Use worker pool for background jobs
import { requests, accountingSyncLogs } from "../../db/schema";
import { eq } from "drizzle-orm";
import * as quickbooksService from "../../integrations/quickbooks.service";
import * as xeroService from "../../integrations/xero.service";

/**
 * Process sync job
 */
async function processSync(job: Job<SyncJobData>) {
  const { tenantId, provider, entity, entityId, action, data } = job.data;

  logger.info("Processing sync job", {
    jobId: job.id,
    tenantId,
    provider,
    entity,
    entityId,
    action,
  });

  // Currently only support purchase order creation
  if (entity !== "purchase_order" || action !== "create") {
    throw new Error(
      `Unsupported sync operation: ${entity} ${action}. Only purchase_order create is supported.`
    );
  }

  // Get request data
  const request = await db.query.requests.findFirst({
    where: eq(requests.id, entityId),
    with: {
      requester: true,
      department: true,
    },
  });

  if (!request) {
    throw new Error(`Request ${entityId} not found`);
  }

  // Ensure request is approved
  if (request.status !== "approved") {
    throw new Error(
      `Request ${request.requestNumber} is not approved (status: ${request.status})`
    );
  }

  // Prepare purchase order data
  const poData = {
    vendorName: request.vendorName || "Unknown Vendor",
    description: request.title,
    amount: request.amount,
    currency: request.currency,
    quantity: request.quantity || 1,
    requestNumber: request.requestNumber,
    requesterEmail: request.requester.email,
    departmentName: request.department.name,
  };

  try {
    let result: { poId: string; poNumber: string };

    // Call the appropriate service
    if (provider === "quickbooks") {
      result = await quickbooksService.createPurchaseOrder(tenantId, poData);
    } else if (provider === "xero") {
      result = await xeroService.createPurchaseOrder(tenantId, poData);
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }

    // Update request with sync success
    await db
      .update(requests)
      .set({
        syncedToAccounting: true,
        accountingSyncRef: result.poNumber,
        accountingSyncProvider: provider,
        accountingSyncError: null,
        lastSyncAttempt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requests.id, entityId));

    // Log sync success
    await db.insert(accountingSyncLogs).values({
      tenantId,
      entityType: "request",
      entityId,
      provider,
      action: "create_purchase_order",
      success: true,
      providerReference: result.poId,
      syncedAt: new Date(),
      responsePayload: {
        poId: result.poId,
        poNumber: result.poNumber,
        requestNumber: request.requestNumber,
      },
    });

    logger.info("Sync completed successfully", {
      jobId: job.id,
      provider,
      poId: result.poId,
      poNumber: result.poNumber,
      requestNumber: request.requestNumber,
    });

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Update request with sync error
    await db
      .update(requests)
      .set({
        accountingSyncError: errorMessage,
        lastSyncAttempt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requests.id, entityId));

    // Log sync failure
    await db.insert(accountingSyncLogs).values({
      tenantId,
      entityType: "request",
      entityId,
      provider,
      action: "create_purchase_order",
      success: false,
      errorMessage,
      syncedAt: new Date(),
      requestPayload: {
        requestNumber: request.requestNumber,
        vendorName: poData.vendorName,
        amount: poData.amount,
      },
    });

    logger.error("Sync failed", error as Error, {
      jobId: job.id,
      provider,
      requestNumber: request.requestNumber,
    });

    throw error; // Will trigger retry
  }
}

/**
 * Create and start sync worker
 */
export function startSyncWorker() {
  const worker = new Worker<SyncJobData>(
    QueueName.SYNC,
    processSync,
    defaultQueueOptions
  );

  // Attach monitoring
  monitorWorker(worker, QueueName.SYNC);

  return worker;
}
