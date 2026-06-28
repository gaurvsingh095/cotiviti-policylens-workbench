import type { PolicyDomain, ChangedClause, ChangeType } from "../types/policy";

// Surfaces the curated changed clauses for a domain, plus light helpers used by
// the Version Diff page. The seed data carries human-authored change labels; the
// engine groups and counts them for display.

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  REQUIREMENT_CHANGED: "Requirement changed",
  NEW_DOCUMENTATION: "New documentation",
  TIMELINE_CHANGED: "Timeline changed",
  AUDIT_REQUIREMENT_ADDED: "Audit requirement added",
  CODING_RULE_UPDATED: "Coding rule updated",
  THRESHOLD_CHANGED: "Threshold changed",
  CLAUSE_ADDED: "Clause added",
  CLAUSE_REMOVED: "Clause removed",
};

export function getChangedClauses(dom: PolicyDomain): ChangedClause[] {
  return dom.changedClauses;
}

export function changeCountsByType(dom: PolicyDomain): { type: ChangeType; label: string; count: number }[] {
  const counts = new Map<ChangeType, number>();
  for (const c of dom.changedClauses) counts.set(c.changeType, (counts.get(c.changeType) ?? 0) + 1);
  return Array.from(counts.entries()).map(([type, count]) => ({
    type,
    label: CHANGE_TYPE_LABELS[type],
    count,
  }));
}

export function totalChanges(dom: PolicyDomain): number {
  return dom.changedClauses.length;
}
