/**
 * Slack Slash Command Webhook
 * Handles /request command
 */

import { NextResponse } from "next/server";
import { verifySlackRequest } from "@/lib/integrations/slack/signature";
import { parseRequestCommand, validateParsedRequest } from "@/lib/integrations/slack/parser";
import { buildRequestModal, buildSuccessMessage, buildErrorMessage, buildValidationErrorMessage } from "@/lib/integrations/slack/modals";
import { mapSlackUserToReqflow, getUserMappingErrorMessage } from "@/lib/integrations/slack/user-mapper";
import { createSlackRequest } from "@/lib/integrations/slack/request-handler";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

export async function POST(request: Request) {
  try {
    // 1. Verify Slack signature
    const body = await request.text();
    const isValid = await verifySlackRequest(request, body);

    if (!isValid) {
      logger.warn("Slack command request has invalid signature", {
        route: "/api/webhooks/slack/commands",
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Parse form-encoded body
    const params = new URLSearchParams(body);
    const text = params.get("text") || "";
    const userId = params.get("user_id");
    const teamId = params.get("team_id");
    const responseUrl = params.get("response_url");

    if (!userId || !teamId) {
      return NextResponse.json(
        { error: "Missing user_id or team_id" },
        { status: 400 }
      );
    }

    // 3. Parse command intent
    const parsed = parseRequestCommand(text);

    // 4. Modal flow - return modal view JSON immediately
    if (parsed.intent === "modal") {
      return NextResponse.json(buildRequestModal());
    }

    // 5. Quick request flow - return 200 immediately, process async
    // Send immediate acknowledgment to Slack (required within 3 seconds)
    const immediateResponse = NextResponse.json({ text: "Processing your request..." });

    // Process request asynchronously via response_url
    processQuickRequest(parsed, userId, teamId, responseUrl).catch((error) => {
      logger.error("Slack command async processing failed", error as Error, {
        route: "/api/webhooks/slack/commands",
        userId,
        teamId,
      });
      captureError(error as Error, { route: "/api/webhooks/slack/commands" });
    });

    return immediateResponse;
  } catch (error: unknown) {
    logger.error("Slack commands webhook failed", error as Error, {
      route: "/api/webhooks/slack/commands",
    });
    captureError(error as Error, { route: "/api/webhooks/slack/commands" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Process quick request asynchronously
 * Sends result via response_url
 */
async function processQuickRequest(
  parsed: ReturnType<typeof parseRequestCommand>,
  slackUserId: string,
  slackTeamId: string,
  responseUrl: string | null
) {
  try {
    // 1. Validate parsed data
    const validationError = validateParsedRequest(parsed);
    if (validationError) {
      await sendToResponseUrl(responseUrl, buildValidationErrorMessage("input", validationError));
      return;
    }

    // 2. Map Slack user to Reqflow user
    let mappedUser;
    try {
      mappedUser = await mapSlackUserToReqflow(slackUserId, slackTeamId);
    } catch (error: unknown) {
      await sendToResponseUrl(
        responseUrl,
        buildErrorMessage(getUserMappingErrorMessage(error as Error))
      );
      return;
    }

    if (!mappedUser) {
      await sendToResponseUrl(
        responseUrl,
        buildErrorMessage("Your Slack account isn't linked to Reqflow. Contact your admin.")
      );
      return;
    }

    // 3. Create request
    const result = await createSlackRequest(
      mappedUser.userId,
      mappedUser.tenantId,
      mappedUser.departmentId,
      {
        title: parsed.title!,
        description: undefined,
        category: parsed.category!,
        vendorName: parsed.vendorName,
        amount: parsed.amount!,
        frequency: "one-time",
        urgency: parsed.urgency,
      }
    );

    // 4. Send success message
    await sendToResponseUrl(
      responseUrl,
      buildSuccessMessage(result.requestNumber, result.workflowName, result.approvalSteps)
    );
  } catch (error: unknown) {
    logger.error("Slack quick request creation failed", error as Error, {
      source: "slack_commands",
    });
    captureError(error as Error, { source: "slack_commands" });
    const message = error instanceof Error ? error.message : "Failed to create request";
    await sendToResponseUrl(
      responseUrl,
      buildErrorMessage(message)
    );
  }
}

/**
 * Send message to Slack response_url
 * 🔒 SECURITY: Whitelisted to hooks.slack.com only (SSRF prevention)
 */
async function sendToResponseUrl(responseUrl: string | null, payload: Record<string, unknown>) {
  if (!responseUrl) {
    logger.warn("No response_url provided for Slack command", {
      source: "slack_commands",
    });
    return;
  }

  // 🔒 SECURITY: Only allow official Slack response URLs to prevent SSRF
  if (!responseUrl.startsWith("https://hooks.slack.com/")) {
    logger.warn("Rejected non-Slack response_url", {
      source: "slack_commands",
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
      source: "slack_commands",
    });
  }
}
