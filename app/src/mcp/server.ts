/**
 * Reqflow MCP Server
 *
 * Full procurement workflow via Model Context Protocol.
 * Works with Claude Desktop, Cursor, Windsurf, or any MCP-compatible client.
 *
 * Setup:
 *   DATABASE_URL       — PostgreSQL connection string
 *   REQFLOW_USER_EMAIL — Email of the authenticated user
 *
 * Run:   npm run mcp --workspace=app
 * Build: npx tsx src/mcp/server.ts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";
import {
  eq,
  and,
  desc,
  asc,
  ilike,
  gte,
  lte,
  or,
  count,
  sql,
  isNull,
  isNotNull,
} from "drizzle-orm";
import * as schema from "../lib/db/schema";

// ---------------------------------------------------------------------------
// Database & Auth Bootstrap
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;
const USER_EMAIL = process.env.REQFLOW_USER_EMAIL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}
if (!USER_EMAIL) {
  console.error("REQFLOW_USER_EMAIL environment variable is required");
  process.exit(1);
}

const queryClient = postgres(DATABASE_URL, {
  max: 3,
  idle_timeout: 20,
  connect_timeout: 10,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = drizzle(queryClient as any, { schema });

// Cache the resolved user for the session lifetime
type ResolvedUser = Awaited<ReturnType<typeof _fetchUser>>;
let _cachedUser: ResolvedUser | null = null;

async function _fetchUser() {
  return db.query.users.findFirst({
    where: eq(schema.users.email, USER_EMAIL!),
    with: { department: true },
  });
}

async function resolveUser(): Promise<NonNullable<ResolvedUser> & { tenantId: string }> {
  if (_cachedUser) return _cachedUser as NonNullable<ResolvedUser> & { tenantId: string };
  const user = await _fetchUser();
  if (!user) {
    console.error(`User not found: ${USER_EMAIL}`);
    process.exit(1);
  }
  if (!user.tenantId) {
    console.error(`User ${USER_EMAIL} has no tenant`);
    process.exit(1);
  }
  _cachedUser = user;
  return user;
}

// Resolve a request by ID or "REQ-YYYY-NNNN" number
async function findRequest(identifier: string, tenantId: string) {
  const isNumber = identifier.toUpperCase().startsWith("REQ-");
  return db.query.requests.findFirst({
    where: and(
      eq(schema.requests.tenantId, tenantId),
      isNumber
        ? eq(schema.requests.requestNumber, identifier.toUpperCase())
        : eq(schema.requests.id, identifier)
    ),
    with: { requester: true, department: true, budget: true },
  });
}

// PgDateString columns expect 'YYYY-MM-DD' strings, not Date objects
function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function fmt(amount: string | number) {
  return `€${parseFloat(String(amount)).toFixed(2)}`;
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-GB");
}

function daysUntil(d: Date | string | null | undefined): number {
  if (!d) return 9999;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

function ok(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function err(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true };
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "reqflow",
  version: "2.0.0",
});

// ===========================================================================
// CONTEXT & IDENTITY
// ===========================================================================

// ---------------------------------------------------------------------------
// Tool: whoami — identity + action summary
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_whoami",
  `Returns who you are in Reqflow, your permissions, and a summary of items that need attention right now.
Call this first to orient yourself before taking action.`,
  {},
  async () => {
    const user = await resolveUser();
    const tid = user.tenantId!;

    const [
      pendingApprovals,
      myDraftRequests,
      myPendingRequests,
      unreadNotifs,
      budgets,
      upcomingRenewals,
    ] = await Promise.all([
      // Approvals waiting on me
      db
        .select({ count: count() })
        .from(schema.approvals)
        .where(
          and(
            eq(schema.approvals.tenantId, tid),
            eq(schema.approvals.approverId, user.id),
            eq(schema.approvals.decision, "pending")
          )
        ),
      // My draft requests
      db
        .select({ count: count() })
        .from(schema.requests)
        .where(
          and(
            eq(schema.requests.tenantId, tid),
            eq(schema.requests.requesterId, user.id),
            eq(schema.requests.status, "draft")
          )
        ),
      // My pending requests
      db
        .select({ count: count() })
        .from(schema.requests)
        .where(
          and(
            eq(schema.requests.tenantId, tid),
            eq(schema.requests.requesterId, user.id),
            eq(schema.requests.status, "pending")
          )
        ),
      // Unread notifications
      db
        .select({ count: count() })
        .from(schema.notifications)
        .where(
          and(
            eq(schema.notifications.userId, user.id),
            eq(schema.notifications.read, false)
          )
        ),
      // Budget warnings
      db.query.budgets.findMany({
        where: eq(schema.budgets.tenantId, tid),
        with: { department: true },
      }),
      // Renewals due in 30 days
      db
        .select({ count: count() })
        .from(schema.renewalEvents)
        .where(
          and(
            eq(schema.renewalEvents.tenantId, tid),
            lte(schema.renewalEvents.renewalDate, dateStr(new Date(Date.now() + 30 * 86400000))),
            isNull(schema.renewalEvents.decision)
          )
        ),
    ]);

    const warnings = budgets
      .filter((b) => {
        const alloc = parseFloat(b.allocated);
        if (alloc === 0) return false;
        const used = parseFloat(b.spent) + parseFloat(b.committed);
        return used / alloc > 0.8;
      })
      .map(
        (b) =>
          `  ⚠️  ${b.department?.name || "Unknown"}: ${(((parseFloat(b.spent) + parseFloat(b.committed)) / parseFloat(b.allocated)) * 100).toFixed(0)}% of budget used`
      );

    const lines = [
      `# You are: ${user.name || user.email}`,
      `**Email:** ${user.email}`,
      `**Role:** ${user.role.toUpperCase()}`,
      `**Department:** ${(user as { department?: { name: string } | null }).department?.name || "None"}`,
      "",
      "## Action Summary",
      `  📋 Pending approvals assigned to you: **${pendingApprovals[0].count}**`,
      `  📝 Your draft requests (not yet submitted): **${myDraftRequests[0].count}**`,
      `  ⏳ Your requests awaiting approval: **${myPendingRequests[0].count}**`,
      `  🔔 Unread notifications: **${unreadNotifs[0].count}**`,
      `  🔄 Renewals due in 30 days needing a decision: **${upcomingRenewals[0].count}**`,
      "",
      ...(warnings.length > 0
        ? ["## Budget Warnings", ...warnings, ""]
        : []),
      "## What you can do",
      user.role === "admin" || user.role === "manager"
        ? "  → You can approve/reject requests. Use reqflow_list_pending_approvals to see your queue."
        : "  → Use reqflow_create_request + reqflow_submit_request to raise a purchase.",
      "  → Use reqflow_get_notifications to see recent activity.",
      "  → Use reqflow_list_requests to browse all requests.",
    ];

    return ok(lines.join("\n"));
  }
);

// ===========================================================================
// REQUESTS
// ===========================================================================

// ---------------------------------------------------------------------------
// Tool: list_requests
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_list_requests",
  "List purchase requests with optional filters. Returns request number, title, vendor, amount, status, and dates.",
  {
    status: z
      .enum(["draft", "pending", "approved", "rejected", "cancelled"])
      .optional()
      .describe("Filter by request status"),
    mine_only: z
      .boolean()
      .optional()
      .describe("Only show requests you created (default: all in org)"),
    search: z
      .string()
      .optional()
      .describe("Search by request number, title, or vendor name"),
    category: z
      .string()
      .optional()
      .describe("Filter by category (saas, services, hardware, etc.)"),
    urgency: z
      .enum(["low", "normal", "urgent"])
      .optional()
      .describe("Filter by urgency level"),
    limit: z.number().min(1).max(100).default(20),
    sort_by: z
      .enum(["createdAt", "amount", "status", "title"])
      .default("createdAt"),
    sort_order: z.enum(["asc", "desc"]).default("desc"),
  },
  async (params) => {
    const user = await resolveUser();
    const conditions = [eq(schema.requests.tenantId, user.tenantId!)];

    if (params.mine_only) conditions.push(eq(schema.requests.requesterId, user.id));
    if (params.status) conditions.push(eq(schema.requests.status, params.status));
    if (params.category) conditions.push(eq(schema.requests.category, params.category));
    if (params.urgency) conditions.push(eq(schema.requests.urgency, params.urgency));
    if (params.search) {
      conditions.push(
        or(
          ilike(schema.requests.requestNumber, `%${params.search}%`),
          ilike(schema.requests.title, `%${params.search}%`),
          ilike(schema.requests.vendorName, `%${params.search}%`)
        )!
      );
    }

    const sortCol =
      params.sort_by === "amount"
        ? schema.requests.amount
        : params.sort_by === "status"
          ? schema.requests.status
          : params.sort_by === "title"
            ? schema.requests.title
            : schema.requests.createdAt;

    const items = await db.query.requests.findMany({
      where: and(...conditions),
      limit: params.limit,
      orderBy: params.sort_order === "asc" ? [asc(sortCol)] : [desc(sortCol)],
      with: { department: true, requester: true },
    });

    if (items.length === 0) {
      return ok("No requests found matching your criteria.");
    }

    const rows = items.map((r) =>
      [
        `**${r.requestNumber}** — ${r.title}`,
        `  ${fmt(r.amount)} (${r.frequency}) | ${r.status.toUpperCase()} | ${r.urgency} priority`,
        `  Vendor: ${r.vendorName || "N/A"} | Dept: ${r.department?.name || "N/A"} | Requester: ${r.requester?.name || r.requester?.email || "N/A"}`,
        `  Created: ${fmtDate(r.createdAt)}${r.submittedAt ? ` | Submitted: ${fmtDate(r.submittedAt)}` : ""}`,
        `  ID: ${r.id}`,
      ].join("\n")
    );

    return ok(`Found ${items.length} request(s):\n\n${rows.join("\n\n")}`);
  }
);

// ---------------------------------------------------------------------------
// Tool: get_request
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_get_request",
  "Get full details of a purchase request including its approval chain. Accepts request ID or request number (e.g. REQ-2026-0001).",
  {
    identifier: z.string().describe("Request ID (UUID) or request number (REQ-YYYY-NNNN)"),
  },
  async (params) => {
    const user = await resolveUser();
    const request = await findRequest(params.identifier, user.tenantId!);

    if (!request) return err(`Request not found: ${params.identifier}`);

    const approvalChain = await db.query.approvals.findMany({
      where: and(
        eq(schema.approvals.requestId, request.id),
        eq(schema.approvals.tenantId, user.tenantId!)
      ),
      orderBy: [asc(schema.approvals.step)],
      with: { approver: true },
    });

    const lines = [
      `# ${request.requestNumber} — ${request.title}`,
      "",
      `**Status:** ${request.status.toUpperCase()}`,
      `**Amount:** ${fmt(request.amount)} (${request.frequency})`,
      `**Vendor:** ${request.vendorName || "N/A"}`,
      `**Category:** ${request.category || "N/A"}`,
      `**Urgency:** ${request.urgency}`,
      `**Quantity:** ${request.quantity || 1}`,
      `**Requester:** ${request.requester?.name || request.requester?.email || "N/A"}`,
      `**Department:** ${request.department?.name || "N/A"}`,
      `**Created:** ${fmtDate(request.createdAt)}`,
      request.submittedAt ? `**Submitted:** ${fmtDate(request.submittedAt)}` : "",
      request.approvedAt ? `**Approved:** ${fmtDate(request.approvedAt)}` : "",
      request.rejectedAt ? `**Rejected:** ${fmtDate(request.rejectedAt)}` : "",
      request.description ? `\n**Description:**\n${request.description}` : "",
      `\n**Request ID:** ${request.id}`,
    ];

    if (approvalChain.length > 0) {
      lines.push("\n## Approval Chain");
      for (const a of approvalChain) {
        const status =
          a.decision === "approved"
            ? "✅ APPROVED"
            : a.decision === "rejected"
              ? "❌ REJECTED"
              : "⏳ PENDING";
        lines.push(
          `  Step ${a.step}: ${a.approver?.name || a.approver?.email || "Unknown"} — ${status}${a.comments ? ` — "${a.comments}"` : ""}`,
          `    Approval ID: ${a.id}`
        );
      }
    }

    // Suggest next actions based on state
    if (request.status === "draft" && request.requesterId === user.id) {
      lines.push("\n💡 This is a draft. Use reqflow_submit_request to submit for approval.");
    } else if (request.status === "pending") {
      lines.push("\n💡 This request is awaiting approval.");
    }

    return ok(lines.filter((l) => l !== "").join("\n"));
  }
);

// ---------------------------------------------------------------------------
// Tool: create_request
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_create_request",
  `Create a new purchase request in DRAFT status. After creating, use reqflow_submit_request to send it for approval.
Tip: Use reqflow_list_vendors to find vendor names already in the system.`,
  {
    title: z.string().min(1).max(200).describe("Brief title for the purchase request"),
    description: z
      .string()
      .max(5000)
      .optional()
      .describe("Detailed justification for the purchase"),
    vendor_name: z.string().max(200).optional().describe("Vendor or supplier name"),
    amount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Must be a number like '1500' or '1500.00'")
      .describe("Total cost in euros (e.g. '1500.00')"),
    category: z
      .enum(["saas", "services", "office", "travel", "hardware", "other"])
      .optional()
      .describe("Request category"),
    frequency: z
      .enum(["one-time", "monthly", "annually"])
      .default("one-time")
      .describe("Payment frequency"),
    urgency: z
      .enum(["low", "normal", "urgent"])
      .default("normal")
      .describe("How urgent is this request"),
    quantity: z.number().min(1).default(1).describe("Quantity of items"),
  },
  async (params) => {
    const user = await resolveUser();

    // Generate request number
    const year = new Date().getFullYear();
    const [lastRequest] = await db
      .select({ requestNumber: schema.requests.requestNumber })
      .from(schema.requests)
      .where(
        and(
          eq(schema.requests.tenantId, user.tenantId!),
          ilike(schema.requests.requestNumber, `REQ-${year}-%`)
        )
      )
      .orderBy(desc(schema.requests.requestNumber))
      .limit(1);

    let sequence = 1;
    if (lastRequest) {
      const parts = lastRequest.requestNumber.split("-");
      sequence = parseInt(parts[2], 10) + 1;
    }
    const requestNumber = `REQ-${year}-${String(sequence).padStart(4, "0")}`;

    if (!user.departmentId) {
      return err(
        "Your account has no department assigned. Please ask your admin to assign you to a department before creating requests."
      );
    }

    const [created] = await db
      .insert(schema.requests)
      .values({
        tenantId: user.tenantId!,
        requesterId: user.id,
        departmentId: user.departmentId,
        requestNumber,
        title: params.title,
        description: params.description,
        vendorName: params.vendor_name,
        amount: params.amount,
        category: params.category,
        frequency: params.frequency,
        urgency: params.urgency,
        quantity: params.quantity,
        status: "draft",
      })
      .returning();

    return ok(
      [
        `✅ Request created: **${requestNumber}** — ${params.title}`,
        `Amount: ${fmt(params.amount)} (${params.frequency}) | Urgency: ${params.urgency}`,
        `Status: DRAFT`,
        `ID: ${created.id}`,
        "",
        `→ Use reqflow_submit_request with "${requestNumber}" to send for approval.`,
        `→ Use reqflow_update_request to edit before submitting.`,
      ].join("\n")
    );
  }
);

// ---------------------------------------------------------------------------
// Tool: update_request
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_update_request",
  "Update a DRAFT purchase request. Only works on requests you own that haven't been submitted yet.",
  {
    identifier: z.string().describe("Request ID (UUID) or request number (REQ-YYYY-NNNN)"),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    vendor_name: z.string().max(200).optional(),
    amount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .optional()
      .describe("Total cost in euros"),
    category: z
      .enum(["saas", "services", "office", "travel", "hardware", "other"])
      .optional(),
    frequency: z.enum(["one-time", "monthly", "annually"]).optional(),
    urgency: z.enum(["low", "normal", "urgent"]).optional(),
    quantity: z.number().min(1).optional(),
  },
  async (params) => {
    const user = await resolveUser();
    const request = await findRequest(params.identifier, user.tenantId!);

    if (!request) return err(`Request not found: ${params.identifier}`);
    if (request.requesterId !== user.id)
      return err("You can only update your own requests.");
    if (request.status !== "draft")
      return err(
        `Request ${request.requestNumber} is ${request.status}. Only draft requests can be edited.`
      );

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (params.title !== undefined) updates.title = params.title;
    if (params.description !== undefined) updates.description = params.description;
    if (params.vendor_name !== undefined) updates.vendorName = params.vendor_name;
    if (params.amount !== undefined) updates.amount = params.amount;
    if (params.category !== undefined) updates.category = params.category;
    if (params.frequency !== undefined) updates.frequency = params.frequency;
    if (params.urgency !== undefined) updates.urgency = params.urgency;
    if (params.quantity !== undefined) updates.quantity = params.quantity;

    await db
      .update(schema.requests)
      .set(updates)
      .where(eq(schema.requests.id, request.id));

    return ok(
      [
        `✅ Updated ${request.requestNumber}`,
        Object.keys(updates)
          .filter((k) => k !== "updatedAt")
          .map((k) => `  ${k}: ${updates[k]}`)
          .join("\n"),
        "",
        `→ Use reqflow_submit_request to submit when ready.`,
      ].join("\n")
    );
  }
);

// ---------------------------------------------------------------------------
// Tool: submit_request
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_submit_request",
  "Submit a draft request for approval. Triggers the approval workflow and routes to the appropriate approvers.",
  {
    identifier: z.string().describe("Request ID (UUID) or request number (REQ-YYYY-NNNN)"),
  },
  async (params) => {
    const user = await resolveUser();
    const request = await findRequest(params.identifier, user.tenantId!);

    if (!request) return err(`Request not found: ${params.identifier}`);
    if (request.requesterId !== user.id)
      return err("You can only submit your own requests.");
    if (request.status !== "draft")
      return err(
        `${request.requestNumber} is already ${request.status}. Only draft requests can be submitted.`
      );

    await db
      .update(schema.requests)
      .set({ status: "pending", submittedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.requests.id, request.id));

    // Route to first available manager/admin
    const approver = await db.query.users.findFirst({
      where: and(
        eq(schema.users.tenantId, user.tenantId!),
        or(eq(schema.users.role, "admin"), eq(schema.users.role, "manager")),
        isNotNull(schema.users.isActive)
      ),
    });

    if (approver && approver.id !== user.id) {
      await db.insert(schema.approvals).values({
        tenantId: user.tenantId!,
        requestId: request.id,
        approverId: approver.id,
        step: 1,
        required: "required",
        decision: "pending",
      });
    }

    return ok(
      [
        `✅ ${request.requestNumber} submitted for approval!`,
        `Title: ${request.title}`,
        `Amount: ${fmt(request.amount)}`,
        "",
        approver && approver.id !== user.id
          ? `Routed to: **${approver.name || approver.email}** (${approver.role})`
          : "No approver found — an admin will review manually.",
      ].join("\n")
    );
  }
);

// ---------------------------------------------------------------------------
// Tool: cancel_request
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_cancel_request",
  "Cancel a purchase request. You can cancel your own requests; admins can cancel any request.",
  {
    identifier: z.string().describe("Request ID (UUID) or request number (REQ-YYYY-NNNN)"),
    reason: z.string().min(1).max(500).optional().describe("Reason for cancellation"),
  },
  async (params) => {
    const user = await resolveUser();
    const request = await findRequest(params.identifier, user.tenantId!);

    if (!request) return err(`Request not found: ${params.identifier}`);

    const isOwner = request.requesterId === user.id;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin)
      return err("You can only cancel your own requests (admins can cancel any).");

    if (request.status === "cancelled")
      return err(`${request.requestNumber} is already cancelled.`);
    if (request.status === "approved")
      return err(`${request.requestNumber} is approved and cannot be cancelled.`);

    await db
      .update(schema.requests)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
        ...(params.reason ? { description: `[Cancelled] ${params.reason}` } : {}),
      })
      .where(eq(schema.requests.id, request.id));

    return ok(
      [
        `✅ ${request.requestNumber} cancelled.`,
        params.reason ? `Reason: ${params.reason}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  }
);

// ===========================================================================
// APPROVALS
// ===========================================================================

// ---------------------------------------------------------------------------
// Tool: list_pending_approvals
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_list_pending_approvals",
  "List approval requests waiting for the current user's decision. Shows request details, amount, urgency, and requester info.",
  {
    limit: z.number().min(1).max(50).default(20),
  },
  async (params) => {
    const user = await resolveUser();

    const items = await db.query.approvals.findMany({
      where: and(
        eq(schema.approvals.tenantId, user.tenantId!),
        eq(schema.approvals.approverId, user.id),
        eq(schema.approvals.decision, "pending")
      ),
      limit: params.limit,
      orderBy: [desc(schema.approvals.createdAt)],
      with: {
        request: {
          with: { requester: true, department: true },
        },
      },
    });

    if (items.length === 0) {
      return ok("No pending approvals. You're all caught up! ✅");
    }

    const rows = items.map((a, i) => {
      const r = a.request;
      return [
        `${i + 1}. **${r.requestNumber}** — ${r.title}`,
        `   ${fmt(r.amount)} (${r.frequency}) | **${r.urgency.toUpperCase()}** priority`,
        `   Vendor: ${r.vendorName || "N/A"} | Dept: ${r.department?.name || "N/A"}`,
        `   From: ${r.requester?.name || r.requester?.email || "N/A"} | Submitted: ${fmtDate(r.submittedAt)}`,
        `   Approval ID: ${a.id}`,
      ].join("\n");
    });

    return ok(
      [
        `You have **${items.length}** pending approval(s):\n`,
        rows.join("\n\n"),
        "",
        "→ Use reqflow_approve_request or reqflow_reject_request with the Approval ID.",
      ].join("\n")
    );
  }
);

// ---------------------------------------------------------------------------
// Tool: approve_request
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_approve_request",
  "Approve a pending request. Use the Approval ID from reqflow_list_pending_approvals.",
  {
    approval_id: z.string().uuid().describe("Approval ID from reqflow_list_pending_approvals"),
    comments: z.string().max(1000).optional().describe("Optional approval comments"),
  },
  async (params) => {
    const user = await resolveUser();

    const approval = await db.query.approvals.findFirst({
      where: and(
        eq(schema.approvals.id, params.approval_id),
        eq(schema.approvals.tenantId, user.tenantId!),
        eq(schema.approvals.approverId, user.id),
        eq(schema.approvals.decision, "pending")
      ),
      with: { request: true },
    });

    if (!approval) return err("Approval not found, already decided, or not assigned to you.");

    await db
      .update(schema.approvals)
      .set({ decision: "approved", comments: params.comments, decidedAt: new Date() })
      .where(eq(schema.approvals.id, params.approval_id));

    const [pending] = await db
      .select({ count: count() })
      .from(schema.approvals)
      .where(
        and(
          eq(schema.approvals.requestId, approval.requestId),
          eq(schema.approvals.decision, "pending"),
          eq(schema.approvals.required, "required")
        )
      );

    const allDone = pending.count === 0;

    if (allDone) {
      await db
        .update(schema.requests)
        .set({ status: "approved", approvedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.requests.id, approval.requestId));
    }

    return ok(
      [
        `✅ Approved: **${approval.request.requestNumber}** — ${approval.request.title}`,
        `Amount: ${fmt(approval.request.amount)}`,
        params.comments ? `Comments: ${params.comments}` : "",
        "",
        allDone
          ? "All required approvals received — request is now **APPROVED**."
          : "Your approval recorded. Waiting for remaining approvers.",
      ]
        .filter(Boolean)
        .join("\n")
    );
  }
);

// ---------------------------------------------------------------------------
// Tool: reject_request
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_reject_request",
  "Reject a pending request. A reason is required.",
  {
    approval_id: z.string().uuid().describe("Approval ID from reqflow_list_pending_approvals"),
    reason: z.string().min(10).max(1000).describe("Reason for rejection (min 10 characters)"),
  },
  async (params) => {
    const user = await resolveUser();

    const approval = await db.query.approvals.findFirst({
      where: and(
        eq(schema.approvals.id, params.approval_id),
        eq(schema.approvals.tenantId, user.tenantId!),
        eq(schema.approvals.approverId, user.id),
        eq(schema.approvals.decision, "pending")
      ),
      with: { request: true },
    });

    if (!approval) return err("Approval not found, already decided, or not assigned to you.");

    await db
      .update(schema.approvals)
      .set({ decision: "rejected", comments: params.reason, decidedAt: new Date() })
      .where(eq(schema.approvals.id, params.approval_id));

    await db
      .update(schema.requests)
      .set({ status: "rejected", rejectedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.requests.id, approval.requestId));

    return ok(
      [
        `❌ Rejected: **${approval.request.requestNumber}** — ${approval.request.title}`,
        `Amount: ${fmt(approval.request.amount)}`,
        `Reason: ${params.reason}`,
        "",
        "The requester will be notified.",
      ].join("\n")
    );
  }
);

// ===========================================================================
// VENDORS
// ===========================================================================

server.tool(
  "reqflow_list_vendors",
  "Search and list vendors in your organization. Use this to find the correct vendor name before creating a request.",
  {
    search: z.string().optional().describe("Filter by vendor name"),
    limit: z.number().min(1).max(50).default(20),
  },
  async (params) => {
    const user = await resolveUser();
    const conditions = [eq(schema.vendors.tenantId, user.tenantId!)];

    if (params.search) {
      conditions.push(ilike(schema.vendors.name, `%${params.search}%`));
    }

    const items = await db.query.vendors.findMany({
      where: and(...conditions),
      limit: params.limit,
      orderBy: [asc(schema.vendors.name)],
    });

    if (items.length === 0) {
      return ok(
        `No vendors found${params.search ? ` matching "${params.search}"` : ""}.\n→ A new vendor record will be created when you use a new vendor_name in reqflow_create_request.`
      );
    }

    const rows = items.map(
      (v) =>
        `  **${v.name}** | ${v.website || "No website"} | ${(v.primaryContact as { email?: string } | null)?.email || "No contact"}`
    );

    return ok(`${items.length} vendor(s):\n\n${rows.join("\n")}`);
  }
);

// ===========================================================================
// CONTRACTS
// ===========================================================================

server.tool(
  "reqflow_list_contracts",
  "List vendor contracts with optional filtering by status or expiry window.",
  {
    status: z
      .enum(["draft", "active", "expired", "terminated"])
      .optional()
      .describe("Filter by contract status"),
    expiring_within_days: z
      .number()
      .optional()
      .describe("Only show contracts expiring within N days (e.g. 90)"),
    search: z.string().optional().describe("Search by contract title or vendor"),
    limit: z.number().min(1).max(50).default(20),
  },
  async (params) => {
    const user = await resolveUser();
    const conditions = [eq(schema.contracts.tenantId, user.tenantId!)];

    if (params.status) conditions.push(eq(schema.contracts.status, params.status));
    if (params.expiring_within_days) {
      const cutoff = new Date(Date.now() + params.expiring_within_days * 86400000);
      conditions.push(lte(schema.contracts.endDate, dateStr(cutoff)));
      conditions.push(gte(schema.contracts.endDate, dateStr(new Date())));
    }
    if (params.search) {
      conditions.push(ilike(schema.contracts.title, `%${params.search}%`));
    }

    const items = await db.query.contracts.findMany({
      where: and(...conditions),
      limit: params.limit,
      orderBy: [asc(schema.contracts.endDate)],
      with: { vendor: true },
    });

    if (items.length === 0) return ok("No contracts found matching your criteria.");

    const rows = items.map((c) => {
      const days = daysUntil(c.endDate);
      const expiry =
        days < 0
          ? `EXPIRED ${Math.abs(days)}d ago`
          : days < 30
            ? `⚠️  Expires in ${days}d`
            : `Expires ${fmtDate(c.endDate)}`;

      return [
        `  **${c.title}** | ${(c as { vendor?: { name: string } | null }).vendor?.name || "N/A"}`,
        `  ${fmt(c.totalValue || 0)} | ${c.status?.toUpperCase() || "N/A"} | ${expiry}`,
        `  ID: ${c.id}`,
      ].join("\n");
    });

    return ok(`${items.length} contract(s):\n\n${rows.join("\n\n")}`);
  }
);

// ===========================================================================
// INVOICES
// ===========================================================================

server.tool(
  "reqflow_list_invoices",
  "List invoices with optional filters. Shows invoice number, vendor, amount, status, and due date.",
  {
    status: z
      .enum(["pending", "approved", "disputed", "paid"])
      .optional()
      .describe("Filter by invoice status"),
    search: z.string().optional().describe("Search by invoice number or vendor"),
    limit: z.number().min(1).max(50).default(20),
  },
  async (params) => {
    const user = await resolveUser();
    const conditions = [eq(schema.invoices.tenantId, user.tenantId!)];

    if (params.status) conditions.push(eq(schema.invoices.status, params.status));
    if (params.search) {
      conditions.push(ilike(schema.invoices.invoiceNumber, `%${params.search}%`));
    }

    const items = await db.query.invoices.findMany({
      where: and(...conditions),
      limit: params.limit,
      orderBy: [desc(schema.invoices.createdAt)],
      with: { vendor: true },
    });

    if (items.length === 0) return ok("No invoices found.");

    const rows = items.map((inv) => {
      const days = daysUntil(inv.dueDate);
      const due =
        inv.dueDate
          ? days < 0
            ? `⚠️  OVERDUE by ${Math.abs(days)}d`
            : `Due in ${days}d (${fmtDate(inv.dueDate)})`
          : "No due date";

      return [
        `  **${inv.invoiceNumber || inv.id.slice(0, 8)}** | ${(inv as { vendor?: { name: string } | null }).vendor?.name || "N/A"}`,
        `  ${fmt(inv.amount)} | ${inv.status?.toUpperCase() || "N/A"} | ${due}`,
        `  ID: ${inv.id}`,
      ].join("\n");
    });

    return ok(`${items.length} invoice(s):\n\n${rows.join("\n\n")}`);
  }
);

// ===========================================================================
// RENEWALS & TRIALS
// ===========================================================================

server.tool(
  "reqflow_list_renewals",
  "List upcoming subscription renewals. Shows cost, renewal date, and whether a decision has been made.",
  {
    due_within_days: z
      .number()
      .min(1)
      .max(365)
      .default(60)
      .describe("Show renewals due within N days (default 60)"),
    decision_needed: z
      .boolean()
      .optional()
      .describe("Only show renewals where no decision has been made yet"),
    limit: z.number().min(1).max(50).default(20),
  },
  async (params) => {
    const user = await resolveUser();
    const cutoff = new Date(Date.now() + params.due_within_days * 86400000);
    const conditions = [
      eq(schema.renewalEvents.tenantId, user.tenantId!),
      lte(schema.renewalEvents.renewalDate, dateStr(cutoff)),
    ];

    if (params.decision_needed) conditions.push(isNull(schema.renewalEvents.decision));

    const items = await db.query.renewalEvents.findMany({
      where: and(...conditions),
      limit: params.limit,
      orderBy: [asc(schema.renewalEvents.renewalDate)],
      with: { subscription: true },
    });

    if (items.length === 0) {
      return ok(`No renewals due within ${params.due_within_days} days. 🎉`);
    }

    const rows = items.map((r) => {
      const days = daysUntil(r.renewalDate);
      const urgency = days <= 7 ? "🔴" : days <= 14 ? "🟠" : "🟡";
      const decision = r.decision ? `Decision: ${r.decision}` : "⚠️  No decision yet";
      const cost = (r as { subscription?: { totalCost?: string; toolName?: string } | null }).subscription?.totalCost;

      return [
        `  ${urgency} **${(r as { subscription?: { toolName?: string } | null }).subscription?.toolName || "Unknown"}** — renews in ${days}d (${fmtDate(r.renewalDate)})`,
        `  ${cost ? `Cost: ${fmt(cost)}` : "Cost: unknown"} | ${decision}`,
        `  Renewal ID: ${r.id}`,
      ].join("\n");
    });

    return ok(
      [
        `${items.length} renewal(s) due within ${params.due_within_days} days:\n`,
        rows.join("\n\n"),
        "",
        "→ Contact your Reqflow admin to log a renewal decision.",
      ].join("\n")
    );
  }
);

server.tool(
  "reqflow_list_trials",
  "List active SaaS trials and their expiry dates. Shows trials that need a decision (convert or cancel).",
  {
    expiring_within_days: z
      .number()
      .min(1)
      .max(90)
      .default(30)
      .describe("Show trials expiring within N days (default 30)"),
    limit: z.number().min(1).max(50).default(20),
  },
  async (params) => {
    const user = await resolveUser();
    const cutoff = new Date(Date.now() + params.expiring_within_days * 86400000);

    const items = await db.query.trials.findMany({
      where: and(
        eq(schema.trials.tenantId, user.tenantId!),
        lte(schema.trials.endDate, dateStr(cutoff)),
        isNull(schema.trials.decision)
      ),
      limit: params.limit,
      orderBy: [asc(schema.trials.endDate)],
    });

    if (items.length === 0) {
      return ok(`No trials expiring within ${params.expiring_within_days} days.`);
    }

    const rows = items.map((t) => {
      const days = daysUntil(t.endDate);
      const urgency = days <= 3 ? "🔴" : days <= 7 ? "🟠" : "🟡";

      return [
        `  ${urgency} **${t.toolName}** — expires in ${days}d (${fmtDate(t.endDate)})`,
        `  Est. cost if converted: ${t.estimatedCost ? fmt(t.estimatedCost) : "Unknown"}`,
        `  Trial ID: ${t.id}`,
      ].join("\n");
    });

    return ok(
      [
        `${items.length} trial(s) expiring within ${params.expiring_within_days} days:\n`,
        rows.join("\n\n"),
        "",
        "→ To convert a trial, use reqflow_create_request with the tool name and cost.",
      ].join("\n")
    );
  }
);

// ===========================================================================
// SUBSCRIPTIONS
// ===========================================================================

server.tool(
  "reqflow_list_subscriptions",
  "List active subscriptions (SaaS tools, services) with cost and renewal info.",
  {
    status: z
      .enum(["trial", "active", "paused", "cancelled", "expired"])
      .optional()
      .describe("Filter by status (default: all)"),
    search: z.string().optional().describe("Search by tool name"),
    limit: z.number().min(1).max(50).default(20),
  },
  async (params) => {
    const user = await resolveUser();
    const conditions = [eq(schema.subscriptions.tenantId, user.tenantId!)];

    if (params.status) conditions.push(eq(schema.subscriptions.status, params.status));
    if (params.search) {
      conditions.push(ilike(schema.subscriptions.toolName, `%${params.search}%`));
    }

    const items = await db.query.subscriptions.findMany({
      where: and(...conditions),
      limit: params.limit,
      orderBy: [desc(schema.subscriptions.totalCost)],
      with: { vendor: true, department: true },
    });

    if (items.length === 0) return ok("No subscriptions found.");

    const totalMonthlyCost = items.reduce((sum, s) => {
      const cost = parseFloat(s.totalCost);
      if (s.billingCycle === "annually") return sum + cost / 12;
      if (s.billingCycle === "quarterly") return sum + cost / 3;
      return sum + cost;
    }, 0);

    const rows = items.map(
      (s) =>
        `  **${s.toolName}** | ${fmt(s.totalCost)}/${s.billingCycle} | ${s.status?.toUpperCase()} | ${s.seats ? `${s.activeSeats || 0}/${s.seats} seats` : "no seat limit"}`
    );

    return ok(
      [
        `## Subscriptions (${items.length})`,
        `Est. monthly cost: **${fmt(totalMonthlyCost)}**`,
        "",
        rows.join("\n"),
      ].join("\n")
    );
  }
);

// ===========================================================================
// BUDGETS & SPEND
// ===========================================================================

server.tool(
  "reqflow_get_budget_status",
  "Get budget status showing allocated, committed, spent, and remaining amounts for each department.",
  {},
  async () => {
    const user = await resolveUser();

    const budgetList = await db.query.budgets.findMany({
      where: eq(schema.budgets.tenantId, user.tenantId!),
      with: { department: true },
      orderBy: [desc(schema.budgets.allocated)],
    });

    if (budgetList.length === 0) {
      return ok("No budgets configured for your organization.");
    }

    const rows = budgetList.map((b) => {
      const allocated = parseFloat(b.allocated);
      const committed = parseFloat(b.committed);
      const spent = parseFloat(b.spent);
      const remaining = allocated - committed - spent;
      const utilization = allocated > 0 ? ((committed + spent) / allocated) * 100 : 0;
      const bar = utilization > 90 ? "🔴" : utilization > 75 ? "🟠" : "🟢";

      return [
        `${bar} **${b.department?.name || "Unknown"}**`,
        `  Allocated: ${fmt(allocated)} | Spent: ${fmt(spent)} | Committed: ${fmt(committed)}`,
        `  Remaining: ${fmt(remaining)} | Utilization: ${utilization.toFixed(1)}%`,
      ].join("\n");
    });

    const totalAllocated = budgetList.reduce(
      (sum, b) => sum + parseFloat(b.allocated),
      0
    );
    const totalUsed = budgetList.reduce(
      (sum, b) => sum + parseFloat(b.spent) + parseFloat(b.committed),
      0
    );

    return ok(
      [
        `## Budget Status`,
        `Total: ${fmt(totalAllocated)} allocated | ${fmt(totalUsed)} used | ${fmt(totalAllocated - totalUsed)} remaining`,
        "",
        rows.join("\n\n"),
      ].join("\n")
    );
  }
);

server.tool(
  "reqflow_get_spend_summary",
  "Get a spend summary for approved requests grouped by department, category, vendor, or month.",
  {
    group_by: z
      .enum(["department", "category", "vendor", "month"])
      .default("category"),
    period_days: z.number().min(1).max(365).default(30),
  },
  async (params) => {
    const user = await resolveUser();
    const since = new Date(Date.now() - params.period_days * 24 * 60 * 60 * 1000);

    const base = and(
      eq(schema.requests.tenantId, user.tenantId!),
      eq(schema.requests.status, "approved"),
      gte(schema.requests.approvedAt, since)
    );

    let results: { name: string | null; total: string; count: number }[];
    let groupField: string;

    if (params.group_by === "department") {
      groupField = "Department";
      results = await db
        .select({
          name: schema.departments.name,
          total: sql<string>`coalesce(sum(${schema.requests.amount}), '0')`,
          count: count(),
        })
        .from(schema.requests)
        .leftJoin(schema.departments, eq(schema.requests.departmentId, schema.departments.id))
        .where(base)
        .groupBy(schema.departments.name)
        .orderBy(desc(sql`sum(${schema.requests.amount})`));
    } else if (params.group_by === "vendor") {
      groupField = "Vendor";
      results = await db
        .select({
          name: schema.requests.vendorName,
          total: sql<string>`coalesce(sum(${schema.requests.amount}), '0')`,
          count: count(),
        })
        .from(schema.requests)
        .where(base)
        .groupBy(schema.requests.vendorName)
        .orderBy(desc(sql`sum(${schema.requests.amount})`));
    } else if (params.group_by === "month") {
      groupField = "Month";
      results = await db
        .select({
          name: sql<string>`to_char(${schema.requests.approvedAt}, 'YYYY-MM')`,
          total: sql<string>`coalesce(sum(${schema.requests.amount}), '0')`,
          count: count(),
        })
        .from(schema.requests)
        .where(base)
        .groupBy(sql`to_char(${schema.requests.approvedAt}, 'YYYY-MM')`)
        .orderBy(asc(sql`to_char(${schema.requests.approvedAt}, 'YYYY-MM')`));
    } else {
      groupField = "Category";
      results = await db
        .select({
          name: schema.requests.category,
          total: sql<string>`coalesce(sum(${schema.requests.amount}), '0')`,
          count: count(),
        })
        .from(schema.requests)
        .where(base)
        .groupBy(schema.requests.category)
        .orderBy(desc(sql`sum(${schema.requests.amount})`));
    }

    if (results.length === 0) {
      return ok(`No approved spend in the last ${params.period_days} days.`);
    }

    const grandTotal = results.reduce((s, r) => s + parseFloat(r.total), 0);
    const totalCount = results.reduce((s, r) => s + r.count, 0);

    const rows = results.map(
      (r) =>
        `  ${r.name || "Uncategorized"}: ${fmt(r.total)} (${r.count} request${r.count !== 1 ? "s" : ""})`
    );

    return ok(
      [
        `## Spend Summary — last ${params.period_days} days`,
        `Total: **${fmt(grandTotal)}** across ${totalCount} approved request(s)`,
        "",
        `By ${groupField}:`,
        ...rows,
      ].join("\n")
    );
  }
);

// ===========================================================================
// TEAM
// ===========================================================================

server.tool(
  "reqflow_list_team",
  "List team members in your organization. Useful for understanding who can approve requests and who is in which department.",
  {
    role: z
      .enum(["requester", "manager", "finance", "admin"])
      .optional()
      .describe("Filter by role"),
    search: z.string().optional().describe("Search by name or email"),
    limit: z.number().min(1).max(100).default(30),
  },
  async (params) => {
    const user = await resolveUser();
    const conditions = [
      eq(schema.users.tenantId, user.tenantId!),
      eq(schema.users.isActive, true),
    ];

    if (params.role) conditions.push(eq(schema.users.role, params.role));
    if (params.search) {
      conditions.push(
        or(
          ilike(schema.users.name, `%${params.search}%`),
          ilike(schema.users.email, `%${params.search}%`)
        )!
      );
    }

    const members = await db.query.users.findMany({
      where: and(...conditions),
      limit: params.limit,
      orderBy: [asc(schema.users.name)],
      with: { department: true },
    });

    if (members.length === 0) return ok("No team members found.");

    const rows = members.map(
      (m) =>
        `  **${m.name || m.email}** | ${m.role.toUpperCase()} | ${(m as { department?: { name: string } | null }).department?.name || "No dept"} | ${m.email}`
    );

    const approvers = members.filter(
      (m) => m.role === "admin" || m.role === "manager"
    );

    return ok(
      [
        `## Team (${members.length} active members)`,
        `Approvers: ${approvers.length} (managers + admins)`,
        "",
        rows.join("\n"),
      ].join("\n")
    );
  }
);

// ===========================================================================
// NOTIFICATIONS
// ===========================================================================

server.tool(
  "reqflow_get_notifications",
  "Get your recent unread notifications. Shows what actions have happened that need your attention.",
  {
    limit: z.number().min(1).max(30).default(10),
    unread_only: z.boolean().default(true),
  },
  async (params) => {
    const user = await resolveUser();
    const conditions = [eq(schema.notifications.userId, user.id)];
    if (params.unread_only) conditions.push(eq(schema.notifications.read, false));

    const items = await db.query.notifications.findMany({
      where: and(...conditions),
      limit: params.limit,
      orderBy: [desc(schema.notifications.createdAt)],
    });

    if (items.length === 0) {
      return ok(params.unread_only ? "No unread notifications. ✅" : "No notifications found.");
    }

    const rows = items.map(
      (n) =>
        `  ${n.read ? "·" : "🔔"} **${n.type?.replace(/_/g, " ") || "Notification"}** — ${n.message || "No message"}\n     ${fmtDate(n.createdAt)}`
    );

    return ok(
      [`${items.length} notification(s):`, "", rows.join("\n\n")].join("\n")
    );
  }
);

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

async function main() {
  const user = await resolveUser();
  console.error(
    `Reqflow MCP v2 — authenticated as ${user.name || user.email} (${user.role})`
  );
  console.error(`20 tools available. Ask Claude what you need.`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
