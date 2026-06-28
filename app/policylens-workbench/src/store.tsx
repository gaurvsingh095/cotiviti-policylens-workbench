import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PolicyDomain, ReviewerDecision, RuleStatus } from "./types/policy";
import { SEED_DOMAINS } from "./data/seedPolicies";

const LS_DECISIONS = "policylens.decisions.v1";
const LS_DOMAIN = "policylens.domain.v1";

interface StoreValue {
  domains: PolicyDomain[];
  domainId: string;
  domain: PolicyDomain;
  setDomainId: (id: string) => void;
  decisions: Record<string, ReviewerDecision>;
  setDecision: (ruleId: string, status: RuleStatus, note?: string) => void;
  resetDecisions: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadDecisions(): Record<string, ReviewerDecision> {
  try {
    const raw = localStorage.getItem(LS_DECISIONS);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {};
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [domainId, setDomainIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(LS_DOMAIN) ?? SEED_DOMAINS[0].domainId;
    } catch {
      return SEED_DOMAINS[0].domainId;
    }
  });
  const [decisions, setDecisions] = useState<Record<string, ReviewerDecision>>(loadDecisions);

  useEffect(() => {
    try {
      localStorage.setItem(LS_DECISIONS, JSON.stringify(decisions));
    } catch {
      /* ignore */
    }
  }, [decisions]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_DOMAIN, domainId);
    } catch {
      /* ignore */
    }
  }, [domainId]);

  const domain = useMemo(
    () => SEED_DOMAINS.find((d) => d.domainId === domainId) ?? SEED_DOMAINS[0],
    [domainId],
  );

  const value: StoreValue = {
    domains: SEED_DOMAINS,
    domainId,
    domain,
    setDomainId: setDomainIdState,
    decisions,
    setDecision: (ruleId, status, note) =>
      setDecisions((prev) => ({
        ...prev,
        [ruleId]: {
          ruleId,
          status,
          note: note ?? prev[ruleId]?.note ?? "",
          decidedAt: status === "pending" ? null : new Date().toISOString(),
        },
      })),
    resetDecisions: () => setDecisions({}),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
