/**
 * Slack Request Signature Verification
 * Ensures webhook requests actually come from Slack
 */

import crypto from "crypto";
import { env } from "@/lib/env";

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
    console.error("[Slack] SLACK_SIGNING_SECRET not configured");
    return false;
  }

  // Reject old requests (replay attack prevention)
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(currentTime - requestTime);

  if (timeDiff > 300) {
    // More than 5 minutes old
    console.warn(`[Slack] Request timestamp too old: ${timeDiff}s`);
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
  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    // Buffers must be same length for timingSafeEqual
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error("[Slack] Signature verification error:", error);
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
    console.warn("[Slack] Missing signature headers");
    return false;
  }

  return verifySlackSignature(body, timestamp, signature);
}
