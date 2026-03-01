/**
 * Team Invite Email Template
 * Sent when a user invites a teammate during onboarding or later
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

interface TeamInviteEmailProps {
  inviterName: string;
  orgName: string;
  inviteUrl: string;
  role: string;
}

export default function TeamInviteEmail({
  inviterName = "Jane Smith",
  orgName = "Acme Corp",
  inviteUrl = "https://app.reqflow.com/signup?invite=abc123",
  role = "requester",
}: TeamInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} invited you to join {orgName} on Reqflow
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You&apos;re invited to {orgName}</Heading>

          <Text style={text}>
            {inviterName} has invited you to join <strong>{orgName}</strong> on
            Reqflow as a <strong>{role}</strong>.
          </Text>

          <Text style={text}>
            Reqflow helps teams manage software purchases - from first request
            to renewal. Accept the invite to get started.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteUrl}>
              Accept Invite
            </Button>
          </Section>

          <Text style={smallText}>
            This invite expires in 7 days. If you didn&apos;t expect this
            email, you can safely ignore it.
          </Text>

          <Text style={footer}> -  Reqflow Team</Text>
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
  margin: "40px 0 20px",
  padding: "0 40px",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const smallText = {
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: "22px",
  padding: "0 40px",
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
