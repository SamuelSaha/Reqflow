/**
 * Password Reset Helpers
 * Generate, validate, and consume reset tokens
 */

import { db } from "../db";
import { passwordResetTokens, users } from "../db/schema";
import { sendEmail, EmailTemplate } from "../queue/queues/email";
import { env } from "../env";
import { logger } from "../monitoring/logger";
import { eq } from "drizzle-orm";
import { hashPassword } from "./simple-auth";

function generateResetToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Request a password reset for the given email.
 * Always returns success to prevent user enumeration.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  // 🔒 SECURITY: Don't reveal whether email exists
  if (!user) {
    logger.info("Password reset requested for unknown email", { email });
    return;
  }

  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    email: user.email,
    token,
    expiresAt,
  });

  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  if (process.env.NODE_ENV === "development") {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║         🔑 PASSWORD RESET LINK (dev only)                ║");
    console.log("╠══════════════════════════════════════════════════════════╣");
    console.log(`║  User: ${user.email.padEnd(50)} ║`);
    console.log(`║  ${resetUrl}`);
    console.log("╚══════════════════════════════════════════════════════════╝\n");
  }

  await sendEmail({
    to: user.email,
    subject: "Reset your Reqflow password",
    template: EmailTemplate.PASSWORD_RESET,
    data: { resetUrl, name: user.name },
    priority: 1,
  });

  logger.info("Password reset email sent", { userId: user.id });
}

/**
 * Validate a reset token. Returns user id if valid, null if not.
 */
export async function validateResetToken(token: string): Promise<string | null> {
  const record = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.token, token),
  });

  if (!record) return null;
  if (record.used) return null;
  if (new Date() > record.expiresAt) return null;

  return record.userId;
}

/**
 * Consume a reset token and update the user's password.
 * Marks token as used — cannot be reused.
 */
export async function consumeResetToken(token: string, newPassword: string): Promise<boolean> {
  const userId = await validateResetToken(token);
  if (!userId) return false;

  const passwordHash = await hashPassword(newPassword);

  // Update password and mark token used in parallel
  await Promise.all([
    db.update(users).set({ passwordHash }).where(eq(users.id, userId)),
    db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.token, token)),
  ]);

  logger.info("Password reset completed", { userId });
  return true;
}
