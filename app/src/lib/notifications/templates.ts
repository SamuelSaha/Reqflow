/**
 * Notification Templates
 * Pre-built templates for common notification types
 */

import type { NotificationTemplate, TemplateContext, NotificationAction } from "./types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://reqflow.com";

// ============================================================================
// HELPERS
// ============================================================================

function extractMetadata(ctx: TemplateContext): Record<string, unknown> {
  return ctx.payload.metadata || {};
}

function formatCurrency(amount: number | undefined | null, currency = "USD"): string {
  if (amount === undefined || amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function getString(metadata: Record<string, unknown>, key: string): string {
  const value = metadata[key];
  return typeof value === "string" ? value : "";
}

function getNumber(metadata: Record<string, unknown>, key: string): number | undefined {
  const value = metadata[key];
  return typeof value === "number" ? value : undefined;
}

// ============================================================================
// REQUEST TEMPLATES
// ============================================================================

export const requestCreatedTemplate: NotificationTemplate = {
  type: "request.created",
  getTitle: () => "New Purchase Request",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const requester = getString(metadata, "requester");
    const title = getString(metadata, "title");
    const amount = getNumber(metadata, "amount");
    return `${requester} submitted "${title}" for ${formatCurrency(amount)}`;
  },
  getColor: () => 0x36a64f,
  getEmoji: () => "🆕",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const requestId = getString(metadata, "requestId");
    return [
      { label: "View Request", url: `${APP_URL}/dashboard/requests/${requestId}`, style: "primary" },
    ];
  },
};

export const requestApprovedTemplate: NotificationTemplate = {
  type: "request.approved",
  getTitle: () => "Request Approved ✅",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const title = getString(metadata, "title");
    const amount = getNumber(metadata, "amount");
    return `Your request "${title}" for ${formatCurrency(amount)} has been approved!`;
  },
  getColor: () => 0x36a64f,
  getEmoji: () => "✅",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const requestId = getString(metadata, "requestId");
    return [
      { label: "View Request", url: `${APP_URL}/dashboard/requests/${requestId}` },
    ];
  },
};

export const requestRejectedTemplate: NotificationTemplate = {
  type: "request.rejected",
  getTitle: () => "Request Rejected ❌",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const title = getString(metadata, "title");
    const reason = getString(metadata, "reason");
    const reasonText = reason ? ` Reason: ${reason}` : "";
    return `Your request "${title}" was rejected.${reasonText}`;
  },
  getColor: () => 0xdc3545,
  getEmoji: () => "❌",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const requestId = getString(metadata, "requestId");
    return [
      { label: "View Request", url: `${APP_URL}/dashboard/requests/${requestId}` },
    ];
  },
};

// ============================================================================
// APPROVAL TEMPLATES
// ============================================================================

export const approvalAssignedTemplate: NotificationTemplate = {
  type: "approval.assigned",
  getTitle: () => "Approval Required",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const requester = getString(metadata, "requester");
    const title = getString(metadata, "title");
    const amount = getNumber(metadata, "amount");
    return `${requester} needs your approval for "${title}" (${formatCurrency(amount)})`;
  },
  getColor: () => 0x007bff,
  getEmoji: () => "👉",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const requestId = getString(metadata, "requestId");
    return [
      { label: "Review Now", url: `${APP_URL}/dashboard/approvals?request=${requestId}`, style: "primary" },
    ];
  },
};

export const approvalReminderTemplate: NotificationTemplate = {
  type: "approval.reminder",
  getTitle: () => "Approval Reminder ⏰",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const requester = getString(metadata, "requester");
    const title = getString(metadata, "title");
    const pendingHours = getNumber(metadata, "pendingHours");
    return `Reminder: ${requester}'s request "${title}" is waiting for your approval (${pendingHours}h pending)`;
  },
  getColor: () => 0xffc107,
  getEmoji: () => "⏰",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const requestId = getString(metadata, "requestId");
    return [
      { label: "Review Now", url: `${APP_URL}/dashboard/approvals?request=${requestId}`, style: "primary" },
    ];
  },
};

// ============================================================================
// BUDGET TEMPLATES
// ============================================================================

export const budgetWarningTemplate: NotificationTemplate = {
  type: "budget.warning",
  getTitle: () => "Budget Warning ⚠️",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const budgetName = getString(metadata, "budgetName");
    const percentage = getNumber(metadata, "percentage");
    const spent = getNumber(metadata, "spent");
    const total = getNumber(metadata, "total");
    return `Budget "${budgetName}" has used ${percentage?.toFixed(1) ?? 0}% (${formatCurrency(spent)} of ${formatCurrency(total)})`;
  },
  getColor: () => 0xffc107,
  getEmoji: () => "⚠️",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const budgetId = getString(metadata, "budgetId");
    return [
      { label: "View Budget", url: `${APP_URL}/dashboard/budgets/${budgetId}`, style: "primary" },
    ];
  },
};

