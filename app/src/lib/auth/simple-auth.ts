/**
 * Lightweight auth for MVP
 * TODO: Migrate to Better Auth post-launch
 *
 * 🔒 SECURITY (issue #116): JWT signing with RS256 (asymmetric)
 * - New tokens: RS256 (private key signing, public key verification)
 * - Old tokens: HS256 (symmetric secret) - backwards compatibility during migration
 * - Migration period: 7 days (max token lifetime)
 *
 * 🔒 SECURITY (issue #126): Refresh token rotation
 * - Access tokens: 24h expiration (short-lived)
 * - Refresh tokens: 30d expiration, stored in DB, instantly revocable
 * - Rotation: each refresh generates new access+refresh pair
 */

import { SignJWT, jwtVerify, importPKCS8, importSPKI } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "../db";
import { users, organizations, refreshTokens } from "../db/schema";
import { eq, lt } from "drizzle-orm";
import type { User } from "../db/schema";
import { env } from "../env";
import { setCSRFToken } from "../security/csrf";

/**
 * 🔒 SECURITY: Web Crypto API compatible randomBytes (works in Edge Runtime)
 * Generates cryptographically secure random bytes
 * Edge Runtime doesn't support Node.js crypto module, so we use Web Crypto API
 */
function randomBytes(size: number): Buffer {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes); // Web Crypto API (available in Edge Runtime)
  return Buffer.from(bytes);
}

// Legacy HS256 secret (for verifying old tokens)
const JWT_SECRET_HS256 = new TextEncoder().encode(env.AUTH_SECRET);

// RS256 keys (for signing new tokens and verifying)
let privateKey: CryptoKey | null = null;
let publicKey: CryptoKey | null = null;

/**
 * Load RS256 keys from environment
 * Keys are base64-encoded PEM format
 */
async function loadRS256Keys() {
  if (privateKey && publicKey) return { privateKey, publicKey };

  if (!env.JWT_PRIVATE_KEY || !env.JWT_PUBLIC_KEY) {
    // RS256 not configured yet - will fall back to HS256
    return null;
  }

  try {
    // Decode base64 PEM
    const privatePem = Buffer.from(env.JWT_PRIVATE_KEY, "base64").toString("utf-8");
    const publicPem = Buffer.from(env.JWT_PUBLIC_KEY, "base64").toString("utf-8");

    // Import keys
    privateKey = await importPKCS8(privatePem, "RS256");
    publicKey = await importSPKI(publicPem, "RS256");

    return { privateKey, publicKey };
  } catch (error) {
    console.error("Failed to load RS256 keys:", error);
    return null;
  }
}

// Cookie name must match middleware.ts
// Note: __Host- prefix requires HTTPS and breaks local dev on HTTP
const COOKIE_NAME = "reqflow_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours (access token lifetime)
const REFRESH_COOKIE_NAME = "reqflow_refresh";
const REFRESH_TOKEN_EXPIRATION = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
  onboardingCompleted: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  mfaVerified: boolean;
  exp: number;
}

/**
 * Create a JWT session token (access token)
 * 🔒 SECURITY: Uses RS256 if keys are configured, falls back to HS256
 * 🔒 SECURITY (issue #116): RS256 REQUIRED in production
 * 🔒 SECURITY (issue #126): Reduced from 7d to 24h expiration
 */
export async function createSession(
  user: User,
  opts?: { onboardingCompleted?: boolean; mfaVerified?: boolean }
): Promise<string> {
  const payload = {
    userId: user.id,
    email: user.email,
    tenantId: user.tenantId,
    role: user.role,
    onboardingCompleted: opts?.onboardingCompleted ?? false,
    emailVerified: user.emailVerified ?? false,
    mfaEnabled: user.mfaEnabled ?? false,
    mfaVerified: opts?.mfaVerified ?? false,
  };

  // Try RS256 first (preferred)
  const keys = await loadRS256Keys();
  if (keys?.privateKey) {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "RS256" }) // 🔒 Asymmetric signing
      .setIssuedAt()
      .setExpirationTime("24h") // 🔒 Reduced from 7d
      .sign(keys.privateKey);

    return token;
  }

  // 🔒 SECURITY (issue #116): RS256 REQUIRED in production
  if (env.NODE_ENV === "production") {
    throw new Error(
      "JWT RS256 keys not configured. Set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY environment variables. " +
      "Run 'bash scripts/generate-jwt-keys.sh' to generate keys."
    );
  }

  // Fallback to HS256 (development only)
  console.warn("JWT RS256 keys not configured - using HS256 fallback (development only)");
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // 🔒 Reduced from 7d
    .sign(JWT_SECRET_HS256);

  return token;
}

