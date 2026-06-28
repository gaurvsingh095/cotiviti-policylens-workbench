import type { PolicyDomain, ReviewerDecision } from "../types/policy";
import { generateQaTests } from "./qaGenerator";
import { totalChanges } from "./diffEngine";

// Lightweight metrics for the Command Center and charts. Pure functions over the
// seed domains and current reviewer state.

export function ruleCount(domains: PolicyDomain[]): number {
  return domains.reduce((n, d) => n + d.rules.length, 0);
}

export function qaTestCount(domains: PolicyDomain[]): number {
  return domains.reduce((n, d) => n + generateQaTests(d).length, 0);
}

export function changeCount(domains: PolicyDomain[]): number {
  return domains.reduce((n, d) => n + totalChanges(d), 0);
}

export function caseCount(domains: PolicyDomain[]): number {
  return domains.reduce((n, d) => n + d.cases.length, 0);
}

export interface ReviewProgress {
  approved: number;
  rejected: number;
  revision: number;
  pending: number;
  total: number;
  percentComplete: number;
}

export function reviewProgress(
  domains: PolicyDomain[],
  decisions: Record<string, ReviewerDecision>,
): ReviewProgress {
  let approved = 0, rejected = 0, revision = 0, pending = 0, total = 0;
  for (const d of domains) {
    for (const r of d.rules) {
      total++;
      const status = decisions[r.ruleId]?.status ?? "pending";
      if (status === "approved") approved++;
      else if (status === "rejected") rejected++;
      else if (status === "revision_requested") revision++;
      else pending++;
    }
  }
  const decided = approved + rejected + revision;
  return {
    approved, rejected, revision, pending, total,
    percentComplete: total ? Math.round((100 * decided) / total) : 0,
  };
}

export function riskByDomain(domains: PolicyDomain[]): { domain: string; high: number; medium: number; low: number }[] {
  return domains.map((d) => {
    const high = d.impactedTeams.filter((t) => t.risk === "high").length;
    const medium = d.impactedTeams.filter((t) => t.risk === "medium").length;
    const low = d.impactedTeams.filter((t) => t.risk === "low").length;
    return { domain: d.name.split(" ")[0], high, medium, low };
  });
}

export function rulesPerDomain(domains: PolicyDomain[]): { domain: string; rules: number; qa: number }[] {
  return domains.map((d) => ({
    domain: d.name.split(" ").slice(0, 2).join(" "),
    rules: d.rules.length,
    qa: generateQaTests(d).length,
  }));
}
