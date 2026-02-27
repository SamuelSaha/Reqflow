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
import { getSession } from "@/lib/auth/session";
import { validateOAuthState } from "@/lib/security/oauth-state";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/login`);
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const realmId = searchParams.get("realmId"); // QuickBooks company ID
    const error = searchParams.get("error");

    // Handle user denial
    if (error === "access_denied") {
      logger.warn("QuickBooks OAuth denied by user", { userId: session.userId });
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=access_denied`
      );
    }

    // 🔒 SECURITY FIX: Validate OAuth state parameter to prevent CSRF attacks
    const isValidState = await validateOAuthState("quickbooks", state);
    if (!isValidState) {
      logger.warn("QuickBooks OAuth state validation failed", {
        userId: session.userId,
        hasState: !!state,
      });
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=invalid_state`
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
        eq(accountingIntegrations.tenantId, session.tenantId),
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
        tenantId: session.tenantId,
        realmId,
        companyName,
      });
    } else {
      // Create new integration
      await db.insert(accountingIntegrations).values({
        tenantId: session.tenantId,
        provider: "quickbooks",
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        tokenExpiresAt,
        providerAccountId: realmId,
        providerAccountName: companyName,
        isActive: true,
        autoSync: true,
        connectedBy: session.userId,
        connectedAt: new Date(),
      });

      logger.info("QuickBooks integration created", {
        tenantId: session.tenantId,
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
