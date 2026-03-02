/**
 * Unified Notification Service
 * Single interface for multi-channel notifications with retry, batching, and templates
 */

import { logger } from "@/lib/monitoring/logger";
import type {
  Notifier,
  NotificationPayload,
  NotificationResult,
  NotificationOptions,
  NotificationChannel,
  DeliveryResult,
  NotificationTemplate,
  TemplateContext,
} from "./types";
import {
  slackNotifier,
  discordNotifier,
  telegramNotifier,
  emailNotifier,
  inAppNotifier,
} from "./channels";

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS: Required<NotificationOptions> = {
  channels: ["in-app", "email"],
  priority: "normal",
  skipIfNotConfigured: true,
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 10000,
  idempotencyKey: "",
};

// ============================================================================
// CHANNEL REGISTRY
// ============================================================================

const channelRegistry: Record<NotificationChannel, Notifier> = {
  slack: slackNotifier,
  discord: discordNotifier,
  telegram: telegramNotifier,
  email: emailNotifier,
  "in-app": inAppNotifier,
};

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

class NotificationService {
  private templates: Map<string, NotificationTemplate> = new Map();
  private pendingRetries: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a custom notification template
   */
  registerTemplate(template: NotificationTemplate): void {
    this.templates.set(template.type, template);
  }

  /**
   * Get a registered notifier by channel
   */
  getNotifier(channel: NotificationChannel): Notifier | undefined {
    return channelRegistry[channel];
  }

  /**
   * Check which channels are configured
   */
  getConfiguredChannels(): NotificationChannel[] {
    const configured: NotificationChannel[] = [];
    for (const [channel, notifier] of Object.entries(channelRegistry) as [NotificationChannel, Notifier][]) {
      if (notifier.isConfigured()) {
        configured.push(channel);
      }
    }
    return configured;
  }

  /**
   * Send a notification to one or more channels
   */
  async notify(
    payload: NotificationPayload,
    options?: NotificationOptions
  ): Promise<NotificationResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const appliedPayload = this.applyTemplate(payload);

    const results: DeliveryResult[] = [];
    const delivered: NotificationChannel[] = [];
    const failed: Array<{ channel: NotificationChannel; error: string }> = [];

    const channelsToUse = opts.channels.filter((ch) => {
      const notifier = channelRegistry[ch];
      if (!notifier) {
        logger.warn(`Unknown notification channel: ${ch}`);
        return false;
      }
      if (!notifier.isConfigured() && !opts.skipIfNotConfigured) {
        failed.push({ channel: ch, error: "Not configured" });
        return false;
      }
      return notifier.isConfigured();
    });

    if (channelsToUse.length === 0) {
      return {
        success: false,
        results: [],
        delivered: [],
        failed,
      };
    }

    const sendPromises = channelsToUse.map(async (channel) => {
      const notifier = channelRegistry[channel]!;

      try {
        const result = await this.sendWithRetry(notifier, appliedPayload, opts);
        results.push(result);

        if (result.status === "sent" || result.status === "delivered") {
          delivered.push(channel);
        } else {
          failed.push({ channel, error: result.error || "Unknown error" });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({
          channel,
          status: "failed",
          timestamp: new Date(),
          error: errorMessage,
        });
        failed.push({ channel, error: errorMessage });
      }
    });

    await Promise.allSettled(sendPromises);

    const success = delivered.length > 0;

    if (!success) {
      logger.warn("All notification channels failed", {
        type: payload.type,
        attemptedChannels: channelsToUse,
        failedChannels: failed.map((f) => f.channel),
      });
    }

    return { success, results, delivered, failed };
  }

  /**
   * Send to a single channel
   */
  async sendTo(
    channel: NotificationChannel,
    payload: NotificationPayload,
    options?: NotificationOptions
  ): Promise<DeliveryResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const notifier = channelRegistry[channel];

    if (!notifier) {
      return {
        channel,
        status: "failed",
        timestamp: new Date(),
        error: `Unknown channel: ${channel}`,
      };
    }

    if (!notifier.isConfigured()) {
      return {
        channel,
        status: "failed",
        timestamp: new Date(),
        error: "Channel not configured",
      };
    }

