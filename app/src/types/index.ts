/**
 * Core type definitions for Reqflow
 */

// User roles for RBAC
export type UserRole = "requester" | "manager" | "finance" | "admin";

// Request status
export type RequestStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

// Request category
export type RequestCategory =
  | "saas"
  | "services"
  | "office"
  | "travel"
  | "hardware"
  | "other";

// Approval decision
export type ApprovalDecision = "approved" | "rejected" | "pending";

// Budget period
export type BudgetPeriod = "monthly" | "quarterly" | "annually";

// Common entity types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantScoped {
  tenantId: string;
}
