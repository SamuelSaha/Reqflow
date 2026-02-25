import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="pt-20 pb-32 px-20 flex flex-col items-center gap-6 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm">
        <span className="w-2 h-2 bg-amber-500 rounded-full" />
        <span className="text-[13px] font-medium text-slate-700">
          Coming Soon
        </span>
      </div>
      <h1 className="text-[52px] font-extrabold tracking-[-1.5px] text-slate-900">
        {title}
      </h1>
      <p className="text-[18px] text-slate-600 max-w-[500px]">{description}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-blue-600 font-semibold no-underline hover:text-blue-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </section>
  );
}
