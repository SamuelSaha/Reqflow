/**
 * Request Approved Email Template
 * Sent to requester when their request is approved
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

interface RequestApprovedEmailProps {
  requesterName: string;
  requestNumber: string;
  title: string;
  amount: string;
  currency: string;
  approverName: string;
  approverComments?: string;
  hasMoreApprovers: boolean;
  nextApproverName?: string;
  requestUrl: string;
}

export default function RequestApprovedEmail({
  requesterName = "John Doe",
  requestNumber = "REQ-2026-0001",
  title = "Figma Annual Subscription",
  amount = "1,200",
  currency = "EUR",
  approverName = "Jane Smith",
  approverComments,
  hasMoreApprovers = false,
  nextApproverName,
  requestUrl = "https://app.reqflow.com/dashboard/requests/123",
}: RequestApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        ✅ {requestNumber} approved by {approverName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Request Approved</Heading>

          <Text style={text}>
            Hi {requesterName},
          </Text>

          <Text style={text}>
            Great news! Your purchase request has been approved.
          </Text>

          <Section style={successBox}>
            <Text style={requestNumberStyle}>{requestNumber}</Text>
            <Text style={requestTitle}>{title}</Text>
            <Text style={requestAmount}>
              {currency} {amount}
            </Text>

            <Hr style={divider} />

            <Text style={approvalInfo}>
              Approved by: <strong>{approverName}</strong>
            </Text>

            {approverComments && (
              <>
                <Text style={commentsLabel}>Comments:</Text>
                <Text style={commentsText}>{approverComments}</Text>
              </>
            )}
          </Section>

          {hasMoreApprovers ? (
            <>
              <Text style={text}>
                <strong>Next Step:</strong> Your request is now waiting for approval from{" "}
                {nextApproverName || "the next approver"}. You'll be notified when they review it.
              </Text>
            </>
          ) : (
            <>
              <Text style={text}>
                <strong>What's next:</strong> Your request has completed the approval chain. The finance
                team will process the purchase and you'll be notified when it's complete.
              </Text>
            </>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={requestUrl}>
              View Request Details
            </Button>
          </Section>

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

const successBox = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "24px",
};

const requestNumberStyle = {
  color: "#166534",
  fontSize: "14px",
  margin: "0 0 8px",
  fontWeight: "600",
};

const requestTitle = {
  color: "#1e293b",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const requestAmount = {
  color: "#16a34a",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const divider = {
  borderColor: "#bbf7d0",
  margin: "16px 0",
};

const approvalInfo = {
  color: "#166534",
  fontSize: "14px",
  margin: "0 0 12px",
};

const commentsLabel = {
  color: "#166534",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const commentsText = {
  color: "#15803d",
  fontSize: "14px",
  fontStyle: "italic",
  margin: "0",
  padding: "12px",
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  border: "1px solid #bbf7d0",
};

const buttonContainer = {
  padding: "24px 40px",
};

const button = {
  backgroundColor: "#16a34a",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
};

const footer = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
};
