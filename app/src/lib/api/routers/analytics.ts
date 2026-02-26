/**
 * Analytics tRPC Router
 * Admin-only endpoints for system metrics, audit logs, and usage analytics
 */

import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { requests, users, auditLogs, authEvents } from "@/lib/db/schema";
import { eq, and, gte, desc, sql, count, inArray } from "drizzle-orm";
import { subDays } from "date-fns";

export const analyticsRouter = router({
  /**
   * Dashboard overview stats
   * Returns high-level metrics for the last 30 days
   */
  overview: adminProcedure.query(async ({ ctx }) => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const sevenDaysAgo = subDays(new Date(), 7);

    // Active users (made at least one request in last 30 days)
    const activeUsersResult = await ctx.db
      .selectDistinct({ userId: requests.requesterId })
      .from(requests)
      .where(
        and(
          eq(requests.tenantId, ctx.tenantId),
          gte(requests.createdAt, thirtyDaysAgo)
        )
      );

    // Total request volume (last 30 days)
    const [{ value: requestVolume }] = await ctx.db
      .select({ value: count() })
      .from(requests)
      .where(
        and(
          eq(requests.tenantId, ctx.tenantId),
          gte(requests.createdAt, thirtyDaysAgo)
        )
      );

    // Average approval time (last 7 days, only approved requests)
    const recentApprovals = await ctx.db.query.requests.findMany({
      where: and(
        eq(requests.tenantId, ctx.tenantId),
        eq(requests.status, "approved"),
        gte(requests.submittedAt, sevenDaysAgo)
      ),
      columns: {
        submittedAt: true,
        approvedAt: true,
      },
    });

    const avgApprovalTimeMs = recentApprovals.length > 0
      ? recentApprovals.reduce((sum, req) => {
          if (!req.submittedAt || !req.approvedAt) return sum;
          return sum + (req.approvedAt.getTime() - req.submittedAt.getTime());
        }, 0) / recentApprovals.length
      : 0;

    const avgApprovalTimeHours = Math.round(avgApprovalTimeMs / (1000 * 60 * 60));

    // Budget utilization (sum of approved request amounts)
    const approvedRequests = await ctx.db.query.requests.findMany({
      where: and(
        eq(requests.tenantId, ctx.tenantId),
        eq(requests.status, "approved"),
        gte(requests.createdAt, thirtyDaysAgo)
      ),
      columns: {
        amount: true,
      },
    });

    const totalSpend = approvedRequests.reduce(
      (sum, req) => sum + parseFloat(req.amount),
      0
    );

    return {
      activeUsers: activeUsersResult.length,
      requestVolume: Number(requestVolume),
      avgApprovalTimeHours,
      totalSpend,
    };
  }),

  /**
   * Request trends over time
   * Daily request counts for the last 30 days
   */
  requestTrends: adminProcedure.query(async ({ ctx }) => {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const trends = await ctx.db
      .select({
        date: sql<string>`DATE(${requests.createdAt})`,
        count: count(),
      })
      .from(requests)
      .where(
        and(
          eq(requests.tenantId, ctx.tenantId),
          gte(requests.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${requests.createdAt})`)
      .orderBy(sql`DATE(${requests.createdAt})`);

    return trends.map((t) => ({
      date: t.date,
      count: Number(t.count),
    }));
  }),

  /**
   * Top users by activity
   * Top 10 users by request count and total amount
   */
  topUsers: adminProcedure.query(async ({ ctx }) => {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const topUserStats = await ctx.db
      .select({
        userId: requests.requesterId,
        requestCount: count(),
        totalAmount: sql<number>`SUM(CAST(${requests.amount} AS DECIMAL))`,
      })
      .from(requests)
      .where(
        and(
          eq(requests.tenantId, ctx.tenantId),
          gte(requests.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(requests.requesterId)
      .orderBy(desc(count()))
      .limit(10);

    // Enrich with user details
    const userIds = topUserStats.map((stat) => stat.userId);

    // Handle empty array case
    if (userIds.length === 0) {
      return [];
    }

    const userDetails = await ctx.db.query.users.findMany({
      where: and(
        eq(users.tenantId, ctx.tenantId),
        inArray(users.id, userIds)
      ),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const userMap = new Map(userDetails.map((u) => [u.id, u]));

    return topUserStats.map((stat) => {
      const user = userMap.get(stat.userId);
      return {
        userId: stat.userId,
        userName: user?.name || "Unknown",
        userEmail: user?.email || "",
        userRole: user?.role || "requester",
        requestCount: Number(stat.requestCount),
        totalAmount: Number(stat.totalAmount) || 0,
      };
    });
  }),

  /**
   * Recent audit logs
   * Last 50 audit log entries with filtering
   */
  auditLogs: adminProcedure
    .input(
      z.object({
        action: z.string().optional(),
        entityType: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(auditLogs.tenantId, ctx.tenantId)];

      if (input.action) {
        conditions.push(eq(auditLogs.action, input.action));
      }

      if (input.entityType) {
        conditions.push(eq(auditLogs.entityType, input.entityType));
      }

      const logs = await ctx.db.query.auditLogs.findMany({
        where: and(...conditions),
        orderBy: [desc(auditLogs.createdAt)],
        limit: input.limit,
      });

      return logs;
    }),

  /**
   * Recent auth events
   * Last 50 authentication events for security monitoring
   */
  authEvents: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const events = await ctx.db.query.authEvents.findMany({
        where: eq(authEvents.tenantId, ctx.tenantId),
        orderBy: [desc(authEvents.createdAt)],
        limit: input.limit,
      });

      return events;
    }),

  /**
   * Queue statistics (BullMQ health)
   * Returns counts for waiting, active, completed, failed jobs
   */
  queueStats: adminProcedure.query(async ({ ctx }) => {
    // Import queue instances
    const { emailQueue } = await import("@/lib/queue/queues/email");
    const { approvalTimersQueue } = await import("@/lib/queue/queues/approval-timers");
    const { trialRemindersQueue } = await import("@/lib/queue/queues/trial-reminders");
    const { renewalRemindersQueue } = await import("@/lib/queue/queues/renewal-reminders");

    const queues = [
      { name: "Email", queue: emailQueue },
      { name: "Approval Timers", queue: approvalTimersQueue },
      { name: "Trial Reminders", queue: trialRemindersQueue },
      { name: "Renewal Reminders", queue: renewalRemindersQueue },
    ];

    const stats = await Promise.all(
      queues.map(async ({ name, queue }) => {
        const [waiting, active, completed, failed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
        ]);

        return {
          name,
          waiting,
          active,
          completed,
          failed,
        };
      })
    );

    return stats;
  }),
});
