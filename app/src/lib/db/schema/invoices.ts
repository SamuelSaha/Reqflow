import { pgTable, uuid, text, timestamp, jsonb, index, numeric, date, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "./organizations";
import { vendors } from "./vendors";
import { contracts } from "./contracts";
import { subscriptions } from "./subscriptions";

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "set null" }),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "set null" }),

  // Invoice identity
  invoiceNumber: text("invoice_number"),
  externalRef: text("external_ref"), // Vendor's reference number

  // Financial
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("EUR"),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),

  // Line items
  lineItems: jsonb("line_items").$type<Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
  }>>(),

  // Dates
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date"),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),

  // Status
  status: text("status").notNull().default("pending"), // pending, approved, paid, disputed, overdue, cancelled

  // Matching
  matchStatus: text("match_status").default("unmatched"), // unmatched, auto_matched, manual_matched, disputed
  matchConfidence: numeric("match_confidence", { precision: 3, scale: 2 }),
  varianceAmount: numeric("variance_amount", { precision: 12, scale: 2 }), // Difference from expected
  varianceReason: text("variance_reason"),

  // Source
  source: text("source").notNull().default("manual"), // manual, email, ocr, api, card_transaction
  sourceRef: text("source_ref"), // Card descriptor, email ID, etc.

  // Documents
  documentUrl: text("document_url"),

  // Accounting
  costCenter: text("cost_center"),
  accountingCategory: text("accounting_category"),
  syncedToAccounting: boolean("synced_to_accounting").notNull().default(false),
  accountingSyncRef: text("accounting_sync_ref"),

  // Approval
  approvedById: uuid("approved_by_id"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("invoices_tenant_idx").on(table.tenantId),
  index("invoices_vendor_idx").on(table.vendorId),
  index("invoices_contract_idx").on(table.contractId),
  index("invoices_subscription_idx").on(table.subscriptionId),
  index("invoices_status_idx").on(table.status),
  index("invoices_match_idx").on(table.matchStatus),
  index("invoices_due_idx").on(table.dueDate),
]);

export const invoiceRelations = relations(invoices, ({ one }) => ({
  organization: one(organizations, {
    fields: [invoices.tenantId],
    references: [organizations.id],
  }),
  vendor: one(vendors, {
    fields: [invoices.vendorId],
    references: [vendors.id],
  }),
  contract: one(contracts, {
    fields: [invoices.contractId],
    references: [contracts.id],
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const insertInvoiceSchema = createInsertSchema(invoices);
export const selectInvoiceSchema = createSelectSchema(invoices);
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type SelectInvoice = typeof invoices.$inferSelect;
