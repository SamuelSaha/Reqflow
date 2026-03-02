/**
 * Resend Verification Email Endpoint
 * Allows users to request a new verification email
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createVerificationToken } from "@/lib/auth/email-verification";
import { getSession } from "@/lib/auth/session";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get email from request body or allow sending to both session email and request email
    // This supports both: logged-in user resending, and user providing email manually
    const body = await request.json().catch(() => ({}));
    const email = body.email || session.email;

    if (!email) {
      return NextResponse.json(
        { error: "Email address required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: true, message: "Email already verified" }
      );
    }

    // Create and send verification token
    await createVerificationToken(user.id, user.email);

    logger.info("Verification email resent", {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error: unknown) {
    logger.error("Failed to resend verification email", error as Error);
    captureError(error as Error, { route: "/api/auth/resend-verification" });

    // Don't reveal if user exists or not
    return NextResponse.json(
      { error: "Failed to send verification email. Please try again later." },
      { status: 500 }
    );
  }
}
