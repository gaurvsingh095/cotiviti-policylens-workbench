import { NAV_ITEMS, type NavItem } from "../nav";
import {
  Gauge,
  Library,
  GitCompare,
  Network,
  SlidersHorizontal,
  FlaskConical,
  ListChecks,
  Inbox,
  Package,
  Sparkles,
  Scale,
  Focus,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  gauge: Gauge,
  library: Library,
  "git-compare": GitCompare,
  network: Network,
  sliders: SlidersHorizontal,
  flask: FlaskConical,
  "check-checks": ListChecks,
  inbox: Inbox,
  package: Package,
  sparkles: Sparkles,
  scale: Scale,
};

const GROUPS: NavItem["group"][] = ["Operate", "Analyze", "Govern"];

export function Sidebar({
  page,
  setPage,
}: {
  page: string;
  setPage: (id: string) => void;
}) {
  return (
    <aside className="flex h-full w-64 flex-col bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 text-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-teal-300">
          <Focus size={20} />
        </div>
        <div>
          <p className="text-[15px] font-semibold leading-tight">PolicyLens</p>
          <p className="text-[11px] tracking-wide text-navy-200">WORKBENCH</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {GROUPS.map((group) => (
          <div key={group}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-300/70">
              {group}
            </p>
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
                const Icon = ICONS[item.icon] ?? Gauge;
                const active = page === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className={`nav-link w-full text-left ${active ? "nav-link-active" : ""}`}
                  >
                    <Icon size={17} className={active ? "text-teal-300" : "text-navy-200"} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-[11px] leading-relaxed text-navy-200/80">
          Synthetic data only. No PHI. Not for real medical, payment, or coverage decisions.
        </p>
      </div>
    </aside>
  );
}
