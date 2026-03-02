import { pgTable, uuid, text, timestamp, jsonb, index, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "./organizations";
import { vendors } from "./vendors";
import { departments } from "./departments";
import { requests } from "./requests";

export const trials = pgTable("trials", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: "set null" }),

  // Trial identity
  toolName: text("tool_name").notNull(),
  category: text("category"), // saas, services, infrastructure
  description: text("description"),

  // Ownership
  initiatedById: uuid("initiated_by_id").notNull(), // Who started the trial
  stakeholders: jsonb("stakeholders").$type<Array<{ userId: string; role: string }>>(),

  // Timeline
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),

  // Success criteria
  successCriteria: jsonb("success_criteria").$type<Array<{
    metric: string;
    target: string;
    actual?: string;
    met?: boolean;
  }>>(),

  // Status
  status: text("status").notNull().default("active"), // active, extended, converted, cancelled, expired

  // Decision
  decision: text("decision"), // buy, extend, cancel
  decisionDate: timestamp("decision_date"),
  decisionNotes: text("decision_notes"),

  // Conversion - links to purchase request if trial converts
  convertedRequestId: uuid("converted_request_id").references(() => requests.id, { onDelete: "set null" }),

  // Estimated cost (for budget planning)
  estimatedCost: text("estimated_cost"), // e.g., "$19/user/mo"
  estimatedAnnualCost: text("estimated_annual_cost"), // e.g., "$2,736/yr"

  // Reminders sent
  remindersSent: jsonb("reminders_sent").$type<Array<{ date: string; type: string }>>(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("trials_tenant_idx").on(table.tenantId),
  index("trials_vendor_idx").on(table.vendorId),
  index("trials_status_idx").on(table.status),
  index("trials_end_date_idx").on(table.endDate),
  index("trials_initiated_by_idx").on(table.initiatedById),
  // Composite: list trials by status + sort by end date
  index("trials_tenant_status_end_idx").on(table.tenantId, table.status, table.endDate),
]);

export const trialRelations = relations(trials, ({ one }) => ({
  organization: one(organizations, {
    fields: [trials.tenantId],
    references: [organizations.id],
  }),
  vendor: one(vendors, {
    fields: [trials.vendorId],
    references: [vendors.id],
  }),
  department: one(departments, {
    fields: [trials.departmentId],
    references: [departments.id],
  }),
  convertedRequest: one(requests, {
    fields: [trials.convertedRequestId],
    references: [requests.id],
  }),
}));

export const insertTrialSchema = createInsertSchema(trials);
export const selectTrialSchema = createSelectSchema(trials);
export type InsertTrial = z.infer<typeof insertTrialSchema>;
export type SelectTrial = typeof trials.$inferSelect;
