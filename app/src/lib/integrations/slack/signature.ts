/**
 * Slack Request Signature Verification
 * Ensures webhook requests actually come from Slack
 */

import crypto from "crypto";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";

/**
 * Verify Slack request signature using HMAC-SHA256
 * @param body - Raw request body as string
 * @param timestamp - X-Slack-Request-Timestamp header
 * @param signature - X-Slack-Signature header (format: v0=hex)
 * @returns true if signature is valid, false otherwise
 */
export function verifySlackSignature(
  body: string,
  timestamp: string,
  signature: string
): boolean {
  // Must have signing secret configured
  if (!env.SLACK_SIGNING_SECRET) {
    logger.error("Slack signing secret not configured", new Error("Missing SLACK_SIGNING_SECRET"));
    return false;
  }

  // Reject old requests (replay attack prevention)
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(currentTime - requestTime);

  if (timeDiff > 300) {
    // More than 5 minutes old
    logger.warn("Slack request timestamp too old", {
      timeDiff,
      source: "slack_signature",
    });
    return false;
  }

  // Compute expected signature
  const sigBasestring = `v0:${timestamp}:${body}`;
  const hmac = crypto
    .createHmac("sha256", env.SLACK_SIGNING_SECRET)
    .update(sigBasestring)
    .digest("hex");
  const expected = `v0=${hmac}`;

  // Timing-safe comparison to prevent timing attacks
  // 🔒 SECURITY: Pad both buffers to the same length before comparing so that
  // a length mismatch doesn't create an early-return timing oracle.
  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    const maxLen = Math.max(signatureBuffer.length, expectedBuffer.length);
    const a = Buffer.alloc(maxLen, 0);
    const b = Buffer.alloc(maxLen, 0);
    signatureBuffer.copy(a);
    expectedBuffer.copy(b);

    // Length must match AND content must match (both evaluated in constant time)
    const lengthMatch = signatureBuffer.length === expectedBuffer.length;
    const contentMatch = crypto.timingSafeEqual(a, b);
    return lengthMatch && contentMatch;
  } catch (error) {
    logger.error("Slack signature verification failed", error as Error, {
      source: "slack_signature",
    });
    return false;
  }
}

/**
 * Extract and verify signature from Next.js Request
 * @param request - Next.js Request object
 * @param body - Raw request body
 * @returns true if valid, false otherwise
 */
export async function verifySlackRequest(
  request: Request,
  body: string
): Promise<boolean> {
  const timestamp = request.headers.get("x-slack-request-timestamp");
  const signature = request.headers.get("x-slack-signature");

  if (!timestamp || !signature) {
    logger.warn("Slack request missing signature headers", {
      source: "slack_signature",
    });
    return false;
  }

  return verifySlackSignature(body, timestamp, signature);
}
