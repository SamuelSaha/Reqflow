"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: "General",
      shortcuts: [
        { keys: [modKey, "K"], description: "Open command palette" },
        { keys: ["?"], description: "Show keyboard shortcuts" },
        { keys: ["Esc"], description: "Close dialogs/menus" },
      ],
    },
    {
      title: "Navigation",
      shortcuts: [
        { keys: ["G", "then", "D"], description: "Go to Dashboard" },
        { keys: ["G", "then", "R"], description: "Go to Requests" },
        { keys: ["G", "then", "A"], description: "Go to Approvals" },
        { keys: ["G", "then", "T"], description: "Go to Trials" },
        { keys: ["G", "then", "W"], description: "Go to Renewals" },
        { keys: ["G", "then", "B"], description: "Go to Budgets" },
        { keys: ["G", "then", "S"], description: "Go to Subscriptions" },
        { keys: ["G", "then", "I"], description: "Go to Invoices" },
        { keys: ["G", "then", "V"], description: "Go to Vendors" },
        { keys: ["G", "then", "E"], description: "Go to Settings" },
      ],
    },
    {
      title: "Actions",
      shortcuts: [
        { keys: ["N"], description: "New (context-aware)" },
        { keys: ["/"], description: "Focus search" },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-medium text-slate-700">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && key !== "then" && (
                            <span className="text-slate-400 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono">
              ?
            </kbd>{" "}
            anytime to see this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
