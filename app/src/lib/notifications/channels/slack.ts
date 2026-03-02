/**
 * Slack Webhook Channel
 * Simple, reliable notifications via Slack Incoming Webhooks
 */

import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import type {
  Notifier,
  NotificationPayload,
  DeliveryResult,
  DeliveryStatus,
  SlackMessage,
  SlackBlock,
} from "../types";

const SLACK_WEBHOOK_REGEX = /^https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+$/;

const EMOJI_MAP: Record<string, string> = {
  "request.created": ":new:",
  "request.approved": ":white_check_mark:",
  "request.rejected": ":x:",
  "request.cancelled": ":no_entry_sign:",
  "approval.assigned": ":point_right:",
  "approval.reminder": ":alarm_clock:",
  "budget.warning": ":warning:",
  "budget.exceeded": ":rotating_light:",
  "trial.expiring": ":hourglass:",
  "trial.expired": ":skull:",
  "renewal.due": ":calendar:",
  "renewal.reminder": ":bell:",
  "contract.expiring": ":file_folder:",
  "invoice.received": ":receipt:",
  "invoice.overdue": ":money_with_wings:",
  "user.invited": ":wave:",
  "user.verified": ":star:",
  "system.alert": ":rotating_light:",
  "custom": ":bell:",
};

const COLOR_MAP: Record<string, string> = {
  "request.created": "#36a64f",
  "request.approved": "#36a64f",
  "request.rejected": "#dc3545",
  "request.cancelled": "#6c757d",
  "approval.assigned": "#007bff",
  "approval.reminder": "#ffc107",
  "budget.warning": "#ffc107",
  "budget.exceeded": "#dc3545",
  "trial.expiring": "#ffc107",
  "trial.expired": "#dc3545",
  "renewal.due": "#17a2b8",
  "renewal.reminder": "#ffc107",
  "contract.expiring": "#fd7e14",
  "invoice.received": "#36a64f",
  "invoice.overdue": "#dc3545",
  "user.invited": "#6f42c1",
  "user.verified": "#36a64f",
  "system.alert": "#dc3545",
  "custom": "#007bff",
};

export class SlackNotifier implements Notifier {
  readonly channel = "slack" as const;
  readonly name = "Slack";

  private get webhookUrl(): string | undefined {
    return env.SLACK_WEBHOOK_URL;
  }

  isConfigured(): boolean {
    const url = this.webhookUrl;
    return !!url && SLACK_WEBHOOK_REGEX.test(url);
  }

  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return this.createResult("failed", "Slack webhook not configured");
    }

    try {
      const message = this.buildMessage(payload);
      const response = await fetch(this.webhookUrl!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error("Slack webhook failed", new Error(error), {
          status: response.status,
          type: payload.type,
        });
        return this.createResult("failed", `HTTP ${response.status}: ${error}`);
      }

      logger.info("Slack notification sent", {
        type: payload.type,
        duration: Date.now() - startTime,
      });

      return this.createResult("sent");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Slack notification error", error as Error, { type: payload.type });
      return this.createResult("failed", errorMessage);
    }
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<DeliveryResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }

  private buildMessage(payload: NotificationPayload): SlackMessage {
    const emoji = EMOJI_MAP[payload.type] || ":bell:";
    const color = COLOR_MAP[payload.type] || "#007bff";

    const blocks: SlackBlock[] = [
      {
        type: "header",
        text: { type: "plain_text", text: `${emoji} ${payload.title}` },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: payload.message },
      },
    ];

    if (payload.metadata) {
      const fields = this.buildFields(payload.metadata);
      if (fields.length > 0) {
        blocks.push({
          type: "section",
          fields: fields.slice(0, 10).map((f) => ({ type: "mrkdwn", text: `*${f.name}:*\n${f.value}` })),
        });
      }
    }

    if (payload.actor) {
      blocks.push({
        type: "context",
        elements: [
          { type: "mrkdwn", text: `By ${payload.actor.name}${payload.actor.email ? ` (${payload.actor.email})` : ""}` },
        ],
      });
    }

    if (payload.actions?.length) {
      const elements = payload.actions.slice(0, 5).map((action) => ({
        type: "button",
        text: { type: "plain_text", text: action.label },
        url: action.url,
        style: action.style === "danger" ? "danger" : action.style === "primary" ? "primary" : undefined,
      }));

      blocks.push({ type: "actions", elements });
    }

    blocks.push({ type: "divider" });

    return {
      text: `${emoji} ${payload.title}: ${payload.message}`,
      blocks,
      username: "Reqflow",
      icon_emoji: ":clipboard:",
    };
  }

  private buildFields(metadata: Record<string, unknown>): Array<{ name: string; value: string }> {
    const fields: Array<{ name: string; value: string }> = [];
    const skipKeys = ["id", "tenantId", "createdAt", "updatedAt"];

    for (const [key, value] of Object.entries(metadata)) {
      if (skipKeys.includes(key)) continue;
      if (value === undefined || value === null) continue;

      const displayName = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();

      let displayValue: string;
      if (typeof value === "number") {
        displayValue = value.toLocaleString();
      } else if (typeof value === "boolean") {
        displayValue = value ? "Yes" : "No";
      } else if (value instanceof Date) {
        displayValue = value.toLocaleDateString();
      } else if (Array.isArray(value)) {
        displayValue = value.join(", ");
      } else {
        displayValue = String(value);
      }

      if (displayValue.length <= 100) {
        fields.push({ name: displayName, value: displayValue });
      }
    }

    return fields;
  }

  private createResult(status: DeliveryStatus, error?: string): DeliveryResult {
    return {
      channel: this.channel,
      status,
      timestamp: new Date(),
      error,
    };
  }
}

export const slackNotifier = new SlackNotifier();
