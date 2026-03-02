/**
 * OAuth State Parameter Validation
 * Prevents CSRF attacks by generating and validating random state tokens
 *
 * Security Requirements:
 * - 32-byte cryptographically random state tokens
 * - 10-minute expiry window
 * - Single-use tokens (deleted after validation)
 * - Provider-specific validation
 */

import { randomBytes } from "crypto";
import { db } from "../db";
import { oauthStates } from "../db/schema";
import { eq, and, gt, lt } from "drizzle-orm";
import { logger } from "../monitoring/logger";

/**
 * Generate a secure random OAuth state token
 * Returns a 32-byte hex string (64 characters)
 */
export function generateOAuthState(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Store OAuth state in database with 10-minute expiry
 *
 * @param provider - OAuth provider ('quickbooks' | 'xero')
 * @param state - Random state token
 * @param tenantId - Tenant ID
 * @param userId - User ID
 */
export async function storeOAuthState(
  provider: string,
  state: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(oauthStates).values({
    provider,
    state,
    tenantId,
    userId,
    expiresAt,
  });

  logger.info("OAuth state stored", {
    provider,
    tenantId,
    userId,
    expiresAt,
  });
}

/**
 * Validate OAuth state parameter
 *
 * Security checks:
 * 1. State token exists in database
 * 2. Token has not expired (10 min window)
 * 3. Token matches the provider
 * 4. SECURITY FIX: Token belongs to the current user's session
 *
 * After successful validation, the token is deleted to prevent replay attacks
 *
 * @param provider - OAuth provider ('quickbooks' | 'xero')
 * @param state - State token from callback
 * @param expectedUserId - Optional: The user ID that initiated the OAuth flow
 * @returns true if valid, false otherwise
 */
export async function validateOAuthState(
  provider: string,
  state: string | null,
  expectedUserId?: string
): Promise<boolean> {
  if (!state) {
    logger.warn("OAuth state validation failed: missing state parameter", {
      provider,
    });
    return false;
  }

  try {
    // Find unexpired state token for this provider
    const stateRecord = await db.query.oauthStates.findFirst({
      where: and(
        eq(oauthStates.state, state),
        eq(oauthStates.provider, provider),
        gt(oauthStates.expiresAt, new Date())
      ),
    });

    if (!stateRecord) {
      logger.warn("OAuth state validation failed: invalid or expired state", {
        provider,
        hasState: !!state,
      });
      return false;
    }

    // SECURITY FIX: Validate that the state belongs to the expected user
    // This prevents one user from using another user's OAuth state token
    if (expectedUserId && stateRecord.userId !== expectedUserId) {
      logger.warn("OAuth state validation failed: user ID mismatch", {
        provider,
        expectedUserId,
        stateUserId: stateRecord.userId,
      });
      return false;
    }

    // Delete the state token to prevent replay attacks
    await db.delete(oauthStates).where(eq(oauthStates.id, stateRecord.id));

    logger.info("OAuth state validated successfully", {
      provider,
      tenantId: stateRecord.tenantId,
      userId: stateRecord.userId,
    });

    return true;
  } catch (error) {
    logger.error("OAuth state validation error", error as Error, {
      provider,
    });
    return false;
  }
}

/**
 * Validate OAuth state and extract context (for SameSite=strict cookie compatibility)
 *
 * SECURITY: Use this function in OAuth callbacks when session cookie is not available
 * due to SameSite=strict. The state token serves as the authentication mechanism.
 *
 * @param provider - OAuth provider ('quickbooks' | 'xero')
 * @param state - State token from callback
 * @returns The state record with userId and tenantId if valid, null otherwise
 */
export async function validateOAuthStateAndExtractContext(
  provider: string,
  state: string | null
): Promise<{ userId: string; tenantId: string } | null> {
  if (!state) {
    logger.warn("OAuth state validation failed: missing state parameter", {
      provider,
    });
    return null;
  }

  try {
    const stateRecord = await db.query.oauthStates.findFirst({
      where: and(
        eq(oauthStates.state, state),
        eq(oauthStates.provider, provider),
        gt(oauthStates.expiresAt, new Date())
      ),
    });

    if (!stateRecord) {
      logger.warn("OAuth state validation failed: invalid or expired state", {
        provider,
        hasState: !!state,
      });
      return null;
    }

    // Delete the state token to prevent replay attacks
    await db.delete(oauthStates).where(eq(oauthStates.id, stateRecord.id));

    logger.info("OAuth state validated and context extracted", {
      provider,
      tenantId: stateRecord.tenantId,
      userId: stateRecord.userId,
    });

    return {
      userId: stateRecord.userId,
      tenantId: stateRecord.tenantId,
    };
  } catch (error) {
    logger.error("OAuth state validation error", error as Error, {
      provider,
    });
    return null;
  }
}

/**
 * Validate OAuth state with full context (user and tenant validation)
 *
 * SECURITY: Use this function in OAuth callbacks to ensure:
 * 1. The state token is valid and not expired
 * 2. The state belongs to the current authenticated user
 * 3. The tenant ID matches
 *
 * @param provider - OAuth provider ('quickbooks' | 'xero')
 * @param state - State token from callback
 * @param expectedUserId - The user ID that initiated the OAuth flow
 * @param expectedTenantId - The tenant ID that initiated the OAuth flow
 * @returns The state record if valid, null otherwise
 */
export async function validateOAuthStateWithContext(
  provider: string,
  state: string | null,
  expectedUserId: string,
  expectedTenantId: string
): Promise<{ userId: string; tenantId: string } | null> {
  if (!state) {
    logger.warn("OAuth state validation failed: missing state parameter", {
      provider,
    });
    return null;
  }

  try {
    const stateRecord = await db.query.oauthStates.findFirst({
      where: and(
        eq(oauthStates.state, state),
        eq(oauthStates.provider, provider),
        gt(oauthStates.expiresAt, new Date())
      ),
    });

    if (!stateRecord) {
      logger.warn("OAuth state validation failed: invalid or expired state", {
        provider,
        hasState: !!state,
      });
      return null;
    }

    // SECURITY: Validate user ID matches
    if (stateRecord.userId !== expectedUserId) {
      logger.warn("OAuth state validation failed: user ID mismatch", {
        provider,
        expectedUserId,
        stateUserId: stateRecord.userId,
      });
      return null;
    }

    // SECURITY: Validate tenant ID matches
    if (stateRecord.tenantId !== expectedTenantId) {
      logger.warn("OAuth state validation failed: tenant ID mismatch", {
        provider,
        expectedTenantId,
        stateTenantId: stateRecord.tenantId,
      });
      return null;
    }

    // Delete the state token to prevent replay attacks
    await db.delete(oauthStates).where(eq(oauthStates.id, stateRecord.id));

    logger.info("OAuth state validated successfully with context", {
      provider,
      tenantId: stateRecord.tenantId,
      userId: stateRecord.userId,
    });

    return {
      userId: stateRecord.userId,
      tenantId: stateRecord.tenantId,
    };
  } catch (error) {
    logger.error("OAuth state validation error", error as Error, {
      provider,
    });
    return null;
  }
}

/**
 * Cleanup expired OAuth state tokens
 * Should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredOAuthStates(): Promise<number> {
  try {
    const deleted = await db
      .delete(oauthStates)
      .where(lt(oauthStates.expiresAt, new Date()))
      .returning({ id: oauthStates.id });

    logger.info("Cleaned up expired OAuth states", {
      count: deleted.length,
    });

    return deleted.length;
  } catch (error) {
    logger.error("Failed to cleanup expired OAuth states", error as Error);
    return 0;
  }
}
