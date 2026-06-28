import type { SyntheticCase, CaseField } from "../types/policy";
import { SEED_DOMAINS } from "./seedPolicies";

// Synthetic cases and their editable fields, derived per domain. No PHI.

export function casesForDomain(domainId: string): SyntheticCase[] {
  return SEED_DOMAINS.find((d) => d.domainId === domainId)?.cases ?? [];
}

export function caseFieldsForDomain(domainId: string): CaseField[] {
  return SEED_DOMAINS.find((d) => d.domainId === domainId)?.caseFields ?? [];
}

export const ALL_CASES: SyntheticCase[] = SEED_DOMAINS.flatMap((d) => d.cases);
