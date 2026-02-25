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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BUDGET_TYPES = [
  { value: "company", label: "Company-wide" },
  { value: "department", label: "Department" },
  { value: "category", label: "Category" },
  { value: "project", label: "Project" },
] as const;

const PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
] as const;

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
}

export function CreateBudgetDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("company");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [allocated, setAllocated] = useState<number>(0);
  const [period, setPeriod] = useState<string>("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [softLimit, setSoftLimit] = useState<number>(80);
  const [hardLimit, setHardLimit] = useState<number>(100);

  const departments = trpc.team.listDepartments.useQuery(undefined, {
    enabled: open && type === "department",
  });

  const utils = trpc.useUtils();
  const mutation = trpc.budgets.create.useMutation({
    onSuccess: () => {
      toast.success("Budget created successfully");
      utils.budgets.list.invalidate();
      utils.budgets.getAnalytics.invalidate();
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create budget");
    },
  });

  function handleClose() {
    setName("");
    setType("company");
    setDepartmentId("");
    setCategory("");
    setAllocated(0);
    setPeriod("monthly");
    setStartDate("");
    setEndDate("");
    setSoftLimit(80);
    setHardLimit(100);
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !startDate || !endDate || allocated <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    mutation.mutate({
      name,
      type: type as any,
      departmentId: type === "department" ? departmentId : undefined,
      category: type === "category" ? (category as any) : undefined,
      allocated,
      period: period as any,
      startDate,
      endDate,
      softLimit: softLimit / 100,
      hardLimit: hardLimit / 100,
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
            <DialogDescription>
              Define a new budget allocation with spending limits
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Budget Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q1 2026 Engineering Budget"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Period */}
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department (conditional) */}
            {type === "department" && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.data?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} {dept.code && `(${dept.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Category (conditional) */}
            {type === "category" && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
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
            )}

            {/* Allocated Amount */}
            <div className="space-y-2">
              <Label htmlFor="allocated">
                Allocated Amount (€) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="allocated"
                type="number"
                step="0.01"
                min="0"
                value={allocated || ""}
                onChange={(e) => setAllocated(Number(e.target.value))}
                placeholder="10000.00"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Limits */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="softLimit">Soft Limit (Warning at %)</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="softLimit"
                    type="range"
                    min="0"
                    max="100"
                    value={softLimit}
                    onChange={(e) => setSoftLimit(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm font-medium">{softLimit}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hardLimit">Hard Limit (Block at %)</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="hardLimit"
                    type="range"
                    min="0"
                    max="100"
                    value={hardLimit}
                    onChange={(e) => setHardLimit(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm font-medium">{hardLimit}%</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
