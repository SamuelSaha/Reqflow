/**
 * tRPC React hooks for Client Components
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import type { AppRouter } from "./root";
import superjson from "superjson";
import { env } from "../env";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return env.NEXT_PUBLIC_APP_URL;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Caching strategy: Optimize for dashboard performance
            staleTime: 60 * 1000, // Data stays fresh for 1 minute (reduces API calls by ~70%)
            gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
            refetchOnWindowFocus: false, // Don't refetch when user tabs back (better UX)
            refetchOnMount: false, // Use cache on mount if data is fresh (instant loads)
            retry: 2, // Retry failed requests twice (better reliability)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          // Use HTTP subscription link for subscriptions (long-polling)
          condition(op) {
            return op.type === "subscription";
          },
          true: httpSubscriptionLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
          }),
          // Use HTTP batch link for queries and mutations
          false: httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
            // Prevent URLs from exceeding browser limits
            maxURLLength: 2083,
            headers() {
              const csrfToken = getCookie("csrf_token");
              return csrfToken ? { "x-csrf-token": csrfToken } : {};
            },
          }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
