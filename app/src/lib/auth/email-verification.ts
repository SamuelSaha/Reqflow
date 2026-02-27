/**
 * Email Verification Helpers
 * Generate tokens and send verification emails
 */

import { db } from "../db";
import { verificationTokens } from "../db/schema";
import { sendEmail, EmailTemplate } from "../queue/queues/email";
import { env } from "../env";
import { checkEmailVerificationRateLimit } from "../security/rate-limit";
import { logger } from "../monitoring/logger";

/**
 * Generate cryptographically secure verification token
 * Uses 32 bytes (256 bits) of entropy, base64url encoded
 */
function generateVerificationToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Create verification token and send email
 * 🔒 SECURITY FIX: Added rate limiting to prevent email bombing
 */
export async function createVerificationToken(
  userId: string,
  email: string
): Promise<string> {
  // 🔒 Rate limit check: Prevent email bombing (3 emails per hour)
  const rateLimitResult = await checkEmailVerificationRateLimit(email);
  if (!rateLimitResult.success) {
    const waitMinutes = Math.ceil((rateLimitResult.reset - Date.now()) / 60000);
    throw new Error(
      `Too many verification emails requested. Please try again in ${waitMinutes} minutes.`
    );
  }

  // Generate secure token
  const token = generateVerificationToken();

  // Token expires in 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Store token in database
  await db.insert(verificationTokens).values({
    userId,
    email,
    token,
    expiresAt,
  });

  // Send verification email
  const verificationUrl = `${env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your email address",
    template: EmailTemplate.VERIFY_EMAIL,
    data: {
      verificationUrl,
    },
  });

  logger.info("Verification email sent", { userId, email });

  return token;
}
