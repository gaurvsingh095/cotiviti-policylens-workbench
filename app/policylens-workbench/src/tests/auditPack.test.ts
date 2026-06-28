import { describe, it, expect } from "vitest";
import { SEED_DOMAINS } from "../data/seedPolicies";
import { evaluateCase } from "../logic/policyEngine";
import { buildAuditPackage, auditPackageToJson, RESPONSIBLE_USE_NOTE } from "../logic/auditPack";
import type { ReviewerDecision } from "../types/policy";

describe("audit package", () => {
  const domain = SEED_DOMAINS[0];
  const values = domain.cases[0].values;
  const result = evaluateCase(domain, values);

  it("includes every required section", () => {
    const pkg = buildAuditPackage(domain, values, result, {});
    expect(pkg.policy.domainId).toBe(domain.domainId);
    expect(pkg.policy.oldVersion).toBe(domain.oldVersion);
    expect(pkg.policy.newVersion).toBe(domain.newVersion);
    expect(pkg.changes.length).toBeGreaterThan(0);
    expect(pkg.impactedTeams.length).toBeGreaterThan(0);
    expect(pkg.rules.length).toBe(domain.rules.length);
    expect(pkg.qaTests.length).toBeGreaterThan(0);
    expect(pkg.scenario.result.status).toBe(result.status);
    expect(pkg.traceability.rows.length).toBe(result.findings.length);
    expect(pkg.responsibleUse).toBe(RESPONSIBLE_USE_NOTE);
  });

  it("reflects reviewer decisions in the package", () => {
    const decisions: Record<string, ReviewerDecision> = {
      [domain.rules[0].ruleId]: {
        ruleId: domain.rules[0].ruleId,
        status: "approved",
        note: "Looks correct.",
        decidedAt: new Date().toISOString(),
      },
    };
    const pkg = buildAuditPackage(domain, values, result, decisions);
    const reviewed = pkg.rules.find((r) => r.ruleId === domain.rules[0].ruleId);
    expect(reviewed?.reviewStatus).toBe("approved");
    expect(reviewed?.reviewerNote).toBe("Looks correct.");
    // undecided rules default to pending
    const other = pkg.rules.find((r) => r.ruleId === domain.rules[1].ruleId);
    expect(other?.reviewStatus).toBe("pending");
  });

  it("reports 100% traceability on the default case", () => {
    const pkg = buildAuditPackage(domain, values, result, {});
    expect(pkg.traceability.coveragePercent).toBe(100);
  });

  it("serializes to valid JSON", () => {
    const pkg = buildAuditPackage(domain, values, result, {});
    const json = auditPackageToJson(pkg);
    const parsed = JSON.parse(json);
    expect(parsed.tool).toBe("PolicyLens Workbench");
    expect(parsed.policy.name).toBe(domain.name);
  });

  it("builds a package for every domain without error", () => {
    for (const d of SEED_DOMAINS) {
      const r = evaluateCase(d, d.cases[0].values);
      const pkg = buildAuditPackage(d, d.cases[0].values, r, {});
      expect(pkg.rules.length).toBe(d.rules.length);
      expect(pkg.qaTests.length).toBe(d.cases.length);
    }
  });
});
