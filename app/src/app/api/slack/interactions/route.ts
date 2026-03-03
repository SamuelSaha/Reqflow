/**
 * Slack Interactive Components Handler
 * Processes button clicks from approval messages
 * Security: Verifies request signature, validates permissions
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { WebClient } from "@slack/web-api";
import { db } from "@/lib/db";
import { approvals, requests, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { buildApprovalConfirmationMessage } from "@/lib/slack/messages";
import { createAuditLog, AuditAction } from "@/lib/monitoring/audit";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";

const slack = new WebClient(env.SLACK_BOT_TOKEN);

/**
 * Verify Slack request signature
 * Prevents unauthorized webhook calls
 */
function verifySlackSignature(
  body: string,
  timestamp: string,
  signature: string
): boolean {
  const signingSecret = env.SLACK_SIGNING_SECRET;

  // Skip verification if signing secret not configured
  if (!signingSecret) {
    logger.warn("SLACK_SIGNING_SECRET not configured, skipping verification");
    return true;
  }

  // Reject old requests (prevents replay attacks)
  const requestTimestamp = parseInt(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - requestTimestamp) > 60 * 5) {
    return false;
  }

  // Compute signature
  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature =
    "v0=" +
    createHmac("sha256", signingSecret).update(sigBasestring).digest("hex");

  return signature === mySignature;
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const body = await request.text();
    const timestamp = request.headers.get("x-slack-request-timestamp") || "";
    const signature = request.headers.get("x-slack-signature") || "";

    // Verify signature
    if (!verifySlackSignature(body, timestamp, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse payload
    const params = new URLSearchParams(body);
    const payloadStr = params.get("payload");
    if (!payloadStr) {
      return NextResponse.json({ error: "No payload" }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);
    const action = payload.actions?.[0];
    const actionId = action?.action_id;
    const requestId = action?.value;

    if (!actionId || !requestId) {
      return NextResponse.json(
        { error: "Missing action data" },
        { status: 400 }
      );
    }

    // Get Slack user info to map to app user
    const slackUserId = payload.user?.id;
    const slackUserInfo = await slack.users.info({ user: slackUserId });
    const slackUserEmail = slackUserInfo.user?.profile?.email;

    if (!slackUserEmail) {
      return NextResponse.json(
        { error: "Could not identify Slack user" },
        { status: 400 }
      );
    }

    // Find the user by email first
    const user = await db.query.users.findFirst({
      where: eq(users.email, slackUserEmail),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in system" },
        { status: 404 }
      );
    }

    // Find approval record for this user/request
    const approval = await db.query.approvals.findFirst({
      where: and(
        eq(approvals.requestId, requestId),
        eq(approvals.approverId, user.id)
      ),
      with: {
        request: true,
        approver: true,
      },
    });

    if (!approval) {
      return NextResponse.json(
        { error: "Approval not found or you don't have permission" },
        { status: 403 }
      );
    }

    // Check if already decided
    if (approval.decision !== "pending") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    // Determine decision
    const decision = actionId === "approve_request" ? "approved" : "rejected";

    // Update approval status
    await db
      .update(approvals)
      .set({
        decision: decision,
        decidedAt: new Date(),
        comments: `Decision made via Slack`,
      })
      .where(eq(approvals.id, approval.id));

    // Check if this was the final approval needed
    const allApprovals = await db.query.approvals.findMany({
      where: eq(approvals.requestId, requestId),
    });

    const approvedCount = allApprovals.filter(
      (a) => a.decision === "approved" || (a.id === approval.id && decision === "approved")
    ).length;
    const rejectedCount = allApprovals.filter(
      (a) => a.decision === "rejected" || (a.id === approval.id && decision === "rejected")
    ).length;

    // If any rejection, mark request as rejected
    // If all approved, mark as approved
    if (rejectedCount > 0) {
      await db
        .update(requests)
        .set({ status: "rejected" })
        .where(eq(requests.id, requestId));
    } else if (approvedCount === allApprovals.length) {
      await db
        .update(requests)
        .set({ status: "approved" })
        .where(eq(requests.id, requestId));
    }

    // Create audit log
    await createAuditLog({
      tenantId: approval.request.tenantId,
      userId: approval.approverId,
      userEmail: approval.approver.email,
      userName: approval.approver.name || "Unknown",
      action:
        decision === "approved"
          ? AuditAction.REQUEST_APPROVED
          : AuditAction.REQUEST_REJECTED,
      entityType: "request",
      entityId: requestId,
      description: `${decision === "approved" ? "Approved" : "Rejected"} request via Slack`,
      metadata: {
        approvalId: approval.id,
        slackUserId,
        channel: "slack",
      },
    });

    // Update Slack message to show decision
    const confirmationMessage = buildApprovalConfirmationMessage(
      {
        request: approval.request,
        approverName: approval.approver.name || "Unknown",
        riskFlags: [], // TODO: Get risk flags from approval
        actionUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/requests/${requestId}`,
      },
      decision,
      approval.approver.name || "Unknown"
    );

    await slack.chat.update({
      channel: payload.channel.id,
      ts: payload.message.ts,
      text: confirmationMessage.text,
      blocks: confirmationMessage.blocks,
    });

    // Return success (Slack expects 200 response)
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Slack interaction error", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
