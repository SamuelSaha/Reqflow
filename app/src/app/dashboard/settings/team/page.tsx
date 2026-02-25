"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import { Plus, AlertCircle, Users, Mail, Building } from "lucide-react";
import { getErrorMessage } from "@/lib/utils/error-messages";
import { InviteUsersDialog } from "@/components/settings/InviteUsersDialog";

export const dynamic = "force-dynamic";

const roleConfig: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-violet-100 text-violet-700" },
  finance: { label: "Finance", className: "bg-blue-100 text-blue-700" },
  manager: { label: "Manager", className: "bg-slate-100 text-slate-700" },
  requester: { label: "Requester", className: "bg-slate-50 text-slate-600" },
};

export default function TeamPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const userList = trpc.team.listUsers.useQuery({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Management</h2>
          <p className="text-slate-600 mt-1">
            Manage users, departments, and team invites
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Users
        </Button>
      </div>

      {/* Loading */}
      {userList.isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {userList.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(userList.error)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {userList.data && userList.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              No team members yet
            </p>
            <p className="text-slate-600 mb-6">
              Invite your first team member to get started
            </p>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Users
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User list */}
      {userList.data && userList.data.length > 0 && (
        <div className="space-y-3">
          {userList.data.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {user.name}
                      </h3>
                      <Badge className={roleConfig[user.role].className}>
                        {roleConfig[user.role].label}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="outline" className="text-slate-500">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </div>
                      {user.department && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3.5 w-3.5" />
                          {user.department.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Dialog */}
      <InviteUsersDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
}
