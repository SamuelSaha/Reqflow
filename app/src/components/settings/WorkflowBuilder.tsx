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

  const departments = trpc.team.listDepartments.useQuery(undefined, {
    enabled: currentStep >= 2,
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
    return true;
  }

  function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    setCurrentStep((s) => s - 1);
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

          {/* Step 3: Approval Chain (Placeholder) */}
          {currentStep === 3 && (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-4">Approval Chain editor coming in Sprint 4</p>
              <p className="text-sm">
                Define who approves requests matching this workflow
              </p>
            </div>
          )}

          {/* Step 4: Review (Placeholder) */}
          {currentStep === 4 && (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-4">Review & Save coming in Sprint 4</p>
              <p className="text-sm">Preview and save your workflow</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        <div className="text-sm text-slate-600">
          Step {currentStep} of {steps.length}
        </div>
        <Button
          onClick={handleNext}
          disabled={!validateStep(currentStep) || currentStep === steps.length}
        >
          {currentStep === steps.length ? "Save" : "Next"}
        </Button>
      </div>
    </div>
  );
}
