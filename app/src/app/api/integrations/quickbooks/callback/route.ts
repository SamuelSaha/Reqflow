/**
 * QuickBooks OAuth Callback Endpoint
 * Exchanges authorization code for access/refresh tokens
 */

import { NextResponse } from "next/server";
import OAuthClient from "intuit-oauth";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";
import { db } from "@/lib/db";
import { accountingIntegrations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { validateOAuthStateAndExtractContext } from "@/lib/security/oauth-state";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const realmId = searchParams.get("realmId"); // QuickBooks company ID
    const error = searchParams.get("error");

    // 🔒 SECURITY (issue #125): Validate OAuth state to extract user context
    // This allows SameSite=strict cookies by authenticating via state token
    // instead of relying on session cookie which won't be sent cross-site
    const stateContext = await validateOAuthStateAndExtractContext("quickbooks", state);
    if (!stateContext) {
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=invalid_state`
      );
    }

    const { userId, tenantId } = stateContext;

    // Handle user denial
    if (error === "access_denied") {
      logger.warn("QuickBooks OAuth denied by user", { userId });
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=access_denied`
      );
    }

    if (!code || !realmId) {
      return NextResponse.json(
        { error: "Missing authorization code or realm ID" },
        { status: 400 }
      );
    }

    // Initialize OAuth client
    const oauthClient = new OAuthClient({
      clientId: env.QUICKBOOKS_CLIENT_ID!,
      clientSecret: env.QUICKBOOKS_CLIENT_SECRET!,
      environment: env.NODE_ENV === "production" ? "production" : "sandbox",
      redirectUri: env.QUICKBOOKS_REDIRECT_URI!,
    });

    // Exchange authorization code for tokens
    const authResponse = await oauthClient.createToken(request.url);
    const token = oauthClient.getToken();

    if (!token.access_token || !token.refresh_token) {
      throw new Error("Failed to obtain access tokens");
    }

    // Get company info
    const companyInfoUrl = `${oauthClient.environment === "sandbox"
      ? "https://sandbox-quickbooks.api.intuit.com"
      : "https://quickbooks.api.intuit.com"
    }/v3/company/${realmId}/companyinfo/${realmId}`;

    const companyResponse = await fetch(companyInfoUrl, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: "application/json",
      },
    });

    let companyName = "QuickBooks Company";
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      companyName = companyData.CompanyInfo?.CompanyName || companyName;
    }

    // Check for existing integration
    const existing = await db.query.accountingIntegrations.findFirst({
      where: and(
        eq(accountingIntegrations.tenantId, tenantId),
        eq(accountingIntegrations.provider, "quickbooks")
      ),
    });

    const tokenExpiresAt = new Date(Date.now() + (token.expires_in || 3600) * 1000);

    if (existing) {
      // Update existing integration
      await db
        .update(accountingIntegrations)
        .set({
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          tokenExpiresAt,
          providerAccountId: realmId,
          providerAccountName: companyName,
          isActive: true,
          lastSyncError: null,
          updatedAt: new Date(),
        })
        .where(eq(accountingIntegrations.id, existing.id));

      logger.info("QuickBooks integration updated", {
        tenantId,
        realmId,
        companyName,
      });
    } else {
      // Create new integration
      await db.insert(accountingIntegrations).values({
        tenantId,
        provider: "quickbooks",
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        tokenExpiresAt,
        providerAccountId: realmId,
        providerAccountName: companyName,
        isActive: true,
        autoSync: true,
        connectedBy: userId,
        connectedAt: new Date(),
      });

      logger.info("QuickBooks integration created", {
        tenantId,
        realmId,
        companyName,
      });
    }

    // Redirect to settings page with success
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?success=quickbooks`
    );
  } catch (error: unknown) {
    logger.error("QuickBooks OAuth callback failed", error as Error);
    captureError(error as Error, { route: "/api/integrations/quickbooks/callback" });
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=callback_failed`
    );
  }
}
