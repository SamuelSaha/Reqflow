"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import {
  Plus,
  AlertCircle,
  Users,
  Mail,
  Building,
  MoreVertical,
  RefreshCw,
  XCircle,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils/error-messages";
import { InviteUsersDialog, EditUserDialog } from "@/components/settings/lazy-components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  EmptyUsersState,
  EmptyInvitesState,
  EmptyDepartmentsState,
} from "@/components/settings/empty-team-states";

export const dynamic = "force-dynamic";

const roleConfig: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-violet-100 text-violet-700" },
  finance: { label: "Finance", className: "bg-blue-100 text-blue-700" },
  manager: { label: "Manager", className: "bg-slate-100 text-slate-700" },
  requester: { label: "Requester", className: "bg-slate-50 text-slate-600" },
};

type Tab = "users" | "invites" | "departments";

type UserData = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  department: {
    id: string;
    name: string;
    code: string | null;
  } | null;
};

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const userList = trpc.team.listUsers.useQuery({});
  const inviteList = trpc.team.listInvites.useQuery({});
  const departmentList = trpc.team.listDepartments.useQuery();
  const utils = trpc.useUtils();

  const resendInvite = trpc.team.resendInvite.useMutation({
    onSuccess: () => {
      toast.success("Invite resent successfully");
      utils.team.listInvites.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeInvite = trpc.team.revokeInvite.useMutation({
    onSuccess: () => {
      toast.success("Invite revoked");
      utils.team.listInvites.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteDepartment = trpc.team.deleteDepartment.useMutation({
    onSuccess: () => {
      toast.success("Department deleted");
      utils.team.listDepartments.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  function handleEditUser(user: UserData) {
    setSelectedUser(user);
    setEditUserDialogOpen(true);
  }

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

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { id: "users" as Tab, label: "Users", icon: Users, loading: userList.isLoading },
            { id: "invites" as Tab, label: "Invites", icon: Mail, loading: inviteList.isLoading },
            { id: "departments" as Tab, label: "Departments", icon: Building, loading: departmentList.isLoading },
          ].map(({ id, label, icon: Icon, loading }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                activeTab === id
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {loading && activeTab === id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <>
          {userList.error && !userList.isLoading && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">
                  {getErrorMessage(userList.error)}
                </p>
              </CardContent>
            </Card>
          )}

          {!userList.error && (!userList.data || userList.data.length === 0) && (
            <EmptyUsersState onInvite={() => setInviteDialogOpen(true)} />
          )}

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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Invites Tab */}
      {activeTab === "invites" && (
        <>
          {inviteList.error && !inviteList.isLoading && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">
                  Failed to load invites
                </p>
                <p className="text-slate-600 text-sm">
                  {inviteList.error.message || "An error occurred while fetching invites"}
                </p>
              </CardContent>
            </Card>
          )}

          {!inviteList.error && (!inviteList.data || inviteList.data.length === 0) && (
            <EmptyInvitesState onInvite={() => setInviteDialogOpen(true)} />
          )}

          {inviteList.data && inviteList.data.length > 0 && (
            <div className="space-y-3">
              {inviteList.data.map((invite) => (
                <Card key={invite.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {invite.email}
                          </h3>
                          <Badge className={roleConfig[invite.role].className}>
                            {roleConfig[invite.role].label}
                          </Badge>
                          <Badge
                            variant={
                              invite.status === "pending" ? "default" : "outline"
                            }
                          >
                            {invite.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>
                            Invited by {invite.invitedBy.name} on{" "}
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            Expires{" "}
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {invite.status === "pending" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                resendInvite.mutate({ inviteId: invite.id })
                              }
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                revokeInvite.mutate({ inviteId: invite.id })
                              }
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Revoke
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Departments Tab */}
      {activeTab === "departments" && (
        <>
          {!departmentList.error && (!departmentList.data || departmentList.data.length === 0) && (
            <EmptyDepartmentsState />
          )}

          {departmentList.data && departmentList.data.length > 0 && (
            <div className="space-y-3">
              {departmentList.data.map((dept) => (
                <Card key={dept.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {dept.name}
                          </h3>
                          {dept.code && (
                            <Badge variant="outline">{dept.code}</Badge>
                          )}
                          <Badge variant="secondary">
                            {dept.memberCount}{" "}
                            {dept.memberCount === 1 ? "member" : "members"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          {dept.head && <span>Head: {dept.head.name}</span>}
                          {dept.description && <span>{dept.description}</span>}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              deleteDepartment.mutate({
                                departmentId: dept.id,
                              })
                            }
                            className="text-red-600"
                            disabled={dept.memberCount > 0}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <InviteUsersDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
      <EditUserDialog
        open={editUserDialogOpen}
        onOpenChange={setEditUserDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}
