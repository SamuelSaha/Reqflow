"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/api/react";
import { Badge } from "@/components/ui/badge";
import { ApprovalChainEditor } from "./ApprovalChainEditor";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { value: "saas", label: "SaaS / Software" },
  { value: "hardware", label: "Hardware" },
  { value: "services", label: "Professional Services" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "travel", label: "Travel & Events" },
  { value: "office", label: "Office Supplies" },
] as const;

interface WorkflowBuilderProps {
  onComplete?: (workflow: any) => void;
  initialData?: any;
}

export function WorkflowBuilder({ onComplete, initialData }: WorkflowBuilderProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Basic Info
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Step 2: Conditions
  const [amountMin, setAmountMin] = useState<number | undefined>(
    initialData?.conditions?.amountMin
  );
  const [amountMax, setAmountMax] = useState<number | undefined>(
    initialData?.conditions?.amountMax
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.conditions?.categories || []
  );
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    initialData?.conditions?.departments || []
  );

  // Step 3: Approval Chain
  const [approvalChain, setApprovalChain] = useState<any[]>(
    initialData?.approvalChain || []
  );

  const departments = trpc.team.listDepartments.useQuery(undefined, {
    enabled: currentStep >= 2,
  });

  const utils = trpc.useUtils();
  const createWorkflow = trpc.workflows.create.useMutation({
    onSuccess: () => {
      toast.success("Workflow created successfully");
      utils.workflows.list.invalidate();
      router.push("/dashboard/settings/workflows");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create workflow");
    },
  });

  function handleCategoryToggle(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }

  function handleDepartmentToggle(deptId: string) {
    setSelectedDepartments((prev) =>
      prev.includes(deptId)
        ? prev.filter((d) => d !== deptId)
        : [...prev, deptId]
    );
  }

  function validateStep(step: number): boolean {
    if (step === 1) {
      return name.trim().length > 0;
    }
    if (step === 3) {
      return approvalChain.length > 0;
    }
    return true;
  }

  function handleNext() {
    if (!validateStep(currentStep)) return;

    if (currentStep === 4) {
      // Final step - save workflow
      handleSave();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    setCurrentStep((s) => s - 1);
  }

  function handleSave() {
    createWorkflow.mutate({
      name,
      description,
      isActive,
      conditions: {
        amountMin,
        amountMax,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        departments: selectedDepartments.length > 0 ? selectedDepartments : undefined,
      },
      approvalChain,
    });
  }

  const steps = [
    { number: 1, title: "Basic Info", description: "Name and description" },
    { number: 2, title: "Conditions", description: "When this workflow applies" },
    { number: 3, title: "Approval Chain", description: "Who approves" },
    { number: 4, title: "Review", description: "Verify and save" },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.number
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step.number}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-slate-900">
                  {step.title}
                </div>
                <div className="text-xs text-slate-500">{step.description}</div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  currentStep > step.number ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">
                  Workflow Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., High-Value Purchases"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe when this workflow should be used..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active immediately</Label>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </>
          )}

          {/* Step 2: Conditions */}
          {currentStep === 2 && (
            <>
              <div>
                <Label className="text-base">Amount Range</Label>
                <p className="text-sm text-slate-600 mb-4">
                  Define the purchase amount range for this workflow
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amountMin">Minimum (€)</Label>
                    <Input
                      id="amountMin"
                      type="number"
                      value={amountMin ?? ""}
                      onChange={(e) =>
                        setAmountMin(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="No minimum"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amountMax">Maximum (€)</Label>
                    <Input
                      id="amountMax"
                      type="number"
                      value={amountMax ?? ""}
                      onChange={(e) =>
                        setAmountMax(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="No maximum"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base">Categories</Label>
                <p className="text-sm text-slate-600 mb-4">
                  Select specific categories or leave empty for all
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`cat-${cat.value}`}
                        checked={selectedCategories.includes(cat.value)}
                        onCheckedChange={() => handleCategoryToggle(cat.value)}
                      />
                      <label
                        htmlFor={`cat-${cat.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {cat.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base">Departments</Label>
                <p className="text-sm text-slate-600 mb-4">
                  Select specific departments or leave empty for all
                </p>
                {departments.isLoading && (
                  <div className="text-sm text-slate-500">Loading departments...</div>
                )}
                {departments.data && departments.data.length === 0 && (
                  <div className="text-sm text-slate-500">No departments yet</div>
                )}
                {departments.data && departments.data.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {departments.data.map((dept) => (
                      <div key={dept.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${dept.id}`}
                          checked={selectedDepartments.includes(dept.id)}
                          onCheckedChange={() => handleDepartmentToggle(dept.id)}
                        />
                        <label
                          htmlFor={`dept-${dept.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {dept.name}
                          {dept.code && (
                            <Badge variant="outline" className="ml-2">
                              {dept.code}
                            </Badge>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 3: Approval Chain */}
          {currentStep === 3 && (
            <>
              <div className="mb-4">
                <Label className="text-base">Approval Chain</Label>
                <p className="text-sm text-slate-600">
                  Define the approval steps for requests matching this workflow
                </p>
              </div>
              <ApprovalChainEditor
                value={approvalChain}
                onChange={setApprovalChain}
              />
            </>
          )}

          {/* Step 4: Review & Save */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Review Your Workflow
                  </h3>
                  <p className="text-sm text-slate-600">
                    Verify all settings before saving
                  </p>
                </div>
              </div>

              {/* Basic Info Summary */}
              <div>
                <Label className="text-base">Basic Information</Label>
                <Card className="mt-2 bg-slate-50">
                  <CardContent className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Name:</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    {description && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Description:</span>
                        <span className="font-medium">{description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <Badge variant={isActive ? "default" : "outline"}>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conditions Summary */}
              <div>
                <Label className="text-base">Conditions</Label>
                <Card className="mt-2 bg-slate-50">
                  <CardContent className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amount Range:</span>
                      <span className="font-medium">
                        €{amountMin ?? 0} - €{amountMax ?? "∞"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Categories:</span>
                      <span className="font-medium">
                        {selectedCategories.length > 0
                          ? `${selectedCategories.length} selected`
                          : "All categories"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Departments:</span>
                      <span className="font-medium">
                        {selectedDepartments.length > 0
                          ? `${selectedDepartments.length} selected`
                          : "All departments"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Approval Chain Summary */}
              <div>
                <Label className="text-base">Approval Chain</Label>
                <Card className="mt-2 bg-slate-50">
                  <CardContent className="p-4">
                    {approvalChain.length === 0 ? (
                      <p className="text-sm text-slate-500">No steps defined</p>
                    ) : (
                      <ol className="space-y-2">
                        {approvalChain.map((step, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-sm">
                            <Badge variant="outline" className="shrink-0">
                              {idx + 1}
                            </Badge>
                            <span className="font-medium">
                              {step.type === "role"
                                ? `${step.value} role`
                                : step.type === "department_head"
                                ? "Department Head"
                                : "Specific User"}
                            </span>
                            <Badge variant="secondary" className="ml-auto">
                              {step.required}
                            </Badge>
                          </li>
                        ))}
                      </ol>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || createWorkflow.isPending}
        >
          Back
        </Button>
        <div className="text-sm text-slate-600">
          Step {currentStep} of {steps.length}
        </div>
        <Button
          onClick={handleNext}
          disabled={!validateStep(currentStep) || createWorkflow.isPending}
        >
          {createWorkflow.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {currentStep === steps.length ? "Save Workflow" : "Next"}
        </Button>
      </div>
    </div>
  );
}