/**
 * Generate a secure refresh token and store in DB
 * 🔒 SECURITY (issue #126): Cryptographically random, 30-day expiration
 */
export async function createRefreshToken(
  userId: string,
  metadata?: { userAgent?: string; ipAddress?: string }
): Promise<string> {
  // Generate cryptographically random token (32 bytes = 256 bits)
  const token = randomBytes(32).toString("base64url");

  // Store in database with expiration
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION * 1000);

  await db.insert(refreshTokens).values({
    userId,
    token,
    userAgent: metadata?.userAgent,
    ipAddress: metadata?.ipAddress,
    expiresAt,
  });

  return token;
}

/**
 * Verify and consume a refresh token
 * 🔒 SECURITY: Rotation pattern - invalidates old token, issues new pair
 * Returns null if token is invalid, expired, or doesn't exist
 */
export async function verifyRefreshToken(
  token: string
): Promise<User | null> {
  // Look up token in database
  const storedToken = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.token, token),
    with: {
      user: true,
    },
  });

  if (!storedToken) {
    return null;
  }

  // Check expiration
  if (storedToken.expiresAt < new Date()) {
    // Token expired - delete it
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    return null;
  }

  // Update last used timestamp
  await db
    .update(refreshTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(refreshTokens.token, token));

  return storedToken.user;
}

/**
 * Revoke a specific refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
}

/**
 * Revoke all refresh tokens for a user (e.g., on password change, security event)
 */
export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}

/**
 * Cleanup expired refresh tokens (run periodically via cron/worker)
 */
export async function cleanupExpiredRefreshTokens(): Promise<number> {
  const result = await db
    .delete(refreshTokens)
    .where(lt(refreshTokens.expiresAt, new Date()))
    .returning({ id: refreshTokens.id });

  return result.length;
}

/**
 * Verify and decode a JWT session token
 * 🔒 SECURITY: Tries RS256 first, falls back to HS256 for old tokens
 * Migration strategy: Old HS256 tokens valid for 7 days, then expire naturally
 */
