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
import { onboardingRouter } from "./routers/onboarding";
import { teamRouter } from "./routers/team";
import { workflowsRouter } from "./routers/workflows";
import { analyticsRouter } from "./routers/analytics";
import { vendorsRouter } from "./routers/vendors";

export const appRouter = router({
  requests: requestsRouter,
  budgets: budgetsRouter,
  approvals: approvalsRouter,
  trials: trialsRouter,
  renewals: renewalsRouter,
  onboarding: onboardingRouter,
  team: teamRouter,
  workflows: workflowsRouter,
  analytics: analyticsRouter,
  vendors: vendorsRouter,
});

export type AppRouter = typeof appRouter;
