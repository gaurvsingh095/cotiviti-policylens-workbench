import type { ReactNode } from "react";

type Tone = "ok" | "warn" | "block" | "info" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  ok: "bg-teal-50 text-teal-700 border-teal-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  block: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

export function StatusBadge({
  tone = "neutral",
  children,
  icon,
}: {
  tone?: Tone;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

const RULE_STATUS_TONE: Record<string, Tone> = {
  approved: "ok",
  rejected: "block",
  revision_requested: "warn",
  pending: "neutral",
};

const RULE_STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  rejected: "Rejected",
  revision_requested: "Revision requested",
  pending: "Pending",
};

export function RuleStatusBadge({ status }: { status: string }) {
  return <StatusBadge tone={RULE_STATUS_TONE[status] ?? "neutral"}>{RULE_STATUS_LABEL[status] ?? status}</StatusBadge>;
}

const SEVERITY_TONE: Record<string, Tone> = { hard: "block", soft: "warn", info: "info" };
export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <StatusBadge tone={SEVERITY_TONE[severity] ?? "neutral"}>{severity}</StatusBadge>
  );
}

const RISK_TONE: Record<string, Tone> = { high: "block", medium: "warn", low: "ok" };
export function RiskBadge({ risk }: { risk: string }) {
  return <StatusBadge tone={RISK_TONE[risk] ?? "neutral"}>{risk} risk</StatusBadge>;
}
