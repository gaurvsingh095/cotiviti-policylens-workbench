import { useStore } from "../store";
import { DomainIcon } from "../components/icons";
import { StatusBadge } from "../components/StatusBadge";
import { totalChanges } from "../logic/diffEngine";
import { generateQaTests } from "../logic/qaGenerator";
import { ArrowRight, FileText } from "lucide-react";

export function PolicyLibrary({ setPage }: { setPage: (id: string) => void }) {
  const { domains, domainId, setDomainId, domain } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800">Policy Library</h1>
        <p className="mt-1 text-sm text-slate-500">
          Synthetic policy domains with versioned text. Select one to drive the rest of the workbench.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          {domains.map((d) => {
            const active = d.domainId === domainId;
            return (
              <button
                key={d.domainId}
                onClick={() => setDomainId(d.domainId)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  active ? "border-teal-300 bg-teal-50/50 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-teal-100 text-teal-700" : "bg-navy-50 text-navy-700"}`}>
                  <DomainIcon name={d.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-800">{d.name}</p>
                  <p className="text-[11px] text-slate-500">{d.category}</p>
                </div>
                <StatusBadge tone="neutral">{d.newVersion}</StatusBadge>
              </button>
            );
          })}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="card card-pad">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 text-white">
                  <DomainIcon name={domain.icon} size={22} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-navy-800">{domain.name}</h2>
                  <p className="text-xs text-slate-500">
                    {domain.category} · effective {domain.effectiveDate}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <StatusBadge tone="neutral">old {domain.oldVersion}</StatusBadge>
                <StatusBadge tone="ok">new {domain.newVersion}</StatusBadge>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-lg font-semibold text-navy-800">{domain.rules.length}</p>
                <p className="text-[11px] text-slate-500">candidate rules</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-lg font-semibold text-navy-800">{totalChanges(domain)}</p>
                <p className="text-[11px] text-slate-500">changed clauses</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-lg font-semibold text-navy-800">{generateQaTests(domain).length}</p>
                <p className="text-[11px] text-slate-500">QA tests</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="eyebrow mb-1.5">Why this matters</p>
              <p className="text-sm leading-relaxed text-navy-700">{domain.whyItMatters}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="card card-pad">
              <p className="eyebrow mb-2 flex items-center gap-1.5">
                <FileText size={13} /> Old version {domain.oldVersion}
              </p>
              <p className="text-sm leading-relaxed text-slate-600">{domain.oldText}</p>
            </div>
            <div className="card card-pad border-teal-200">
              <p className="eyebrow mb-2 flex items-center gap-1.5 text-teal-700">
                <FileText size={13} /> New version {domain.newVersion}
              </p>
              <p className="text-sm leading-relaxed text-navy-700">{domain.newText}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setPage("version-diff")}>
              View version diff <ArrowRight size={15} />
            </button>
            <button className="btn-primary" onClick={() => setPage("rule-studio")}>
              Open Rule Studio <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