    const appliedPayload = this.applyTemplate(payload);
    return this.sendWithRetry(notifier, appliedPayload, opts);
  }

  /**
   * Send batch notifications
   */
  async notifyBatch(
    payloads: NotificationPayload[],
    options?: NotificationOptions
  ): Promise<NotificationResult[]> {
    return Promise.all(payloads.map((p) => this.notify(p, options)));
  }

  /**
   * Quick helper: Send approval notification
   */
  async notifyApprovalAssigned(
    data: {
      requestId: string;
      requestTitle: string;
      requestAmount: number;
      requesterName: string;
      approverEmail: string;
      approverId: string;
      tenantId: string;
      approvalUrl: string;
    },
    channels?: NotificationChannel[]
  ): Promise<NotificationResult> {
    return this.notify(
      {
        type: "approval.assigned",
        title: "New Approval Request",
        message: `${data.requesterName} submitted a request for ${formatCurrency(data.requestAmount)}: ${data.requestTitle}`,
        recipient: {
          email: data.approverEmail,
          userId: data.approverId,
        },
        metadata: {
          requestId: data.requestId,
          amount: data.requestAmount,
          requester: data.requesterName,
        },
        actions: [
          { label: "Review Request", url: data.approvalUrl, style: "primary" },
        ],
        tenantId: data.tenantId,
      },
      { channels: channels || ["in-app", "email"] }
    );
  }

  /**
   * Quick helper: Send request status notification
   */
  async notifyRequestStatus(
    data: {
      requestId: string;
      requestTitle: string;
      requestAmount: number;
      status: "approved" | "rejected";
      requesterEmail: string;
      requesterId: string;
      tenantId: string;
      requestUrl: string;
      reviewerName?: string;
      reason?: string;
    },
    channels?: NotificationChannel[]
  ): Promise<NotificationResult> {
    const type = data.status === "approved" ? "request.approved" : "request.rejected";
    const title = data.status === "approved" ? "Request Approved" : "Request Rejected";

    return this.notify(
      {
        type,
        title,
        message: `Your request "${data.requestTitle}" for ${formatCurrency(data.requestAmount)} has been ${data.status}.`,
        recipient: {
          email: data.requesterEmail,
          userId: data.requesterId,
        },
        metadata: {
          requestId: data.requestId,
          amount: data.requestAmount,
          reviewer: data.reviewerName,
          reason: data.reason,
        },
        actions: [
          { label: "View Request", url: data.requestUrl },
        ],
        tenantId: data.tenantId,
      },
      { channels: channels || ["in-app", "email"] }
    );
  }

  /**
   * Quick helper: Send budget warning
   */
  async notifyBudgetWarning(
    data: {
      budgetId: string;
      budgetName: string;
      spentAmount: number;
      totalAmount: number;
      percentageUsed: number;
      notifyEmails: string[];
      tenantId: string;
      budgetUrl: string;
    },
    channels?: NotificationChannel[]
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const email of data.notifyEmails) {
      const result = await this.notify(
        {
          type: "budget.warning",
          title: "Budget Warning",
          message: `Budget "${data.budgetName}" has used ${data.percentageUsed.toFixed(1)}% (${formatCurrency(data.spentAmount)} of ${formatCurrency(data.totalAmount)})`,
          recipient: { email },
          metadata: {
            budgetId: data.budgetId,
            budgetName: data.budgetName,
            spent: data.spentAmount,
            total: data.totalAmount,
            percentage: data.percentageUsed,
          },
          actions: [
            { label: "View Budget", url: data.budgetUrl, style: "primary" },
          ],
          tenantId: data.tenantId,
        },
        { channels: channels || ["in-app", "email"] }
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Quick helper: Send to all configured channels (broadcast)
   */
  async broadcast(
    payload: NotificationPayload,
    excludeChannels?: NotificationChannel[]
  ): Promise<NotificationResult> {
    const allChannels = this.getConfiguredChannels();
    const channels = allChannels.filter((ch) => !excludeChannels?.includes(ch));

    return this.notify(payload, { channels });
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private applyTemplate(payload: NotificationPayload): NotificationPayload {
    const template = this.templates.get(payload.type);
    if (!template) return payload;

    const ctx: TemplateContext = {
      payload,
      channel: "email",
    };

    return {
      ...payload,
      title: template.getTitle(ctx) || payload.title,
      message: template.getMessage(ctx) || payload.message,
      actions: payload.actions || template.getDefaultActions?.(ctx),
    };
  }

  private async sendWithRetry(
    notifier: Notifier,
    payload: NotificationPayload,
    options: Required<NotificationOptions>
  ): Promise<DeliveryResult> {
    let lastError: string | undefined;
    let attempt = 0;

    while (attempt < options.retryAttempts) {
      attempt++;

      try {
        const result = await withTimeout(
          notifier.send(payload),
          options.timeout
        );

        if (result.status === "sent" || result.status === "delivered") {
          return { ...result, retryCount: attempt - 1 };
        }

        if (result.status === "rate_limited") {
          const delay = options.retryDelay * Math.pow(2, attempt);
          logger.warn(`Rate limited, retrying in ${delay}ms`, {
            channel: notifier.channel,
            attempt,
          });
          await sleep(delay);
          continue;
        }

        lastError = result.error;
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown error";
        logger.warn(`Notification attempt ${attempt} failed`, {
          channel: notifier.channel,
          error: lastError,
        });
      }

      if (attempt < options.retryAttempts) {
        const delay = options.retryDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }

    return {
      channel: notifier.channel,
      status: "failed",
      timestamp: new Date(),
      error: lastError || "Max retries exceeded",
      retryCount: attempt,
    };
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const notify = new NotificationService();

// Export class for testing
export { NotificationService };

// Export types
export * from "./types";
