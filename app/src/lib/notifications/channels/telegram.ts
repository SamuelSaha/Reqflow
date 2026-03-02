/**
 * Telegram Bot Channel
 * Notifications via Telegram Bot API with HTML formatting
 */

import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import type {
  Notifier,
  NotificationPayload,
  DeliveryResult,
  DeliveryStatus,
  TelegramMessage,
} from "../types";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

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

export class TelegramNotifier implements Notifier {
  readonly channel = "telegram" as const;
  readonly name = "Telegram";

  private get botToken(): string | undefined {
    return env.TELEGRAM_BOT_TOKEN;
  }

  private get chatId(): string | undefined {
    return env.TELEGRAM_CHAT_ID;
  }

  isConfigured(): boolean {
    return !!(this.botToken && this.chatId);
  }

  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return this.createResult("failed", "Telegram bot not configured");
    }

    const chatId = payload.recipient?.telegramChatId || this.chatId!;

    try {
      const message = this.buildMessage(payload, chatId);
      const url = `${TELEGRAM_API_BASE}${this.botToken}/sendMessage`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        const error = result.description || `HTTP ${response.status}`;
        logger.error("Telegram API failed", new Error(error), {
          status: response.status,
          type: payload.type,
          chatId,
        });

        if (response.status === 429 || result.error_code === 429) {
          return this.createResult("rate_limited", "Telegram rate limit exceeded");
        }

        return this.createResult("failed", error);
      }

      logger.info("Telegram notification sent", {
        type: payload.type,
        chatId,
        messageId: result.result?.message_id,
        duration: Date.now() - startTime,
      });

      return {
        channel: this.channel,
        status: "sent",
        messageId: String(result.result?.message_id),
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Telegram notification error", error as Error, { type: payload.type });
      return this.createResult("failed", errorMessage);
    }
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<DeliveryResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }

  private buildMessage(payload: NotificationPayload, chatId: string): TelegramMessage {
    const emoji = EMOJI_MAP[payload.type] || "🔔";

    const parts: string[] = [
      `<b>${escapeHtml(`${emoji} ${payload.title}`)}</b>`,
      "",
      escapeHtml(payload.message),
    ];

    if (payload.metadata) {
      parts.push("");
      parts.push(this.buildMetadataSection(payload.metadata));
    }

    if (payload.actor) {
      parts.push("");
      parts.push(`<i>By ${escapeHtml(payload.actor.name)}${payload.actor.email ? ` (${escapeHtml(payload.actor.email)})` : ""}</i>`);
    }

    if (payload.actions?.length) {
      parts.push("");
      parts.push("<b>Actions:</b>");
      for (const action of payload.actions.slice(0, 5)) {
        parts.push(`• <a href="${escapeHtml(action.url)}">${escapeHtml(action.label)}</a>`);
      }
    }

    return {
      chat_id: chatId,
      text: parts.join("\n"),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };
  }

  private buildMetadataSection(metadata: Record<string, unknown>): string {
    const lines: string[] = ["<b>Details:</b>"];
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
        displayValue = value ? "✓" : "✗";
      } else if (value instanceof Date) {
        displayValue = value.toLocaleDateString();
      } else if (Array.isArray(value)) {
        displayValue = value.join(", ");
      } else {
        displayValue = String(value);
      }

      if (displayValue.length <= 200) {
        lines.push(`• <b>${escapeHtml(displayName)}:</b> ${escapeHtml(displayValue)}`);
      }
    }

    return lines.join("\n");
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const telegramNotifier = new TelegramNotifier();
