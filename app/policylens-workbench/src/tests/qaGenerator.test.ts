import { describe, it, expect } from "vitest";
import { SEED_DOMAINS } from "../data/seedPolicies";
import { generateQaTests, qaCoverageByRule } from "../logic/qaGenerator";

describe("qa generator", () => {
  it("generates at least one test per domain", () => {
    for (const d of SEED_DOMAINS) {
      expect(generateQaTests(d).length).toBeGreaterThan(0);
    }
  });

  it("links every generated test to a real rule in the domain", () => {
    for (const d of SEED_DOMAINS) {
      const ruleIds = new Set(d.rules.map((r) => r.ruleId));
      for (const t of generateQaTests(d)) {
        expect(ruleIds.has(t.ruleId)).toBe(true);
      }
    }
  });

  it("records an expected status for every test", () => {
    for (const d of SEED_DOMAINS) {
      for (const t of generateQaTests(d)) {
        expect(t.expectedStatus.length).toBeGreaterThan(0);
        expect(t.caseId.length).toBeGreaterThan(0);
        expect(t.testId.length).toBeGreaterThan(0);
      }
    }
  });

  it("produces unique test ids within a domain", () => {
    for (const d of SEED_DOMAINS) {
      const ids = generateQaTests(d).map((t) => t.testId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("reports coverage counts that sum to the number of tests", () => {
    for (const d of SEED_DOMAINS) {
      const tests = generateQaTests(d);
      const cov = qaCoverageByRule(d);
      const summed = cov.reduce((n, c) => n + c.tests, 0);
      expect(summed).toBe(tests.length);
    }
  });
});
