/**
 * Slack Client Helper
 * Sends approval notifications to Slack users
 */

import { WebClient } from "@slack/web-api";
import { env } from "@/lib/env";
import { buildApprovalMessage, type ApprovalMessageParams } from "./messages";
import { logger } from "@/lib/monitoring/logger";
import { withCircuitBreaker, CircuitBreakerError } from "@/lib/resilience/circuit-breaker";

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
      logger.info("Slack not configured, skipping notification");
      return { success: false, error: "Slack not configured" };
    }

    // Find Slack user by email (with circuit breaker)
    const approverEmail = params.approverName; // This will actually be the email from the caller
    const userLookup = await withCircuitBreaker(
      "slack-api",
      () => slack.users.lookupByEmail({ email: approverEmail }),
      { threshold: 5, timeout: 60000, requestTimeout: 10000 }
    );

    if (!userLookup.ok || !userLookup.user?.id) {
      logger.warn("Slack user not found for email", { email: approverEmail });
      return { success: false, error: "User not found in Slack workspace" };
    }

    const slackUserId = userLookup.user.id;

    // Build message
    const message = buildApprovalMessage(params);

    // Send DM to user (with circuit breaker)
    const result = await withCircuitBreaker(
      "slack-api",
      () =>
        slack.chat.postMessage({
          channel: slackUserId,
          text: message.text,
          blocks: message.blocks,
        }),
      { threshold: 5, timeout: 60000, requestTimeout: 10000 }
    );

    if (!result.ok) {
      logger.error("Failed to send Slack message", { slackError: result.error });
      return { success: false, error: result.error };
    }

    return {
      success: true,
      timestamp: result.ts,
    };
  } catch (error) {
    if (error instanceof CircuitBreakerError) {
      logger.warn("Slack API circuit breaker open", {
        service: error.serviceName,
        state: error.state,
      });
      return {
        success: false,
        error: "Slack service temporarily unavailable",
      };
    }

    logger.error("Error sending Slack notification", error as Error);
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
