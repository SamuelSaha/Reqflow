"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableColumnHeaderProps {
  label: string;
  sortKey: string;
  currentSortBy: string;
  currentSortOrder: "asc" | "desc";
  onSort: (key: string) => void;
  className?: string;
}

export function SortableColumnHeader({
  label,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  className,
}: SortableColumnHeaderProps) {
  const isActive = currentSortBy === sortKey;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className={cn(
        "flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors",
        "hover:text-slate-900",
        isActive ? "text-blue-700" : "text-slate-500",
        className
      )}
    >
      {label}
      <span className="ml-0.5">
        {isActive ? (
          currentSortOrder === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </span>
    </button>
  );
}
