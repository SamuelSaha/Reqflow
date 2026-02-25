/**
 * Approval Assigned Email Template
 * Sent to approver when a request is assigned to them
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

interface ApprovalAssignedEmailProps {
  approverName: string;
  requesterName: string;
  requestNumber: string;
  title: string;
  amount: string;
  currency: string;
  vendor?: string;
  category: string;
  urgency: "low" | "normal" | "urgent";
  riskFlags?: string[];
  approvalUrl: string;
}

export default function ApprovalAssignedEmail({
  approverName = "Jane Smith",
  requesterName = "John Doe",
  requestNumber = "REQ-2026-0001",
  title = "Figma Annual Subscription",
  amount = "1,200",
  currency = "EUR",
  vendor = "Figma Inc.",
  category = "saas",
  urgency = "normal",
  riskFlags = [],
  approvalUrl = "https://app.reqflow.com/dashboard/approvals",
}: ApprovalAssignedEmailProps) {
  const urgencyColor = urgency === "urgent" ? "#dc2626" : urgency === "normal" ? "#f59e0b" : "#64748b";
  const urgencyLabel = urgency === "urgent" ? "URGENT" : urgency === "normal" ? "Normal" : "Low";

  return (
    <Html>
      <Head />
      <Preview>
        Action required: Approve {requestNumber} - {title}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🔔 Approval Request</Heading>

          <Text style={text}>
            Hi {approverName},
          </Text>

          <Text style={text}>
            A purchase request requires your approval:
          </Text>

          <Section style={requestBox}>
            <Text style={requestNumberStyle}>
              {requestNumber}
              <span style={{ ...urgencyBadge, backgroundColor: urgencyColor }}>
                {urgencyLabel}
              </span>
            </Text>
            <Text style={requestTitle}>{title}</Text>
            <Text style={requestAmount}>
              {currency} {amount}
            </Text>

            <Hr style={divider} />

            <table style={detailsTable}>
              <tbody>
                <tr>
                  <td style={labelCell}>Requested by:</td>
                  <td style={valueCell}>{requesterName}</td>
                </tr>
                {vendor && (
                  <tr>
                    <td style={labelCell}>Vendor:</td>
                    <td style={valueCell}>{vendor}</td>
                  </tr>
                )}
                <tr>
                  <td style={labelCell}>Category:</td>
                  <td style={valueCell}>{category.toUpperCase()}</td>
                </tr>
              </tbody>
            </table>

            {riskFlags && riskFlags.length > 0 && (
              <>
                <Hr style={divider} />
                <Text style={riskTitle}>⚠️ AI Risk Flags:</Text>
                {riskFlags.map((flag, index) => (
                  <Text key={index} style={riskItem}>
                    • {flag}
                  </Text>
                ))}
              </>
            )}
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={approvalUrl}>
              Review Request →
            </Button>
          </Section>

          <Text style={footer}>
            — Reqflow Team
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

const requestBox = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "24px",
};

const requestNumberStyle = {
  color: "#64748b",
  fontSize: "14px",
  margin: "0 0 8px",
  fontWeight: "500",
};

const urgencyBadge = {
  display: "inline-block",
  marginLeft: "12px",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#ffffff",
};

const requestTitle = {
  color: "#1e293b",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const requestAmount = {
  color: "#3b82f6",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "16px 0",
};

const detailsTable = {
  width: "100%",
};

const labelCell = {
  color: "#64748b",
  fontSize: "14px",
  paddingBottom: "8px",
  paddingRight: "16px",
  verticalAlign: "top" as const,
};

const valueCell = {
  color: "#1e293b",
  fontSize: "14px",
  paddingBottom: "8px",
  fontWeight: "500",
};

const riskTitle = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "600",
  margin: "8px 0 4px",
};

const riskItem = {
  color: "#dc2626",
  fontSize: "14px",
  margin: "4px 0",
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

const footer = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
};
