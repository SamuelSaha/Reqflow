import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, createSession, createRefreshToken, revokeRefreshToken } from "@/lib/auth/simple-auth";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Refresh access token using refresh token
 * 🔒 SECURITY (issue #126): Token rotation pattern
 * - Validates refresh token from cookie
 * - Revokes old refresh token
 * - Issues new access token (24h) + refresh token (30d)
 * - Updates cookies
 */
export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.get("reqflow_refresh")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token provided" },
        { status: 401 }
      );
    }

    // Verify and get user
    const user = await verifyRefreshToken(refreshToken);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Get organization for onboarding status
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, user.tenantId),
    });

    // Generate new access token (24h)
    const newAccessToken = await createSession(user, {
      onboardingCompleted: org?.onboardingCompleted ?? false,
    });

    // Revoke old refresh token and generate new one (rotation)
    await revokeRefreshToken(refreshToken);

    // Get request metadata
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;

    const newRefreshToken = await createRefreshToken(user.id, {
      userAgent,
      ipAddress,
    });

    // Create response with new cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set new access token cookie (24h)
    response.cookies.set("reqflow_session", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict", // 🔒 SECURITY (issue #125): Strict to prevent all CSRF
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Set new refresh token cookie (30d)
    response.cookies.set("reqflow_refresh", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict", // 🔒 SECURITY (issue #125): Strict to prevent all CSRF
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/api/auth/refresh",
    });

    logger.info("Token refreshed successfully", {
      userId: user.id,
      email: user.email,
    });

    return response;
  } catch (error: unknown) {
    logger.error("Token refresh failed", error as Error, {
      route: "/api/auth/refresh",
    });
    captureError(error as Error, { route: "/api/auth/refresh" });

    return NextResponse.json(
      { error: "An error occurred during token refresh" },
      { status: 500 }
    );
  }
}
