import { useStore } from "../store";
import { PolicySelector } from "./PolicySelector";
import { NAV_ITEMS } from "../nav";
import { ShieldCheck, WifiOff, Lock } from "lucide-react";

export function Header({ page }: { page: string }) {
  const { domain } = useStore();
  const nav = NAV_ITEMS.find((n) => n.id === page);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex flex-col gap-3 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[15px] font-semibold text-navy-800">{nav?.label ?? "PolicyLens"}</p>
          <p className="text-xs text-slate-500">
            {domain.name} · {domain.oldVersion} → {domain.newVersion} · {domain.category}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
              <ShieldCheck size={12} /> Synthetic
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              <Lock size={12} /> No PHI
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              <WifiOff size={12} /> Offline
            </span>
          </div>
          <PolicySelector compact />
        </div>
      </div>
    </header>
  );
}
