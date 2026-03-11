/**
 * Drizzle ORM Schema Index
 * Exports all tables and relations for the Reqflow database
 */

// Organizations & Users
export * from "./organizations";
export * from "./users";
export * from "./departments";

// Budgets
export * from "./budgets";

// Requests & Approvals
export * from "./categories";
export * from "./requests";
export * from "./request-templates";
export * from "./approvals";
export * from "./approval-workflows";

// Audit & Security
export * from "./audit-logs";
export * from "./verification-tokens";
export * from "./refresh-tokens";
export * from "./oauth-states";
export * from "./password-reset-tokens";

// Integrations
export * from "./slack-workspaces";
export * from "./slack-user-mappings";
export * from "./integrations";

// Invites
export * from "./invites";

// Phase 2: Connected data model
export * from "./vendors";
export * from "./contracts";
export * from "./subscriptions";
export * from "./invoices";
export * from "./trials";
export * from "./renewal-events";

// Notifications
export * from "./notifications";

// API Keys (CLI / programmatic access)
export * from "./api-keys";

// Analytics & Monitoring
export * from "./web-vitals";
