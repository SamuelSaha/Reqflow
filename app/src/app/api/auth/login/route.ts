import { NextResponse } from "next/server";
import { signIn, isMFARequired } from "@/lib/auth/session";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";
import {
  checkAuthRateLimit,
  checkAccountLockout,
  recordFailedLogin,
  clearFailedAttempts,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Account lockout check - prevents targeted account compromise
    const lockoutCheck = await checkAccountLockout(email);
    if (lockoutCheck.locked && lockoutCheck.lockedUntil) {
      const remainingTime = Math.ceil((lockoutCheck.lockedUntil - Date.now()) / 1000);
      logger.warn("Account locked due to failed attempts", {
        email,
        attempts: lockoutCheck.attempts,
        lockedUntil: new Date(lockoutCheck.lockedUntil).toISOString(),
      });
      return NextResponse.json(
        {
          error: `Account temporarily locked due to multiple failed login attempts. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`,
          retryAfter: remainingTime,
          locked: true,
        },
        {
          status: 423, // 423 Locked
          headers: {
            "Retry-After": remainingTime.toString(),
          },
        }
      );
    }

    // Rate limiting - prevent brute force attacks (IP-based)
    const rateLimitResult = await checkAuthRateLimit(email, request);
    if (!rateLimitResult.success) {
      logger.warn("Login rate limit exceeded", {
        email,
        remaining: rateLimitResult.remaining,
        reset: new Date(rateLimitResult.reset).toISOString(),
      });
      return NextResponse.json(
        {
          error: "Too many login attempts from this location. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // Attempt sign in
    const result = await signIn(email, password);

    if ("error" in result) {
      // Record failed login attempt for account lockout
      const lockoutResult = await recordFailedLogin(email);

      if (lockoutResult.locked && lockoutResult.lockedUntil) {
        const remainingTime = Math.ceil((lockoutResult.lockedUntil - Date.now()) / 1000);
        logger.warn("Account locked after failed attempt", {
          email,
          attempts: lockoutResult.attempts,
          lockedUntil: new Date(lockoutResult.lockedUntil).toISOString(),
        });
        return NextResponse.json(
          {
            error: `Too many failed attempts. Account locked for ${Math.ceil(remainingTime / 60)} minutes.`,
            retryAfter: remainingTime,
            locked: true,
          },
          {
            status: 423, // 423 Locked
            headers: {
              "Retry-After": remainingTime.toString(),
            },
          }
        );
      }

      // Not locked yet, return generic auth error
      return NextResponse.json(
        {
          error: "Invalid email or password",
          attemptsRemaining: lockoutResult.attempts < 5 ? 5 - lockoutResult.attempts : undefined,
        },
        { status: 401 }
      );
    }

    // Successful login - clear any failed attempts
    await clearFailedAttempts(email);

    // SECURITY: Check if MFA is required for this user's role
    // Finance and Admin roles must complete MFA before full access
    const mfaRequired = await isMFARequired(result.user);
    
    // TODO: When MFA is implemented, check if user has MFA enabled
    // If MFA required but not set up, return mfaSetupRequired: true
    // If MFA required and set up, return mfaVerificationRequired: true
    // For now, flag that MFA should be set up for high-privilege roles
    
    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      // SECURITY: Indicate if MFA is required for this user
      // Frontend should prompt for MFA setup if mfaRequired but not yet set up
      mfaRequired,
      // When MFA is implemented, these will be:
      // mfaEnabled: result.user.mfaEnabled,
      // mfaVerified: false, // Requires separate MFA verification step
    });
  } catch (error: unknown) {
    logger.error("Login failed", error as Error, { route: "/api/auth/login" });
    captureError(error as Error, { route: "/api/auth/login" });
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