export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  // Try RS256 first (new tokens)
  const keys = await loadRS256Keys();
  if (keys?.publicKey) {
    try {
      const { payload } = await jwtVerify(token, keys.publicKey, {
        algorithms: ["RS256"],
      });
      return payload as unknown as SessionPayload;
    } catch (error) {
      // Not an RS256 token or invalid - try HS256 fallback
    }
  }

  // Fallback to HS256 (old tokens)
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_HS256, {
      algorithms: ["HS256"],
    });
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
 * 🔒 SECURITY (issue #121): Returns mfaRequired if MFA is enabled
 */
export async function signIn(
  email: string,
  password: string,
  metadata?: { userAgent?: string; ipAddress?: string }
): Promise<
  | { user: User; token: string; mfaRequired: false }
  | { user: User; mfaRequired: true }
  | { error: string }
> {
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

  // 🔒 SECURITY (issue #121): Check if MFA is enabled
  if (user.mfaEnabled) {
    // Store pending MFA verification in a short-lived cookie
    const pendingMfaToken = randomBytes(32).toString("base64url");
    const cookieStore = await cookies();

    // Set a short-lived cookie for MFA pending state (5 minutes)
    cookieStore.set("reqflow_mfa_pending", pendingMfaToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 300, // 5 minutes
      path: "/",
    });

    // Store user ID in a separate cookie for MFA lookup
    cookieStore.set("reqflow_mfa_user", user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 300, // 5 minutes
      path: "/",
    });

    return { user, mfaRequired: true };
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, user.tenantId),
  });

  // Generate access token (24h) with MFA verified since MFA is not enabled
  const token = await createSession(user, {
    onboardingCompleted: org?.onboardingCompleted ?? true,
    mfaVerified: true, // No MFA, so consider it verified
  });

  // Generate refresh token (30d)
  const refreshToken = await createRefreshToken(user.id, metadata);

  // Set cookies with enhanced security
  const cookieStore = await cookies();

  // Access token cookie (24h)
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // Prevent XSS access
    secure: true, // 🔒 SECURITY: Always HTTPS (issue #123) - use mkcert for local dev
    sameSite: "strict", // 🔒 SECURITY (issue #125): Strict to prevent all CSRF
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  // Refresh token cookie (30d)
  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true, // Prevent XSS access
    secure: true,
    sameSite: "strict", // 🔒 SECURITY (issue #125): Strict to prevent all CSRF
    maxAge: REFRESH_TOKEN_EXPIRATION,
    path: "/api/auth/refresh", // 🔒 Only sent to refresh endpoint
  });

  // Set CSRF token for mutation protection
  await setCSRFToken();

  return { user, token, mfaRequired: false };
}

/**
 * Complete MFA verification and create session
 * 🔒 SECURITY (issue #121): Called after successful TOTP/backup code verification
 */
export async function completeMFAVerification(
  userId: string,
  metadata?: { userAgent?: string; ipAddress?: string }
): Promise<{ user: User; token: string } | { error: string }> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (!user.mfaEnabled) {
    return { error: "MFA is not enabled for this user" };
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, user.tenantId),
  });

  // Generate access token with MFA verified
  const token = await createSession(user, {
    onboardingCompleted: org?.onboardingCompleted ?? true,
    mfaVerified: true,
  });

  // Generate refresh token
  const refreshToken = await createRefreshToken(user.id, metadata);

  // Set cookies
  const cookieStore = await cookies();

  // Clear MFA pending cookies
  cookieStore.delete("reqflow_mfa_pending");
  cookieStore.delete("reqflow_mfa_user");

  // Access token cookie (24h)
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  // Refresh token cookie (30d)
  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_EXPIRATION,
    path: "/api/auth/refresh",
  });

  // Set CSRF token
  await setCSRFToken();

  // Update last login
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));

  return { user, token };
}

/**
 * Sign out (clear session)
 * 🔒 SECURITY (issue #126): Revokes refresh token from DB
 */
export async function signOut(): Promise<void> {
  const cookieStore = await cookies();

  // Revoke refresh token from database
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  // Clear cookies
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Refresh session - re-reads user+org from DB, issues new JWT+cookie
 * Called when onboarding completes to update the JWT claims
 * 🔒 SECURITY (issue #126): Also rotates refresh token
 */
export async function refreshSession(
  userId: string,
  metadata?: { userAgent?: string; ipAddress?: string }
): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return;

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, user.tenantId),
  });

  // Generate new access token
  const token = await createSession(user, {
    onboardingCompleted: org?.onboardingCompleted ?? false,
  });

  // Revoke old refresh token and generate new one (rotation)
  const cookieStore = await cookies();
  const oldRefreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  if (oldRefreshToken) {
    await revokeRefreshToken(oldRefreshToken);
  }
  const newRefreshToken = await createRefreshToken(user.id, metadata);

  // Set new cookies
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // Prevent XSS access
    secure: true, // 🔒 SECURITY: Always HTTPS (issue #123)
    sameSite: "strict", // 🔒 SECURITY (issue #125): Strict to prevent all CSRF
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  cookieStore.set(REFRESH_COOKIE_NAME, newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict", // 🔒 SECURITY (issue #125): Strict to prevent all CSRF
    maxAge: REFRESH_TOKEN_EXPIRATION,
    path: "/api/auth/refresh",
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
