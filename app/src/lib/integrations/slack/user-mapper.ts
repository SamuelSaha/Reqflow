/**
 * Slack User Mapper
 * Maps Slack user IDs to Reqflow user accounts
 */

import { WebClient } from "@slack/web-api";
import { db } from "@/lib/db";
import { users, slackUserMappings, slackWorkspaces } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/monitoring/logger";

export interface MappedUser {
  userId: string;
  tenantId: string;
  departmentId: string;
}

/**
 * Map Slack user ID to Reqflow user account
 * @param slackUserId - Slack user ID (e.g., U1234567890)
 * @param slackTeamId - Slack team/workspace ID
 * @returns Mapped user info or null if not found
 */
export async function mapSlackUserToReqflow(
  slackUserId: string,
  slackTeamId: string
): Promise<MappedUser | null> {
  // 1. Check for existing mapping (cache)
  const mapping = await db.query.slackUserMappings.findFirst({
    where: and(
      eq(slackUserMappings.slackUserId, slackUserId),
      eq(slackUserMappings.tenantId, slackTeamId) // Note: tenantId is organization UUID
    ),
    with: {
      user: true,
    },
  });

  if (mapping && mapping.user) {
    // Ensure user has required fields
    if (!mapping.user.departmentId) {
      throw new Error("User has no department assigned");
    }

    return {
      userId: mapping.user.id,
      tenantId: mapping.tenantId,
      departmentId: mapping.user.departmentId,
    };
  }

  // 2. Get workspace to fetch bot token
  const workspace = await db.query.slackWorkspaces.findFirst({
    where: eq(slackWorkspaces.slackTeamId, slackTeamId),
  });

  if (!workspace) {
    throw new Error("Slack workspace not connected to Reqflow");
  }

  // 3. Fetch user email from Slack API
  const slackClient = new WebClient(workspace.botToken);

  let userInfo;
  try {
    userInfo = await slackClient.users.info({ user: slackUserId });
  } catch (error: unknown) {
    logger.error("Failed to fetch Slack user info", error as Error, {
      slackUserId,
      source: "slack_user_mapper",
    });
    throw new Error("Failed to fetch user information from Slack");
  }

  if (!userInfo.user?.profile?.email) {
    return null; // User has no email in Slack profile
  }

  const email = userInfo.user.profile.email.toLowerCase();

  // 4. Find Reqflow user by email
  const reqflowUser = await db.query.users.findFirst({
    where: and(
      eq(users.email, email),
      eq(users.tenantId, workspace.tenantId),
      eq(users.isActive, true)
    ),
  });

  if (!reqflowUser) {
    return null; // No matching user in Reqflow
  }

  // Ensure user has department
  if (!reqflowUser.departmentId) {
    throw new Error("User has no department assigned");
  }

  // 5. Create mapping for future lookups
  await db.insert(slackUserMappings).values({
    tenantId: workspace.tenantId,
    slackUserId,
    reqflowUserId: reqflowUser.id,
    slackEmail: email,
  });

  logger.info("Created Slack user mapping", {
    slackUserId,
    reqflowEmail: reqflowUser.email,
    tenantId: workspace.tenantId,
    source: "slack_user_mapper",
  });

  return {
    userId: reqflowUser.id,
    tenantId: workspace.tenantId,
    departmentId: reqflowUser.departmentId,
  };
}

/**
 * Get user-friendly error message for mapping failures
 * @param error - Error from mapSlackUserToReqflow
 * @param email - User's email if known
 * @returns Formatted error message for Slack
 */
export function getUserMappingErrorMessage(
  error: Error,
  email?: string
): string {
  if (error.message.includes("workspace not connected")) {
    return "This Slack workspace isn't connected to Reqflow. Please contact your admin to set up the integration.";
  }

  if (error.message.includes("no department")) {
    return "Your Reqflow account needs a department assignment. Please contact your admin.";
  }

  if (email) {
    return `Your Slack email (${email}) doesn't match any active Reqflow account. Please contact your admin to get access.`;
  }

  return "Unable to verify your identity. Please contact your admin.";
}
