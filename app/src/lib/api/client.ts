/**
 * tRPC client for use in Client Components
 */

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./root";
import superjson from "superjson";
import { env } from "../env";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return env.NEXT_PUBLIC_APP_URL;
}

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
