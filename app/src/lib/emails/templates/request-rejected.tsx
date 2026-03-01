/**
 * Request Rejected Email Template
 * Sent to requester when their request is rejected
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

interface RequestRejectedEmailProps {
  requesterName: string;
  requestNumber: string;
  title: string;
  amount: string;
  currency: string;
  rejectorName: string;
  rejectionReason: string;
  canResubmit: boolean;
  requestUrl: string;
}

export default function RequestRejectedEmail({
  requesterName = "John Doe",
  requestNumber = "REQ-2026-0001",
  title = "Figma Annual Subscription",
  amount = "1,200",
  currency = "EUR",
  rejectorName = "Jane Smith",
  rejectionReason = "Budget constraints for this quarter.",
  canResubmit = true,
  requestUrl = "https://app.reqflow.com/dashboard/requests/123",
}: RequestRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {requestNumber} was not approved - {rejectionReason.slice(0, 50)}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>❌ Request Not Approved</Heading>

          <Text style={text}>
            Hi {requesterName},
          </Text>

          <Text style={text}>
            Your purchase request has been reviewed and is not approved at this time.
          </Text>

          <Section style={rejectionBox}>
            <Text style={requestNumberStyle}>{requestNumber}</Text>
            <Text style={requestTitle}>{title}</Text>
            <Text style={requestAmount}>
              {currency} {amount}
            </Text>

            <Hr style={divider} />

            <Text style={rejectorInfo}>
              Reviewed by: <strong>{rejectorName}</strong>
            </Text>

            <Text style={reasonLabel}>Reason:</Text>
            <Text style={reasonText}>{rejectionReason}</Text>
          </Section>

          {canResubmit ? (
            <>
              <Text style={text}>
                <strong>What's next:</strong> You can address the feedback above and resubmit your
                request. Consider discussing with your manager or {rejectorName} before resubmitting.
              </Text>

              <Section style={buttonContainer}>
                <Button style={button} href={requestUrl}>
                  View Request & Resubmit
                </Button>
              </Section>
            </>
          ) : (
            <>
              <Text style={text}>
                <strong>What's next:</strong> This request has been closed. If you believe this was in
                error or if circumstances have changed, please contact your manager or finance team.
              </Text>

              <Section style={buttonContainer}>
                <Button style={buttonOutline} href={requestUrl}>
                  View Request Details
                </Button>
              </Section>
            </>
          )}

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

const rejectionBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "24px",
};

const requestNumberStyle = {
  color: "#991b1b",
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
  color: "#dc2626",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const divider = {
  borderColor: "#fecaca",
  margin: "16px 0",
};

const rejectorInfo = {
  color: "#991b1b",
  fontSize: "14px",
  margin: "0 0 12px",
};

const reasonLabel = {
  color: "#991b1b",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const reasonText = {
  color: "#b91c1c",
  fontSize: "14px",
  margin: "0",
  padding: "12px",
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  border: "1px solid #fecaca",
};

const buttonContainer = {
  padding: "24px 40px",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
};

const buttonOutline = {
  backgroundColor: "transparent",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  color: "#475569",
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
