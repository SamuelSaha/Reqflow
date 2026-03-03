/**
 * QuickBooks Integration Service
 * Creates and manages purchase orders in QuickBooks
 */

import OAuthClient from "intuit-oauth";
import { env } from "../env";
import { db } from "../db";
import { accountingIntegrations } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "../monitoring/logger";
import { withCircuitBreaker } from "../resilience/circuit-breaker";

export interface PurchaseOrderData {
  vendorName: string;
  description: string;
  amount: string;
  currency: string;
  quantity: number;
  requestNumber: string;
  requesterEmail: string;
  departmentName: string;
}

/**
 * Get active QuickBooks integration for tenant
 */
async function getIntegration(tenantId: string) {
  const integration = await db.query.accountingIntegrations.findFirst({
    where: and(
      eq(accountingIntegrations.tenantId, tenantId),
      eq(accountingIntegrations.provider, "quickbooks"),
      eq(accountingIntegrations.isActive, true)
    ),
  });

  if (!integration) {
    throw new Error("QuickBooks integration not found or inactive");
  }

  return integration;
}

/**
 * Refresh access token if expired
 */
async function refreshTokenIfNeeded(tenantId: string) {
  const integration = await getIntegration(tenantId);

  // Check if token is expired or will expire in next 5 minutes
  const now = new Date();
  const expiresAt = new Date(integration.tokenExpiresAt);
  const bufferMs = 5 * 60 * 1000; // 5 minutes

  if (expiresAt.getTime() - now.getTime() > bufferMs) {
    // Token still valid
    return integration;
  }

  // Token expired, refresh it
  const oauthClient = new OAuthClient({
    clientId: env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: env.QUICKBOOKS_CLIENT_SECRET!,
    environment: env.NODE_ENV === "production" ? "production" : "sandbox",
    redirectUri: env.QUICKBOOKS_REDIRECT_URI!,
  });

  // Set the old token
  oauthClient.token.setToken({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
    expires_in: 3600,
  });

  try {
    // Refresh the token
    const authResponse = await oauthClient.refresh();
    const newToken = oauthClient.getToken();

    if (!newToken.access_token || !newToken.refresh_token) {
      throw new Error("Failed to refresh QuickBooks token");
    }

    // Update in database
    const tokenExpiresAt = new Date(
      Date.now() + (newToken.expires_in || 3600) * 1000
    );

    await db
      .update(accountingIntegrations)
      .set({
        accessToken: newToken.access_token,
        refreshToken: newToken.refresh_token,
        tokenExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(accountingIntegrations.id, integration.id));

    logger.info("QuickBooks token refreshed", {
      tenantId,
      integrationId: integration.id,
    });

    return {
      ...integration,
      accessToken: newToken.access_token,
      refreshToken: newToken.refresh_token,
      tokenExpiresAt,
    };
  } catch (error) {
    logger.error("Failed to refresh QuickBooks token", error as Error, {
      tenantId,
      integrationId: integration.id,
    });
    throw new Error("Failed to refresh QuickBooks access token");
  }
}

/**
 * Get or create vendor in QuickBooks
 */
async function getOrCreateVendor(
  accessToken: string,
  realmId: string,
  vendorName: string
): Promise<string> {
  const baseUrl =
    env.NODE_ENV === "production"
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com";

  // Search for existing vendor (with circuit breaker)
  const query = `SELECT * FROM Vendor WHERE DisplayName = '${vendorName.replace(/'/g, "\\'")}'`;
  const searchUrl = `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(query)}`;

  const searchResponse = await withCircuitBreaker(
    "quickbooks-api",
    () =>
      fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }),
    { threshold: 5, timeout: 120000, requestTimeout: 15000 }
  );

  if (!searchResponse.ok) {
    throw new Error(`Failed to search vendors: ${searchResponse.statusText}`);
  }

  const searchData = await searchResponse.json();

  // Return existing vendor if found
  if (searchData.QueryResponse?.Vendor?.[0]) {
    return searchData.QueryResponse.Vendor[0].Id;
  }

  // Create new vendor (with circuit breaker)
  const createUrl = `${baseUrl}/v3/company/${realmId}/vendor`;
  const createResponse = await withCircuitBreaker(
    "quickbooks-api",
    () =>
      fetch(createUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          DisplayName: vendorName,
        }),
      }),
    { threshold: 5, timeout: 120000, requestTimeout: 15000 }
  );

  if (!createResponse.ok) {
    throw new Error(`Failed to create vendor: ${createResponse.statusText}`);
  }

  const createData = await createResponse.json();
  return createData.Vendor.Id;
}

/**
 * Create purchase order in QuickBooks
 */
export async function createPurchaseOrder(
  tenantId: string,
  poData: PurchaseOrderData
): Promise<{ poId: string; poNumber: string }> {
  // Ensure we have a valid token
  const integration = await refreshTokenIfNeeded(tenantId);

  const baseUrl =
    env.NODE_ENV === "production"
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com";

  try {
    // Get or create vendor
    const vendorId = await getOrCreateVendor(
      integration.accessToken,
      integration.providerAccountId,
      poData.vendorName
    );

    // Create purchase order
    const poUrl = `${baseUrl}/v3/company/${integration.providerAccountId}/purchaseorder`;

    const purchaseOrder = {
      VendorRef: {
        value: vendorId,
      },
      Line: [
        {
          DetailType: "ItemBasedExpenseLineDetail",
          Amount: parseFloat(poData.amount),
          Description: `${poData.description}\n\nReqflow Request: ${poData.requestNumber}\nRequester: ${poData.requesterEmail}\nDepartment: ${poData.departmentName}`,
          ItemBasedExpenseLineDetail: {
            Qty: poData.quantity,
            UnitPrice: parseFloat(poData.amount) / poData.quantity,
          },
        },
      ],
      PrivateNote: `Created from Reqflow request ${poData.requestNumber}`,
    };

    const response = await fetch(poUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(purchaseOrder),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`QuickBooks API error: ${errorText}`);
    }

    const data = await response.json();
    const po = data.PurchaseOrder;

    logger.info("Purchase order created in QuickBooks", {
      tenantId,
      poId: po.Id,
      docNumber: po.DocNumber,
      vendorId,
      requestNumber: poData.requestNumber,
    });

    return {
      poId: po.Id,
      poNumber: po.DocNumber,
    };
  } catch (error) {
    logger.error("Failed to create QuickBooks purchase order", error as Error, {
      tenantId,
      requestNumber: poData.requestNumber,
    });
    throw error;
  }
}
