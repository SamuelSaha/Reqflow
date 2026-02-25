"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/api/react";
import { Wallet, AlertTriangle, AlertCircle } from "lucide-react";
import { BudgetCardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { getErrorMessage } from "@/lib/utils/error-messages";

export const dynamic = "force-dynamic";

export default function BudgetsPage() {
  const budgets = trpc.budgets.list.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Budgets
        </h1>
        <p className="text-slate-600 mt-2">
          Department budget utilization and tracking
        </p>
      </div>

      {budgets.isLoading && <BudgetCardSkeleton count={3} />}

      {budgets.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(budgets.error)}
            </p>
            <Button onClick={() => budgets.refetch()} variant="outline" className="mt-2">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {budgets.data && budgets.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900">
              No budgets configured
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Budgets will appear here once set up by an admin
            </p>
          </CardContent>
        </Card>
      )}

      {budgets.data && budgets.data.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {budgets.data.map((budget: any) => {
            const allocated = parseFloat(budget.allocated);
            const committed = parseFloat(budget.committed);
            const spent = parseFloat(budget.spent);
            const used = committed + spent;
            const remaining = allocated - used;
            const utilization = allocated > 0 ? (used / allocated) * 100 : 0;
            const softLimit = parseFloat(budget.softLimit || "0.8") * 100;
            const isWarning = utilization >= softLimit;
            const isOver = utilization >= 100;

            return (
              <Card key={budget.id} className={isOver ? "ring-2 ring-red-200" : isWarning ? "ring-2 ring-amber-200" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-base">{budget.name}</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {budget.department?.name ?? "—"} &middot; {budget.period}
                    </p>
                  </div>
                  {isOver && (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Over budget
                    </Badge>
                  )}
                  {isWarning && !isOver && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {utilization.toFixed(0)}% used
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Utilization bar */}
                  <div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{utilization.toFixed(1)}% utilized</span>
                      <span>€{remaining.toLocaleString("en", { minimumFractionDigits: 0 })} remaining</span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Allocated</p>
                      <p className="text-sm font-semibold text-slate-900">
                        €{allocated.toLocaleString("en", { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Committed</p>
                      <p className="text-sm font-semibold text-amber-700">
                        €{committed.toLocaleString("en", { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Spent</p>
                      <p className="text-sm font-semibold text-slate-700">
                        €{spent.toLocaleString("en", { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
