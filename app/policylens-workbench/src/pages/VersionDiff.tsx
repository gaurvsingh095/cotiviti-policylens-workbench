import { useStore } from "../store";
import { CHANGE_TYPE_LABELS, changeCountsByType } from "../logic/diffEngine";
import { StatusBadge } from "../components/StatusBadge";
import { ArrowRight, Minus } from "lucide-react";
import type { ChangeType } from "../types/policy";

const TYPE_TONE: Record<ChangeType, "ok" | "warn" | "block" | "info" | "neutral"> = {
  REQUIREMENT_CHANGED: "neutral",
  NEW_DOCUMENTATION: "ok",
  TIMELINE_CHANGED: "warn",
  AUDIT_REQUIREMENT_ADDED: "info",
  CODING_RULE_UPDATED: "info",
  THRESHOLD_CHANGED: "warn",
  CLAUSE_ADDED: "ok",
  CLAUSE_REMOVED: "block",
};

export function VersionDiff({ setPage }: { setPage: (id: string) => void }) {
  const { domain } = useStore();
  const counts = changeCountsByType(domain);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-800">Version Diff</h1>
          <p className="mt-1 text-sm text-slate-500">
            {domain.name}: {domain.oldVersion} → {domain.newVersion}. Each change is labeled by type.
          </p>
        </div>
        <button className="btn-ghost" onClick={() => setPage("impact-map")}>
          See operational impact <ArrowRight size={15} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {counts.map((c) => (
          <StatusBadge key={c.type} tone={TYPE_TONE[c.type]}>
            {c.label} · {c.count}
          </StatusBadge>
        ))}
      </div>

      <div className="space-y-4">
        {domain.changedClauses.map((c, i) => (
          <div key={i} className="card card-pad">
            <div className="mb-3 flex items-center gap-2">
              <StatusBadge tone={TYPE_TONE[c.changeType]}>{CHANGE_TYPE_LABELS[c.changeType]}</StatusBadge>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <p className="eyebrow mb-1.5">Old {domain.oldVersion}</p>
                {c.oldText ? (
                  <p className="text-sm leading-relaxed text-slate-600">{c.oldText}</p>
                ) : (
                  <p className="flex items-center gap-1.5 text-sm italic text-slate-400">
                    <Minus size={14} /> not present
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-3">
                <p className="eyebrow mb-1.5 text-teal-700">New {domain.newVersion}</p>
                {c.newText ? (
                  <p className="text-sm leading-relaxed text-navy-700">{c.newText}</p>
                ) : (
                  <p className="flex items-center gap-1.5 text-sm italic text-slate-400">
                    <Minus size={14} /> removed
                  </p>
                )}
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-500">{c.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
