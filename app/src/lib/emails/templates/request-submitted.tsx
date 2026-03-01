/**
 * Request Submitted Email Template
 * Sent to requester after successful submission
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface RequestSubmittedEmailProps {
  requesterName: string;
  requestNumber: string;
  title: string;
  amount: string;
  currency: string;
  requestUrl: string;
}

export default function RequestSubmittedEmail({
  requesterName = "John Doe",
  requestNumber = "REQ-2026-0001",
  title = "Figma Annual Subscription",
  amount = "1,200",
  currency = "EUR",
  requestUrl = "https://app.reqflow.com/dashboard/requests/123",
}: RequestSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your purchase request {requestNumber} has been submitted</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Request Submitted</Heading>

          <Text style={text}>
            Hi {requesterName},
          </Text>

          <Text style={text}>
            Your purchase request has been successfully submitted and is now awaiting approval.
          </Text>

          <Section style={codeBox}>
            <Text style={requestNumberText}>
              Request Number: <strong>{requestNumber}</strong>
            </Text>
            <Text style={detailText}>{title}</Text>
            <Text style={amountText}>
              {currency} {amount}
            </Text>
          </Section>

          <Text style={text}>
            You'll receive an email notification when your request is approved or if any action is needed.
          </Text>

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

const codeBox = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "24px",
};

const requestNumberText = {
  color: "#334155",
  fontSize: "14px",
  margin: "0 0 8px",
};

const detailText = {
  color: "#1e293b",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const amountText = {
  color: "#3b82f6",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0",
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
  padding: "12px 20px",
};

const footer = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
};
