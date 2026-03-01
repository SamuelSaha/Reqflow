/**
 * Xero OAuth Callback Endpoint
 * Exchanges authorization code for access/refresh tokens
 */

import { NextResponse } from "next/server";
import { XeroClient } from "xero-node";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";
import { db } from "@/lib/db";
import { accountingIntegrations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { validateOAuthStateWithContext } from "@/lib/security/oauth-state";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/login`);
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle user denial
    if (error === "access_denied") {
      logger.warn("Xero OAuth denied by user", { userId: session.userId });
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=access_denied`
      );
    }

    // 🔒 SECURITY FIX: Validate OAuth state parameter with user+tenant binding to prevent CSRF/state hijacking
    const stateContext = await validateOAuthStateWithContext(
      "xero",
      state,
      session.userId,
      session.tenantId
    );
    if (!stateContext) {
      logger.warn("Xero OAuth state validation failed", {
        userId: session.userId,
        tenantId: session.tenantId,
        hasState: !!state,
      });
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=invalid_state`
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );
    }

    // Initialize Xero client
    const xero = new XeroClient({
      clientId: env.XERO_CLIENT_ID!,
      clientSecret: env.XERO_CLIENT_SECRET!,
      redirectUris: [env.XERO_REDIRECT_URI!],
      scopes: "offline_access accounting.transactions accounting.contacts accounting.settings.read".split(" "),
    });

    // Exchange authorization code for tokens
    const tokenSet = await xero.apiCallback(request.url);

    if (!tokenSet.access_token || !tokenSet.refresh_token) {
      throw new Error("Failed to obtain access tokens");
    }

    // Get connected tenants (organizations)
    await xero.updateTenants();
    const tenants = xero.tenants;

    if (!tenants || tenants.length === 0) {
      throw new Error("No Xero organizations found");
    }

    // Use the first tenant (organization)
    const xeroTenant = tenants[0];
    const tokenExpiresAt = new Date(Date.now() + (tokenSet.expires_in || 1800) * 1000);

    // Check for existing integration
    const existing = await db.query.accountingIntegrations.findFirst({
      where: and(
        eq(accountingIntegrations.tenantId, session.tenantId),
        eq(accountingIntegrations.provider, "xero")
      ),
    });

    if (existing) {
      // Update existing integration
      await db
        .update(accountingIntegrations)
        .set({
          accessToken: tokenSet.access_token,
          refreshToken: tokenSet.refresh_token,
          tokenExpiresAt,
          providerAccountId: xeroTenant.tenantId,
          providerAccountName: xeroTenant.tenantName || "Xero Organization",
          isActive: true,
          lastSyncError: null,
          updatedAt: new Date(),
        })
        .where(eq(accountingIntegrations.id, existing.id));

      logger.info("Xero integration updated", {
        tenantId: session.tenantId,
        xeroTenantId: xeroTenant.tenantId,
        xeroTenantName: xeroTenant.tenantName,
      });
    } else {
      // Create new integration
      await db.insert(accountingIntegrations).values({
        tenantId: session.tenantId,
        provider: "xero",
        accessToken: tokenSet.access_token,
        refreshToken: tokenSet.refresh_token,
        tokenExpiresAt,
        providerAccountId: xeroTenant.tenantId,
        providerAccountName: xeroTenant.tenantName || "Xero Organization",
        isActive: true,
        autoSync: true,
        connectedBy: session.userId,
        connectedAt: new Date(),
      });

      logger.info("Xero integration created", {
        tenantId: session.tenantId,
        xeroTenantId: xeroTenant.tenantId,
        xeroTenantName: xeroTenant.tenantName,
      });
    }

    // Redirect to settings page with success
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?success=xero`
    );
  } catch (error: unknown) {
    logger.error("Xero OAuth callback failed", error as Error);
    captureError(error as Error, { route: "/api/integrations/xero/callback" });
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=callback_failed`
    );
  }
}
