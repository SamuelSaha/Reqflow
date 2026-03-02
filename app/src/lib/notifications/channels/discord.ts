/**
 * Discord Webhook Channel
 * Rich notifications via Discord Webhooks with embeds and buttons
 */

import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import type {
  Notifier,
  NotificationPayload,
  DeliveryResult,
  DeliveryStatus,
  DiscordMessage,
  DiscordEmbed,
} from "../types";

const DISCORD_WEBHOOK_REGEX = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;

const EMOJI_MAP: Record<string, string> = {
  "request.created": "🆕",
  "request.approved": "✅",
  "request.rejected": "❌",
  "request.cancelled": "🚫",
  "approval.assigned": "👉",
  "approval.reminder": "⏰",
  "budget.warning": "⚠️",
  "budget.exceeded": "🚨",
  "trial.expiring": "⏳",
  "trial.expired": "💀",
  "renewal.due": "📅",
  "renewal.reminder": "🔔",
  "contract.expiring": "📁",
  "invoice.received": "🧾",
  "invoice.overdue": "💸",
  "user.invited": "👋",
  "user.verified": "⭐",
  "system.alert": "🚨",
  "custom": "🔔",
};

const COLOR_MAP: Record<string, number> = {
  "request.created": 0x36a64f,
  "request.approved": 0x36a64f,
  "request.rejected": 0xdc3545,
  "request.cancelled": 0x6c757d,
  "approval.assigned": 0x007bff,
  "approval.reminder": 0xffc107,
  "budget.warning": 0xffc107,
  "budget.exceeded": 0xdc3545,
  "trial.expiring": 0xffc107,
  "trial.expired": 0xdc3545,
  "renewal.due": 0x17a2b8,
  "renewal.reminder": 0xffc107,
  "contract.expiring": 0xfd7e14,
  "invoice.received": 0x36a64f,
  "invoice.overdue": 0xdc3545,
  "user.invited": 0x6f42c1,
  "user.verified": 0x36a64f,
  "system.alert": 0xdc3545,
  "custom": 0x007bff,
};

export class DiscordNotifier implements Notifier {
  readonly channel = "discord" as const;
  readonly name = "Discord";

  private get webhookUrl(): string | undefined {
    return env.DISCORD_WEBHOOK_URL;
  }

  isConfigured(): boolean {
    const url = this.webhookUrl;
    return !!url && DISCORD_WEBHOOK_REGEX.test(url);
  }

  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return this.createResult("failed", "Discord webhook not configured");
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
        logger.error("Discord webhook failed", new Error(error), {
          status: response.status,
          type: payload.type,
        });

        if (response.status === 429) {
          return this.createResult("rate_limited", "Discord rate limit exceeded");
        }

        return this.createResult("failed", `HTTP ${response.status}: ${error}`);
      }

      logger.info("Discord notification sent", {
        type: payload.type,
        duration: Date.now() - startTime,
      });

      return this.createResult("sent");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Discord notification error", error as Error, { type: payload.type });
      return this.createResult("failed", errorMessage);
    }
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<DeliveryResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }

  private buildMessage(payload: NotificationPayload): DiscordMessage {
    const emoji = EMOJI_MAP[payload.type] || "🔔";
    const color = COLOR_MAP[payload.type] || 0x007bff;

    const embed: DiscordEmbed = {
      title: `${emoji} ${payload.title}`,
      description: payload.message,
      color,
      timestamp: new Date().toISOString(),
      footer: {
        text: "Reqflow",
        icon_url: "https://reqflow.com/icon.png",
      },
    };

    if (payload.metadata) {
      const builtFields = this.buildFields(payload.metadata);
      if (builtFields && builtFields.length > 0) {
        embed.fields = builtFields.slice(0, 25);
      }
    }

    if (payload.actor) {
      embed.author = {
        name: payload.actor.name,
        icon_url: payload.actor.avatarUrl,
      };
    }

    const message: DiscordMessage = {
      username: "Reqflow",
      avatar_url: "https://reqflow.com/icon.png",
      embeds: [embed],
    };

    if (payload.actions?.length) {
      message.components = [
        {
          type: 1,
          components: payload.actions.slice(0, 5).map((action) => ({
            type: 2,
            label: action.label.slice(0, 80),
            style: action.style === "danger" ? 4 : action.style === "primary" ? 1 : 2,
            url: action.url,
          })),
        },
      ];
    }

    return message;
  }

  private buildFields(metadata: Record<string, unknown>): Array<{ name: string; value: string; inline?: boolean }> {
    const fields: Array<{ name: string; value: string; inline?: boolean }> = [];
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

      if (displayValue.length <= 1024) {
        fields.push({ name: displayName, value: displayValue.slice(0, 1024), inline: displayValue.length < 50 });
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

export const discordNotifier = new DiscordNotifier();
