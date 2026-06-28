import type { PolicyDomain, QaTest } from "../types/policy";
import { evaluateCase } from "./policyEngine";

// Generates synthetic QA tests from each domain's cases. Every test is linked to
// a real rule (the most relevant fired rule) and records the expected output
// status produced by the deterministic engine — so QA stays in lockstep with the
// rules it covers.

function pickRuleForCase(dom: PolicyDomain, caseId: string, firedRuleIds: string[]): string {
  // Prefer a rule whose id is hinted by the case, else the first failing/notable rule.
  const firstHard = dom.rules.find((r) => r.severity === "hard" && firedRuleIds.includes(r.ruleId));
  void caseId;
  return firstHard?.ruleId ?? firedRuleIds[0] ?? dom.rules[0].ruleId;
}

export function generateQaTests(dom: PolicyDomain): QaTest[] {
  const tests: QaTest[] = [];
  dom.cases.forEach((c, i) => {
    const result = evaluateCase(dom, c.values);
    // rules that produced a non-pass finding are the "interesting" ones for this case
    const notable = result.findings
      .filter((f) => f.status !== "pass")
      .map((f) => f.ruleId);
    const ruleId = pickRuleForCase(dom, c.id, notable.length ? notable : result.findings.map((f) => f.ruleId));
    tests.push({
      testId: `${dom.domainId.toUpperCase().slice(0, 3)}-QA-${String(i + 1).padStart(2, "0")}`,
      ruleId,
      name: `${c.label} → ${result.statusLabel}`,
      given: c.description,
      expectedStatus: result.status,
      caseId: c.id,
    });
  });
  return tests;
}

export function qaCoverageByRule(dom: PolicyDomain): { ruleId: string; tests: number }[] {
  const tests = generateQaTests(dom);
  return dom.rules.map((r) => ({
    ruleId: r.ruleId,
    tests: tests.filter((t) => t.ruleId === r.ruleId).length,
  }));
}
