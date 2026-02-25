"use client";

import { useState } from "react";
import { trpc } from "@/lib/api/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Plus, Trash2 } from "lucide-react";
import Papa from "papaparse";

interface ParsedBudget {
  name: string;
  type: string;
  category: string;
  allocated: string;
  period: string;
  startDate: string;
  endDate: string;
}

const CATEGORIES = ["saas", "services", "office", "travel", "hardware", "other"] as const;
const PERIODS = ["monthly", "quarterly", "annually"] as const;

interface Props {
  onNext: () => void;
}

export function BudgetSetupStep({ onNext }: Props) {
  const [mode, setMode] = useState<"choose" | "csv" | "manual">("choose");
  const [csvData, setCsvData] = useState<ParsedBudget[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Manual budget form state
  const [manualName, setManualName] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualPeriod, setManualPeriod] = useState<string>("quarterly");
  const [manualCategory, setManualCategory] = useState<string>("saas");

  const importMutation = trpc.onboarding.importBudgets.useMutation({
    onSuccess: () => onNext(),
  });

  const manualMutation = trpc.onboarding.createManualBudget.useMutation({
    onSuccess: () => onNext(),
  });

  const skipMutation = trpc.onboarding.skipStep.useMutation({
    onSuccess: () => onNext(),
  });

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data as Record<string, string>[];
        const parsed: ParsedBudget[] = [];

        for (const row of rows) {
          const name = row.name || row.Name || row.budget_name || "";
          const allocated = row.allocated || row.amount || row.Amount || row.budget || "";

          if (!name || !allocated) continue;

          parsed.push({
            name,
            type: row.type || "company",
            category: row.category || "other",
            allocated: allocated.replace(/[^0-9.]/g, ""),
            period: row.period || "quarterly",
            startDate: row.start_date || row.startDate || new Date().toISOString().split("T")[0],
            endDate: row.end_date || row.endDate || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
          });
        }

        if (parsed.length === 0) {
          setCsvError("No valid budget rows found. Ensure your CSV has 'name' and 'allocated' columns.");
          return;
        }

        setCsvData(parsed);
      },
      error() {
        setCsvError("Failed to parse CSV file.");
      },
    });
  }

  function handleCsvImport() {
    importMutation.mutate({
      budgets: csvData.map((b) => ({
        name: b.name,
        type: b.type as "company" | "department" | "category" | "project",
        category: CATEGORIES.includes(b.category as typeof CATEGORIES[number])
          ? (b.category as typeof CATEGORIES[number])
          : undefined,
        allocated: b.allocated,
        period: PERIODS.includes(b.period as typeof PERIODS[number])
          ? (b.period as typeof PERIODS[number])
          : "quarterly",
        startDate: b.startDate,
        endDate: b.endDate,
      })),
    });
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualName.trim() || !manualAmount) return;
    manualMutation.mutate({
      name: manualName.trim(),
      allocated: manualAmount,
      period: manualPeriod as "monthly" | "quarterly" | "annually",
      category: manualCategory as typeof CATEGORIES[number],
    });
  }

  // Choose mode
  if (mode === "choose") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900">
            Set up your budgets
          </h2>
          <p className="text-[15px] text-slate-500 mt-1">
            Budgets help track spending against approved limits. You can import
            from a CSV or create one manually.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode("csv")}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
          >
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="text-[14px] font-semibold text-slate-700">
              Import CSV
            </span>
            <span className="text-[12px] text-slate-400 text-center">
              Upload a spreadsheet with budget data
            </span>
          </button>

          <button
            onClick={() => setMode("manual")}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
          >
            <Plus className="w-8 h-8 text-slate-400" />
            <span className="text-[14px] font-semibold text-slate-700">
              Add manually
            </span>
            <span className="text-[12px] text-slate-400 text-center">
              Create a budget line by line
            </span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            onClick={() => skipMutation.mutate({ step: 1 })}
            disabled={skipMutation.isPending}
          >
            Skip for now
          </Button>
        </div>
      </div>
    );
  }

  // CSV upload mode
  if (mode === "csv") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900">
            Import budgets from CSV
          </h2>
          <p className="text-[15px] text-slate-500 mt-1">
            Upload a CSV with columns: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">name</code>,{" "}
            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">allocated</code>,{" "}
            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">period</code>,{" "}
            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">category</code>
          </p>
        </div>

        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv,.tsv"
            onChange={handleCsvUpload}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {csvError && (
          <p className="text-[13px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {csvError}
          </p>
        )}

        {csvData.length > 0 && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
              <span className="text-[13px] font-semibold text-slate-700">
                {csvData.length} budget{csvData.length > 1 ? "s" : ""} found
              </span>
            </div>
            <div className="max-h-[240px] overflow-y-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-slate-500">Name</th>
                    <th className="text-right px-4 py-2 font-medium text-slate-500">Allocated</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-500">Period</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-500">Category</th>
                    <th className="w-8 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-4 py-2 text-slate-900">{row.name}</td>
                      <td className="px-4 py-2 text-right font-mono text-slate-700">
                        &euro;{Number(row.allocated).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-slate-600">{row.period}</td>
                      <td className="px-4 py-2 text-slate-600">{row.category}</td>
                      <td className="px-2">
                        <button
                          onClick={() => setCsvData(csvData.filter((_, j) => j !== i))}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={() => { setMode("choose"); setCsvData([]); }}>
            Back
          </Button>
          <Button
            onClick={handleCsvImport}
            disabled={csvData.length === 0 || importMutation.isPending}
          >
            {importMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Import {csvData.length} budget{csvData.length > 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    );
  }

  // Manual mode
  return (
    <form onSubmit={handleManualSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-bold text-slate-900">
          Create a budget
        </h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Start with one budget — you can always add more from the dashboard.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="budget-name">Budget name</Label>
          <Input
            id="budget-name"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Q1 2026 SaaS Budget"
            required
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget-amount">Allocated amount (&euro;)</Label>
            <Input
              id="budget-amount"
              type="number"
              min="0"
              step="0.01"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              placeholder="25000"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="budget-period">Period</Label>
            <select
              id="budget-period"
              value={manualPeriod}
              onChange={(e) => setManualPeriod(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="budget-category">Category</Label>
          <select
            id="budget-category"
            value={manualCategory}
            onChange={(e) => setManualCategory(e.target.value)}
            className="mt-1.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="ghost" type="button" onClick={() => setMode("choose")}>
          Back
        </Button>
        <Button
          type="submit"
          disabled={!manualName.trim() || !manualAmount || manualMutation.isPending}
        >
          {manualMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create Budget
        </Button>
      </div>
    </form>
  );
}
