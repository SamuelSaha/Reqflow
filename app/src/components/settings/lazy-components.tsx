"use client";

/**
 * Lazy-loaded Settings Components
 * Separated for code splitting - Workflow builder is complex
 */

import dynamic from "next/dynamic";

/**
 * Workflow Builder - Lazy loaded with Suspense
 * This is a heavy component with complex state management
 */
export const WorkflowBuilder = dynamic(
  () => import("@/components/settings/WorkflowBuilder").then((mod) => mod.WorkflowBuilder),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-10 bg-slate-100 rounded animate-pulse" />
        <div className="h-32 bg-slate-100 rounded animate-pulse" />
        <div className="h-32 bg-slate-100 rounded animate-pulse" />
      </div>
    ),
    ssr: false,
  }
);

/**
 * Approval Chain Editor - Lazy loaded
 */
export const ApprovalChainEditor = dynamic(
  () => import("@/components/settings/ApprovalChainEditor").then((mod) => mod.ApprovalChainEditor),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 bg-slate-100 rounded animate-pulse" />
        <div className="h-24 bg-slate-100 rounded animate-pulse" />
      </div>
    ),
    ssr: false,
  }
);

/**
 * Create Budget Dialog - Lazy loaded
 */
export const CreateBudgetDialog = dynamic(
  () => import("@/components/settings/CreateBudgetDialog").then((mod) => mod.CreateBudgetDialog),
  {
    loading: () => null,
    ssr: false,
  }
);

/**
 * Invite Users Dialog - Lazy loaded
 */
export const InviteUsersDialog = dynamic(
  () => import("@/components/settings/InviteUsersDialog").then((mod) => mod.InviteUsersDialog),
  {
    loading: () => null,
    ssr: false,
  }
);

/**
 * Edit User Dialog - Lazy loaded
 */
export const EditUserDialog = dynamic(
  () => import("@/components/settings/EditUserDialog").then((mod) => mod.EditUserDialog),
  {
    loading: () => null,
    ssr: false,
  }
);

/**
 * Test Workflow Dialog - Lazy loaded
 */
export const TestWorkflowDialog = dynamic(
  () => import("@/components/settings/TestWorkflowDialog").then((mod) => mod.TestWorkflowDialog),
  {
    loading: () => null,
    ssr: false,
  }
);
