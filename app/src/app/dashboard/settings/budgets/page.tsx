"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import {
  Plus,
  AlertCircle,
  Wallet,
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/error-messages";
import { CreateBudgetDialog } from "@/components/settings/lazy-components";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyBudgetsIllustration } from "@/components/ui/illustrations";

export const dynamic = "force-dynamic";

export default function BudgetsSettingsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const budgets = trpc.budgets.list.useQuery();
  const analytics = trpc.budgets.getAnalytics.useQuery();
  const utils = trpc.useUtils();

  const deleteBudget = trpc.budgets.delete.useMutation({
    onMutate: async (variables) => {
      await utils.budgets.list.cancel();
      await utils.budgets.getAnalytics.cancel();

      const previousList = utils.budgets.list.getData();
      const previousAnalytics = utils.budgets.getAnalytics.getData();

      utils.budgets.list.setData(undefined, (old) =>
        old?.filter((b) => b.id !== variables.budgetId) ?? []
      );

      return { previousList, previousAnalytics };
    },
    onError: (error, variables, context) => {
      if (context?.previousList) {
        utils.budgets.list.setData(undefined, context.previousList);
      }
      if (context?.previousAnalytics) {
        utils.budgets.getAnalytics.setData(undefined, context.previousAnalytics);
      }
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Budget deleted");
    },
    onSettled: () => {
      utils.budgets.list.invalidate();
      utils.budgets.getAnalytics.invalidate();
    },
  });

  function formatCurrency(amount: string | number): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `€${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function getUtilization(budget: any): number {
    const allocated = parseFloat(budget.allocated);
    const committed = parseFloat(budget.committed);
    const spent = parseFloat(budget.spent);
    if (allocated === 0) return 0;
    return ((committed + spent) / allocated) * 100;
  }

  function getUtilizationColor(utilization: number, softLimit: number = 80): string {
    if (utilization >= 100) return "text-red-600";
    if (utilization >= softLimit) return "text-yellow-600";
    return "text-green-600";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Budget Management</h2>
          <p className="text-slate-600 mt-1">
            Manage budget allocations and track utilization
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Analytics Overview */}
      {analytics.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Total Allocated</span>
                <Wallet className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(analytics.data.overall.totalAllocated)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Committed</span>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(analytics.data.overall.totalCommitted)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Spent</span>
                <TrendingDown className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.data.overall.totalSpent)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Remaining</span>
                <AlertCircle className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(analytics.data.overall.totalRemaining)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* At-Risk Budgets Alert */}
      {analytics.data && analytics.data.atRisk.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-base font-medium text-yellow-900">
                {analytics.data.atRisk.length} Budget{analytics.data.atRisk.length > 1 ? "s" : ""} Near Limit
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.data.atRisk.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center justify-between text-sm text-yellow-800"
                >
                  <span className="font-medium">{budget.name}</span>
                  <div className="flex items-center gap-3">
                    <span>{formatCurrency(budget.remaining)} remaining</span>
                    <Badge className="bg-yellow-200 text-yellow-900">
                      {budget.utilization.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {budgets.isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {budgets.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(budgets.error)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {budgets.data && budgets.data.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              illustration={<EmptyBudgetsIllustration className="w-32 h-32" />}
              title="No budgets configured"
              description="Set up budgets to track spending by team, department, or category. Monitor utilization and get alerts when limits are approached."
              action={{
                label: "Create Budget",
                onClick: () => setCreateDialogOpen(true),
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Budget List */}
      {budgets.data && budgets.data.length > 0 && (
        <div className="space-y-3">
          {budgets.data.map((budget) => {
            const utilization = getUtilization(budget);
            const softLimit = parseFloat(budget.softLimit || "0.8") * 100;
            const allocated = parseFloat(budget.allocated);
            const committed = parseFloat(budget.committed);
            const spent = parseFloat(budget.spent);
            const remaining = allocated - committed - spent;

            return (
              <Card key={budget.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {budget.name}
                        </h3>
                        <Badge variant="outline">{budget.type}</Badge>
                        {budget.period && (
                          <Badge variant="secondary">{budget.period}</Badge>
                        )}
                        {budget.department && (
                          <Badge className="bg-blue-100 text-blue-700">
                            {budget.department.name}
                          </Badge>
                        )}
                        {budget.category && (
                          <Badge className="bg-green-100 text-green-700">
                            {budget.category}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm mt-4">
                        <div>
                          <span className="text-slate-600">Allocated:</span>
                          <p className="font-medium text-slate-900">
                            {formatCurrency(allocated)}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Committed:</span>
                          <p className="font-medium text-blue-600">
                            {formatCurrency(committed)}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Spent:</span>
                          <p className="font-medium text-green-600">
                            {formatCurrency(spent)}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Remaining:</span>
                          <p
                            className={`font-medium ${getUtilizationColor(utilization, softLimit)}`}
                          >
                            {formatCurrency(remaining)}
                          </p>
                        </div>
                      </div>

                      {/* Utilization Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-600">Utilization</span>
                          <span
                            className={`font-medium ${getUtilizationColor(utilization, softLimit)}`}
                          >
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              utilization >= 100
                                ? "bg-red-500"
                                : utilization >= softLimit
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            deleteBudget.mutate({ budgetId: budget.id })
                          }
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Budget Dialog */}
      <CreateBudgetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
