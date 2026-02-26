/**
 * QuickBooks OAuth Connect Endpoint
 * Initiates OAuth 2.0 authorization flow
 */

import { NextResponse } from "next/server";
import OAuthClient from "intuit-oauth";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

export async function GET() {
  try {
    if (!env.QUICKBOOKS_CLIENT_ID || !env.QUICKBOOKS_CLIENT_SECRET || !env.QUICKBOOKS_REDIRECT_URI) {
      return NextResponse.json(
        { error: "QuickBooks OAuth not configured. Please set environment variables." },
        { status: 500 }
      );
    }

    const oauthClient = new OAuthClient({
      clientId: env.QUICKBOOKS_CLIENT_ID,
      clientSecret: env.QUICKBOOKS_CLIENT_SECRET,
      environment: env.NODE_ENV === "production" ? "production" : "sandbox",
      redirectUri: env.QUICKBOOKS_REDIRECT_URI,
    });

    // Generate authorization URL
    const authUri = oauthClient.authorizeUri({
      scope: [
        OAuthClient.scopes.Accounting,
        OAuthClient.scopes.OpenId,
      ],
      state: "reqflow-qb-oauth", // CSRF protection token (should be random in production)
    });

    logger.info("QuickBooks OAuth flow initiated", {
      environment: env.NODE_ENV === "production" ? "production" : "sandbox",
    });

    // Redirect to QuickBooks authorization page
    return NextResponse.redirect(authUri);
  } catch (error: unknown) {
    logger.error("QuickBooks OAuth connect failed", error as Error);
    captureError(error as Error, { route: "/api/integrations/quickbooks/connect" });
    return NextResponse.json(
      { error: "Failed to initiate QuickBooks connection" },
      { status: 500 }
    );
  }
}
