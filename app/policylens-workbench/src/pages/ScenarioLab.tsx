import { useStore } from "../store";
import { useScenario } from "../hooks/useScenario";
import { StatusBadge } from "../components/StatusBadge";
import { traceabilityCoverage } from "../logic/policyEngine";
import {
  Check,
  X,
  FileWarning,
  Search,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import type { Finding } from "../types/policy";

const TONE_CLASS = {
  ok: "border-teal-200 bg-teal-50",
  warn: "border-amber-200 bg-amber-50",
  block: "border-red-200 bg-red-50",
  info: "border-blue-200 bg-blue-50",
} as const;

const TONE_TEXT = {
  ok: "text-teal-800",
  warn: "text-amber-800",
  block: "text-red-800",
  info: "text-blue-800",
} as const;

const FIND_ICON: Record<Finding["status"], typeof Check> = {
  pass: Check,
  fail: X,
  needs_documentation: FileWarning,
  needs_review: Search,
};

const FIND_TONE: Record<Finding["status"], "ok" | "warn" | "block" | "info"> = {
  pass: "ok",
  fail: "block",
  needs_documentation: "warn",
  needs_review: "info",
};

export function ScenarioLab({ setPage }: { setPage: (id: string) => void }) {
  const { domain } = useStore();
  const { caseId, values, selectCase, setField, result } = useScenario(domain);
  const [openFinding, setOpenFinding] = useState<number | null>(null);
  const coverage = traceabilityCoverage(result);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-800">Scenario Lab</h1>
          <p className="mt-1 text-sm text-slate-500">
            Select a synthetic case, edit the inputs, and run a deterministic evaluation against {domain.name}.
          </p>
        </div>
        <button className="btn-ghost" onClick={() => setPage("audit-pack")}>
          Build audit pack <ArrowRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Inputs */}
        <div className="space-y-4 lg:col-span-1">
          <div className="card card-pad">
            <p className="eyebrow mb-2">Synthetic case</p>
            <select
              value={caseId}
              onChange={(e) => selectCase(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm font-medium text-navy-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              {caseId === "__custom" && <option value="__custom">Custom (edited)</option>}
              {domain.cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              {domain.cases.find((c) => c.id === caseId)?.description ?? "Custom inputs — edit fields below."}
            </p>
          </div>

          <div className="card card-pad">
            <p className="eyebrow mb-3">Case inputs</p>
            <div className="space-y-4">
              {domain.caseFields.map((f) => (
                <div key={f.key}>
                  {f.kind === "int" ? (
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <label className="text-sm text-navy-700">{f.label}</label>
                        <span className="font-mono text-sm font-semibold text-teal-700">
                          {Number(values[f.key])}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={f.min ?? 0}
                        max={f.max ?? 100}
                        step={1}
                        value={Number(values[f.key])}
                        onChange={(e) => setField(f.key, Number(e.target.value))}
                      />
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-between">
                      <span className="text-sm text-navy-700">{f.label}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(values[f.key])}
                        onClick={() => setField(f.key, !values[f.key])}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          values[f.key] ? "bg-teal-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                            values[f.key] ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </label>
                  )}
                  {f.help && <p className="mt-0.5 text-[11px] text-slate-400">{f.help}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="space-y-4 lg:col-span-2">
          <div className={`rounded-xl border p-5 ${TONE_CLASS[result.tone]}`}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={result.tone}>{result.status}</StatusBadge>
              <span className={`text-base font-semibold ${TONE_TEXT[result.tone]}`}>{result.headline}</span>
            </div>
            <p className={`mt-2 text-sm leading-relaxed ${TONE_TEXT[result.tone]}`}>{result.explanation}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge tone="info">Traceability {coverage}%</StatusBadge>
              <StatusBadge tone="neutral">Human review required</StatusBadge>
            </div>
          </div>

          {result.missingCriteria.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-800">
                <AlertTriangle size={15} /> Missing criteria
              </p>
              <ul className="space-y-1">
                {result.missingCriteria.map((m, i) => (
                  <li key={i} className="text-sm text-red-700">
                    • {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-navy-800">Findings ({result.findings.length})</p>
            </div>
            <div className="divide-y divide-slate-100">
              {result.findings.map((f, i) => {
                const Icon = FIND_ICON[f.status];
                const tone = FIND_TONE[f.status];
                const isOpen = openFinding === i;
                return (
                  <div key={i}>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                      onClick={() => setOpenFinding(isOpen ? null : i)}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                          tone === "ok"
                            ? "bg-teal-100 text-teal-700"
                            : tone === "block"
                            ? "bg-red-100 text-red-700"
                            : tone === "warn"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <Icon size={15} />
                      </span>
                      <span className="font-mono text-xs text-slate-500">{f.ruleId}</span>
                      <span className="flex-1 text-sm text-navy-700">{f.message}</span>
                      <ChevronRight
                        size={15}
                        className={`text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="bg-slate-50/60 px-4 pb-3 pl-14">
                        <div className="rounded-lg border-l-2 border-navy-700 bg-white p-2.5 text-xs text-navy-700">
                          {f.sourceClause}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
