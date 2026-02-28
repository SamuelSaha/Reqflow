/**
 * Product Preview - Show actual tool UI
 * Premium screenshot presentation with context
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import Image from "next/image";

export function ProductPreview() {
  return (
    <Section background="warm" className="relative">
      <Container size="default">
        <div className="py-20 md:py-28">
          {/* Context - what they're seeing */}
          <div className="text-center mb-12">
            <p className="text-body text-slate-600 font-medium">
              Complete visibility from request to renewal
            </p>
          </div>

          {/* Premium screenshot container */}
          <div className="relative">
            {/* Browser chrome wrapper */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
              {/* Browser chrome header */}
              <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-500 font-medium">
                    app.reqflow.com/dashboard
                  </div>
                </div>
              </div>

              {/* Screenshot - Dashboard View */}
              <div className="aspect-[16/10] bg-gradient-to-br from-slate-50 to-white relative">
                {/* Placeholder for actual screenshot */}
                <div className="absolute inset-0 p-8">
                  {/* Mock dashboard interface */}
                  <div className="h-full flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                      <div>
                        <div className="h-8 w-48 bg-slate-900 rounded-lg mb-2"></div>
                        <div className="h-4 w-32 bg-slate-200 rounded"></div>
                      </div>
                      <div className="h-10 w-40 bg-blue-600 rounded-lg"></div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                          <div className="h-3 w-16 bg-slate-200 rounded mb-3"></div>
                          <div className="h-7 w-20 bg-slate-900 rounded-lg mb-2"></div>
                          <div className="h-2 w-12 bg-green-200 rounded"></div>
                        </div>
                      ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                      <div className="h-5 w-48 bg-slate-900 rounded mb-6"></div>

                      {/* Table rows */}
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center gap-4 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                              <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                            </div>
                            <div className="h-8 w-24 bg-slate-100 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-b from-blue-500/5 to-transparent rounded-3xl -z-10 blur-2xl"></div>
          </div>

          {/* Caption */}
          <div className="text-center mt-8">
            <p className="text-body-sm text-slate-500">
              Real-time dashboard showing active requests, budget status, and upcoming renewals
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
