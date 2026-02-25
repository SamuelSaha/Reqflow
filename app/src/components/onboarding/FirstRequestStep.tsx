"use client";

import { useState } from "react";
import { trpc } from "@/lib/api/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";

const CATEGORIES = [
  { value: "saas", label: "SaaS / Software" },
  { value: "services", label: "Services" },
  { value: "office", label: "Office Supplies" },
  { value: "travel", label: "Travel" },
  { value: "hardware", label: "Hardware" },
  { value: "other", label: "Other" },
] as const;

interface Props {
  onNext: () => void;
}

export function FirstRequestStep({ onNext }: Props) {
  const [title, setTitle] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("saas");
  const [created, setCreated] = useState(false);

  const mutation = trpc.onboarding.createFirstRequest.useMutation({
    onSuccess: () => setCreated(true),
  });

  const skipMutation = trpc.onboarding.skipStep.useMutation({
    onSuccess: () => onNext(),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    mutation.mutate({
      title: title.trim(),
      vendorName: vendorName || undefined,
      amount,
      category: category as typeof CATEGORIES[number]["value"],
    });
  }

  if (created) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-[24px] font-bold text-slate-900">
            First request created!
          </h2>
          <p className="text-[15px] text-slate-500 mt-1">
            Your request has been saved as a draft. You can review and submit it
            from the dashboard.
          </p>
        </div>
        <Button onClick={onNext}>Continue</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-[24px] font-bold text-slate-900">
            Create your first request
          </h2>
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <p className="text-[15px] text-slate-500">
          Try submitting a purchase request — this is how your team will request
          new tools and services.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="req-title">
            What do you need? <span className="text-red-500">*</span>
          </Label>
          <Input
            id="req-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Figma annual subscription"
            required
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="req-vendor">Vendor name</Label>
            <Input
              id="req-vendor"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. Figma"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="req-amount">
              Amount (&euro;) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="req-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1200"
              required
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="req-category">Category</Label>
          <select
            id="req-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => skipMutation.mutate({ step: 3 })}
          disabled={skipMutation.isPending}
        >
          Skip for now
        </Button>
        <Button
          type="submit"
          disabled={!title.trim() || !amount || mutation.isPending}
        >
          {mutation.isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Create Request
        </Button>
      </div>
    </form>
  );
}
