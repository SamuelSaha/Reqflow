import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  integer,
  boolean,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { users } from "./users";
import { departments } from "./departments";
import { budgets } from "./budgets";
import { z } from "zod";

/**
 * Purchase Requests table
 * The core entity of Reqflow - represents a purchase request
 */
export const requests = pgTable(
  "requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Request number (human-readable)
    requestNumber: text("request_number").notNull().unique(), // REQ-2026-0001

    // Requester
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),

    // What's being requested
    title: text("title").notNull(), // Brief description
    description: text("description"), // Detailed justification
    category: text("category").notNull(), // saas, services, office, travel, hardware, other

    // Vendor info
    vendorName: text("vendor_name"),
    vendorId: uuid("vendor_id"), // References vendors.id (will create later)

    // Financial
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // Total cost
    currency: text("currency").notNull().default("EUR"),
    frequency: text("frequency").notNull().default("one-time"), // one-time, monthly, annually
    quantity: integer("quantity").default(1),

    // Budget tracking
    budgetId: uuid("budget_id").references(() => budgets.id, { onDelete: "set null" }),

    // Status
    status: text("status").notNull().default("draft"), // draft, pending, approved, rejected, cancelled
    urgency: text("urgency").notNull().default("normal"), // low, normal, urgent

    // AI-assisted fields
    aiCategory: text("ai_category"), // AI-suggested category
    aiCategoryConfidence: numeric("ai_category_confidence", { precision: 3, scale: 2 }),
    duplicateCheckPerformed: boolean("duplicate_check_performed").default(false),
    potentialDuplicates: jsonb("potential_duplicates").$type<string[]>(), // Array of request IDs

    // Metadata
    customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
    attachments: jsonb("attachments").$type<Array<{ name: string; url: string }>>(),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    submittedAt: timestamp("submitted_at"),
    approvedAt: timestamp("approved_at"),
    rejectedAt: timestamp("rejected_at"),
  },
  (table) => [
    index("requests_tenant_idx").on(table.tenantId),
    index("requests_requester_idx").on(table.requesterId),
    index("requests_status_idx").on(table.status),
    index("requests_department_idx").on(table.departmentId),
    index("requests_created_idx").on(table.createdAt),
  ]
);

// Relations
export const requestsRelations = relations(requests, ({ one }) => ({
  organization: one(organizations, {
    fields: [requests.tenantId],
    references: [organizations.id],
  }),
  requester: one(users, {
    fields: [requests.requesterId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [requests.departmentId],
    references: [departments.id],
  }),
  budget: one(budgets, {
    fields: [requests.budgetId],
    references: [budgets.id],
  }),
}));

// Zod schemas
export const insertRequestSchema = createInsertSchema(requests, {
  category: z.enum(["saas", "services", "office", "travel", "hardware", "other"]),
  status: z.enum(["draft", "pending", "approved", "rejected", "cancelled"]).optional(),
  urgency: z.enum(["low", "normal", "urgent"]).optional(),
  frequency: z.enum(["one-time", "monthly", "annually"]).optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export const selectRequestSchema = createSelectSchema(requests);

export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;
