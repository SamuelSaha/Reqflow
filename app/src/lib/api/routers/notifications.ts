/**
 * tRPC router for notifications
 * Handles in-app notifications with real-time delivery via subscriptions
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { notifications, users } from "../../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { EventEmitter } from "events";
import { createAuditLog, AuditAction } from "../../monitoring/audit";
import type { Notification } from "../../db/schema";

// Event emitter for real-time notifications
// This allows us to broadcast new notifications to subscribed clients
const notificationEvents = new EventEmitter();

/**
 * Emit a new notification event for real-time delivery
 * Call this after creating a notification to push it to subscribed clients
 */
export function emitNotification(userId: string, notification: Notification) {
  notificationEvents.emit(`notification:${userId}`, notification);
}

/**
 * Create a notification helper function
 * Used by other routers to create notifications
 */
export async function createNotification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  data: {
    tenantId: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
  }
) {
  // Check user's notification preferences
  const user = await db.query.users.findFirst({
    where: eq(users.id, data.userId),
  });

  if (!user) {
    return null;
  }

  // Default to enabled if no preferences set
  const prefs = user.notificationPreferences || {};
  const typePref = prefs[data.type as keyof typeof prefs];
  const inAppEnabled = typePref?.inApp !== false; // Default true

  if (!inAppEnabled) {
    return null; // User has disabled in-app notifications for this type
  }

  // Create the notification
  const [notification] = await db
    .insert(notifications)
    .values({
      tenantId: data.tenantId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl || null,
      read: false,
    })
    .returning();

  // Emit real-time event
  emitNotification(data.userId, notification);

  return notification;
}

export const notificationsRouter = router({
  /**
   * List notifications for the current user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(notifications.tenantId, ctx.tenantId),
        eq(notifications.userId, ctx.user.id),
      ];

      if (input.unreadOnly) {
        conditions.push(eq(notifications.read, false));
      }

      const items = await ctx.db.query.notifications.findMany({
        where: and(...conditions),
        orderBy: [desc(notifications.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });

      // Get total count for pagination
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(and(...conditions));

      const total = totalResult[0]?.count || 0;

      return {
        items,
        total,
        hasMore: input.offset + items.length < total,
      };
    }),

  /**
   * Get unread count for the current user
   * Used for the notification bell badge
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.tenantId, ctx.tenantId),
          eq(notifications.userId, ctx.user.id),
          eq(notifications.read, false)
        )
      );

    return result[0]?.count || 0;
  }),

  /**
   * Mark a single notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the notification belongs to this user
      const notification = await ctx.db.query.notifications.findFirst({
        where: and(
          eq(notifications.id, input.id),
          eq(notifications.userId, ctx.user.id),
          eq(notifications.tenantId, ctx.tenantId)
        ),
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      if (notification.read) {
        return { success: true, alreadyRead: true };
      }

      await ctx.db
        .update(notifications)
        .set({
          read: true,
          readAt: new Date(),
        })
        .where(eq(notifications.id, input.id));

      return { success: true, alreadyRead: false };
    }),

  /**
   * Mark all notifications as read for the current user
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.tenantId, ctx.tenantId),
          eq(notifications.userId, ctx.user.id),
          eq(notifications.read, false)
        )
      );

    await createAuditLog({
      tenantId: ctx.tenantId,
      userId: ctx.user.id,
      userEmail: ctx.user.email,
      userName: ctx.user.name,
      action: AuditAction.NOTIFICATION_READ,
      entityType: "notification",
      entityId: "all",
      description: "Marked all notifications as read",
      metadata: {},
    });

    return { success: true };
  }),

  /**
   * Delete a notification
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the notification belongs to this user
      const notification = await ctx.db.query.notifications.findFirst({
        where: and(
          eq(notifications.id, input.id),
          eq(notifications.userId, ctx.user.id),
          eq(notifications.tenantId, ctx.tenantId)
        ),
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      await ctx.db
        .delete(notifications)
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  // TODO: Real-time subscription for new notifications
  // Re-enable once WebSocket transport (wsLink) is configured:
  //   onNew: protectedProcedure.subscription(({ ctx }) => {
  //     return observable<Notification>((emit) => { ... });
  //   }),

  /**
   * Get notification preferences for the current user
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Return preferences with defaults
    const defaults = {
      approval_assigned: { email: true, inApp: true, slack: false },
      request_approved: { email: true, inApp: true, slack: false },
      request_rejected: { email: true, inApp: true, slack: false },
      budget_warning: { email: true, inApp: true, slack: false },
      trial_expiring: { email: true, inApp: true, slack: false },
      renewal_due: { email: true, inApp: true, slack: false },
    };

    return {
      ...defaults,
      ...(user.notificationPreferences || {}),
    };
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        preferences: z.record(z.string(), z.object({
          email: z.boolean(),
          inApp: z.boolean(),
          slack: z.boolean(),
        })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          notificationPreferences: input.preferences,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));

      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.USER_UPDATED,
        entityType: "user",
        entityId: ctx.user.id,
        description: "Updated notification preferences",
        metadata: { preferences: input.preferences },
      });

      return { success: true };
    }),
});
