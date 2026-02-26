/**
 * Email Template Renderer
 * Maps template names to React Email components and renders them
 */

import { render } from "@react-email/render";
import { EmailTemplate } from "../queue/queues/email";
import RequestSubmittedEmail from "./templates/request-submitted";
import ApprovalAssignedEmail from "./templates/approval-assigned";
import RequestApprovedEmail from "./templates/request-approved";
import RequestRejectedEmail from "./templates/request-rejected";
import ApprovalReminderEmail from "./templates/approval-reminder";
import TeamInviteEmail from "./templates/team-invite";

/**
 * Render email template to HTML
 */
export async function renderEmailTemplate(
  template: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  switch (template) {
    case EmailTemplate.REQUEST_SUBMITTED:
      return render(RequestSubmittedEmail(d));

    case EmailTemplate.APPROVAL_REQUESTED:
      return render(ApprovalAssignedEmail(d));

    case EmailTemplate.REQUEST_APPROVED:
      return render(RequestApprovedEmail(d));

    case EmailTemplate.REQUEST_REJECTED:
      return render(RequestRejectedEmail(d));

    case EmailTemplate.APPROVAL_REMINDER:
      return render(ApprovalReminderEmail(d));

    case EmailTemplate.TEAM_INVITE:
      return render(TeamInviteEmail(d));

    case EmailTemplate.VERIFY_EMAIL:
      return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f8fafc;">
          <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="color: #0f172a; font-size: 24px; margin-bottom: 20px;">Verify your email address</h1>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Welcome to Reqflow! Please verify your email address to complete your account setup.
            </p>
            <a href="${d.verificationUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Verify Email Address
            </a>
            <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
              This link will expire in 24 hours. If you didn't create a Reqflow account, you can safely ignore this email.
            </p>
            <p style="color: #64748b; font-size: 14px; margin-top: 16px;">
              Or copy and paste this URL into your browser:<br/>
              <span style="color: #94a3b8; word-break: break-all;">${d.verificationUrl}</span>
            </p>
          </div>
        </div>
      `;

    default:
      // Fallback for templates without React components yet
      return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
          <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 20px;">Notification</h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Template: ${template}
          </p>
          <pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto;">
            ${JSON.stringify(data, null, 2)}
          </pre>
        </div>
      `;
  }
}
