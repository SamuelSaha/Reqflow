import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth/session";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";
import { checkAuthRateLimit } from "@/lib/security/rate-limit";

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

    // Rate limiting - prevent brute force attacks
    const rateLimitResult = await checkAuthRateLimit(email, request);
    if (!rateLimitResult.success) {
      logger.warn("Login rate limit exceeded", {
        email,
        remaining: rateLimitResult.remaining,
        reset: new Date(rateLimitResult.reset).toISOString(),
      });
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
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

    const result = await signIn(email, password);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
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
