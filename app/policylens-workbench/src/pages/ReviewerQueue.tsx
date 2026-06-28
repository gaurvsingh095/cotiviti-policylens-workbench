import { useState } from "react";
import { useStore } from "../store";
import { RuleStatusBadge, SeverityBadge } from "../components/StatusBadge";
import { reviewProgress } from "../logic/metrics";
import { ArrowRight, Filter } from "lucide-react";
import type { RuleStatus } from "../types/policy";

type FilterStatus = "all" | RuleStatus;

export function ReviewerQueue({ setPage }: { setPage: (id: string) => void }) {
  const { domains, domain, decisions, setDomainId } = useStore();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [scope, setScope] = useState<"current" | "all">("current");

  const progress = reviewProgress(domains, decisions);

  const rows = (scope === "current" ? [domain] : domains).flatMap((d) =>
    d.rules.map((r) => ({
      domainId: d.domainId,
      domainName: d.name,
      rule: r,
      status: (decisions[r.ruleId]?.status ?? "pending") as RuleStatus,
      note: decisions[r.ruleId]?.note ?? "",
    })),
  );

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const FILTERS: { id: FilterStatus; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "revision_requested", label: "Revision" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-800">Reviewer Queue</h1>
          <p className="mt-1 text-sm text-slate-500">
            Rule decisions from Rule Studio. {progress.percentComplete}% of all rules decided across the portfolio.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={scope === "current" ? "btn-navy" : "btn-ghost"}
            onClick={() => setScope("current")}
          >
            Current domain
          </button>
          <button className={scope === "all" ? "btn-navy" : "btn-ghost"} onClick={() => setScope("all")}>
            All domains
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter size={13} /> Filter
        </span>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.id
                ? "border-teal-300 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Rule</th>
                {scope === "all" && <th>Domain</th>}
                <th>Condition</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.domainId}-${r.rule.ruleId}`}>
                  <td className="font-mono text-xs text-navy-700">{r.rule.ruleId}</td>
                  {scope === "all" && <td className="text-xs text-slate-500">{r.domainName}</td>}
                  <td className="text-navy-700">{r.rule.condition}</td>
                  <td>
                    <SeverityBadge severity={r.rule.severity} />
                  </td>
                  <td>
                    <RuleStatusBadge status={r.status} />
                  </td>
                  <td className="max-w-xs truncate text-xs text-slate-500">{r.note || "—"}</td>
                  <td>
                    <button
                      className="btn-ghost !px-2 !py-1 text-xs"
                      onClick={() => {
                        setDomainId(r.domainId);
                        setPage("rule-studio");
                      }}
                    >
                      Open <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-400">
                    No rules match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
