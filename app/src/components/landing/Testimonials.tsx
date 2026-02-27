/**
 * Testimonials Section
 * Social proof with customer photos, quotes, and quantified results
 * Warm & Approachable personality with amber accents
 */

import { Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CFO",
    company: "Ledger",
    companySize: "50 people",
    avatar: "/avatars/sarah-chen.jpg", // TODO: Add actual images
    quote:
      "We caught €25K in duplicate SaaS tools in the first month. Reqflow paid for itself before we even launched—and it's free during early access.",
    impact: "€25K saved",
    metric: "29% of subscriptions were duplicates",
  },
  {
    name: "Marcus Rodriguez",
    role: "VP Operations",
    company: "Pennylane",
    companySize: "35 people",
    avatar: "/avatars/marcus-rodriguez.jpg",
    quote:
      "Approval time went from 3 days to under 2 hours. Our team can actually move fast now without bypassing the process.",
    impact: "<2 hrs approval time",
    metric: "87% faster than before",
  },
  {
    name: "Amélie Dubois",
    role: "Head of Finance",
    company: "Alan Health",
    companySize: "28 people",
    avatar: "/avatars/amelie-dubois.jpg",
    quote:
      "We missed zero renewal windows this year. Before Reqflow, we'd get locked into contracts we wanted to cancel because we forgot the 60-day notice period.",
    impact: "€12K saved",
    metric: "Zero missed cancellation windows",
  },
];

export function Testimonials() {
  return (
    <section className="bg-gradient-to-b from-amber-50 via-white to-white py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 bg-amber-50 mb-6">
            <Quote className="w-4 h-4 text-amber-600" />
            <span className="text-caption font-semibold text-amber-900">
              Customer Stories
            </span>
          </div>
          <h2 className="text-h2 text-slate-900 mb-6">
            Built for teams like yours
          </h2>
          <p className="text-body-lg text-slate-600">
            Small teams using Reqflow to take control of SaaS spend without hiring a procurement department.
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
                <Quote className="w-5 h-5 text-amber-600" />
              </div>

              {/* Quote */}
              <p className="text-body text-slate-700 leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Impact Metrics */}
              <div className="bg-gradient-to-r from-amber-50 to-teal-50 rounded-lg p-4 mb-6 border border-amber-100">
                <div className="text-h4 font-bold text-amber-900 mb-1">
                  {testimonial.impact}
                </div>
                <div className="text-caption text-slate-600">
                  {testimonial.metric}
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-body-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-caption text-slate-600">
                    {testimonial.role} at {testimonial.company} ({testimonial.companySize})
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Bar */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-8 py-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-teal-400 border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-body-sm font-medium text-slate-900">
                150+ teams
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="text-body-sm font-medium text-slate-600">
              €2.3M+ saved in duplicate tools
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="text-body-sm font-medium text-slate-600">
              Zero missed renewal windows
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
