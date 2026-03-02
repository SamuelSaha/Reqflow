"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataPaginationProps {
  page: number; // 0-indexed
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function DataPagination({
  page,
  total,
  pageSize,
  onPageChange,
}: DataPaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <span className="text-sm text-slate-500">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <span className="text-sm font-medium text-slate-700 min-w-[4rem] text-center">
          {page + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}
