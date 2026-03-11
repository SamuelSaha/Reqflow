/**
 * tRPC root router
 * Combines all sub-routers
 */

import { router } from "./trpc";
import { apiKeysRouter } from "./routers/api-keys";
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
import { integrationsRouter } from "./routers/integrations";
import { filesRouter } from "./routers/files";
import { templatesRouter } from "./routers/templates";
import { contractsRouter } from "./routers/contracts";
import { categoriesRouter } from "./routers/categories";
import { subscriptionsRouter } from "./routers/subscriptions";
import { invoicesRouter } from "./routers/invoices";
import { notificationsRouter } from "./routers/notifications";
import { aiRouter } from "./routers/ai";

export const appRouter = router({
  apiKeys: apiKeysRouter,
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
  integrations: integrationsRouter,
  files: filesRouter,
  templates: templatesRouter,
  contracts: contractsRouter,
  categories: categoriesRouter,
  subscriptions: subscriptionsRouter,
  invoices: invoicesRouter,
  notifications: notificationsRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
