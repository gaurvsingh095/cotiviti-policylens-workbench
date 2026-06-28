import type { CandidateRule } from "../types/policy";
import { SEED_DOMAINS } from "./seedPolicies";

// Flat view of all candidate rules across domains (derived from seedPolicies so
// there is a single source of truth).

export const SEED_RULES: CandidateRule[] = SEED_DOMAINS.flatMap((d) => d.rules);

export function rulesForDomain(domainId: string): CandidateRule[] {
  return SEED_RULES.filter((r) => r.domainId === domainId);
}
