/**
 * tRPC client for use in Client Components
 */

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./root";
import superjson from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
