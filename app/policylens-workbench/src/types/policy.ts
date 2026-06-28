// Core domain types for PolicyLens Workbench.
// All data is synthetic. No PHI, no real patient or payment data.

export type RuleSeverity = "hard" | "soft" | "info";
export type RuleStatus = "pending" | "approved" | "rejected" | "revision_requested";
export type ChangeType =
  | "REQUIREMENT_CHANGED"
  | "NEW_DOCUMENTATION"
  | "TIMELINE_CHANGED"
  | "AUDIT_REQUIREMENT_ADDED"
  | "CODING_RULE_UPDATED"
  | "THRESHOLD_CHANGED"
  | "CLAUSE_ADDED"
  | "CLAUSE_REMOVED";

export type FieldKind = "int" | "bool" | "select";

export interface CaseField {
  key: string;
  label: string;
  kind: FieldKind;
  default: number | boolean | string;
  help?: string;
  min?: number;
  max?: number;
  options?: string[];
}

export interface SyntheticCase {
  id: string;
  label: string;
  description: string;
  values: Record<string, number | boolean | string>;
}

export interface CandidateRule {
  ruleId: string;
  domainId: string;
  ruleType: string;
  condition: string;
  threshold: string;
  action: string;
  severity: RuleSeverity;
  sourceClause: string;
  humanReviewRequired: boolean;
}

export interface ChangedClause {
  changeType: ChangeType;
  oldText: string;
  newText: string;
  note: string;
}

export interface ImpactedTeam {
  team: string;
  icon: string;
  workflow: string;
  system: string;
  risk: "low" | "medium" | "high";
  note: string;
}

export interface QaTest {
  testId: string;
  ruleId: string;
  name: string;
  given: string;
  expectedStatus: string;
  caseId: string;
}

export interface PolicyDomain {
  domainId: string;
  name: string;
  category: string;
  icon: string;
  oldVersion: string;
  newVersion: string;
  effectiveDate: string;
  oldText: string;
  newText: string;
  summary: string[];
  whyItMatters: string;
  changedClauses: ChangedClause[];
  rules: CandidateRule[];
  impactedTeams: ImpactedTeam[];
  caseFields: CaseField[];
  cases: SyntheticCase[];
  qaTests: QaTest[];
}

export interface Finding {
  ruleId: string;
  ruleType: string;
  status: "pass" | "fail" | "needs_documentation" | "needs_review";
  message: string;
  sourceClause: string;
}

export interface EvaluationResult {
  domainId: string;
  status: string;
  statusLabel: string;
  tone: "ok" | "warn" | "block" | "info";
  headline: string;
  explanation: string;
  missingCriteria: string[];
  findings: Finding[];
  humanReviewRequired: boolean;
}

export interface AuditTrailRow {
  sourceClause: string;
  ruleId: string;
  ruleCondition: string;
  finding: string;
  findingStatus: string;
  outputStatus: string;
}

// Reviewer state lives in app state / localStorage, keyed by ruleId.
export interface ReviewerDecision {
  ruleId: string;
  status: RuleStatus;
  note: string;
  decidedAt: string | null;
}
