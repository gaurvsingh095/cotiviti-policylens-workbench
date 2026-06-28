import { useStore } from "../store";
import { DomainIcon } from "./icons";
import { ChevronDown } from "lucide-react";

export function PolicySelector({ compact = false }: { compact?: boolean }) {
  const { domains, domainId, setDomainId, domain } = useStore();
  return (
    <label className={`relative block ${compact ? "w-56" : "w-full"}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-600">
        <DomainIcon name={domain.icon} size={16} />
      </span>
      <select
        aria-label="Select policy domain"
        value={domainId}
        onChange={(e) => setDomainId(e.target.value)}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm font-medium text-navy-800 shadow-sm hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
      >
        {domains.map((d) => (
          <option key={d.domainId} value={d.domainId}>
            {d.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </label>
  );
}
