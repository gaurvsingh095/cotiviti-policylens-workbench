import { useStore } from "../store";
import { generateQaTests, qaCoverageByRule } from "../logic/qaGenerator";
import { StatusBadge } from "../components/StatusBadge";
import { STATUS_TONE } from "../logic/policyEngine";
import { ListChecks, Link2 } from "lucide-react";

export function QATests() {
  const { domain } = useStore();
  const tests = generateQaTests(domain);
  const coverage = qaCoverageByRule(domain);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800">QA Tests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Synthetic QA tests generated from {domain.name} cases. Each test is linked to a rule and records the
          deterministic expected status.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card card-pad">
          <p className="eyebrow">Total tests</p>
          <p className="mt-1 text-2xl font-semibold text-navy-800">{tests.length}</p>
        </div>
        <div className="card card-pad">
          <p className="eyebrow">Rules covered</p>
          <p className="mt-1 text-2xl font-semibold text-navy-800">
            {coverage.filter((c) => c.tests > 0).length}/{domain.rules.length}
          </p>
        </div>
        <div className="card card-pad">
          <p className="eyebrow">Cases exercised</p>
          <p className="mt-1 text-2xl font-semibold text-navy-800">{domain.cases.length}</p>
        </div>
        <div className="card card-pad">
          <p className="eyebrow">Linkage</p>
          <p className="mt-1 text-2xl font-semibold text-navy-800">100%</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <ListChecks size={16} className="text-teal-600" />
          <p className="text-sm font-semibold text-navy-800">Generated test cases</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Rule</th>
                <th>Name</th>
                <th>Given</th>
                <th>Expected status</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.testId}>
                  <td className="font-mono text-xs text-navy-700">{t.testId}</td>
                  <td>
                    <span className="inline-flex items-center gap-1 rounded-md bg-navy-50 px-2 py-0.5 font-mono text-xs text-navy-700">
                      <Link2 size={11} /> {t.ruleId}
                    </span>
                  </td>
                  <td className="text-navy-700">{t.name}</td>
                  <td className="max-w-xs text-xs text-slate-500">{t.given}</td>
                  <td>
                    <StatusBadge tone={STATUS_TONE[t.expectedStatus] ?? "neutral"}>{t.expectedStatus}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card-pad">
        <p className="mb-3 text-sm font-semibold text-navy-800">Coverage by rule</p>
        <div className="flex flex-wrap gap-2">
          {coverage.map((c) => (
            <StatusBadge key={c.ruleId} tone={c.tests > 0 ? "ok" : "neutral"}>
              {c.ruleId}: {c.tests} {c.tests === 1 ? "test" : "tests"}
            </StatusBadge>
          ))}
        </div>
      </div>
    </div>
  );
}
