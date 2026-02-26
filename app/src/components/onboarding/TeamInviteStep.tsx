"use client";

import { useState } from "react";
import { trpc } from "@/lib/api/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, CheckCircle2, Mail } from "lucide-react";

interface InviteRow {
  email: string;
  role: "requester" | "manager" | "finance" | "admin";
}

const ROLES = [
  { value: "requester", label: "Requester" },
  { value: "manager", label: "Manager" },
  { value: "finance", label: "Finance" },
  { value: "admin", label: "Admin" },
] as const;

interface Props {
  onNext: () => void;
}

export function TeamInviteStep({ onNext }: Props) {
  const [rows, setRows] = useState<InviteRow[]>([
    { email: "", role: "requester" },
  ]);
  const [sent, setSent] = useState(false);

  const mutation = trpc.onboarding.sendInvites.useMutation({
    onSuccess: () => setSent(true),
  });

  const skipMutation = trpc.onboarding.skipStep.useMutation({
    onSuccess: () => onNext(),
  });

  function addRow() {
    setRows([...rows, { email: "", role: "requester" }]);
  }

  function removeRow(i: number) {
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
    if (validRows.length === 0) return;
    mutation.mutate({ invites: validRows });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-h4 font-bold text-slate-900">
            Invites sent!
          </h2>
          <p className="text-body-sm text-slate-500 mt-1">
            Your teammates will receive an email with a link to join.
          </p>
        </div>
        <Button onClick={onNext}>Continue</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="text-h4 font-bold text-slate-900">
          Invite your team
        </h2>
        <p className="text-body-sm text-slate-500 mt-1">
          Add teammates who should be able to submit or approve purchase
          requests. They&apos;ll get an email invite.
        </p>
      </div>

      <div className="flex flex-col gap-3">
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
                className="text-slate-400 hover:text-red-500 h-10 w-10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="ghost"
          onClick={addRow}
          className="w-fit text-caption"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add another
        </Button>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => skipMutation.mutate({ step: 2 })}
          disabled={skipMutation.isPending}
        >
          Skip for now
        </Button>
        <Button
          type="submit"
          disabled={
            !rows.some((r) => r.email.includes("@")) || mutation.isPending
          }
        >
          {mutation.isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Send Invites
        </Button>
      </div>
    </form>
  );
}
