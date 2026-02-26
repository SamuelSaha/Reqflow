/**
 * Xero Integration Service
 * Creates and manages purchase orders in Xero
 */

import { XeroClient, PurchaseOrder } from "xero-node";
import { env } from "../env";
import { db } from "../db";
import { accountingIntegrations } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "../monitoring/logger";

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
 * Get active Xero integration for tenant
 */
async function getIntegration(tenantId: string) {
  const integration = await db.query.accountingIntegrations.findFirst({
    where: and(
      eq(accountingIntegrations.tenantId, tenantId),
      eq(accountingIntegrations.provider, "xero"),
      eq(accountingIntegrations.isActive, true)
    ),
  });

  if (!integration) {
    throw new Error("Xero integration not found or inactive");
  }

  return integration;
}

/**
 * Create Xero client with token refresh
 */
async function getXeroClient(tenantId: string) {
  const integration = await getIntegration(tenantId);

  const xero = new XeroClient({
    clientId: env.XERO_CLIENT_ID!,
    clientSecret: env.XERO_CLIENT_SECRET!,
    redirectUris: [env.XERO_REDIRECT_URI!],
    scopes: "offline_access accounting.transactions accounting.contacts accounting.settings.read".split(" "),
  });

  // Set the current token
  await xero.setTokenSet({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
    expires_in: Math.floor(
      (new Date(integration.tokenExpiresAt).getTime() - Date.now()) / 1000
    ),
  });

  // Check if token needs refresh (5 minute buffer)
  const now = new Date();
  const expiresAt = new Date(integration.tokenExpiresAt);
  const bufferMs = 5 * 60 * 1000;

  if (expiresAt.getTime() - now.getTime() < bufferMs) {
    try {
      // Refresh the token
      const newTokenSet = await xero.refreshToken();

      if (!newTokenSet.access_token || !newTokenSet.refresh_token) {
        throw new Error("Failed to refresh Xero token");
      }

      // Update in database
      const tokenExpiresAt = new Date(
        Date.now() + (newTokenSet.expires_in || 1800) * 1000
      );

      await db
        .update(accountingIntegrations)
        .set({
          accessToken: newTokenSet.access_token,
          refreshToken: newTokenSet.refresh_token,
          tokenExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(accountingIntegrations.id, integration.id));

      logger.info("Xero token refreshed", {
        tenantId,
        integrationId: integration.id,
      });
    } catch (error) {
      logger.error("Failed to refresh Xero token", error as Error, {
        tenantId,
        integrationId: integration.id,
      });
      throw new Error("Failed to refresh Xero access token");
    }
  }

  return { xero, integration };
}

/**
 * Get or create contact (vendor) in Xero
 */
async function getOrCreateContact(
  xero: XeroClient,
  xeroTenantId: string,
  vendorName: string
): Promise<string> {
  try {
    // Search for existing contact
    const searchResponse = await xero.accountingApi.getContacts(
      xeroTenantId,
      undefined,
      `Name="${vendorName}"`,
      undefined,
      undefined,
      undefined,
      undefined,
      true // summaryOnly
    );

    // Return existing contact if found
    if (searchResponse.body.contacts && searchResponse.body.contacts.length > 0) {
      return searchResponse.body.contacts[0].contactID!;
    }

    // Create new contact
    const createResponse = await xero.accountingApi.createContacts(xeroTenantId, {
      contacts: [
        {
          name: vendorName,
          isSupplier: true,
        },
      ],
    });

    if (
      !createResponse.body.contacts ||
      createResponse.body.contacts.length === 0
    ) {
      throw new Error("Failed to create contact in Xero");
    }

    return createResponse.body.contacts[0].contactID!;
  } catch (error) {
    logger.error("Failed to get/create Xero contact", error as Error, {
      vendorName,
    });
    throw error;
  }
}

/**
 * Create purchase order in Xero
 */
export async function createPurchaseOrder(
  tenantId: string,
  poData: PurchaseOrderData
): Promise<{ poId: string; poNumber: string }> {
  const { xero, integration } = await getXeroClient(tenantId);

  try {
    // Update tenants to get the Xero organization ID
    await xero.updateTenants();
    const xeroTenants = xero.tenants;

    if (!xeroTenants || xeroTenants.length === 0) {
      throw new Error("No Xero tenants found");
    }

    const xeroTenantId = xeroTenants[0].tenantId;

    // Get or create contact
    const contactId = await getOrCreateContact(xero, xeroTenantId, poData.vendorName);

    // Create purchase order
    const unitAmount = parseFloat(poData.amount) / poData.quantity;

    const purchaseOrder: PurchaseOrder = {
      contact: {
        contactID: contactId,
      },
      lineItems: [
        {
          description: `${poData.description}\n\nReqflow Request: ${poData.requestNumber}\nRequester: ${poData.requesterEmail}\nDepartment: ${poData.departmentName}`,
          quantity: poData.quantity,
          unitAmount: unitAmount,
          accountCode: "800", // Default expense account (customize as needed)
        },
      ],
      reference: poData.requestNumber,
      status: PurchaseOrder.StatusEnum.SUBMITTED,
    };

    const response = await xero.accountingApi.createPurchaseOrders(xeroTenantId, {
      purchaseOrders: [purchaseOrder],
    });

    if (
      !response.body.purchaseOrders ||
      response.body.purchaseOrders.length === 0
    ) {
      throw new Error("Failed to create purchase order in Xero");
    }

    const po = response.body.purchaseOrders[0];

    logger.info("Purchase order created in Xero", {
      tenantId,
      poId: po.purchaseOrderID,
      poNumber: po.purchaseOrderNumber,
      contactId,
      requestNumber: poData.requestNumber,
    });

    return {
      poId: po.purchaseOrderID!,
      poNumber: po.purchaseOrderNumber!,
    };
  } catch (error) {
    logger.error("Failed to create Xero purchase order", error as Error, {
      tenantId,
      requestNumber: poData.requestNumber,
    });
    throw error;
  }
}
