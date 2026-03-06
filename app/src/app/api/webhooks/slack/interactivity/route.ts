/**
 * Slack Interactivity Webhook
 * Handles modal submissions and button actions
 */

import { NextResponse } from "next/server";
import { verifySlackRequest } from "@/lib/integrations/slack/signature";
import { buildSuccessMessage } from "@/lib/integrations/slack/modals";
import { mapSlackUserToReqflow, getUserMappingErrorMessage } from "@/lib/integrations/slack/user-mapper";
import { createSlackRequest, extractModalValues } from "@/lib/integrations/slack/request-handler";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

export async function POST(request: Request) {
  try {
    // 1. Verify Slack signature
    const body = await request.text();
    const isValid = await verifySlackRequest(request, body);

    if (!isValid) {
      logger.warn("Slack interactivity request has invalid signature", {
        route: "/api/webhooks/slack/interactivity",
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Parse form-encoded payload
    const params = new URLSearchParams(body);
    const payloadStr = params.get("payload");

    if (!payloadStr) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);
    const { type, user, team, view, response_url } = payload;

    // 3. Handle different interaction types
    if (type === "view_submission") {
      return await handleModalSubmission(view, user.id, team.id, response_url);
    }

    // Future: handle block_actions for approve/reject buttons
    if (type === "block_actions") {
      return NextResponse.json({ text: "Button actions coming soon!" });
    }

    return NextResponse.json({ text: "Unknown interaction type" });
  } catch (error: unknown) {
    logger.error("Slack interactivity webhook failed", error as Error, {
      route: "/api/webhooks/slack/interactivity",
    });
    captureError(error as Error, { route: "/api/webhooks/slack/interactivity" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle modal form submission
 */
async function handleModalSubmission(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  view: any,
  slackUserId: string,
  slackTeamId: string,
  responseUrl: string | null
) {
  try {
    // 1. Extract form values
    const values = view.state.values;
    const input = extractModalValues(values);

    // 2. Map Slack user to Reqflow user
    let mappedUser;
    try {
      mappedUser = await mapSlackUserToReqflow(slackUserId, slackTeamId);
    } catch (error: unknown) {
      // Return error in modal - this shows error message in the modal itself
      return NextResponse.json({
        response_action: "errors",
        errors: {
          title_block: getUserMappingErrorMessage(error as Error),
        },
      });
    }

    if (!mappedUser) {
      return NextResponse.json({
        response_action: "errors",
        errors: {
          title_block:
            "Your Slack account isn't linked to Reqflow. Contact your admin.",
        },
      });
    }

    // 3. Create request
    const result = await createSlackRequest(
      mappedUser.userId,
      mappedUser.tenantId,
      mappedUser.departmentId,
      input
    );

    // 4. Close modal and send success message
    // The modal will close automatically
    // We send a follow-up message via response_url if available
    if (responseUrl) {
      await sendToResponseUrl(
        responseUrl,
        buildSuccessMessage(
          result.requestNumber,
          result.workflowName,
          result.approvalSteps
        )
      );
    }

    // Return empty response to close modal
    return NextResponse.json({});
  } catch (error: unknown) {
    logger.error("Slack modal submission failed", error as Error, {
      source: "slack_interactivity",
    });
    captureError(error as Error, { source: "slack_interactivity" });

    // Show error in modal
    const message = error instanceof Error ? error.message : "Failed to create request";
    return NextResponse.json({
      response_action: "errors",
      errors: {
        title_block: message,
      },
    });
  }
}

/**
 * Send message to Slack response_url
 * 🔒 SECURITY: Whitelisted to hooks.slack.com only (SSRF prevention)
 */
async function sendToResponseUrl(responseUrl: string | null, payload: Record<string, unknown>) {
  if (!responseUrl) {
    logger.warn("No response_url provided for Slack interactivity", {
      source: "slack_interactivity",
    });
    return;
  }

  // 🔒 SECURITY: Only allow official Slack response URLs to prevent SSRF
  if (!responseUrl.startsWith("https://hooks.slack.com/")) {
    logger.warn("Rejected non-Slack response_url", {
      source: "slack_interactivity",
      prefix: responseUrl.substring(0, 40),
    });
    return;
  }

  try {
    await fetch(responseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    logger.error("Failed to send to Slack response_url", error as Error, {
      source: "slack_interactivity",
    });
  }
}
