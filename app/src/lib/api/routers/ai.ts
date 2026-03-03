/**
 * AI Router — Bring Your Own API Key (BYOAK), multi-provider
 * Issue #35: Claude / GPT / Gemini support for purchase request analysis
 *
 * Security model:
 * - API key encrypted at rest with AES-256-GCM (FIELD_ENCRYPTION_KEY)
 * - Key stored per-org in organizations.ai_api_key + organizations.ai_provider
 * - Key NEVER returned to the client — only { configured: boolean, provider: string }
 * - Only admins can save/remove the key
 */

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { organizations, requests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encryptField, decryptField, isFieldEncrypted } from "@/lib/security/field-encryption";
import { withCircuitBreaker } from "@/lib/resilience/circuit-breaker";
import Anthropic from "@anthropic-ai/sdk";

export type AiProvider = "anthropic" | "openai" | "gemini";

const providerSchema = z.enum(["anthropic", "openai", "gemini"]);

// Key format hints for each provider
const KEY_PREFIXES: Record<AiProvider, string | null> = {
  anthropic: "sk-ant-",
  openai: "sk-",
  gemini: null, // Google AI keys have no standard prefix
};

const AiAnalysisSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  recommendation: z.enum(["approve", "review", "flag"]),
  summary: z.string(),
  concerns: z.array(z.string()),
  suggestedQuestions: z.array(z.string()),
  insights: z.string(),
});

export type AiAnalysis = z.infer<typeof AiAnalysisSchema>;

async function getOrgAiConfig(
  tenantId: string,
  db: typeof import("@/lib/db").db
): Promise<{ provider: AiProvider; apiKey: string } | null> {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, tenantId),
    columns: { aiProvider: true, aiApiKey: true, anthropicApiKey: true },
  });

  if (!org) return null;

  // New unified key takes priority
  if (org.aiApiKey && isFieldEncrypted(org.aiApiKey)) {
    try {
      return {
        provider: (org.aiProvider ?? "anthropic") as AiProvider,
        apiKey: decryptField(org.aiApiKey),
      };
    } catch {
      return null;
    }
  }

  // Fall back to legacy anthropic_api_key (pre-migration rows)
  if (org.anthropicApiKey && isFieldEncrypted(org.anthropicApiKey)) {
    try {
      return { provider: "anthropic", apiKey: decryptField(org.anthropicApiKey) };
    } catch {
      return null;
    }
  }

  return null;
}

/** Call the appropriate provider API and return raw text response */
async function callProvider(
  provider: AiProvider,
  apiKey: string,
  prompt: string
): Promise<string> {
  if (provider === "anthropic") {
    const client = new Anthropic({ apiKey });
    const message = await withCircuitBreaker(
      "anthropic-api",
      () =>
        client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          messages: [{ role: "user", content: prompt }],
        }),
      { threshold: 5, timeout: 120000, requestTimeout: 30000 }
    );
    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    return content.text;
  }

  if (provider === "openai") {
    const response = await withCircuitBreaker(
      "openai-api",
      () =>
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            max_tokens: 512,
            messages: [{ role: "user", content: prompt }],
          }),
        }),
      { threshold: 5, timeout: 120000, requestTimeout: 30000 }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `OpenAI API error ${response.status}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  if (provider === "gemini") {
    const response = await withCircuitBreaker(
      "gemini-api",
      () =>
        fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 512 },
            }),
          }
        ),
      { threshold: 5, timeout: 120000, requestTimeout: 30000 }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `Gemini API error ${response.status}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  throw new Error(`Unknown provider: ${provider}`);
}

/** Validate a key by making a minimal test call */
async function validateKey(provider: AiProvider, key: string): Promise<void> {
  if (provider === "anthropic") {
    const client = new Anthropic({ apiKey: key });
    await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1,
      messages: [{ role: "user", content: "hi" }],
    });
    return;
  }

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error("Invalid OpenAI key");
    return;
  }

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    if (!res.ok) throw new Error("Invalid Gemini key");
    return;
  }
}

export const aiRouter = router({
  /**
   * Check if this org has an AI key configured.
   * Returns { configured: boolean, provider: AiProvider } — never the key itself.
   */
  status: protectedProcedure.query(async ({ ctx }) => {
    const org = await ctx.db.query.organizations.findFirst({
      where: eq(organizations.id, ctx.tenantId),
      columns: { aiProvider: true, aiApiKey: true, anthropicApiKey: true },
    });

    const hasNewKey = !!org?.aiApiKey && isFieldEncrypted(org.aiApiKey);
    const hasLegacyKey = !!org?.anthropicApiKey && isFieldEncrypted(org.anthropicApiKey);

    return {
      configured: hasNewKey || hasLegacyKey,
      provider: (org?.aiProvider ?? "anthropic") as AiProvider,
    };
  }),

  /**
   * Save (or replace) the org's AI key for the selected provider.
   * Admin only. Validates key format + live-tests it, then encrypts and stores.
   */
  saveKey: adminProcedure
    .input(z.object({ provider: providerSchema, key: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const prefix = KEY_PREFIXES[input.provider];
      if (prefix && !input.key.startsWith(prefix)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid key format. ${
            input.provider === "anthropic" ? "Anthropic" : "OpenAI"
          } keys start with ${prefix}`,
        });
      }

      try {
        await validateKey(input.provider, input.key);
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error
              ? err.message
              : "API key validation failed. Please check your key and try again.",
        });
      }

      const encrypted = encryptField(input.key);

      await ctx.db
        .update(organizations)
        .set({
          aiProvider: input.provider,
          aiApiKey: encrypted,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, ctx.tenantId));

      return { success: true };
    }),

  /**
   * Remove the org's AI key.
   * Admin only.
   */
  removeKey: adminProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(organizations)
      .set({ aiApiKey: null, anthropicApiKey: null, updatedAt: new Date() })
      .where(eq(organizations.id, ctx.tenantId));

    return { success: true };
  }),

  /**
   * Analyze a purchase request with the configured AI provider.
   * Falls back to ANTHROPIC_API_KEY env var if no org key is set.
   * Returns structured AI analysis — never exposes the API key.
   */
  analyzeRequest: protectedProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      let config = await getOrgAiConfig(ctx.tenantId, ctx.db);

      if (!config) {
        const { env } = await import("@/lib/env");
        const fallback = env.ANTHROPIC_API_KEY ?? null;
        if (fallback) config = { provider: "anthropic", apiKey: fallback };
      }

      if (!config) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No AI API key configured. Add your API key in Settings → AI.",
        });
      }

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
        const text = await callProvider(config.provider, config.apiKey, prompt);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");
        const parsed = AiAnalysisSchema.parse(JSON.parse(jsonMatch[0]));
        return { ...parsed, provider: config.provider };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI analysis failed. Please try again.",
        });
      }
    }),
});
