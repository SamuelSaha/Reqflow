/**
 * tRPC root router
 * Combines all sub-routers
 */

import { router } from "./trpc";
import { requestsRouter } from "./routers/requests";
import { budgetsRouter } from "./routers/budgets";
import { approvalsRouter } from "./routers/approvals";
import { trialsRouter } from "./routers/trials";
import { renewalsRouter } from "./routers/renewals";

export const appRouter = router({
  requests: requestsRouter,
  budgets: budgetsRouter,
  approvals: approvalsRouter,
  trials: trialsRouter,
  renewals: renewalsRouter,
});

export type AppRouter = typeof appRouter;
