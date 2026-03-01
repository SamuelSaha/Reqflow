import { pgTable, uuid, text, timestamp, jsonb, index, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "./organizations";

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Identity
  name: text("name").notNull(),
  legalName: text("legal_name"),
  website: text("website"),
  industry: text("industry"),

  // Billing identity (for card descriptor matching)
  billingNames: jsonb("billing_names").$type<string[]>(), // e.g., ["STRIPE*NOTION", "NOTION.SO", "NOTION LABS INC"]

  // Contacts
  primaryContact: jsonb("primary_contact").$type<{ name: string; email: string; phone?: string; role?: string }>(),

  // Compliance
  complianceTier: text("compliance_tier").notNull().default("none"), // none, basic, customer_data, regulated
  complianceDocs: jsonb("compliance_docs").$type<Array<{ type: string; name: string; url: string; expiresAt?: string }>>(),

  // Tax
  taxId: text("tax_id"),
  country: text("country"),

  // Status
  status: text("status").notNull().default("active"), // active, inactive, blocked, pending_review

  // Performance
  performanceScore: numeric("performance_score", { precision: 3, scale: 2 }),
  internalNotes: text("internal_notes"),

  // Full-text search
  searchVector: text("search_vector"), // tsvector managed by PostgreSQL trigger

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("vendors_tenant_idx").on(table.tenantId),
  index("vendors_name_idx").on(table.name),
  index("vendors_status_idx").on(table.status),
]);

export const vendorRelations = relations(vendors, ({ one }) => ({
  organization: one(organizations, {
    fields: [vendors.tenantId],
    references: [organizations.id],
  }),
}));

export const insertVendorSchema = createInsertSchema(vendors);
export const selectVendorSchema = createSelectSchema(vendors);
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type SelectVendor = typeof vendors.$inferSelect;
