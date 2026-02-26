import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  users,
  organizations,
  departments,
  invites,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, createSession } from "@/lib/auth/simple-auth";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";
import { env } from "@/lib/env";
import { checkSignupRateLimit } from "@/lib/security/rate-limit";

const COOKIE_NAME = "reqflow_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Password policy enforcement (NIST, OWASP compliant)
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character (!@#$%^&* etc.)"
  );

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  name: z.string().min(1, "Name is required"),
  inviteToken: z.string().optional(),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with password policy
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => err.message);
      return NextResponse.json(
        { error: errors.join(". ") },
        { status: 400 }
      );
    }

    const { email, password, name, inviteToken } = validation.data;

    // Rate limiting - prevent spam signups
    const rateLimitResult = await checkSignupRateLimit(request);
    if (!rateLimitResult.success) {
      logger.warn("Signup rate limit exceeded", {
        remaining: rateLimitResult.remaining,
        reset: new Date(rateLimitResult.reset).toISOString(),
      });
      return NextResponse.json(
        {
          error: "Too many signup attempts. Please try again later.",
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

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // --- Invite flow: join existing org ---
    if (inviteToken) {
      const invite = await db.query.invites.findFirst({
        where: and(
          eq(invites.token, inviteToken),
          eq(invites.status, "pending")
        ),
      });

      if (!invite || new Date() > invite.expiresAt) {
        return NextResponse.json(
          { error: "Invalid or expired invite" },
          { status: 400 }
        );
      }

      // Get a department from the org
      const dept = await db.query.departments.findFirst({
        where: eq(departments.tenantId, invite.tenantId),
      });

      const [user] = await db
        .insert(users)
        .values({
          email: email.toLowerCase(),
          name,
          passwordHash,
          role: invite.role as "requester" | "manager" | "finance" | "admin",
          tenantId: invite.tenantId,
          departmentId: dept?.id,
          isActive: true,
          emailVerified: true,
        })
        .returning();

      // Mark invite as accepted
      await db
        .update(invites)
        .set({ status: "accepted" })
        .where(eq(invites.id, invite.id));

      // Invited users skip onboarding — the org is already set up
      const token = await createSession(user, { onboardingCompleted: true });

      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        redirect: "/dashboard",
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    }

    // --- New org flow: create org + admin user + default department ---
    const orgName = `${name}'s Org`;
    const slug = slugify(orgName) + "-" + Date.now().toString(36);

    // Create org
    const [org] = await db
      .insert(organizations)
      .values({
        name: orgName,
        slug,
        plan: "starter",
        isActive: true,
        onboardingCompleted: false,
        onboardingStep: 0,
      })
      .returning();

    // Create default department
    const [dept] = await db
      .insert(departments)
      .values({
        tenantId: org.id,
        name: "General",
        code: "GEN",
      })
      .returning();

    // Create admin user
    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: "admin",
        tenantId: org.id,
        departmentId: dept.id,
        isActive: true,
        emailVerified: true,
      })
      .returning();

    // Set session cookie
    const token = await createSession(user, { onboardingCompleted: false });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      redirect: "/onboarding",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error: unknown) {
    logger.error("Signup failed", error as Error, { route: "/api/auth/signup" });
    captureError(error as Error, { route: "/api/auth/signup" });
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
