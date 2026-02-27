"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import {
  Plus,
  AlertCircle,
  Workflow,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  Star,
  FlaskConical,
  Info,
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
import { TestWorkflowDialog } from "@/components/settings/lazy-components";

export const dynamic = "force-dynamic";

export default function WorkflowsPage() {
  const router = useRouter();
  const workflows = trpc.workflows.list.useQuery();
  const thresholds = trpc.workflows.getThresholds.useQuery();
  const utils = trpc.useUtils();

  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const toggleActive = trpc.workflows.toggleActive.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.workflow.isActive ? "Workflow activated" : "Workflow deactivated"
      );
      utils.workflows.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const setDefault = trpc.workflows.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Default workflow updated");
      utils.workflows.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteWorkflow = trpc.workflows.delete.useMutation({
    onSuccess: () => {
      toast.success("Workflow deleted");
      utils.workflows.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  function handleTestWorkflow(workflow: { id: string; name: string }) {
    setSelectedWorkflow(workflow);
    setTestDialogOpen(true);
  }

  function formatConditions(conditions: any): string {
    const parts: string[] = [];

    if (conditions.amountMin !== undefined || conditions.amountMax !== undefined) {
      const min = conditions.amountMin ?? 0;
      const max = conditions.amountMax ?? "∞";
      parts.push(`€${min.toLocaleString()} - €${max}`);
    }

    if (conditions.categories?.length > 0) {
      parts.push(`${conditions.categories.length} categories`);
    }

    if (conditions.departments?.length > 0) {
      parts.push(`${conditions.departments.length} departments`);
    }

    return parts.length > 0 ? parts.join(" • ") : "All requests";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Approval Workflows
          </h2>
          <p className="text-slate-600 mt-1">
            Configure approval routing rules and chains
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/settings/workflows/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Thresholds Info Panel */}
      {thresholds.data && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium text-blue-900">
                Current Approval Thresholds
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <div className="font-medium">Finance Review</div>
                <div className="text-blue-600">
                  €{thresholds.data.FINANCE_REVIEW.toLocaleString()}+
                </div>
              </div>
              <div>
                <div className="font-medium">Executive Review</div>
                <div className="text-blue-600">
                  €{thresholds.data.EXECUTIVE_REVIEW.toLocaleString()}+
                </div>
              </div>
              <div>
                <div className="font-medium">Legal Review</div>
                <div className="text-blue-600">
                  €{thresholds.data.LEGAL_REVIEW_AMOUNT.toLocaleString()}+
                </div>
              </div>
              <div>
                <div className="font-medium">Budget Escalation</div>
                <div className="text-blue-600">
                  {thresholds.data.BUDGET_ESCALATION_PCT}% utilized
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {workflows.isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
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
      {workflows.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(workflows.error)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {workflows.data && workflows.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Workflow className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              No workflows configured
            </p>
            <p className="text-slate-600 mb-6">
              Create your first approval workflow to automate routing
            </p>
            <Button onClick={() => router.push("/dashboard/settings/workflows/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workflow List */}
      {workflows.data && workflows.data.length > 0 && (
        <div className="space-y-3">
          {workflows.data.map((workflow) => (
            <Card
              key={workflow.id}
              className={`hover:shadow-md transition-shadow ${
                !workflow.isActive ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {workflow.name}
                      </h3>
                      {workflow.isDefault && (
                        <Badge className="bg-violet-100 text-violet-700">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {workflow.isActive ? (
                        <Badge variant="outline" className="text-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">
                          Inactive
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {workflow.approvalChainLength}{" "}
                        {workflow.approvalChainLength === 1 ? "step" : "steps"}
                      </Badge>
                    </div>
                    {workflow.description && (
                      <p className="text-sm text-slate-600 mb-2">
                        {workflow.description}
                      </p>
                    )}
                    <div className="text-sm text-slate-500">
                      <span className="font-medium">Conditions:</span>{" "}
                      {formatConditions(workflow.conditions)}
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
                      <DropdownMenuItem
                        onClick={() =>
                          handleTestWorkflow({
                            id: workflow.id,
                            name: workflow.name,
                          })
                        }
                      >
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Test Workflow
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          toggleActive.mutate({
                            workflowId: workflow.id,
                            isActive: !workflow.isActive,
                          })
                        }
                      >
                        <Power className="h-4 w-4 mr-2" />
                        {workflow.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      {!workflow.isDefault && (
                        <DropdownMenuItem
                          onClick={() =>
                            setDefault.mutate({ workflowId: workflow.id })
                          }
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          deleteWorkflow.mutate({ workflowId: workflow.id })
                        }
                        className="text-red-600"
                        disabled={workflow.isDefault}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Test Workflow Dialog */}
      {selectedWorkflow && (
        <TestWorkflowDialog
          open={testDialogOpen}
          onOpenChange={setTestDialogOpen}
          workflowId={selectedWorkflow.id}
          workflowName={selectedWorkflow.name}
        />
      )}
    </div>
  );
}
