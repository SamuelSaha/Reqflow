import { pgTable, uuid, text, timestamp, jsonb, boolean, index, numeric, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "./organizations";
import { vendors } from "./vendors";

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),

  // Contract details
  title: text("title").notNull(),
  contractNumber: text("contract_number"),
  type: text("type").notNull().default("subscription"), // subscription, service, license, framework
  status: text("status").notNull().default("active"), // draft, active, expired, cancelled, renewed

  // Terms
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),

  // KILLER FEATURE: Notice-window tracking
  autoRenew: boolean("auto_renew").notNull().default(false),
  renewalDate: date("renewal_date"),
  noticeDeadline: date("notice_deadline"), // THE decision point - when you must act
  noticePeriodDays: numeric("notice_period_days"), // e.g., 30, 60, 90
  upliftCap: numeric("uplift_cap", { precision: 5, scale: 2 }), // max price increase %, e.g., 5.00

  // Financial
  totalValue: numeric("total_value", { precision: 12, scale: 2 }),
  currency: text("currency").notNull().default("EUR"),
  paymentTerms: text("payment_terms"), // e.g., "Net 30", "Annual upfront"

  // AI-extracted clauses
  extractedTerms: jsonb("extracted_terms").$type<{
    terminationRights?: string;
    dataRetention?: string;
    liabilityCap?: string;
    confidentiality?: string;
    subprocessorChanges?: string;
    slaDetails?: string;
  }>(),

  // Ownership
  ownerId: uuid("owner_id"), // Who manages this contract

  // Documents
  documentUrl: text("document_url"),
  amendments: jsonb("amendments").$type<Array<{ date: string; description: string; url?: string }>>(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("contracts_tenant_idx").on(table.tenantId),
  index("contracts_vendor_idx").on(table.vendorId),
  index("contracts_status_idx").on(table.status),
  index("contracts_renewal_idx").on(table.renewalDate),
  index("contracts_notice_idx").on(table.noticeDeadline),
]);

export const contractRelations = relations(contracts, ({ one }) => ({
  organization: one(organizations, {
    fields: [contracts.tenantId],
    references: [organizations.id],
  }),
  vendor: one(vendors, {
    fields: [contracts.vendorId],
    references: [vendors.id],
  }),
}));

export const insertContractSchema = createInsertSchema(contracts);
export const selectContractSchema = createSelectSchema(contracts);
export type InsertContract = z.infer<typeof insertContractSchema>;
export type SelectContract = typeof contracts.$inferSelect;
