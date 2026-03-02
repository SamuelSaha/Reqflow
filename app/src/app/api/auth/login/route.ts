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

    // Get request metadata for refresh token tracking
    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;

    // Attempt sign in
    const result = await signIn(email, password, { userAgent, ipAddress });

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

    // 🔒 SECURITY (issue #121): Check if MFA is required
    if (result.mfaRequired) {
      return NextResponse.json({
        success: true,
        mfaRequired: true,
        redirectTo: "/verify-mfa",
      });
    }

    // No MFA required - full login success
    return NextResponse.json({
      success: true,
      mfaRequired: false,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
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
