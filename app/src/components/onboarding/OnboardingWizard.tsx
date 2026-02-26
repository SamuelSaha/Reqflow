"use client";

import { useState } from "react";
import { trpc } from "@/lib/api/react";
import { CompanySetupStep } from "./CompanySetupStep";
import { BudgetSetupStep } from "./BudgetSetupStep";
import { TeamInviteStep } from "./TeamInviteStep";
import { FirstRequestStep } from "./FirstRequestStep";
import { IntegrationsStep } from "./IntegrationsStep";
import { Building2, Wallet, Users, FileText, Plug } from "lucide-react";

const STEPS = [
  { label: "Company", icon: Building2 },
  { label: "Budgets", icon: Wallet },
  { label: "Team", icon: Users },
  { label: "First Request", icon: FileText },
  { label: "Integrations", icon: Plug },
] as const;

export function OnboardingWizard() {
  const { data: state, isLoading } = trpc.onboarding.getState.useQuery();
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  // Sync server step on first load
  const step = currentStep ?? state?.step ?? 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-body-sm text-slate-500">Loading your setup...</p>
      </div>
    );
  }

  function handleNext() {
    setCurrentStep((step ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isCompleted = i < step;

          return (
            <div key={s.label} className="flex items-center flex-1">
              <button
                onClick={() => i <= step && setCurrentStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : isCompleted
                      ? "text-green-600 hover:bg-green-50 cursor-pointer"
                      : "text-slate-400 cursor-default"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-caption font-bold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-caption font-semibold hidden sm:block">
                  {s.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        {step === 0 && (
          <CompanySetupStep
            defaultValues={{
              name: state?.orgName || "",
              industry: state?.orgIndustry || "",
              size: state?.orgSize || "",
              domain: state?.orgDomain || "",
            }}
            onNext={handleNext}
          />
        )}
        {step === 1 && <BudgetSetupStep onNext={handleNext} />}
        {step === 2 && <TeamInviteStep onNext={handleNext} />}
        {step === 3 && <FirstRequestStep onNext={handleNext} />}
        {step === 4 && <IntegrationsStep />}
      </div>
    </div>
  );
}
