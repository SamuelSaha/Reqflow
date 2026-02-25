"use client";

import { useState } from "react";
import { trpc } from "@/lib/api/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const CATEGORIES = [
  { value: "saas", label: "SaaS / Software" },
  { value: "hardware", label: "Hardware" },
  { value: "services", label: "Professional Services" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "travel", label: "Travel & Events" },
  { value: "office", label: "Office Supplies" },
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  workflowName: string;
}

export function TestWorkflowDialog({
  open,
  onOpenChange,
  workflowId,
  workflowName,
}: Props) {
  const [amount, setAmount] = useState<number>(1000);
  const [category, setCategory] = useState<string>("saas");
  const [departmentId, setDepartmentId] = useState<string | undefined>();

  const departments = trpc.team.listDepartments.useQuery(undefined, {
    enabled: open,
  });

  const testResult = trpc.workflows.testWorkflow.useQuery(
    {
      workflowId,
      testRequest: {
        amount,
        category,
        departmentId,
      },
    },
    {
      enabled: open,
    }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Test Workflow: {workflowName}</DialogTitle>
          <DialogDescription>
            Enter mock request data to see if this workflow matches
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Test Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (€)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department (optional)</Label>
            <Select
              value={departmentId || "none"}
              onValueChange={(val) => setDepartmentId(val === "none" ? undefined : val)}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Any department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Any department</SelectItem>
                {departments.data?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} {dept.code && `(${dept.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Test Result */}
          {testResult.isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          )}

          {testResult.data && (
            <Card
              className={
                testResult.data.matches
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {testResult.data.matches ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3
                      className={`font-semibold mb-2 ${
                        testResult.data.matches ? "text-green-900" : "text-red-900"
                      }`}
                    >
                      {testResult.data.matches ? "Match Found" : "No Match"}
                    </h3>
                    <p
                      className={`text-sm mb-4 ${
                        testResult.data.matches ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {testResult.data.explanation}
                    </p>

                    {testResult.data.matches && (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-medium text-green-800">
                            Specificity Score:
                          </span>
                          <Badge className="bg-green-200 text-green-900">
                            {testResult.data.score}
                          </Badge>
                        </div>

                        {testResult.data.workflow.approvalChain.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-green-800 mb-2">
                              Approval Chain:
                            </p>
                            <ol className="space-y-2">
                              {testResult.data.workflow.approvalChain.map(
                                (step: any, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex items-center gap-2 text-sm text-green-800"
                                  >
                                    <Badge
                                      variant="outline"
                                      className="shrink-0 border-green-300"
                                    >
                                      {idx + 1}
                                    </Badge>
                                    <span>
                                      {step.type === "role"
                                        ? `${step.value} role`
                                        : step.type === "department_head"
                                        ? "Department Head"
                                        : "Specific User"}
                                    </span>
                                    <Badge className="ml-auto bg-green-200 text-green-900">
                                      {step.required}
                                    </Badge>
                                  </li>
                                )
                              )}
                            </ol>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
