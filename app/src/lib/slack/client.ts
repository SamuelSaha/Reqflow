/**
 * Slack Client Helper
 * Sends approval notifications to Slack users
 */

import { WebClient } from "@slack/web-api";
import { env } from "@/lib/env";
import { buildApprovalMessage, type ApprovalMessageParams } from "./messages";

const slack = new WebClient(env.SLACK_BOT_TOKEN);

/**
 * Send approval notification to Slack user
 * Returns message timestamp for later updates
 */
export async function sendApprovalNotification(
  params: ApprovalMessageParams
): Promise<{ success: boolean; timestamp?: string; error?: string }> {
  try {
    // Skip if Slack is not configured
    if (!env.SLACK_BOT_TOKEN || !env.SLACK_WORKSPACE_ID) {
      console.log("Slack not configured, skipping notification");
      return { success: false, error: "Slack not configured" };
    }

    // Find Slack user by email
    const approverEmail = params.approverName; // This will actually be the email from the caller
    const userLookup = await slack.users.lookupByEmail({
      email: approverEmail,
    });

    if (!userLookup.ok || !userLookup.user?.id) {
      console.log(`Slack user not found for email: ${approverEmail}`);
      return { success: false, error: "User not found in Slack workspace" };
    }

    const slackUserId = userLookup.user.id;

    // Build message
    const message = buildApprovalMessage(params);

    // Send DM to user
    const result = await slack.chat.postMessage({
      channel: slackUserId, // DM to user
      text: message.text,
      blocks: message.blocks,
    });

    if (!result.ok) {
      console.error("Failed to send Slack message:", result.error);
      return { success: false, error: result.error };
    }

    return {
      success: true,
      timestamp: result.ts,
    };
  } catch (error) {
    console.error("Error sending Slack notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if Slack integration is configured
 */
export function isSlackConfigured(): boolean {
  return !!(env.SLACK_BOT_TOKEN && env.SLACK_WORKSPACE_ID);
}
