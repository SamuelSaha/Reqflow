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

export async function POST(request: Request) {
  try {
    // 1. Verify Slack signature
    const body = await request.text();
    const isValid = await verifySlackRequest(request, body);

    if (!isValid) {
      console.warn("[Slack Commands] Invalid signature");
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
      console.error("[Slack Commands] Async processing error:", error);
    });

    return immediateResponse;
  } catch (error: unknown) {
    console.error("[Slack Commands] Error:", error);
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
    console.error("[Slack Commands] Quick request error:", error);
    const message = error instanceof Error ? error.message : "Failed to create request";
    await sendToResponseUrl(
      responseUrl,
      buildErrorMessage(message)
    );
  }
}

/**
 * Send message to Slack response_url
 */
async function sendToResponseUrl(responseUrl: string | null, payload: Record<string, unknown>) {
  if (!responseUrl) {
    console.warn("[Slack Commands] No response_url provided");
    return;
  }

  try {
    await fetch(responseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[Slack Commands] Failed to send to response_url:", error);
  }
}
