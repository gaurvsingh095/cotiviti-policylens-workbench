import type {
  PolicyDomain,
  EvaluationResult,
  ReviewerDecision,
} from "../types/policy";
import { buildAuditTrail, traceabilityCoverage } from "./policyEngine";
import { generateQaTests } from "./qaGenerator";

export const RESPONSIBLE_USE_NOTE =
  "PolicyLens Workbench is a proof-of-concept. It uses synthetic policy text and synthetic case data. It does not process PHI and does not make real medical, payment, or coverage decisions. Every extracted rule requires human validation before operational use.";

export interface AuditPackage {
  generatedAt: string;
  tool: string;
  responsibleUse: string;
  policy: {
    domainId: string;
    name: string;
    category: string;
    oldVersion: string;
    newVersion: string;
    effectiveDate: string;
    summary: string[];
    whyItMatters: string;
  };
  changes: PolicyDomain["changedClauses"];
  impactedTeams: PolicyDomain["impactedTeams"];
  rules: {
    ruleId: string;
    condition: string;
    severity: string;
    sourceClause: string;
    reviewStatus: string;
    reviewerNote: string;
    humanReviewRequired: boolean;
  }[];
  qaTests: ReturnType<typeof generateQaTests>;
  scenario: {
    caseValues: Record<string, number | boolean | string>;
    result: EvaluationResult;
  };
  traceability: {
    coveragePercent: number;
    rows: ReturnType<typeof buildAuditTrail>;
  };
}

export function buildAuditPackage(
  dom: PolicyDomain,
  caseValues: Record<string, number | boolean | string>,
  result: EvaluationResult,
  decisions: Record<string, ReviewerDecision>,
): AuditPackage {
  return {
    generatedAt: new Date().toISOString(),
    tool: "PolicyLens Workbench",
    responsibleUse: RESPONSIBLE_USE_NOTE,
    policy: {
      domainId: dom.domainId,
      name: dom.name,
      category: dom.category,
      oldVersion: dom.oldVersion,
      newVersion: dom.newVersion,
      effectiveDate: dom.effectiveDate,
      summary: dom.summary,
      whyItMatters: dom.whyItMatters,
    },
    changes: dom.changedClauses,
    impactedTeams: dom.impactedTeams,
    rules: dom.rules.map((r) => {
      const d = decisions[r.ruleId];
      return {
        ruleId: r.ruleId,
        condition: r.condition,
        severity: r.severity,
        sourceClause: r.sourceClause,
        reviewStatus: d?.status ?? "pending",
        reviewerNote: d?.note ?? "",
        humanReviewRequired: r.humanReviewRequired,
      };
    }),
    qaTests: generateQaTests(dom),
    scenario: { caseValues, result },
    traceability: {
      coveragePercent: traceabilityCoverage(result),
      rows: buildAuditTrail(dom, result),
    },
  };
}

export function auditPackageToJson(pkg: AuditPackage): string {
  return JSON.stringify(pkg, null, 2);
}
