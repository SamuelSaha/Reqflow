/**
 * Email Channel
 * Wrapper around Resend for email notifications
 */

import { Resend } from "resend";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import type {
  Notifier,
  NotificationPayload,
  DeliveryResult,
  DeliveryStatus,
  EmailMessage,
} from "../types";

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

export class EmailNotifier implements Notifier {
  readonly channel = "email" as const;
  readonly name = "Email";

  private get resend(): Resend | null {
    if (!env.RESEND_API_KEY) return null;
    return new Resend(env.RESEND_API_KEY);
  }

  private get fromAddress(): string {
    return env.EMAIL_FROM || "Reqflow <notifications@reqflow.com>";
  }

  isConfigured(): boolean {
    return !!env.RESEND_API_KEY;
  }

  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return this.createResult("failed", "Email not configured (missing RESEND_API_KEY)");
    }

    const recipientEmail = payload.recipient?.email;
    if (!recipientEmail) {
      return this.createResult("failed", "No recipient email address provided");
    }

    try {
      const message = this.buildMessage(payload, recipientEmail);
      const resend = this.resend!;

      const { data, error } = await resend.emails.send({
        from: message.from || this.fromAddress,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });

      if (error) {
        logger.error("Resend API error", new Error(error.message), {
          type: payload.type,
          recipient: recipientEmail,
        });
        return this.createResult("failed", error.message);
      }

      logger.info("Email notification sent", {
        type: payload.type,
        recipient: recipientEmail,
        messageId: data?.id,
        duration: Date.now() - startTime,
      });

      return {
        channel: this.channel,
        status: "sent",
        messageId: data?.id,
        timestamp: new Date(),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("Email notification error", err as Error, {
        type: payload.type,
        recipient: recipientEmail,
      });
      return this.createResult("failed", errorMessage);
    }
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<DeliveryResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }

  private buildMessage(payload: NotificationPayload, to: string): EmailMessage {
    const emoji = EMOJI_MAP[payload.type] || "🔔";
    const subject = `${emoji} ${payload.title}`;

    const html = this.buildHtml(payload);
    const text = this.buildText(payload);

    return {
      to,
      subject,
      html,
      text,
      from: this.fromAddress,
    };
  }

  private buildHtml(payload: NotificationPayload): string {
    const sections: string[] = [];

    sections.push(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #1e293b; margin: 0 0 16px 0;">${escapeHtml(payload.title)}</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">${escapeHtml(payload.message)}</p>
    `);

    if (payload.metadata && Object.keys(payload.metadata).length > 0) {
      sections.push(`<div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">`);
      sections.push(`<h2 style="font-size: 14px; font-weight: 600; color: #64748b; margin: 0 0 12px 0; text-transform: uppercase;">Details</h2>`);

      const skipKeys = ["id", "tenantId", "createdAt", "updatedAt"];
      for (const [key, value] of Object.entries(payload.metadata)) {
        if (skipKeys.includes(key) || value === undefined || value === null) continue;

        const displayName = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
        const displayValue = formatValue(value);

        sections.push(`
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-size: 14px;">${escapeHtml(displayName)}</span>
            <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${escapeHtml(displayValue)}</span>
          </div>
        `);
      }
      sections.push(`</div>`);
    }

    if (payload.actions?.length) {
      sections.push(`<div style="margin-bottom: 24px;">`);
      for (const action of payload.actions) {
        const bgColor = action.style === "danger" ? "#dc2626" : action.style === "primary" ? "#2563eb" : "#64748b";
        sections.push(`
          <a href="${escapeHtml(action.url)}" style="display: inline-block; background: ${bgColor}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-right: 8px; margin-bottom: 8px;">
            ${escapeHtml(action.label)}
          </a>
        `);
      }
      sections.push(`</div>`);
    }

    if (payload.actor) {
      sections.push(`
        <p style="font-size: 14px; color: #94a3b8; margin: 0 0 24px 0;">
          By ${escapeHtml(payload.actor.name)}${payload.actor.email ? ` (${escapeHtml(payload.actor.email)})` : ""}
        </p>
      `);
    }

    sections.push(`
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          Sent by <a href="https://reqflow.com" style="color: #64748b;">Reqflow</a> — Procurement Management Platform
        </p>
      </div>
    `);

    return sections.join("");
  }

  private buildText(payload: NotificationPayload): string {
    const lines: string[] = [
      payload.title,
      "=".repeat(payload.title.length),
      "",
      payload.message,
    ];

    if (payload.metadata && Object.keys(payload.metadata).length > 0) {
      lines.push("", "DETAILS", "-".repeat(8));
      const skipKeys = ["id", "tenantId", "createdAt", "updatedAt"];
      for (const [key, value] of Object.entries(payload.metadata)) {
        if (skipKeys.includes(key) || value === undefined || value === null) continue;
        const displayName = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
        lines.push(`${displayName}: ${formatValue(value)}`);
      }
    }

    if (payload.actions?.length) {
      lines.push("", "ACTIONS", "-".repeat(8));
      for (const action of payload.actions) {
        lines.push(`• ${action.label}: ${action.url}`);
      }
    }

    if (payload.actor) {
      lines.push("", `By ${payload.actor.name}${payload.actor.email ? ` (${payload.actor.email})` : ""}`);
    }

    lines.push("", "---", "Sent by Reqflow — https://reqflow.com");

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
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatValue(value: unknown): string {
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export const emailNotifier = new EmailNotifier();
