"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import {
  Plus,
  Trash2,
  GripVertical,
  User,
  Users,
  Building,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface ApprovalStep {
  step: number;
  type: "role" | "user" | "department_head";
  value: string;
  required: "required" | "optional" | "parallel";
}

interface Props {
  value: ApprovalStep[];
  onChange: (steps: ApprovalStep[]) => void;
}

const STEP_TYPES = [
  { value: "role", label: "Role", icon: Users },
  { value: "user", label: "Specific User", icon: User },
  { value: "department_head", label: "Department Head", icon: Building },
] as const;

const ROLES = [
  { value: "manager", label: "Manager" },
  { value: "finance", label: "Finance" },
  { value: "admin", label: "Admin" },
] as const;

const REQUIRED_OPTIONS = [
  { value: "required", label: "Required" },
  { value: "optional", label: "Optional" },
  { value: "parallel", label: "Parallel" },
] as const;

export function ApprovalChainEditor({ value, onChange }: Props) {
  const users = trpc.team.listUsers.useQuery({});

  function addStep() {
    const newStep: ApprovalStep = {
      step: value.length + 1,
      type: "role",
      value: "manager",
      required: "required",
    };
    onChange([...value, newStep]);
  }

  function removeStep(index: number) {
    const updated = value.filter((_, i) => i !== index);
    // Renumber steps
    const renumbered = updated.map((step, i) => ({ ...step, step: i + 1 }));
    onChange(renumbered);
  }

  function updateStep(index: number, field: keyof ApprovalStep, val: string) {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };

    // Reset value when type changes
    if (field === "type") {
      if (val === "role") {
        updated[index].value = "manager";
      } else if (val === "department_head") {
        updated[index].value = "department_head";
      } else if (val === "user" && users.data && users.data.length > 0) {
        updated[index].value = users.data[0].id;
      }
    }

    onChange(updated);
  }

  function moveStep(index: number, direction: "up" | "down") {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === value.length - 1)
    ) {
      return;
    }

    const updated = [...value];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];

    // Renumber steps
    const renumbered = updated.map((step, i) => ({ ...step, step: i + 1 }));
    onChange(renumbered);
  }

  function getStepIcon(type: string) {
    const config = STEP_TYPES.find((t) => t.value === type);
    return config?.icon || Users;
  }

  function getStepDescription(step: ApprovalStep): string {
    if (step.type === "role") {
      const role = ROLES.find((r) => r.value === step.value);
      return role?.label || step.value;
    }
    if (step.type === "department_head") {
      return "Department Head";
    }
    if (step.type === "user") {
      const user = users.data?.find((u) => u.id === step.value);
      return user ? `${user.name} (${user.email})` : "Select user";
    }
    return step.value;
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="mb-4">No approval steps defined yet</p>
          <Button onClick={addStep} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add First Step
          </Button>
        </div>
      )}

      {value.map((step, index) => {
        const Icon = getStepIcon(step.type);
        return (
          <Card key={index} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Drag Handle & Step Number */}
                <div className="flex flex-col items-center gap-2 pt-2">
                  <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                    {step.step}
                  </Badge>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveStep(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveStep(index, "down")}
                      disabled={index === value.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Step Configuration */}
                <div className="flex-1 grid grid-cols-3 gap-4">
                  {/* Type */}
                  <div className="space-y-2">
                    {index === 0 && <Label className="text-xs">Approver Type</Label>}
                    <Select
                      value={step.type}
                      onValueChange={(val) => updateStep(index, "type", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STEP_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value */}
                  <div className="space-y-2">
                    {index === 0 && <Label className="text-xs">Approver</Label>}
                    {step.type === "role" && (
                      <Select
                        value={step.value}
                        onValueChange={(val) => updateStep(index, "value", val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {step.type === "department_head" && (
                      <div className="h-10 px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-600 flex items-center">
                        Department Head
                      </div>
                    )}
                    {step.type === "user" && (
                      <Select
                        value={step.value}
                        onValueChange={(val) => updateStep(index, "value", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.data?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Required */}
                  <div className="space-y-2">
                    {index === 0 && <Label className="text-xs">Mode</Label>}
                    <Select
                      value={step.required}
                      onValueChange={(val) => updateStep(index, "required", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REQUIRED_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStep(index)}
                  className="shrink-0 mt-6"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              {/* Step Preview */}
              <div className="mt-3 pl-14 text-sm text-slate-600">
                <Icon className="h-4 w-4 inline mr-2" />
                {getStepDescription(step)}
                <Badge variant="outline" className="ml-2 text-xs">
                  {step.required}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {value.length > 0 && (
        <Button onClick={addStep} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Approval Step
        </Button>
      )}

      {/* Info Panel */}
      {value.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-2">Approval Flow Modes:</p>
          <ul className="space-y-1 text-xs">
            <li>
              <strong>Required:</strong> Must approve for request to proceed
            </li>
            <li>
              <strong>Optional:</strong> Can approve but not required
            </li>
            <li>
              <strong>Parallel:</strong> Can approve simultaneously with previous step
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
