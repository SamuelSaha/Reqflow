/**
 * Empty Team States
 * Enhanced empty state components for team management with clear CTAs and guidance
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, Mail, Building, Sparkles } from "lucide-react";

interface EmptyTeamStateProps {
  onInvite: () => void;
}

export function EmptyUsersState({ onInvite }: EmptyTeamStateProps) {
  return (
    <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
      <CardContent className="py-16">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          {/* Illustration */}
          <div className="relative mb-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 border-4 border-white shadow-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Build Your Team
          </h3>

          {/* Description */}
          <p className="text-slate-600 mb-2 leading-relaxed">
            Invite team members to collaborate on procurement requests.
            They'll receive an email invitation to join your workspace.
          </p>

          {/* Benefit highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 mb-8">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Streamline approvals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Assign roles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Track activity</span>
            </div>
          </div>

          {/* Primary CTA */}
          <Button
            size="lg"
            onClick={onInvite}
            className="h-12 px-8 text-base font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Invite Your First Team Member
          </Button>

          {/* Help text */}
          <p className="text-sm text-slate-500 mt-6">
            💡 <span className="font-medium">Tip:</span> Start by inviting approvers and department leads
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyInvitesStateProps {
  onInvite: () => void;
}

export function EmptyInvitesState({ onInvite }: EmptyInvitesStateProps) {
  return (
    <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
      <CardContent className="py-16">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          {/* Illustration */}
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 mb-6">
            <Mail className="w-10 h-10 text-slate-400" />
          </div>

          {/* Heading */}
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            No Pending Invites
          </h3>

          {/* Description */}
          <p className="text-slate-600 mb-8 leading-relaxed">
            You don't have any outstanding invitations.
            Send invites to grow your team and collaborate on requests.
          </p>

          {/* Primary CTA */}
          <Button
            size="lg"
            onClick={onInvite}
            className="h-12 px-8 text-base font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Send Invitations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyDepartmentsStateProps {
  onCreate?: () => void;
}

export function EmptyDepartmentsState({ onCreate }: EmptyDepartmentsStateProps) {
  return (
    <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
      <CardContent className="py-16">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          {/* Illustration */}
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 mb-6">
            <Building className="w-10 h-10 text-slate-400" />
          </div>

          {/* Heading */}
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            No Departments Yet
          </h3>

          {/* Description */}
          <p className="text-slate-600 mb-2 leading-relaxed">
            Organize your team into departments for better budget allocation
            and approval workflows.
          </p>

          {/* Examples */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 mb-8">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full">
              Engineering
            </span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full">
              Marketing
            </span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full">
              Sales
            </span>
          </div>

          {/* Primary CTA */}
          {onCreate && (
            <Button
              size="lg"
              onClick={onCreate}
              className="h-12 px-8 text-base font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Department
            </Button>
          )}

          {onCreate && (
            <p className="text-sm text-slate-500 mt-6">
              You can assign team members to departments after creating them
            </p>
          )}

          {!onCreate && (
            <p className="text-sm text-slate-500 mt-6">
              Contact your admin to create departments
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
