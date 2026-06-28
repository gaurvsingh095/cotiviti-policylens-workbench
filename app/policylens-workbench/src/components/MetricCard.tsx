import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  sub,
  icon,
  accent = "navy",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: "navy" | "teal" | "blue" | "amber";
}) {
  const accentMap = {
    navy: "text-navy-700 bg-navy-50",
    teal: "text-teal-700 bg-teal-50",
    blue: "text-blue-700 bg-blue-50",
    amber: "text-amber-700 bg-amber-50",
  } as const;
  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-navy-800 tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        {icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentMap[accent]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
