/**
 * AI Router — Bring Your Own API Key (BYOAK)
 * Issue #35: Claude AI integration for purchase request analysis
 *
 * Security model:
 * - API key encrypted at rest with AES-256-GCM (FIELD_ENCRYPTION_KEY)
 * - Key stored per-org in organizations.anthropic_api_key
 * - Key NEVER returned to the client — only { configured: boolean }
 * - Only admins can save/remove the key
 */

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { organizations, requests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encryptField, decryptField, isFieldEncrypted } from "@/lib/security/field-encryption";
import Anthropic from "@anthropic-ai/sdk";

// Anthropic key prefix validation
const ANTHROPIC_KEY_PREFIX = "sk-ant-";

const AiAnalysisSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  recommendation: z.enum(["approve", "review", "flag"]),
  summary: z.string(),
  concerns: z.array(z.string()),
  suggestedQuestions: z.array(z.string()),
  insights: z.string(),
});

export type AiAnalysis = z.infer<typeof AiAnalysisSchema>;

async function getDecryptedKey(tenantId: string, db: typeof import("@/lib/db").db): Promise<string | null> {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, tenantId),
    columns: { anthropicApiKey: true },
  });

  if (!org?.anthropicApiKey) return null;

  try {
    return decryptField(org.anthropicApiKey);
  } catch {
    return null;
  }
}

export const aiRouter = router({
  /**
   * Check if this org has a Claude API key configured.
   * Returns { configured: boolean } — never the key itself.
   */
  status: protectedProcedure.query(async ({ ctx }) => {
    const org = await ctx.db.query.organizations.findFirst({
      where: eq(organizations.id, ctx.tenantId),
      columns: { anthropicApiKey: true },
    });

    return {
      configured: !!org?.anthropicApiKey && isFieldEncrypted(org.anthropicApiKey),
    };
  }),

  /**
   * Save (or replace) the org's Claude API key.
   * Admin only. Validates the key format, then encrypts and stores it.
   */
  saveKey: adminProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!input.key.startsWith(ANTHROPIC_KEY_PREFIX)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid API key format. Anthropic keys start with sk-ant-",
        });
      }

      // Quick validation: test the key with a minimal API call
      try {
        const client = new Anthropic({ apiKey: input.key });
        await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        });
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "API key validation failed. Please check your key and try again.",
        });
      }

      const encrypted = encryptField(input.key);

      await ctx.db
        .update(organizations)
        .set({ anthropicApiKey: encrypted, updatedAt: new Date() })
        .where(eq(organizations.id, ctx.tenantId));

      return { success: true };
    }),

  /**
   * Remove the org's Claude API key.
   * Admin only.
   */
  removeKey: adminProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(organizations)
      .set({ anthropicApiKey: null, updatedAt: new Date() })
      .where(eq(organizations.id, ctx.tenantId));

    return { success: true };
  }),

  /**
   * Analyze a purchase request with Claude.
   * Uses the org's stored API key (falls back to server-level key if no org key).
   * Returns structured AI analysis — never exposes the API key.
   */
  analyzeRequest: protectedProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Get API key: org key takes priority, then server-level env key
      let apiKey = await getDecryptedKey(ctx.tenantId, ctx.db);

      if (!apiKey) {
        // Check server-level key as fallback
        const { env } = await import("@/lib/env");
        apiKey = env.ANTHROPIC_API_KEY ?? null;
      }

      if (!apiKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No AI API key configured. Add your Anthropic API key in Settings → AI.",
        });
      }

      // Fetch the request with context
      const request = await ctx.db.query.requests.findFirst({
        where: eq(requests.id, input.requestId),
        with: {
          requester: { columns: { name: true, role: true } },
          department: { columns: { name: true } },
        },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
      }

      if (request.tenantId !== ctx.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Build the analysis prompt
      const prompt = `You are a procurement analyst reviewing a purchase request. Analyze this request and respond with ONLY valid JSON matching the schema below.

PURCHASE REQUEST:
- Title: ${request.title}
- Amount: €${parseFloat(request.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
- Vendor: ${request.vendorName ?? "Not specified"}
- Category: ${request.category ?? "Not specified"}
- Department: ${request.department?.name ?? "Not specified"}
- Requester Role: ${request.requester?.role ?? "unknown"}
- Business Justification: ${request.description ?? "None provided"}
- Urgency: ${request.urgency ?? "normal"}
- Status: ${request.status}

Respond with this exact JSON structure:
{
  "riskLevel": "low" | "medium" | "high",
  "recommendation": "approve" | "review" | "flag",
  "summary": "1-2 sentence assessment of this request",
  "concerns": ["concern1", "concern2"],
  "suggestedQuestions": ["question for approver 1", "question 2"],
  "insights": "Additional context or market insight about this purchase"
}

Guidelines:
- riskLevel=high if amount >€5000 or missing justification or first-time vendor
- riskLevel=medium if amount €1000-5000 or vague justification
- recommendation=flag only if something looks genuinely suspicious
- suggestedQuestions should help the approver make a better decision
- Keep concerns and suggestedQuestions arrays to 2-3 items max
- insights should add real value (pricing benchmarks, vendor reputation, alternatives)`;

      try {
        const client = new Anthropic({ apiKey });
        const message = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          messages: [{ role: "user", content: prompt }],
        });

        const content = message.content[0];
        if (content.type !== "text") {
          throw new Error("Unexpected response type");
        }

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");

        const parsed = AiAnalysisSchema.parse(JSON.parse(jsonMatch[0]));
        return parsed;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI analysis failed. Please try again.",
        });
      }
    }),
});
