/**
 * Accounting Integrations Schema
 * Stores OAuth tokens and configuration for QuickBooks and Xero
 */

import { pgTable, uuid, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

/**
 * Accounting integrations table
 * One integration per tenant per provider (QuickBooks OR Xero)
 */
export const accountingIntegrations = pgTable("accounting_integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  // Provider: "quickbooks" or "xero"
  provider: text("provider").notNull(), // "quickbooks" | "xero"

  // OAuth 2.0 tokens (encrypted in production)
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiresAt: timestamp("token_expires_at").notNull(),

  // Provider-specific identifiers
  // QuickBooks: realmId (company ID)
  // Xero: tenantId (organization ID)
  providerAccountId: text("provider_account_id").notNull(),
  providerAccountName: text("provider_account_name"), // Company/org name

  // Connection status
  isActive: boolean("is_active").default(true).notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  lastSyncError: text("last_sync_error"),

  // Configuration
  // Auto-sync: automatically create POs when requests are approved
  autoSync: boolean("auto_sync").default(true).notNull(),

  // Mapping configuration (e.g., department → cost center mapping)
  config: jsonb("config").$type<{
    defaultVendor?: string; // Default vendor ID for unmatched vendors
    departmentMapping?: Record<string, string>; // Reqflow dept ID → Accounting dept/class ID
    accountMapping?: Record<string, string>; // Reqflow category → Accounting account/category
  }>(),

  // Metadata
  connectedBy: uuid("connected_by"), // User who connected the integration
  connectedAt: timestamp("connected_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  // Composite: lookup integration by tenant + provider (most common query)
  index("acct_integrations_tenant_provider_idx").on(table.tenantId, table.provider),
]);

/**
 * Accounting sync logs
 * Tracks every sync attempt for audit trail
 */
export const accountingSyncLogs = pgTable("accounting_sync_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  // What was synced
  entityType: text("entity_type").notNull(), // "request" | "invoice" | "vendor"
  entityId: uuid("entity_id").notNull(),

  // Sync details
  provider: text("provider").notNull(), // "quickbooks" | "xero"
  action: text("action").notNull(), // "create" | "update" | "delete"

  // Result
  success: boolean("success").notNull(),
  providerReference: text("provider_reference"), // PO ID, invoice ID, etc.
  errorMessage: text("error_message"),
  errorCode: text("error_code"),

  // Metadata
  requestPayload: jsonb("request_payload"), // What we sent to the provider
  responsePayload: jsonb("response_payload"), // What we got back

  syncedAt: timestamp("synced_at").defaultNow().notNull(),
  syncedBy: uuid("synced_by"), // User who triggered sync (if manual)
});

export type AccountingIntegration = typeof accountingIntegrations.$inferSelect;
export type NewAccountingIntegration = typeof accountingIntegrations.$inferInsert;
export type AccountingSyncLog = typeof accountingSyncLogs.$inferSelect;
export type NewAccountingSyncLog = typeof accountingSyncLogs.$inferInsert;
