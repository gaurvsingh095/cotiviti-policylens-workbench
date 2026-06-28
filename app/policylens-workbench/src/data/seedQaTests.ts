import type { QaTest } from "../types/policy";
import { SEED_DOMAINS } from "./seedPolicies";
import { generateQaTests } from "../logic/qaGenerator";

// QA tests are generated deterministically from each domain's cases and linked
// to the rules they exercise.

export function qaTestsForDomain(domainId: string): QaTest[] {
  const dom = SEED_DOMAINS.find((d) => d.domainId === domainId);
  return dom ? generateQaTests(dom) : [];
}

export const ALL_QA_TESTS: QaTest[] = SEED_DOMAINS.flatMap((d) => generateQaTests(d));
