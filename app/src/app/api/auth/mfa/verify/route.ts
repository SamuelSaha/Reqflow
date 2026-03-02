/**
 * MFA Verification API
 * 🔒 SECURITY (issue #121): Verify TOTP or backup code during login
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyTOTP,
  verifyBackupCode,
  hashBackupCodes,
} from "@/lib/auth/mfa";
import { completeMFAVerification } from "@/lib/auth/session";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";
import { checkAuthRateLimit, recordFailedLogin } from "@/lib/security/rate-limit";

const MAX_MFA_ATTEMPTS = 5;
const MFA_LOCKOUT_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, isBackupCode } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    // Get pending MFA user from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get("reqflow_mfa_user")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "MFA session expired. Please log in again." },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkAuthRateLimit(`mfa:${userId}`, request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many MFA attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Get user with MFA data
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return NextResponse.json(
        { error: "MFA is not properly configured" },
        { status: 400 }
      );
    }

    let isValid = false;
    let updatedBackupCodes: string[] | undefined;

    if (isBackupCode) {
      // Verify backup code
      if (!user.mfaBackupCodes || user.mfaBackupCodes.length === 0) {
        return NextResponse.json(
          { error: "No backup codes available" },
          { status: 400 }
        );
      }

      const result = await verifyBackupCode(user.mfaBackupCodes, code.toUpperCase());
      isValid = result.valid;
      updatedBackupCodes = result.remainingCodes;
    } else {
      // Verify TOTP code
      isValid = await verifyTOTP(user.mfaSecret, code);
    }

    if (!isValid) {
      const lockoutResult = await recordFailedLogin(`mfa:${userId}`);

      if (lockoutResult.locked) {
        logger.warn("MFA locked due to failed attempts", { userId });
        return NextResponse.json(
          {
            error: `Too many failed MFA attempts. Please try again in ${MFA_LOCKOUT_MINUTES} minutes.`,
            locked: true,
          },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          error: "Invalid verification code",
          attemptsRemaining: Math.max(0, MAX_MFA_ATTEMPTS - lockoutResult.attempts),
        },
        { status: 401 }
      );
    }

    // If backup code was used, update the stored codes
    if (updatedBackupCodes !== undefined) {
      await db
        .update(users)
        .set({ mfaBackupCodes: updatedBackupCodes })
        .where(eq(users.id, userId));
    }

    // Get request metadata
    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      undefined;

    // Complete MFA verification and create session
    const result = await completeMFAVerification(userId, { userAgent, ipAddress });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("MFA verification successful", { userId });

    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard",
    });
  } catch (error: unknown) {
    logger.error("MFA verification failed", error as Error, { route: "/api/auth/mfa/verify" });
    captureError(error as Error, { route: "/api/auth/mfa/verify" });
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
