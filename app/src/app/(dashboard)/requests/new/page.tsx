"use client";

import { RequestForm } from "@/components/dashboard/RequestForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NewRequestPage() {
  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          New Purchase Request
        </h1>
        <p className="text-slate-600 mt-2">
          Submit a new request for approval
        </p>
      </div>

      <RequestForm />
    </div>
  );
}
