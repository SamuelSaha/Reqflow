/**
 * Email Verification Endpoint
 * Validates verification token and marks email as verified
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verificationTokens, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";
import { createAuthEvent, AuthEvent } from "@/lib/monitoring/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", request.url)
      );
    }

    // Find verification token
    const verification = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    });

    if (!verification) {
      logger.warn("Invalid verification token", { token });
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", request.url)
      );
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      logger.warn("Expired verification token", {
        token,
        expiresAt: verification.expiresAt,
      });

      // Clean up expired token
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.id, verification.id));

      return NextResponse.redirect(
        new URL("/login?error=expired_token", request.url)
      );
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, verification.userId),
    });

    if (!user) {
      logger.error("User not found for verification token", {
        userId: verification.userId,
      });
      return NextResponse.redirect(
        new URL("/login?error=user_not_found", request.url)
      );
    }

    // Update user email verification status
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, user.id));

    // Delete verification token (one-time use)
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, verification.id));

    // Create auth event
    await createAuthEvent({
      tenantId: user.tenantId,
      userId: user.id,
      event: AuthEvent.EMAIL_VERIFIED,
      success: true,
      metadata: { email: user.email },
    });

    logger.info("Email verified successfully", {
      userId: user.id,
      email: user.email,
    });

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL("/dashboard?verified=true", request.url)
    );
  } catch (error: unknown) {
    logger.error("Email verification failed", error as Error);
    captureError(error as Error, { route: "/api/auth/verify-email" });

    return NextResponse.redirect(
      new URL("/login?error=verification_failed", request.url)
    );
  }
}
