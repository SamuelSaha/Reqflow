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
