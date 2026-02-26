import { PageShell } from "@/components/layout";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const posts = [
    {
      slug: "notice-windows-not-renewal-dates",
      title: "Track notice windows, not just renewal dates",
      excerpt: "Most tools track when subscriptions renew. That's the wrong date. You need to know when you must decide — before auto-renew locks you in for another year.",
      author: "Samuel Saha",
      date: "February 20, 2026",
      readTime: "4 min read",
      category: "Product Thinking",
      featured: true,
    },
    {
      slug: "the-connected-record",
      title: "The connected record: Tool → Contract → Subscription → Invoice → Owner",
      excerpt: "Every SaaS tool has a story: why you bought it, who owns it, what it costs, and when you can leave. Most companies lose this story immediately after the first invoice.",
      author: "Samuel Saha",
      date: "February 13, 2026",
      readTime: "6 min read",
      category: "Strategy",
      featured: true,
    },
    {
      slug: "when-spreadsheets-stop-working",
      title: "When spreadsheets stop working for procurement",
      excerpt: "There's a moment between 15 and 50 employees when procurement becomes impossible to manage in spreadsheets — but not complex enough to justify enterprise software.",
      author: "Samuel Saha",
      date: "February 6, 2026",
      readTime: "5 min read",
      category: "Operations",
      featured: true,
    },
  ];

  return (
    <PageShell>
      <section className="pt-20 pb-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white via-[var(--warm-50)] to-white">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-4">
              Blog
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed max-w-[600px] mx-auto">
              Thoughts on procurement, operations, and building software for teams that move too fast for spreadsheets.
            </p>
          </div>

          {/* Featured posts */}
          <div className="space-y-8">
            {posts.map((post, idx) => (
              <article
                key={post.slug}
                className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                  idx === 0 ? "md:flex" : ""
                }`}
              >
                {idx === 0 ? (
                  <>
                    {/* Featured post layout */}
                    <div className="md:w-2/5 bg-gradient-to-br from-blue-50 to-violet-50 p-12 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                          <span className="text-white text-[32px] font-bold">🎯</span>
                        </div>
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[12px] font-bold rounded-full">
                          FEATURED
                        </span>
                      </div>
                    </div>
                    <div className="md:w-3/5 p-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[13px] font-semibold rounded-full">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-2 text-[13px] text-slate-500">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-slate-500">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </div>
                      </div>
                      <h2 className="text-h4 font-bold text-slate-900 mb-3 leading-tight">
                        {post.title}
                      </h2>
                      <p className="text-body text-slate-600 leading-relaxed mb-6">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <div className="text-body-sm font-semibold text-slate-900">
                              {post.author}
                            </div>
                            <div className="text-[13px] text-slate-500">Founder</div>
                          </div>
                        </div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 text-body font-semibold text-blue-600 hover:text-blue-700 transition-colors no-underline"
                        >
                          Read post
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[13px] font-semibold rounded-full">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-2 text-[13px] text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-slate-500">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>
                    <h2 className="text-h4 font-bold text-slate-900 mb-3 leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-body text-slate-600 leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">
                            {post.author}
                          </div>
                          <div className="text-[13px] text-slate-500">Founder</div>
                        </div>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-[15px] font-semibold text-blue-600 hover:text-blue-700 transition-colors no-underline"
                      >
                        Read post
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-slate-900 rounded-2xl border border-slate-700 p-10 text-center text-white">
            <h2 className="text-h4 font-bold mb-3">Get new posts via email</h2>
            <p className="text-body text-slate-300 mb-6 max-w-[500px] mx-auto">
              We publish 1-2 posts per month on procurement operations, team building, and product development. No spam, no marketing fluff.
            </p>
            <div className="flex items-center gap-3 max-w-[500px] mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 text-body bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-body font-semibold hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          {/* Coming soon */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-body-lg font-bold text-blue-900 mb-2">
              More posts coming soon
            </h3>
            <p className="text-body-sm text-blue-800">
              We're building in public and sharing what we learn. Follow along on{" "}
              <a href="https://twitter.com/reqflow" className="text-blue-600 font-semibold no-underline">
                Twitter
              </a>{" "}
              or join our{" "}
              <Link href="/beta" className="text-blue-600 font-semibold no-underline">
                beta program
              </Link>{" "}
              for direct access to the team.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
