/**
 * Slack Block Kit Message Builders
 * Creates interactive messages with approve/reject buttons
 */

import type { Request } from "../db/schema";

export interface ApprovalMessageParams {
  request: Request;
  approverName: string;
  riskFlags: string[];
  actionUrl: string;
}

/**
 * Build Slack Block Kit message for approval notifications
 * Includes interactive Approve/Reject buttons
 */
export function buildApprovalMessage(params: ApprovalMessageParams) {
  const { request, approverName, riskFlags, actionUrl } = params;
  const amount = parseFloat(request.amount);

  return {
    text: `New Approval Required: ${request.title}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🔔 New Approval Required",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Request:*\n${request.title}`,
          },
          {
            type: "mrkdwn",
            text: `*Amount:*\n${request.currency} ${amount.toLocaleString()}`,
          },
          {
            type: "mrkdwn",
            text: `*Vendor:*\n${request.vendorName || "Not specified"}`,
          },
          {
            type: "mrkdwn",
            text: `*Request Number:*\n${request.requestNumber}`,
          },
        ],
      },
      ...(request.description
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Description:*\n${request.description.slice(0, 200)}${request.description.length > 200 ? "..." : ""}`,
              },
            },
          ]
        : []),
      ...(riskFlags.length > 0
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*⚠️ Risk Flags:*\n${riskFlags.map((f) => `• ${f}`).join("\n")}`,
              },
            },
          ]
        : []),
      {
        type: "divider",
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "✅ Approve",
              emoji: true,
            },
            style: "primary",
            value: request.id,
            action_id: "approve_request",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "❌ Reject",
              emoji: true,
            },
            style: "danger",
            value: request.id,
            action_id: "reject_request",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "👁️ View Details",
              emoji: true,
            },
            url: actionUrl,
            action_id: "view_details",
          },
        ],
      },
    ],
  };
}

/**
 * Build updated message after approval decision
 * Disables buttons and shows decision status
 */
export function buildApprovalConfirmationMessage(
  originalMessage: ApprovalMessageParams,
  decision: "approved" | "rejected",
  approverName: string
) {
  const { request, riskFlags } = originalMessage;
  const amount = parseFloat(request.amount);
  const isApproved = decision === "approved";

  return {
    text: `${isApproved ? "✅ Approved" : "❌ Rejected"}: ${request.title}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: isApproved ? "✅ Request Approved" : "❌ Request Rejected",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Request:*\n${request.title}`,
          },
          {
            type: "mrkdwn",
            text: `*Amount:*\n${request.currency} ${amount.toLocaleString()}`,
          },
          {
            type: "mrkdwn",
            text: `*Approved by:*\n${approverName}`,
          },
          {
            type: "mrkdwn",
            text: `*Request Number:*\n${request.requestNumber}`,
          },
        ],
      },
      ...(request.description
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Description:*\n${request.description.slice(0, 200)}${request.description.length > 200 ? "..." : ""}`,
              },
            },
          ]
        : []),
      ...(riskFlags.length > 0
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*⚠️ Risk Flags:*\n${riskFlags.map((f) => `• ${f}`).join("\n")}`,
              },
            },
          ]
        : []),
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Decision made by ${approverName} on ${new Date().toLocaleDateString()}`,
          },
        ],
      },
    ],
  };
}
