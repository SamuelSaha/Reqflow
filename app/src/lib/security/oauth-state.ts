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
 *
 * After successful validation, the token is deleted to prevent replay attacks
 *
 * @param provider - OAuth provider ('quickbooks' | 'xero')
 * @param state - State token from callback
 * @returns true if valid, false otherwise
 */
export async function validateOAuthState(
  provider: string,
  state: string | null
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
