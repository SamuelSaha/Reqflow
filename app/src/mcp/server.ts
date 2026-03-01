/**
 * Reqflow MCP Server
 *
 * Exposes procurement workflow tools via the Model Context Protocol.
 * Designed for stdio transport (Claude Desktop, Cursor, etc.)
 *
 * Auth: Set REQFLOW_USER_EMAIL to authenticate as a specific user.
 * Database: Set DATABASE_URL to connect to the Reqflow database.
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
  sum,
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

const db = drizzle(queryClient, { schema });

// Resolve authenticated user at startup
async function resolveUser() {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, USER_EMAIL!),
  });
  if (!user) {
    console.error(`User not found: ${USER_EMAIL}`);
    process.exit(1);
  }
  if (!user.tenantId) {
    console.error(`User ${USER_EMAIL} has no tenant`);
    process.exit(1);
  }
  return user;
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "reqflow",
  version: "1.0.0",
});

// ---------------------------------------------------------------------------
// Tool 1: List Requests
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_list_requests",
  "List purchase requests with optional filters. Returns request number, title, vendor, amount, status, and dates.",
  {
    status: z
      .enum(["draft", "pending", "approved", "rejected", "cancelled"])
      .optional()
      .describe("Filter by request status"),
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
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(20)
      .describe("Max results to return (default 20)"),
    sort_by: z
      .enum(["createdAt", "amount", "status", "title"])
      .default("createdAt")
      .describe("Sort field"),
    sort_order: z
      .enum(["asc", "desc"])
      .default("desc")
      .describe("Sort direction"),
  },
  async (params) => {
    const user = await resolveUser();
    const conditions = [eq(schema.requests.tenantId, user.tenantId!)];

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
    const orderBy =
      params.sort_order === "asc" ? [asc(sortCol)] : [desc(sortCol)];

    const items = await db.query.requests.findMany({
      where: and(...conditions),
      limit: params.limit,
      orderBy,
      with: { department: true, requester: true },
    });

    if (items.length === 0) {
      return { content: [{ type: "text" as const, text: "No requests found matching your criteria." }] };
    }

    const rows = items.map((r) =>
      [
        `${r.requestNumber} | ${r.title}`,
        `  Vendor: ${r.vendorName || "N/A"} | Amount: €${parseFloat(r.amount).toFixed(2)} | Status: ${r.status.toUpperCase()}`,
        `  Urgency: ${r.urgency} | Frequency: ${r.frequency} | Dept: ${r.department?.name || "N/A"}`,
        `  Requester: ${r.requester?.name || r.requester?.email || "N/A"} | Created: ${new Date(r.createdAt).toLocaleDateString("en-GB")}`,
      ].join("\n")
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${items.length} request(s):\n\n${rows.join("\n\n")}`,
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool 2: Get Request Details
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_get_request",
  "Get full details of a purchase request including its approval chain. Accepts request ID or request number (e.g. REQ-2026-0001).",
  {
    identifier: z
      .string()
      .describe("Request ID (UUID) or request number (REQ-YYYY-NNNN)"),
  },
  async (params) => {
    const user = await resolveUser();

    const isRequestNumber = params.identifier.startsWith("REQ-");
    const request = await db.query.requests.findFirst({
      where: and(
        eq(schema.requests.tenantId, user.tenantId!),
        isRequestNumber
          ? eq(schema.requests.requestNumber, params.identifier)
          : eq(schema.requests.id, params.identifier)
      ),
      with: {
        requester: true,
        department: true,
        budget: true,
      },
    });

    if (!request) {
      return {
        content: [{ type: "text" as const, text: `Request not found: ${params.identifier}` }],
        isError: true,
      };
    }

    // Fetch approval chain
    const approvalChain = await db.query.approvals.findMany({
      where: and(
        eq(schema.approvals.requestId, request.id),
        eq(schema.approvals.tenantId, user.tenantId!)
      ),
      orderBy: [schema.approvals.step],
      with: { approver: true },
    });

    const lines = [
      `# ${request.requestNumber} — ${request.title}`,
      "",
      `**Status:** ${request.status.toUpperCase()}`,
      `**Amount:** €${parseFloat(request.amount).toFixed(2)} (${request.frequency})`,
      `**Vendor:** ${request.vendorName || "N/A"}`,
      `**Category:** ${request.category || "N/A"}`,
      `**Urgency:** ${request.urgency}`,
      `**Requester:** ${request.requester?.name || request.requester?.email || "N/A"}`,
      `**Department:** ${request.department?.name || "N/A"}`,
      `**Created:** ${new Date(request.createdAt).toLocaleDateString("en-GB")}`,
      request.approvedAt ? `**Approved:** ${new Date(request.approvedAt).toLocaleDateString("en-GB")}` : "",
      request.rejectedAt ? `**Rejected:** ${new Date(request.rejectedAt).toLocaleDateString("en-GB")}` : "",
      request.description ? `\n**Description:**\n${request.description}` : "",
    ];

    if (approvalChain.length > 0) {
      lines.push("", "## Approval Chain");
      for (const a of approvalChain) {
        const status =
          a.decision === "approved" ? "APPROVED" :
          a.decision === "rejected" ? "REJECTED" : "PENDING";
        lines.push(
          `  Step ${a.step}: ${a.approver?.name || a.approver?.email || "Unknown"} — ${status}${a.comments ? ` (${a.comments})` : ""}`
        );
      }
    }

    return {
      content: [{ type: "text" as const, text: lines.filter(Boolean).join("\n") }],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool 3: Create Request
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_create_request",
  "Create a new purchase request. The request is created in draft status. Use reqflow_submit_request to submit it for approval.",
  {
    title: z.string().min(1).max(200).describe("Brief title for the purchase request"),
    description: z
      .string()
      .max(5000)
      .optional()
      .describe("Detailed justification for the purchase"),
    vendor_name: z.string().max(200).optional().describe("Vendor or supplier name"),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/).describe("Total cost (e.g. '1500.00')"),
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

    const [created] = await db
      .insert(schema.requests)
      .values({
        tenantId: user.tenantId!,
        requesterId: user.id,
        departmentId: user.departmentId!,
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

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `Request created successfully!`,
            "",
            `**${requestNumber}** — ${params.title}`,
            `Amount: €${parseFloat(params.amount).toFixed(2)} (${params.frequency})`,
            `Status: DRAFT`,
            "",
            `Use reqflow_submit_request to submit it for approval.`,
          ].join("\n"),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool 4: Submit Request for Approval
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_submit_request",
  "Submit a draft request for approval. Triggers the approval workflow and routes to the appropriate approvers.",
  {
    identifier: z
      .string()
      .describe("Request ID (UUID) or request number (REQ-YYYY-NNNN)"),
  },
  async (params) => {
    const user = await resolveUser();

    const isRequestNumber = params.identifier.startsWith("REQ-");
    const request = await db.query.requests.findFirst({
      where: and(
        eq(schema.requests.tenantId, user.tenantId!),
        eq(schema.requests.requesterId, user.id),
        isRequestNumber
          ? eq(schema.requests.requestNumber, params.identifier)
          : eq(schema.requests.id, params.identifier)
      ),
    });

    if (!request) {
      return {
        content: [{ type: "text" as const, text: `Request not found or you don't own it: ${params.identifier}` }],
        isError: true,
      };
    }
    if (request.status !== "draft") {
      return {
        content: [{ type: "text" as const, text: `Request ${request.requestNumber} is already ${request.status}. Only draft requests can be submitted.` }],
        isError: true,
      };
    }

    // Update status to pending
    await db
      .update(schema.requests)
      .set({
        status: "pending",
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.requests.id, request.id));

    // Find an approver — default to any admin/manager in the tenant
    const approver = await db.query.users.findFirst({
      where: and(
        eq(schema.users.tenantId, user.tenantId!),
        or(
          eq(schema.users.role, "admin"),
          eq(schema.users.role, "manager")
        )
      ),
    });

    if (approver) {
      await db.insert(schema.approvals).values({
        tenantId: user.tenantId!,
        requestId: request.id,
        approverId: approver.id,
        step: 1,
        required: "required",
        decision: "pending",
      });
    }

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `Request ${request.requestNumber} submitted for approval!`,
            "",
            approver
              ? `Routed to: ${approver.name || approver.email}`
              : `No approver found — an admin will need to review manually.`,
          ].join("\n"),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool 5: List Pending Approvals
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_list_pending_approvals",
  "List approval requests waiting for the current user's decision. Shows request details, amount, urgency, and requester info.",
  {
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(20)
      .describe("Max results (default 20)"),
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
          with: {
            requester: true,
            department: true,
          },
        },
      },
    });

    if (items.length === 0) {
      return {
        content: [{ type: "text" as const, text: "No pending approvals. You're all caught up!" }],
      };
    }

    const rows = items.map((a, i) => {
      const r = a.request;
      return [
        `${i + 1}. **${r.requestNumber}** — ${r.title}`,
        `   Amount: €${parseFloat(r.amount).toFixed(2)} (${r.frequency}) | Urgency: ${r.urgency}`,
        `   Vendor: ${r.vendorName || "N/A"} | Dept: ${r.department?.name || "N/A"}`,
        `   Requester: ${r.requester?.name || r.requester?.email || "N/A"} | Submitted: ${r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("en-GB") : "N/A"}`,
        `   Approval ID: ${a.id}`,
      ].join("\n");
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `You have ${items.length} pending approval(s):\n\n${rows.join("\n\n")}`,
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool 6: Approve Request
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_approve_request",
  "Approve a pending request. Provide the approval ID from reqflow_list_pending_approvals.",
  {
    approval_id: z.string().uuid().describe("The approval ID to approve"),
    comments: z
      .string()
      .max(1000)
      .optional()
      .describe("Optional approval comments"),
  },
  async (params) => {
    const user = await resolveUser();

    // Verify this approval belongs to the current user
    const approval = await db.query.approvals.findFirst({
      where: and(
        eq(schema.approvals.id, params.approval_id),
        eq(schema.approvals.tenantId, user.tenantId!),
        eq(schema.approvals.approverId, user.id),
        eq(schema.approvals.decision, "pending")
      ),
      with: { request: true },
    });

    if (!approval) {
      return {
        content: [{ type: "text" as const, text: "Approval not found, already decided, or not assigned to you." }],
        isError: true,
      };
    }

    // Update approval decision
    await db
      .update(schema.approvals)
      .set({
        decision: "approved",
        comments: params.comments,
        decidedAt: new Date(),
      })
      .where(eq(schema.approvals.id, params.approval_id));

    // Check if all required approvals for this request are done
    const pendingApprovals = await db
      .select({ count: count() })
      .from(schema.approvals)
      .where(
        and(
          eq(schema.approvals.requestId, approval.requestId),
          eq(schema.approvals.decision, "pending"),
          eq(schema.approvals.required, "required")
        )
      );

    const allApproved = pendingApprovals[0].count === 0;

    if (allApproved) {
      // All required approvals done — mark request as approved
      await db
        .update(schema.requests)
        .set({
          status: "approved",
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.requests.id, approval.requestId));
    }

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `Approved: ${approval.request.requestNumber} — ${approval.request.title}`,
            `Amount: €${parseFloat(approval.request.amount).toFixed(2)}`,
            params.comments ? `Comments: ${params.comments}` : "",
            "",
            allApproved
              ? "All required approvals received — request is now APPROVED."
              : "Your approval recorded. Waiting for remaining approvers.",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool 7: Reject Request
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_reject_request",
  "Reject a pending request. A reason is required when rejecting.",
  {
    approval_id: z.string().uuid().describe("The approval ID to reject"),
    reason: z.string().min(1).max(1000).describe("Reason for rejection"),
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

    if (!approval) {
      return {
        content: [{ type: "text" as const, text: "Approval not found, already decided, or not assigned to you." }],
        isError: true,
      };
    }

    // Update approval decision
    await db
      .update(schema.approvals)
      .set({
        decision: "rejected",
        comments: params.reason,
        decidedAt: new Date(),
      })
      .where(eq(schema.approvals.id, params.approval_id));

    // Any rejection rejects the whole request
    await db
      .update(schema.requests)
      .set({
        status: "rejected",
        rejectedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.requests.id, approval.requestId));

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `Rejected: ${approval.request.requestNumber} — ${approval.request.title}`,
            `Reason: ${params.reason}`,
            "",
            "Request has been rejected. The requester will be notified.",
          ].join("\n"),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool 8: Spend Summary
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_get_spend_summary",
  "Get a spend summary for approved requests. Can be grouped by department, category, vendor, or month.",
  {
    group_by: z
      .enum(["department", "category", "vendor", "month"])
      .default("category")
      .describe("How to group the spend data"),
    period_days: z
      .number()
      .min(1)
      .max(365)
      .default(30)
      .describe("Number of days to look back (default 30)"),
  },
  async (params) => {
    const user = await resolveUser();
    const since = new Date(Date.now() - params.period_days * 24 * 60 * 60 * 1000);

    const baseConditions = and(
      eq(schema.requests.tenantId, user.tenantId!),
      eq(schema.requests.status, "approved"),
      gte(schema.requests.approvedAt, since)
    );

    let groupField: string;
    let groupColumn;

    if (params.group_by === "department") {
      groupField = "Department";
      // Join with departments
      const results = await db
        .select({
          name: schema.departments.name,
          total: sql<string>`coalesce(sum(${schema.requests.amount}), '0')`,
          count: count(),
        })
        .from(schema.requests)
        .leftJoin(
          schema.departments,
          eq(schema.requests.departmentId, schema.departments.id)
        )
        .where(baseConditions)
        .groupBy(schema.departments.name)
        .orderBy(desc(sql`sum(${schema.requests.amount})`));

      return formatSpendResult(groupField, results, params.period_days);
    }

    if (params.group_by === "vendor") {
      groupField = "Vendor";
      const results = await db
        .select({
          name: schema.requests.vendorName,
          total: sql<string>`coalesce(sum(${schema.requests.amount}), '0')`,
          count: count(),
        })
        .from(schema.requests)
        .where(baseConditions)
        .groupBy(schema.requests.vendorName)
        .orderBy(desc(sql`sum(${schema.requests.amount})`));

      return formatSpendResult(groupField, results, params.period_days);
    }

    if (params.group_by === "month") {
      groupField = "Month";
      const results = await db
        .select({
          name: sql<string>`to_char(${schema.requests.approvedAt}, 'YYYY-MM')`,
          total: sql<string>`coalesce(sum(${schema.requests.amount}), '0')`,
          count: count(),
        })
        .from(schema.requests)
        .where(baseConditions)
        .groupBy(sql`to_char(${schema.requests.approvedAt}, 'YYYY-MM')`)
        .orderBy(asc(sql`to_char(${schema.requests.approvedAt}, 'YYYY-MM')`));

      return formatSpendResult(groupField, results, params.period_days);
    }

    // Default: category
    groupField = "Category";
    const results = await db
      .select({
        name: schema.requests.category,
        total: sql<string>`coalesce(sum(${schema.requests.amount}), '0')`,
        count: count(),
      })
      .from(schema.requests)
      .where(baseConditions)
      .groupBy(schema.requests.category)
      .orderBy(desc(sql`sum(${schema.requests.amount})`));

    return formatSpendResult(groupField, results, params.period_days);
  }
);

function formatSpendResult(
  groupField: string,
  results: { name: string | null; total: string; count: number }[],
  periodDays: number
) {
  if (results.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No approved spend in the last ${periodDays} days.`,
        },
      ],
    };
  }

  const grandTotal = results.reduce(
    (sum, r) => sum + parseFloat(r.total),
    0
  );
  const totalCount = results.reduce((sum, r) => sum + r.count, 0);

  const rows = results.map(
    (r) =>
      `  ${r.name || "Uncategorized"}: €${parseFloat(r.total).toFixed(2)} (${r.count} request${r.count !== 1 ? "s" : ""})`
  );

  return {
    content: [
      {
        type: "text" as const,
        text: [
          `## Spend Summary (last ${periodDays} days)`,
          `**Total:** €${grandTotal.toFixed(2)} across ${totalCount} approved request(s)`,
          "",
          `**By ${groupField}:**`,
          ...rows,
        ].join("\n"),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Tool 9: List Subscriptions
// ---------------------------------------------------------------------------

server.tool(
  "reqflow_list_subscriptions",
  "List active subscriptions (SaaS tools, services) with cost and renewal info.",
  {
    status: z
      .enum(["trial", "active", "paused", "cancelled", "expired"])
      .optional()
      .describe("Filter by subscription status (default: all)"),
    search: z.string().optional().describe("Search by tool name"),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(20)
      .describe("Max results (default 20)"),
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

    if (items.length === 0) {
      return {
        content: [{ type: "text" as const, text: "No subscriptions found." }],
      };
    }

    const totalMonthlyCost = items.reduce((sum, s) => {
      const cost = parseFloat(s.totalCost);
      if (s.billingCycle === "annually") return sum + cost / 12;
      if (s.billingCycle === "quarterly") return sum + cost / 3;
      return sum + cost;
    }, 0);

    const rows = items.map(
      (s) =>
        `  ${s.toolName} | €${parseFloat(s.totalCost).toFixed(2)}/${s.billingCycle} | ${s.status.toUpperCase()} | ${s.vendor?.name || "N/A"} | ${s.seats ? `${s.activeSeats || 0}/${s.seats} seats` : "N/A"}`
    );

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `## Subscriptions (${items.length} found)`,
            `**Est. Monthly Cost:** €${totalMonthlyCost.toFixed(2)}`,
            "",
            ...rows,
          ].join("\n"),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool 10: Get Budget Status
// ---------------------------------------------------------------------------

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
      return {
        content: [{ type: "text" as const, text: "No budgets configured for your organization." }],
      };
    }

    const rows = budgetList.map((b) => {
      const allocated = parseFloat(b.allocated);
      const committed = parseFloat(b.committed);
      const spent = parseFloat(b.spent);
      const remaining = allocated - committed - spent;
      const utilization = allocated > 0 ? ((committed + spent) / allocated) * 100 : 0;

      return [
        `**${b.department?.name || "Unknown Dept"}**`,
        `  Allocated: €${allocated.toFixed(2)}`,
        `  Committed: €${committed.toFixed(2)}`,
        `  Spent: €${spent.toFixed(2)}`,
        `  Remaining: €${remaining.toFixed(2)}`,
        `  Utilization: ${utilization.toFixed(1)}%${utilization > 90 ? " ⚠️" : ""}`,
      ].join("\n");
    });

    const totalAllocated = budgetList.reduce(
      (sum, b) => sum + parseFloat(b.allocated),
      0
    );
    const totalSpent = budgetList.reduce(
      (sum, b) => sum + parseFloat(b.spent) + parseFloat(b.committed),
      0
    );

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `## Budget Status`,
            `**Total Allocated:** €${totalAllocated.toFixed(2)} | **Total Used:** €${totalSpent.toFixed(2)} | **Utilization:** ${totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0}%`,
            "",
            ...rows,
          ].join("\n"),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

async function main() {
  // Verify user exists at startup
  const user = await resolveUser();
  console.error(`Reqflow MCP Server started — authenticated as ${user.name || user.email} (${user.role})`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
