import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { users } from "./users";

/**
 * Audit Logs table - APPEND ONLY
 * Every action in the system is logged here
 * No UPDATE or DELETE grants - immutable by design
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Who did what
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    userEmail: text("user_email"), // Captured at event time (in case user is deleted)
    userName: text("user_name"),

    // What happened
    action: text("action").notNull(), // e.g., "request.created", "approval.approved", "budget.exceeded"
    entityType: text("entity_type").notNull(), // "request", "approval", "budget", "user", etc.
    entityId: uuid("entity_id"), // ID of the affected entity

    // Context
    description: text("description"), // Human-readable description
    metadata: jsonb("metadata").$type<Record<string, unknown>>(), // Additional context
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    // Change tracking (for UPDATE actions)
    before: jsonb("before").$type<Record<string, unknown>>(), // State before change
    after: jsonb("after").$type<Record<string, unknown>>(), // State after change

    // Timestamp (only created, never updated)
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_tenant_idx").on(table.tenantId),
    index("audit_logs_user_idx").on(table.userId),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_idx").on(table.createdAt),
    // Composite: activity timeline — sort by date within tenant
    index("audit_logs_tenant_created_idx").on(table.tenantId, table.createdAt),
  ]
);

// Relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLogs.tenantId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const selectAuditLogSchema = createSelectSchema(auditLogs);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

/**
 * Auth Events table - APPEND ONLY
 * Separate from general audit logs for security events
 * Integrated with Better Auth middleware
 */
export const authEvents = pgTable(
  "auth_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => organizations.id, { onDelete: "cascade" }),

    // User
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    userEmail: text("user_email"),

    // Event
    event: text("event").notNull(), // login, logout, login_failed, mfa_enabled, password_reset, etc.
    success: text("success").notNull(), // true, false
    reason: text("reason"), // Failure reason if applicable

    // Context
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    location: text("location"), // Geo-location if available
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    // Timestamp
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("auth_events_tenant_idx").on(table.tenantId),
    index("auth_events_user_idx").on(table.userId),
    index("auth_events_event_idx").on(table.event),
    index("auth_events_created_idx").on(table.createdAt),
  ]
);

// Relations
export const authEventsRelations = relations(authEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [authEvents.tenantId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [authEvents.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertAuthEventSchema = createInsertSchema(authEvents);
export const selectAuthEventSchema = createSelectSchema(authEvents);

export type AuthEvent = typeof authEvents.$inferSelect;
export type NewAuthEvent = typeof authEvents.$inferInsert;
