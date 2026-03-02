/**
 * Axiom Client Wrapper
 * Exports configured Axiom instance for direct ingestion
 */

import { Axiom } from "@axiomhq/js";
import { env } from "../env";

/**
 * Shared Axiom client instance
 * Falls back to no-op if AXIOM_API_TOKEN not configured
 */
export const axiom = env.AXIOM_API_TOKEN
  ? new Axiom({
      token: env.AXIOM_API_TOKEN,
    })
  : {
      // No-op implementation when Axiom not configured
      ingest: async () => {},
      flush: async () => {},
    };

export const AXIOM_DATASET = env.AXIOM_DATASET;
