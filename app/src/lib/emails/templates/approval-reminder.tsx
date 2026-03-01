/**
 * Approval Reminder Email Template
 * Sent to approver 48h after assignment if still pending
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PendingApproval {
  requestNumber: string;
  title: string;
  requesterName: string;
  amount: string;
  currency: string;
  urgency: "low" | "normal" | "urgent";
  daysWaiting: number;
}

interface ApprovalReminderEmailProps {
  approverName: string;
  pendingApprovals: PendingApproval[];
  approvalUrl: string;
}

export default function ApprovalReminderEmail({
  approverName = "Jane Smith",
  pendingApprovals = [
    {
      requestNumber: "REQ-2026-0001",
      title: "Figma Annual Subscription",
      requesterName: "John Doe",
      amount: "1,200",
      currency: "EUR",
      urgency: "urgent",
      daysWaiting: 2,
    },
    {
      requestNumber: "REQ-2026-0002",
      title: "Slack Business+ Plan",
      requesterName: "Alice Johnson",
      amount: "800",
      currency: "EUR",
      urgency: "normal",
      daysWaiting: 3,
    },
  ],
  approvalUrl = "https://app.reqflow.com/dashboard/approvals",
}: ApprovalReminderEmailProps) {
  const urgentCount = pendingApprovals.filter((a) => a.urgency === "urgent").length;
  const totalCount = pendingApprovals.length;

  return (
    <Html>
      <Head />
      <Preview>
        {`${totalCount} pending approval${totalCount > 1 ? "s" : ""} need your review`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⏰ Pending Approvals</Heading>

          <Text style={text}>
            Hi {approverName},
          </Text>

          <Text style={text}>
            You have <strong>{totalCount}</strong> purchase request{totalCount > 1 ? "s" : ""} waiting
            for your approval{urgentCount > 0 && ` (${urgentCount} urgent)`}.
          </Text>

          <Section style={approvalsList}>
            {pendingApprovals
              .sort((a, b) => {
                // Sort: urgent first, then by days waiting
                if (a.urgency === "urgent" && b.urgency !== "urgent") return -1;
                if (a.urgency !== "urgent" && b.urgency === "urgent") return 1;
                return b.daysWaiting - a.daysWaiting;
              })
              .map((approval, index) => (
                <div key={index}>
                  <Section style={approvalItem}>
                    <Text style={approvalHeader}>
                      <span style={approvalNumber}>{approval.requestNumber}</span>
                      {approval.urgency === "urgent" && (
                        <span style={urgentBadge}>URGENT</span>
                      )}
                    </Text>
                    <Text style={approvalTitle}>{approval.title}</Text>
                    <Text style={approvalDetails}>
                      {approval.requesterName} • {approval.currency} {approval.amount} • Waiting {approval.daysWaiting} day{approval.daysWaiting > 1 ? "s" : ""}
                    </Text>
                  </Section>
                  {index < pendingApprovals.length - 1 && <Hr style={divider} />}
                </div>
              ))}
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={approvalUrl}>
              Review All Requests
            </Button>
          </Section>

          <Text style={helpText}>
            <strong>Tip:</strong> You can approve or reject requests directly from your approvals
            dashboard with a single click.
          </Text>

          <Text style={footer}>
            - Reqflow Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#1e293b",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const approvalsList = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "16px",
};

const approvalItem = {
  padding: "8px 0",
};

const approvalHeader = {
  margin: "0 0 4px",
};

const approvalNumber = {
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "600",
};

const urgentBadge = {
  display: "inline-block",
  marginLeft: "8px",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "11px",
  fontWeight: "700",
  color: "#ffffff",
  backgroundColor: "#dc2626",
};

const approvalTitle = {
  color: "#1e293b",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const approvalDetails = {
  color: "#64748b",
  fontSize: "14px",
  margin: "0",
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "12px 0",
};

const buttonContainer = {
  padding: "24px 40px",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 24px",
};

const helpText = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "22px",
  backgroundColor: "#f8fafc",
  margin: "0 40px",
  padding: "16px",
  borderRadius: "6px",
};

const footer = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "24px",
};
