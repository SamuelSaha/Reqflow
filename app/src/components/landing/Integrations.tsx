import { Plug } from "lucide-react";

const integrations = [
  { name: "Slack", letter: "S", color: "bg-purple-700" },
  { name: "Teams", letter: "T", color: "bg-indigo-500" },
  { name: "QuickBooks", letter: "Q", color: "bg-green-600" },
  { name: "Xero", letter: "X", color: "bg-teal-500" },
  { name: "Google", letter: "G", color: "bg-blue-500" },
  { name: "Pennylane", letter: "P", color: "bg-orange-500" },
];

export function Integrations() {
  return (
    <section className="bg-slate-50 py-20 md:py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Badge + Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 mb-5">
            <Plug className="w-4 h-4 text-blue-600" />
            <span className="text-caption font-semibold text-blue-600 uppercase tracking-wider">Integrations</span>
          </div>
          <h2 className="text-h2 text-slate-900 mb-4">
            Plugs into the tools<br />your team already uses.
          </h2>
          <p className="text-body-lg text-slate-600 max-w-2xl">
            One-click integrations with your accounting, chat, and identity tools.
            Data flows both ways, so nothing needs manual entry.
          </p>
        </div>

        {/* Integration Icons */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {integrations.map((integration, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col items-center gap-4 hover:shadow-md transition-shadow duration-200">
              <div className={`w-14 h-14 rounded-2xl ${integration.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">{integration.letter}</span>
              </div>
              <span className="text-body-sm font-medium text-slate-900">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
