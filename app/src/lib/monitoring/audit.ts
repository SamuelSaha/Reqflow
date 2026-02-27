/**
 * Audit Log Helpers
 * Populates audit_logs and auth_events tables for compliance and security tracking
 */

import { db } from "../db";
import { auditLogs, authEvents } from "../db/schema";
import { logger } from "./logger";

/**
 * Create an audit log entry
 * Tracks all significant business actions in the system
 */
export async function createAuditLog(data: {
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  metadata?: Record<string, unknown>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLogs).values(data);
    logger.info("Audit log created", {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
    });
  } catch (error) {
    logger.error("Failed to create audit log", error as Error, {
      action: data.action,
      entityType: data.entityType,
      userId: data.userId,
    });
  }
}

/**
 * Create an authentication event
 * Tracks login, logout, MFA, and other auth-related events
 */
export async function createAuthEvent(data: {
  tenantId: string;
  userId: string | null;
  event: string;
  success: boolean;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.insert(authEvents).values({
      ...data,
      success: data.success.toString(), // Convert boolean to string for DB
    });
    logger.info("Auth event created", {
      event: data.event,
      success: data.success,
      userId: data.userId ?? undefined,
    });
  } catch (error) {
    logger.error("Failed to create auth event", error as Error, {
      event: data.event,
      userId: data.userId ?? undefined,
    });
  }
}

/**
 * Standard audit action constants
 * Ensures consistent naming across the application
 */
export const AuditAction = {
  // Request actions
  REQUEST_CREATED: "request.created",
  REQUEST_SUBMITTED: "request.submitted",
  REQUEST_APPROVED: "request.approved",
  REQUEST_REJECTED: "request.rejected",
  REQUEST_UPDATED: "request.updated",
  REQUEST_DELETED: "request.deleted",

  // Approval actions
  APPROVAL_DECIDED: "approval.decided",
  APPROVAL_DELEGATED: "approval.delegated",

  // Budget actions
  BUDGET_CREATED: "budget.created",
  BUDGET_UPDATED: "budget.updated",
  BUDGET_DELETED: "budget.deleted",
  BUDGET_ALLOCATED: "budget.allocated",

  // User/Team actions
  USER_INVITED: "user.invited",
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DEACTIVATED: "user.deactivated",
  USER_REACTIVATED: "user.reactivated",
  INVITE_RESENT: "invite.resent",
  INVITE_REVOKED: "invite.revoked",

  // Department actions
  DEPARTMENT_CREATED: "department.created",
  DEPARTMENT_UPDATED: "department.updated",
  DEPARTMENT_DELETED: "department.deleted",

  // Trial actions
  TRIAL_STARTED: "trial.started",
  TRIAL_EXTENDED: "trial.extended",
  TRIAL_CONVERTED: "trial.converted",
  TRIAL_EXPIRED: "trial.expired",
  TRIAL_CHECKPOINT_UPDATED: "trial.checkpoint.updated",

  // Renewal actions
  RENEWAL_DECISION: "renewal.decision",
  RENEWAL_CHECKPOINT_UPDATED: "renewal.checkpoint.updated",

  // Vendor actions
  VENDOR_CREATED: "vendor.created",
  VENDOR_UPDATED: "vendor.updated",
  VENDOR_AUTO_CREATED: "vendor.auto_created",
  COMPLIANCE_DOC_UPLOADED: "vendor.compliance_doc.uploaded",

  // Organization actions
  ORG_SETTINGS_UPDATED: "org.settings.updated",
  ORG_PLAN_CHANGED: "org.plan.changed",

  // File actions
  FILE_UPLOADED: "file.uploaded",
  FILE_DOWNLOADED: "file.downloaded",
  FILE_DELETED: "file.deleted",

  // Template actions
  TEMPLATE_CREATED: "template.created",
  TEMPLATE_UPDATED: "template.updated",
  TEMPLATE_DELETED: "template.deleted",
  TEMPLATE_USED: "template.used",
} as const;

/**
 * Standard auth event constants
 */
export const AuthEvent = {
  LOGIN_SUCCESS: "login.success",
  LOGIN_FAILED: "login.failed",
  LOGOUT: "logout",
  SIGNUP: "signup",
  PASSWORD_RESET_REQUESTED: "password_reset.requested",
  PASSWORD_RESET_COMPLETED: "password_reset.completed",
  EMAIL_VERIFIED: "email.verified",
  MFA_ENABLED: "mfa.enabled",
  MFA_DISABLED: "mfa.disabled",
  SESSION_EXPIRED: "session.expired",
} as const;
