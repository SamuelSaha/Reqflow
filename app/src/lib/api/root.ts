/**
 * tRPC root router
 * Combines all sub-routers
 */

import { router } from "./trpc";
import { requestsRouter } from "./routers/requests";
import { budgetsRouter } from "./routers/budgets";
import { approvalsRouter } from "./routers/approvals";

export const appRouter = router({
  requests: requestsRouter,
  budgets: budgetsRouter,
  approvals: approvalsRouter,
});

export type AppRouter = typeof appRouter;
