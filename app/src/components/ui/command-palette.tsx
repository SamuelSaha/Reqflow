"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FileText,
  CheckSquare,
  LayoutDashboard,
  Wallet,
  FlaskConical,
  Calendar,
  Settings,
  Building2,
  Package,
  Receipt,
  Plus,
  Search,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
  category: "navigation" | "action";
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navigation
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      action: () => router.push("/dashboard"),
      keywords: ["home", "overview"],
      category: "navigation",
    },
    {
      id: "requests",
      label: "Requests",
      icon: FileText,
      action: () => router.push("/dashboard/requests"),
      keywords: ["purchase", "buy"],
      category: "navigation",
    },
    {
      id: "approvals",
      label: "Approvals",
      icon: CheckSquare,
      action: () => router.push("/dashboard/approvals"),
      keywords: ["approve", "review"],
      category: "navigation",
    },
    {
      id: "trials",
      label: "Trials",
      icon: FlaskConical,
      action: () => router.push("/dashboard/trials"),
      keywords: ["test", "pilot"],
      category: "navigation",
    },
    {
      id: "renewals",
      label: "Renewals",
      icon: Calendar,
      action: () => router.push("/dashboard/renewals"),
      keywords: ["expiring", "contract"],
      category: "navigation",
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: Wallet,
      action: () => router.push("/dashboard/budgets"),
      keywords: ["spend", "money"],
      category: "navigation",
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: Package,
      action: () => router.push("/dashboard/subscriptions"),
      keywords: ["saas", "recurring"],
      category: "navigation",
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: Receipt,
      action: () => router.push("/dashboard/invoices"),
      keywords: ["bill", "payment"],
      category: "navigation",
    },
    {
      id: "vendors",
      label: "Vendors",
      icon: Building2,
      action: () => router.push("/dashboard/vendors"),
      keywords: ["supplier", "partner"],
      category: "navigation",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      action: () => router.push("/dashboard/settings"),
      keywords: ["preferences", "config"],
      category: "navigation",
    },

    // Actions
    {
      id: "new-request",
      label: "New Request",
      icon: Plus,
      action: () => router.push("/dashboard/requests/new"),
      keywords: ["create", "add", "buy"],
      category: "action",
    },
    {
      id: "new-vendor",
      label: "New Vendor",
      icon: Plus,
      action: () => router.push("/dashboard/vendors/new"),
      keywords: ["create", "add", "supplier"],
      category: "action",
    },
    {
      id: "new-contract",
      label: "New Contract",
      icon: Plus,
      action: () => router.push("/dashboard/contracts/new"),
      keywords: ["create", "add", "agreement"],
      category: "action",
    },
  ];

  const filteredCommands = search
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(search.toLowerCase()) ||
          cmd.keywords?.some((kw) => kw.toLowerCase().includes(search.toLowerCase()))
      )
    : commands;

  // Group by category
  const navigationCommands = filteredCommands.filter((c) => c.category === "navigation");
  const actionCommands = filteredCommands.filter((c) => c.category === "action");

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          selected.action();
          onOpenChange(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredCommands, selectedIndex, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <div className="border-b border-slate-200 px-4 py-3 flex items-center gap-2">
          <Search className="h-5 w-5 text-slate-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {/* Navigation section */}
          {navigationCommands.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                Navigation
              </div>
              <div className="py-2">
                {navigationCommands.map((cmd, idx) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onOpenChange(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${
                        selectedIndex === globalIndex
                          ? "bg-blue-50 text-blue-900"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions section */}
          {actionCommands.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-t border-slate-100">
                Actions
              </div>
              <div className="py-2">
                {actionCommands.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onOpenChange(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${
                        selectedIndex === globalIndex
                          ? "bg-blue-50 text-blue-900"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No results */}
          {filteredCommands.length === 0 && (
            <div className="px-4 py-12 text-center text-slate-500">
              <p className="text-sm">No commands found for &ldquo;{search}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-200 px-4 py-2 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono">
              ↵
            </kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono">
              Esc
            </kbd>
            <span>Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
