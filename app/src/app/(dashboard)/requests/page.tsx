"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Requests
          </h1>
          <p className="text-slate-600 mt-2">
            View and manage your purchase requests
          </p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>
            Your purchase request history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            No requests yet. Create your first request to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
