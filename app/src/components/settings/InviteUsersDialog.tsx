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
import { Loader2, Plus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

interface InviteRow {
  email: string;
  role: "requester" | "manager" | "finance" | "admin";
  departmentId?: string;
}

const ROLES = [
  { value: "requester", label: "Requester" },
  { value: "manager", label: "Manager" },
  { value: "finance", label: "Finance" },
  { value: "admin", label: "Admin" },
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUsersDialog({ open, onOpenChange }: Props) {
  const [rows, setRows] = useState<InviteRow[]>([
    { email: "", role: "requester" },
  ]);

  const utils = trpc.useUtils();

  const mutation = trpc.team.inviteUsers.useMutation({
    onMutate: () => {
      toast.loading("Sending invites...", { id: "send-invites" });
    },
    onSuccess: (data) => {
      const sentCount = data.results.filter((r) => r.sent).length;
      const failedCount = data.results.filter((r) => !r.sent).length;

      if (sentCount > 0 && failedCount === 0) {
        toast.success(`${sentCount} invite${sentCount > 1 ? "s" : ""} sent successfully`, {
          id: "send-invites",
          description: "Team members will receive an email to join your workspace",
        });
      } else if (sentCount > 0 && failedCount > 0) {
        toast.success(`${sentCount} invite${sentCount > 1 ? "s" : ""} sent, ${failedCount} failed`, {
          id: "send-invites",
          description: "Some invites couldn't be delivered",
        });
        data.results
          .filter((r) => !r.sent)
          .forEach((r) => {
            toast.error(`${r.email}: ${r.error}`);
          });
      } else if (failedCount > 0) {
        toast.error("Failed to send invites", {
          id: "send-invites",
          description: "Please check the email addresses and try again",
        });
      }

      // Refresh user list and invites
      utils.team.listUsers.invalidate();

      // Reset and close
      setRows([{ email: "", role: "requester" }]);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to send invites", {
        id: "send-invites",
        description: error.message,
      });
    },
  });

  function addRow() {
    setRows([...rows, { email: "", role: "requester" }]);
  }

  function removeRow(i: number) {
    if (rows.length === 1) return;
    setRows(rows.filter((_, j) => j !== i));
  }

  function updateRow(i: number, field: keyof InviteRow, value: string) {
    const updated = [...rows];
    updated[i] = { ...updated[i], [field]: value };
    setRows(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validRows = rows.filter((r) => r.email.includes("@"));
    if (validRows.length === 0) {
      toast.error("Please enter at least one valid email");
      return;
    }
    mutation.mutate({ invites: validRows });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <DialogDescription>
              Send email invitations to new team members. They'll receive a link
              to create their account.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="flex items-end gap-3">
                <div className="flex-1">
                  {i === 0 && <Label className="mb-1.5 block">Email</Label>}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      value={row.email}
                      onChange={(e) => updateRow(i, "email", e.target.value)}
                      placeholder="teammate@company.com"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="w-[140px]">
                  {i === 0 && <Label className="mb-1.5 block">Role</Label>}
                  <select
                    value={row.role}
                    onChange={(e) => updateRow(i, "role", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(i)}
                    className="shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add another
            </Button>
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
              Send Invites
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
