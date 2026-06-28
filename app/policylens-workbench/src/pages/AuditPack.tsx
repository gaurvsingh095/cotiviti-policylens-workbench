import { useStore } from "../store";
import { useScenario } from "../hooks/useScenario";
import { JsonPanel } from "../components/JsonPanel";
import { StatusBadge } from "../components/StatusBadge";
import { buildAuditPackage, RESPONSIBLE_USE_NOTE } from "../logic/auditPack";
import { ShieldCheck, Package, FileCheck2 } from "lucide-react";

export function AuditPack() {
  const { domain, decisions } = useStore();
  const { values, result } = useScenario(domain);

  const pkg = buildAuditPackage(domain, values, result, decisions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800">Audit Pack</h1>
        <p className="mt-1 text-sm text-slate-500">
          A single exportable package: policy, changes, rules and reviewer decisions, QA tests, the current scenario
          result, and a full traceability trail. Copy or download as JSON.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card card-pad">
          <p className="eyebrow">Rules</p>
          <p className="mt-1 text-2xl font-semibold text-navy-800">{pkg.rules.length}</p>
        </div>
        <div className="card card-pad">
          <p className="eyebrow">QA tests</p>
          <p className="mt-1 text-2xl font-semibold text-navy-800">{pkg.qaTests.length}</p>
        </div>
        <div className="card card-pad">
          <p className="eyebrow">Trace coverage</p>
          <p className="mt-1 text-2xl font-semibold text-navy-800">{pkg.traceability.coveragePercent}%</p>
        </div>
        <div className="card card-pad">
          <p className="eyebrow">Scenario status</p>
          <p className="mt-1 text-sm font-semibold text-navy-800">{result.status}</p>
        </div>
      </div>

      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-teal-800">
          <ShieldCheck size={16} /> Responsible use
        </p>
        <p className="mt-1 text-sm text-teal-700">{RESPONSIBLE_USE_NOTE}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="card card-pad">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-800">
              <Package size={15} /> Package contents
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              {[
                "Policy metadata & versions",
                "Changed clauses",
                "Impacted teams",
                "Rules + reviewer decisions",
                "Generated QA tests",
                "Scenario inputs & result",
                "Traceability trail",
                "Responsible-use note",
              ].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <FileCheck2 size={14} className="text-teal-600" /> {x}
                </li>
              ))}
            </ul>
          </div>

          <div className="card card-pad">
            <p className="mb-2 text-sm font-semibold text-navy-800">Traceability trail</p>
            <p className="mb-2 text-xs text-slate-500">source clause → rule → finding → output</p>
            <StatusBadge tone="info">{pkg.traceability.coveragePercent}% covered</StatusBadge>
            <div className="mt-3 space-y-2">
              {pkg.traceability.rows.slice(0, 4).map((row, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-2 text-xs">
                  <p className="font-mono text-navy-700">{row.ruleId}</p>
                  <p className="mt-0.5 text-slate-500">{row.finding}</p>
                </div>
              ))}
              {pkg.traceability.rows.length > 4 && (
                <p className="text-xs text-slate-400">+ {pkg.traceability.rows.length - 4} more in the JSON</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <JsonPanel
            data={pkg}
            title={`policylens-audit-${domain.domainId}.json`}
            filename={`policylens-audit-${domain.domainId}.json`}
            maxHeight="40rem"
          />
        </div>
      </div>
    </div>
  );
}
