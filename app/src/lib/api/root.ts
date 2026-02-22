/**
 * tRPC root router
 * Combines all sub-routers
 */

import { router } from "./trpc";
import { requestsRouter } from "./routers/requests";
import { budgetsRouter } from "./routers/budgets";

export const appRouter = router({
  requests: requestsRouter,
  budgets: budgetsRouter,
  // TODO: Add more routers as needed
  // approvals: approvalsRouter,
  // vendors: vendorsRouter,
  // users: usersRouter,
});

export type AppRouter = typeof appRouter;
