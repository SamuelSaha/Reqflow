/**
 * Central Export for Lazy-Loaded Components
 * Use these imports for code-splitting across the application
 */

// Chart components (heavy - Recharts)
export { RequestTrendChart, RequestTrendChartSkeleton } from "@/components/charts/RequestTrendChart";

// Dashboard components
export { DashboardStats } from "@/components/dashboard/LazyDashboardStats";
export { LazyDashboardStats } from "@/components/dashboard/LazyDashboardStatsWrapper";

// Settings components (complex forms and dialogs)
export {
  WorkflowBuilder,
  ApprovalChainEditor,
  CreateBudgetDialog,
  InviteUsersDialog,
  EditUserDialog,
  TestWorkflowDialog,
} from "@/components/settings/lazy-components";
