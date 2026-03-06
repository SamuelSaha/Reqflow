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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: { id: string; name: string } | null;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

const ROLES = [
  { value: "requester", label: "Requester" },
  { value: "manager", label: "Manager" },
  { value: "finance", label: "Finance" },
  { value: "admin", label: "Admin" },
] as const;

export function EditUserDialog({ open, onOpenChange, user }: Props) {
  const [role, setRole] = useState(user?.role || "requester");
  const [departmentId, setDepartmentId] = useState<string | null>(
    user?.department?.id || null
  );
  const [isActive, setIsActive] = useState(user?.isActive ?? true);

  const utils = trpc.useUtils();
  const departments = trpc.team.listDepartments.useQuery(undefined, {
    enabled: open,
  });

  const mutation = trpc.team.updateUser.useMutation({
    onMutate: async (variables) => {
      await utils.team.listUsers.cancel();

      const previousUsers = utils.team.listUsers.getData({});

      return { previousUsers, variables };
    },
    onSuccess: (data, variables, context) => {
      const wasDeactivated = context?.variables && !context.variables.isActive && user?.isActive;

      if (wasDeactivated) {
        toast.success("Team member removed", {
          description: "User account has been deactivated",
          action: {
            label: "Undo",
            onClick: () => {
              // Restore snapshot
              if (context?.previousUsers) {
                utils.team.listUsers.setData({}, context.previousUsers);
              }
            },
          },
          duration: 5000,
        });
      } else {
        toast.success("User updated successfully");
      }

      utils.team.listUsers.invalidate();
      onOpenChange(false);
    },
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        utils.team.listUsers.setData({}, context.previousUsers);
      }
      toast.error(error.message || "Failed to update user");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    mutation.mutate({
      userId: user.id,
      role: role as "requester" | "manager" | "finance" | "admin",
      departmentId: departmentId || null,
      isActive,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role, department, and account status
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {/* Name (readonly) */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={user?.name || ""} disabled />
            </div>

            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={departmentId || "none"}
                onValueChange={(val) =>
                  setDepartmentId(val === "none" ? null : val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No department</SelectItem>
                  {departments.data?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} {dept.code && `(${dept.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="active-status" className="cursor-pointer">
                Active Status
              </Label>
              <Switch
                id="active-status"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
