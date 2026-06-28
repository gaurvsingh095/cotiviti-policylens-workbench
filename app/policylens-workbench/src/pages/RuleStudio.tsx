import { useState } from "react";
import { useStore } from "../store";
import { SeverityBadge, RuleStatusBadge } from "../components/StatusBadge";
import { Check, X, RotateCcw, ChevronDown, ChevronRight, FileText } from "lucide-react";
import type { RuleStatus } from "../types/policy";

export function RuleStudio() {
  const { domain, decisions, setDecision } = useStore();
  const [open, setOpen] = useState<string | null>(domain.rules[0]?.ruleId ?? null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const act = (ruleId: string, status: RuleStatus) => {
    const note = noteDraft[ruleId] ?? decisions[ruleId]?.note ?? "";
    setDecision(ruleId, status, note);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800">Rule Studio</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review the candidate rules extracted from {domain.name} {domain.newVersion}. Each cites its source clause.
          Approve, reject, or request a revision — decisions flow to the Reviewer Queue and Audit Pack.
        </p>
      </div>

      <div className="space-y-3">
        {domain.rules.map((r) => {
          const decision = decisions[r.ruleId];
          const status = decision?.status ?? "pending";
          const isOpen = open === r.ruleId;
          return (
            <div key={r.ruleId} className="card overflow-hidden">
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                onClick={() => setOpen(isOpen ? null : r.ruleId)}
              >
                {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                <span className="font-mono text-xs font-semibold text-navy-700">{r.ruleId}</span>
                <span className="flex-1 text-sm font-medium text-navy-800">{r.condition}</span>
                <SeverityBadge severity={r.severity} />
                <RuleStatusBadge status={status} />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2 text-sm">
                      <Row label="Type" value={r.ruleType} />
                      <Row label="Threshold" value={r.threshold} mono />
                      <Row label="Action" value={r.action} />
                      <Row label="Human review" value={r.humanReviewRequired ? "Required" : "Not required"} />
                    </div>
                    <div>
                      <p className="eyebrow mb-1.5 flex items-center gap-1.5">
                        <FileText size={12} /> Source clause
                      </p>
                      <div className="rounded-lg border-l-2 border-navy-700 bg-slate-50 p-3 text-sm text-navy-700">
                        {r.sourceClause}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="eyebrow mb-1.5 block">Reviewer note</label>
                    <textarea
                      value={noteDraft[r.ruleId] ?? decision?.note ?? ""}
                      onChange={(e) => setNoteDraft((p) => ({ ...p, [r.ruleId]: e.target.value }))}
                      placeholder="Add context for your decision (optional)…"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                      rows={2}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className={`btn ${status === "approved" ? "bg-teal-600 text-white" : "btn-ghost"}`}
                      onClick={() => act(r.ruleId, "approved")}
                    >
                      <Check size={15} /> Approve
                    </button>
                    <button
                      className={`btn ${status === "revision_requested" ? "bg-amber-500 text-white" : "btn-ghost"}`}
                      onClick={() => act(r.ruleId, "revision_requested")}
                    >
                      <RotateCcw size={15} /> Request revision
                    </button>
                    <button
                      className={`btn ${status === "rejected" ? "bg-red-600 text-white" : "btn-ghost"}`}
                      onClick={() => act(r.ruleId, "rejected")}
                    >
                      <X size={15} /> Reject
                    </button>
                    {status !== "pending" && (
                      <button className="btn-ghost text-slate-500" onClick={() => act(r.ruleId, "pending")}>
                        Clear
                      </button>
                    )}
                    {decision?.decidedAt && (
                      <span className="ml-auto self-center text-[11px] text-slate-400">
                        decided {new Date(decision.decidedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 pb-1.5">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right font-medium text-navy-800 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
