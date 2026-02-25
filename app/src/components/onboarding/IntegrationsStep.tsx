"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/api/react";
import { Button } from "@/components/ui/button";
import { Loader2, Rocket } from "lucide-react";

const INTEGRATIONS = [
  {
    name: "Slack",
    description: "Get approval notifications and submit requests from Slack.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.27 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.833 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.52-2.52A2.528 2.528 0 0 1 8.833 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.521 2.522v6.312z" fill="#2EB67D"/>
        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.521-2.522v-2.522h2.521zm0-1.27a2.528 2.528 0 0 1-2.521-2.522 2.528 2.528 0 0 1 2.521-2.521h6.313A2.528 2.528 0 0 1 24 15.164a2.528 2.528 0 0 1-2.522 2.522h-6.313z" fill="#ECB22E"/>
      </svg>
    ),
    available: false,
  },
  {
    name: "QuickBooks",
    description: "Sync approved purchases with your accounting software.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#2CA01C"/>
        <path d="M6 12a4 4 0 0 1 4-4h1v2h-1a2 2 0 0 0 0 4h1v2h-1a4 4 0 0 1-4-4zm8-4h1a4 4 0 0 1 0 8h-1v-2h1a2 2 0 0 0 0-4h-1V8z" fill="white"/>
      </svg>
    ),
    available: false,
  },
  {
    name: "Jira",
    description: "Link purchase requests to Jira projects and epics.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.577 24V12.518a1.005 1.005 0 0 0-1.006-1.005z" fill="#2684FF"/>
        <path d="M17.786 5.25H6.214a5.218 5.218 0 0 0 5.233 5.214h2.129v2.058a5.218 5.218 0 0 0 5.216 5.228V6.256a1.005 1.005 0 0 0-1.006-1.006z" fill="url(#a)" fillOpacity=".8"/>
        <path d="M24 0H12.429a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 25.006 12.5V1.005A1.005 1.005 0 0 0 24 0z" fill="url(#b)" fillOpacity=".8"/>
        <defs>
          <linearGradient id="a" x1="12.1" y1="5.3" x2="17.8" y2="17.7" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0052CC"/><stop offset="1" stopColor="#2684FF"/>
          </linearGradient>
          <linearGradient id="b" x1="18.3" y1="0" x2="24" y2="12.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0052CC"/><stop offset="1" stopColor="#2684FF"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    available: false,
  },
];

export function IntegrationsStep() {
  const router = useRouter();

  const mutation = trpc.onboarding.completeOnboarding.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-bold text-slate-900">
          Connect your tools
        </h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Integrations are coming soon. Here&apos;s what we&apos;re building.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {INTEGRATIONS.map((int) => (
          <div
            key={int.name}
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex-shrink-0">{int.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-slate-900">
                  {int.name}
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  COMING SOON
                </span>
              </div>
              <p className="text-[13px] text-slate-500 mt-0.5">
                {int.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {mutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Rocket className="w-4 h-4 mr-2" />
          )}
          Finish Setup &amp; Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
