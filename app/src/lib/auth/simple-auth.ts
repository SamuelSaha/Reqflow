/**
 * Lightweight auth for MVP
 * TODO: Migrate to Better Auth post-launch
 */

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "../db";
import { users, organizations } from "../db/schema";
import { eq } from "drizzle-orm";
import type { User } from "../db/schema";
import { env } from "../env";
import { setCSRFToken } from "../security/csrf";

const JWT_SECRET = new TextEncoder().encode(env.AUTH_SECRET);

// Use __Host- prefix for enhanced security (requires secure=true, path="/")
const COOKIE_NAME = "__Host-reqflow_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  tenantId: string;
  onboardingCompleted: boolean;
  exp: number;
}

/**
 * Create a JWT session token
 */
export async function createSession(
  user: User,
  opts?: { onboardingCompleted?: boolean }
): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    tenantId: user.tenantId,
    onboardingCompleted: opts?.onboardingCompleted ?? false,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Get session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  return user || null;
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User; token: string } | { error: string }> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (!user || !user.passwordHash) {
    return { error: "Invalid email or password" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    return { error: "Invalid email or password" };
  }

  if (!user.isActive) {
    return { error: "Account is disabled" };
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, user.tenantId),
  });

  const token = await createSession(user, {
    onboardingCompleted: org?.onboardingCompleted ?? true,
  });

  // Set cookie with enhanced security
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // Prevent XSS access
    secure: true, // ALWAYS require HTTPS (fixed security issue)
    sameSite: "lax", // Allow cookie on GET requests (like OAuth callbacks)
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  // Set CSRF token for mutation protection
  await setCSRFToken();

  return { user, token };
}

/**
 * Sign out (clear session)
 */
export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Refresh session — re-reads user+org from DB, issues new JWT+cookie
 * Called when onboarding completes to update the JWT claims
 */
export async function refreshSession(userId: string): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return;

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, user.tenantId),
  });

  const token = await createSession(user, {
    onboardingCompleted: org?.onboardingCompleted ?? false,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // Prevent XSS access
    secure: true, // ALWAYS require HTTPS (fixed security issue)
    sameSite: "lax", // Allow cookie on GET requests
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  // Refresh CSRF token on session refresh
  await setCSRFToken();
}

/**
 * Create a new user (for dev/testing)
 */
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role?: "requester" | "manager" | "finance" | "admin";
  tenantId: string;
  departmentId: string;
}): Promise<User> {
  const passwordHash = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash,
      role: data.role || "requester",
      tenantId: data.tenantId,
      departmentId: data.departmentId,
      isActive: true,
      emailVerified: true,
    })
    .returning();

  return user;
}