export const budgetExceededTemplate: NotificationTemplate = {
  type: "budget.exceeded",
  getTitle: () => "Budget Exceeded 🚨",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const budgetName = getString(metadata, "budgetName");
    const spent = getNumber(metadata, "spent");
    const total = getNumber(metadata, "total");
    return `Budget "${budgetName}" has been exceeded! Spent: ${formatCurrency(spent)} / Budget: ${formatCurrency(total)}`;
  },
  getColor: () => 0xdc3545,
  getEmoji: () => "🚨",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const budgetId = getString(metadata, "budgetId");
    return [
      { label: "View Budget", url: `${APP_URL}/dashboard/budgets/${budgetId}`, style: "danger" },
    ];
  },
};

// ============================================================================
// TRIAL & RENEWAL TEMPLATES
// ============================================================================

export const trialExpiringTemplate: NotificationTemplate = {
  type: "trial.expiring",
  getTitle: () => "Trial Expiring Soon",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const toolName = getString(metadata, "toolName");
    const daysLeft = getNumber(metadata, "daysLeft") ?? 0;
    return `Your ${toolName} trial expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`;
  },
  getColor: () => 0xffc107,
  getEmoji: () => "⏳",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const trialId = getString(metadata, "trialId");
    return [
      { label: "Manage Trial", url: `${APP_URL}/dashboard/trials/${trialId}`, style: "primary" },
      { label: "Convert to Subscription", url: `${APP_URL}/dashboard/trials/${trialId}/convert` },
    ];
  },
};

export const renewalDueTemplate: NotificationTemplate = {
  type: "renewal.due",
  getTitle: () => "Renewal Due",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const toolName = getString(metadata, "toolName");
    const daysUntil = getNumber(metadata, "daysUntil") ?? 0;
    return `${toolName} renewal is due in ${daysUntil} days`;
  },
  getColor: () => 0x17a2b8,
  getEmoji: () => "📅",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const contractId = getString(metadata, "contractId");
    return [
      { label: "View Contract", url: `${APP_URL}/dashboard/contracts/${contractId}`, style: "primary" },
    ];
  },
};

// ============================================================================
// INVOICE TEMPLATES
// ============================================================================

export const invoiceReceivedTemplate: NotificationTemplate = {
  type: "invoice.received",
  getTitle: () => "New Invoice Received",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const vendorName = getString(metadata, "vendorName");
    const invoiceNumber = getString(metadata, "invoiceNumber");
    const amount = getNumber(metadata, "amount");
    return `Invoice #${invoiceNumber} from ${vendorName} for ${formatCurrency(amount)}`;
  },
  getColor: () => 0x36a64f,
  getEmoji: () => "🧾",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const invoiceId = getString(metadata, "invoiceId");
    return [
      { label: "View Invoice", url: `${APP_URL}/dashboard/invoices/${invoiceId}`, style: "primary" },
    ];
  },
};

export const invoiceOverdueTemplate: NotificationTemplate = {
  type: "invoice.overdue",
  getTitle: () => "Invoice Overdue",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const vendorName = getString(metadata, "vendorName");
    const invoiceNumber = getString(metadata, "invoiceNumber");
    const amount = getNumber(metadata, "amount");
    const daysOverdue = getNumber(metadata, "daysOverdue") ?? 0;
    return `Invoice #${invoiceNumber} from ${vendorName} (${formatCurrency(amount)}) is ${daysOverdue} days overdue`;
  },
  getColor: () => 0xdc3545,
  getEmoji: () => "💸",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const invoiceId = getString(metadata, "invoiceId");
    return [
      { label: "View Invoice", url: `${APP_URL}/dashboard/invoices/${invoiceId}`, style: "danger" },
    ];
  },
};

// ============================================================================
// USER TEMPLATES
// ============================================================================

export const userInvitedTemplate: NotificationTemplate = {
  type: "user.invited",
  getTitle: () => "You're Invited to Reqflow!",
  getMessage: (ctx) => {
    const metadata = extractMetadata(ctx);
    const inviterName = getString(metadata, "inviterName");
    const organizationName = getString(metadata, "organizationName");
    return `${inviterName} has invited you to join ${organizationName} on Reqflow`;
  },
  getColor: () => 0x6f42c1,
  getEmoji: () => "👋",
  getDefaultActions: (ctx) => {
    const metadata = extractMetadata(ctx);
    const inviteToken = getString(metadata, "inviteToken");
    return [
      { label: "Accept Invitation", url: `${APP_URL}/accept-invite?token=${inviteToken}`, style: "primary" },
    ];
  },
};

// ============================================================================
// ALL TEMPLATES
// ============================================================================

export const allTemplates: NotificationTemplate[] = [
  requestCreatedTemplate,
  requestApprovedTemplate,
  requestRejectedTemplate,
  approvalAssignedTemplate,
  approvalReminderTemplate,
  budgetWarningTemplate,
  budgetExceededTemplate,
  trialExpiringTemplate,
  renewalDueTemplate,
  invoiceReceivedTemplate,
  invoiceOverdueTemplate,
  userInvitedTemplate,
];
