"use client";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50/30">
      <div className="mx-auto max-w-[720px] px-6 py-12">
        {/* Branding */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <span className="text-h5 font-bold text-slate-900">Reqflow</span>
        </div>

        <OnboardingWizard />
      </div>
    </div>
  );
}
