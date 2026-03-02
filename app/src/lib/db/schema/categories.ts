/**
 * Categories Schema
 * Customizable spend categories with GL mapping for accounting integration
 */

import { pgTable, text, timestamp, uuid, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { requests } from "./requests";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),

  // Category details
  name: text("name").notNull(), // Display name (e.g., "SaaS", "Professional Services")
  slug: text("slug").notNull(), // Unique identifier within tenant (e.g., "saas", "prof-services")
  description: text("description"), // What this category covers

  // Visual identity
  color: text("color").notNull().default("#3B82F6"), // Hex color for UI (e.g., "#3B82F6")
  icon: text("icon").default("tag"), // Lucide icon name

  // Accounting integration
  glAccountCode: text("gl_account_code"), // General ledger account for sync

  // Metadata
  isActive: boolean("is_active").notNull().default(true), // Soft delete
  isSystem: boolean("is_system").notNull().default(false), // System categories can't be deleted
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  // Composite: active categories for a tenant (most common query)
  index("categories_tenant_active_idx").on(table.tenantId, table.isActive),
  // Composite: lookup category by slug within tenant
  index("categories_tenant_slug_idx").on(table.tenantId, table.slug),
]);

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  requests: many(requests),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
