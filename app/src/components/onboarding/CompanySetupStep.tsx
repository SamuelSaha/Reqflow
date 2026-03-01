"use client";

import { useState } from "react";
import { trpc } from "@/lib/api/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const INDUSTRIES = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail & E-commerce",
  "Media & Entertainment",
  "Consulting",
  "Government",
  "Other",
];

const SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

interface Props {
  defaultValues: {
    name: string;
    industry: string;
    size: string;
    domain: string;
  };
  onNext: () => void;
}

export function CompanySetupStep({ defaultValues, onNext }: Props) {
  const [name, setName] = useState(defaultValues.name);
  const [industry, setIndustry] = useState(defaultValues.industry);
  const [size, setSize] = useState(defaultValues.size);
  const [domain, setDomain] = useState(defaultValues.domain);

  const mutation = trpc.onboarding.updateCompanyProfile.useMutation({
    onSuccess: () => onNext(),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({
      name: name.trim(),
      industry: industry || undefined,
      size: size || undefined,
      domain: domain || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="text-h4 font-bold text-slate-900">
          Set up your company
        </h2>
        <p className="text-body-sm text-slate-500 mt-1">
          Tell us about your organization so Reqflow can tailor your experience.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="company-name">
            Company name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="company-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Corp"
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-1.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="size">Team size</Label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-1.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select team size</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s} employees
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="domain">Email domain</Label>
          <Input
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="acme.com"
            className="mt-1.5"
          />
          <p className="text-caption text-slate-400 mt-1">
            Used for auto-joining - teammates with this domain can join automatically.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={!name.trim() || mutation.isPending}>
          {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Continue
        </Button>
      </div>
    </form>
  );
}
