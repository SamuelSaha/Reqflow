import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { users } from "./users";
import { z } from "zod";

/**
 * Notifications table
 * In-app notifications for users (approvals, rejections, budget warnings, etc.)
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Recipient
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Notification content
    type: text("type").notNull(), // approval_assigned, approval_decided, request_approved, request_rejected, budget_warning, trial_expiring, renewal_due, etc.
    title: text("title").notNull(),
    message: text("message").notNull(),
    actionUrl: text("action_url"), // Where to navigate when clicked

    // Status
    read: boolean("read").notNull().default(false),
    readAt: timestamp("read_at"),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // Indexes for common queries
    index("notifications_tenant_idx").on(table.tenantId),
    index("notifications_user_idx").on(table.userId),
    index("notifications_read_idx").on(table.read),
    index("notifications_created_idx").on(table.createdAt),
    // Composite index for unread notifications by user
    index("notifications_user_unread_idx").on(table.userId, table.read),
    // Composite: notification inbox — tenant-scoped, per-user, filter by read, sort by date
    index("notifications_tenant_user_read_created_idx").on(table.tenantId, table.userId, table.read, table.createdAt),
  ]
);

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  organization: one(organizations, {
    fields: [notifications.tenantId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertNotificationSchema = createInsertSchema(notifications, {
  type: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
});

export const selectNotificationSchema = createSelectSchema(notifications);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// Notification type enum for type safety
export const NotificationType = {
  // Approvals
  APPROVAL_ASSIGNED: "approval_assigned",
  APPROVAL_REMINDER: "approval_reminder",

  // Requests
  REQUEST_APPROVED: "request_approved",
  REQUEST_REJECTED: "request_rejected",
  REQUEST_NEEDS_INFO: "request_needs_info",

  // Budgets
  BUDGET_WARNING: "budget_warning",
  BUDGET_EXCEEDED: "budget_exceeded",

  // Trials
  TRIAL_EXPIRING: "trial_expiring",
  TRIAL_EXPIRED: "trial_expired",
  TRIAL_DECISION_NEEDED: "trial_decision_needed",

  // Renewals
  RENEWAL_DUE: "renewal_due",
  RENEWAL_UPCOMING: "renewal_upcoming",
  RENEWAL_DECISION_NEEDED: "renewal_decision_needed",

  // System
  SYSTEM_ANNOUNCEMENT: "system_announcement",
  INTEGRATION_ERROR: "integration_error",
} as const;

export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType];
