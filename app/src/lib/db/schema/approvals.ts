import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { users } from "./users";
import { requests } from "./requests";
import { z } from "zod";

/**
 * Approvals table
 * Tracks the approval chain for each request
 */
export const approvals = pgTable(
  "approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Request being approved
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),

    // Approver
    approverId: uuid("approver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Approval sequence
    step: integer("step").notNull(), // 1, 2, 3... (order in the chain)
    required: text("required").notNull().default("required"), // required, optional, parallel

    // Decision
    decision: text("decision").notNull().default("pending"), // pending, approved, rejected
    comments: text("comments"),

    // Context provided to approver
    context: jsonb("context").$type<{
      budgetRemaining?: string;
      similarRequests?: string[];
      aiSuggestion?: string;
      riskFlags?: string[];
    }>(),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    decidedAt: timestamp("decided_at"),
    notifiedAt: timestamp("notified_at"),
    reminderSentAt: timestamp("reminder_sent_at"),
  },
  (table) => [
    index("approvals_tenant_idx").on(table.tenantId),
    index("approvals_request_idx").on(table.requestId),
    index("approvals_approver_idx").on(table.approverId),
    index("approvals_decision_idx").on(table.decision),
  ]
);

// Relations
export const approvalsRelations = relations(approvals, ({ one }) => ({
  organization: one(organizations, {
    fields: [approvals.tenantId],
    references: [organizations.id],
  }),
  request: one(requests, {
    fields: [approvals.requestId],
    references: [requests.id],
  }),
  approver: one(users, {
    fields: [approvals.approverId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertApprovalSchema = createInsertSchema(approvals, {
  required: z.enum(["required", "optional", "parallel"]).optional(),
  decision: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const selectApprovalSchema = createSelectSchema(approvals);

export type Approval = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;
