import { useStore } from "../store";
import { DomainIcon } from "../components/icons";
import { RiskBadge } from "../components/StatusBadge";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";
import { Workflow, Server, ArrowRight } from "lucide-react";

const RISK_SCORE = { high: 3, medium: 2, low: 1 } as const;

export function ImpactMap({ setPage }: { setPage: (id: string) => void }) {
  const { domain } = useStore();

  const radarData = domain.impactedTeams.map((t) => ({
    team: t.team,
    risk: RISK_SCORE[t.risk],
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-800">Impact Map</h1>
          <p className="mt-1 text-sm text-slate-500">
            Teams, workflows, systems, and risk affected by the {domain.name} change.
          </p>
        </div>
        <button className="btn-ghost" onClick={() => setPage("rule-studio")}>
          Review candidate rules <ArrowRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {domain.impactedTeams.map((t) => (
            <div key={t.team} className="card card-pad">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                    <DomainIcon name={t.icon} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy-800">{t.team}</p>
                    <p className="text-xs text-slate-500">{t.note}</p>
                  </div>
                </div>
                <RiskBadge risk={t.risk} />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Workflow size={13} className="text-teal-600" /> {t.workflow}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Server size={13} className="text-navy-500" /> {t.system}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="card card-pad">
          <h2 className="section-title text-base">Risk profile</h2>
          <p className="mt-0.5 text-xs text-slate-500">Relative risk by impacted team</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="team" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Radar dataKey="risk" stroke="#15916f" fill="#15916f" fillOpacity={0.35} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400">3 = high · 2 = medium · 1 = low</p>
        </div>
      </div>
    </div>
  );
}
