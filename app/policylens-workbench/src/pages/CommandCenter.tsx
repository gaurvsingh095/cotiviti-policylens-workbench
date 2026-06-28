import { useStore } from "../store";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { DomainIcon } from "../components/icons";
import {
  ruleCount,
  qaTestCount,
  changeCount,
  reviewProgress,
  rulesPerDomain,
} from "../logic/metrics";
import { totalChanges } from "../logic/diffEngine";
import { generateQaTests } from "../logic/qaGenerator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";
import { Boxes, FileStack, ListChecks, ShieldCheck, ArrowRight } from "lucide-react";

export function CommandCenter({ setPage }: { setPage: (id: string) => void }) {
  const { domains, domain, decisions, setDomainId } = useStore();

  const progress = reviewProgress(domains, decisions);
  const perDomain = rulesPerDomain(domains);
  const pieData = [
    { name: "Approved", value: progress.approved, color: "#0e7458" },
    { name: "Revision", value: progress.revision, color: "#d9a514" },
    { name: "Rejected", value: progress.rejected, color: "#b91c1c" },
    { name: "Pending", value: progress.pending, color: "#94a3b8" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800">Command Center</h1>
        <p className="mt-1 text-sm text-slate-500">
          Portfolio view across {domains.length} synthetic policy domains. Selected domain drives every page.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Policy domains" value={domains.length} icon={<Boxes size={18} />} accent="navy" sub="Synthetic, versioned" />
        <MetricCard label="Candidate rules" value={ruleCount(domains)} icon={<FileStack size={18} />} accent="teal" sub="Source-cited" />
        <MetricCard label="Generated QA tests" value={qaTestCount(domains)} icon={<ListChecks size={18} />} accent="blue" sub="Linked to rules" />
        <MetricCard label="Tracked changes" value={changeCount(domains)} icon={<ShieldCheck size={18} />} accent="amber" sub="Across versions" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card card-pad lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title text-base">Rules and QA coverage by domain</h2>
            <StatusBadge tone="info">live</StatusBadge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perDomain} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="domain" tick={{ fontSize: 11, fill: "#64748b" }} angle={-12} textAnchor="end" height={48} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="rules" name="Rules" fill="#26466e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qa" name="QA tests" fill="#15916f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="section-title text-base">Reviewer progress</h2>
          <p className="mt-0.5 text-xs text-slate-500">{progress.percentComplete}% of rules decided</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={42} outerRadius={64} paddingAngle={2}>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-slate-600">{d.name}</span>
                <span className="ml-auto font-semibold text-navy-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title text-base">Domain portfolio</h2>
          <button className="btn-ghost text-xs" onClick={() => setPage("policy-library")}>
            Open Policy Library <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {domains.map((d) => {
            const active = d.domainId === domain.domainId;
            return (
              <button
                key={d.domainId}
                onClick={() => {
                  setDomainId(d.domainId);
                  setPage("version-diff");
                }}
                className={`group flex flex-col rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                  active ? "border-teal-300 bg-teal-50/40" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                    <DomainIcon name={d.icon} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-800">{d.name}</p>
                    <p className="text-[11px] text-slate-500">{d.category}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                  <span>{d.rules.length} rules</span>
                  <span>·</span>
                  <span>{totalChanges(d)} changes</span>
                  <span>·</span>
                  <span>{generateQaTests(d).length} QA</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
