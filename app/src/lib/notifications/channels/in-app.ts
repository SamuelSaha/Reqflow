/**
 * In-App Notification Channel
 * Stores notifications in the database for in-app display
 */

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "@/lib/monitoring/logger";
import type {
  Notifier,
  NotificationPayload,
  DeliveryResult,
  DeliveryStatus,
} from "../types";

export class InAppNotifier implements Notifier {
  readonly channel = "in-app" as const;
  readonly name = "In-App";

  isConfigured(): boolean {
    return true;
  }

  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    const startTime = Date.now();

    const userId = payload.recipient?.userId;
    if (!userId) {
      return this.createResult("failed", "No recipient user ID provided");
    }

    const tenantId = payload.tenantId;
    if (!tenantId) {
      return this.createResult("failed", "No tenant ID provided");
    }

    try {
      const [inserted] = await db.insert(notifications).values({
        userId,
        tenantId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        actionUrl: payload.actions?.[0]?.url || null,
        read: false,
      }).returning();

      logger.info("In-app notification created", {
        type: payload.type,
        userId,
        notificationId: inserted?.id,
        duration: Date.now() - startTime,
      });

      return {
        channel: this.channel,
        status: "sent",
        messageId: inserted?.id,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("In-app notification error", error as Error, {
        type: payload.type,
        userId,
      });
      return this.createResult("failed", errorMessage);
    }
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<DeliveryResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await db
        .update(notifications)
        .set({ read: true, readAt: new Date() })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
        .returning({ id: notifications.id });

      return result.length > 0;
    } catch (error) {
      logger.error("Failed to mark notification as read", error as Error, { notificationId, userId });
      return false;
    }
  }

  async markAllAsRead(userId: string, tenantId: string): Promise<number> {
    try {
      const result = await db
        .update(notifications)
        .set({ read: true, readAt: new Date() })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.tenantId, tenantId),
            eq(notifications.read, false)
          )
        )
        .returning({ id: notifications.id });

      return result.length;
    } catch (error) {
      logger.error("Failed to mark all notifications as read", error as Error, { userId, tenantId });
      return 0;
    }
  }

  async getUnreadCount(userId: string, tenantId: string): Promise<number> {
    try {
      const result = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.tenantId, tenantId),
            eq(notifications.read, false)
          )
        );

      return result.length;
    } catch (error) {
      logger.error("Failed to get unread count", error as Error, { userId, tenantId });
      return 0;
    }
  }

  async getRecent(userId: string, tenantId: string, limit = 50) {
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.tenantId, tenantId)
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(limit);

      return result;
    } catch (error) {
      logger.error("Failed to get recent notifications", error as Error, { userId, tenantId });
      return [];
    }
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

export const inAppNotifier = new InAppNotifier();
