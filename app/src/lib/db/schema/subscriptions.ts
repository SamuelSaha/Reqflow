import { pgTable, uuid, text, timestamp, jsonb, integer, index, numeric, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "./organizations";
import { vendors } from "./vendors";
import { contracts } from "./contracts";
import { departments } from "./departments";

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "set null" }),
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: "set null" }),

  // Tool identity
  toolName: text("tool_name").notNull(),
  category: text("category").notNull(), // saas, services, infrastructure, office, other
  description: text("description"),

  // Plan details
  plan: text("plan"), // e.g., "Business", "Enterprise", "Pro"
  seats: integer("seats"),
  activeSeats: integer("active_seats"),

  // Billing
  costPerSeat: numeric("cost_per_seat", { precision: 12, scale: 2 }),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("EUR"),
  billingCycle: text("billing_cycle").notNull().default("monthly"), // monthly, quarterly, annually

  // Lifecycle
  status: text("status").notNull().default("active"), // trial, active, paused, cancelled, expired
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),

  // Ownership
  ownerId: uuid("owner_id"), // Current owner (not necessarily who purchased it)
  requestedById: uuid("requested_by_id"), // Who originally requested it (user)
  sourceRequestId: uuid("source_request_id"), // Original request that was converted to this subscription

  // Add-ons and extras
  addOns: jsonb("add_ons").$type<Array<{ name: string; cost: number; description?: string }>>(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("subscriptions_tenant_idx").on(table.tenantId),
  index("subscriptions_vendor_idx").on(table.vendorId),
  index("subscriptions_contract_idx").on(table.contractId),
  index("subscriptions_department_idx").on(table.departmentId),
  index("subscriptions_status_idx").on(table.status),
  index("subscriptions_category_idx").on(table.category),
  // Composite: list subscriptions by status + sort by date
  index("subscriptions_tenant_status_created_idx").on(table.tenantId, table.status, table.createdAt),
]);

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.tenantId],
    references: [organizations.id],
  }),
  vendor: one(vendors, {
    fields: [subscriptions.vendorId],
    references: [vendors.id],
  }),
  contract: one(contracts, {
    fields: [subscriptions.contractId],
    references: [contracts.id],
  }),
  department: one(departments, {
    fields: [subscriptions.departmentId],
    references: [departments.id],
  }),
}));

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type SelectSubscription = typeof subscriptions.$inferSelect;
