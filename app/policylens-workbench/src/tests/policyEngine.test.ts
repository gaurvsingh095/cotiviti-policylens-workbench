import { describe, it, expect } from "vitest";
import { SEED_DOMAINS } from "../data/seedPolicies";
import {
  evaluateCase,
  buildAuditTrail,
  traceabilityCoverage,
  STATUS,
} from "../logic/policyEngine";
import type { PolicyDomain } from "../types/policy";

function dom(id: string): PolicyDomain {
  const d = SEED_DOMAINS.find((x) => x.domainId === id);
  if (!d) throw new Error(`missing domain ${id}`);
  return d;
}

function ruleIds(result: ReturnType<typeof evaluateCase>): Set<string> {
  return new Set(result.findings.map((f) => f.ruleId));
}

describe("imaging scenarios", () => {
  it("fails when conservative therapy is under the threshold", () => {
    const r = evaluateCase(dom("imaging"), {
      patient_age: 52, conservative_therapy_weeks: 5, clinical_notes_included: true, urgent: false,
    });
    expect(r.status).toBe(STATUS.NOT_APPROVED);
    expect(ruleIds(r).has("R003")).toBe(true);
  });
  it("pends when clinical notes are missing", () => {
    const r = evaluateCase(dom("imaging"), {
      patient_age: 52, conservative_therapy_weeks: 6, clinical_notes_included: false, urgent: false,
    });
    expect(r.status).toBe(STATUS.PENDED);
  });
  it("routes urgent within 72 hours", () => {
    const r = evaluateCase(dom("imaging"), {
      patient_age: 52, conservative_therapy_weeks: 0, clinical_notes_included: true, urgent: true,
    });
    expect(r.status).toBe(STATUS.URGENT);
  });
  it("approves when all criteria are met", () => {
    const r = evaluateCase(dom("imaging"), {
      patient_age: 52, conservative_therapy_weeks: 6, clinical_notes_included: true, urgent: false,
    });
    expect(r.status).toBe(STATUS.APPROVED);
  });
  it("escalates an underage member to human review", () => {
    const r = evaluateCase(dom("imaging"), {
      patient_age: 17, conservative_therapy_weeks: 6, clinical_notes_included: true, urgent: false,
    });
    expect(r.status).toBe(STATUS.HUMAN);
    expect(ruleIds(r).has("R001")).toBe(true);
  });
});

describe("billing scenarios", () => {
  it("pends when modifier 59 documentation is missing", () => {
    const r = evaluateCase(dom("billing"), {
      modifier_59_present: true, distinct_service_documented: false,
      duplicate_line_item: false, same_member_provider_date_code: false,
    });
    expect(r.status).toBe(STATUS.PENDED);
    expect(ruleIds(r).has("B001")).toBe(true);
  });
  it("flags a four-key duplicate for pre-payment review", () => {
    const r = evaluateCase(dom("billing"), {
      modifier_59_present: false, distinct_service_documented: false,
      duplicate_line_item: true, same_member_provider_date_code: true,
    });
    expect(r.status).toBe(STATUS.FLAGGED);
  });
  it("passes a clean claim", () => {
    const r = evaluateCase(dom("billing"), {
      modifier_59_present: true, distinct_service_documented: true,
      duplicate_line_item: false, same_member_provider_date_code: false,
    });
    expect(r.status).toBe(STATUS.PASSED);
  });
});

describe("clinical scenarios", () => {
  it("pends when documentation elements are missing", () => {
    const r = evaluateCase(dom("clinical"), {
      diagnosis_present: true, history_present: false,
      prior_treatment_present: false, provider_rationale_present: true,
    });
    expect(r.status).toBe(STATUS.PENDED);
    expect(ruleIds(r).has("C003")).toBe(true);
    expect(ruleIds(r).has("C004")).toBe(true);
  });
  it("completes when all elements present", () => {
    const r = evaluateCase(dom("clinical"), {
      diagnosis_present: true, history_present: true,
      prior_treatment_present: true, provider_rationale_present: true,
    });
    expect(r.status).toBe(STATUS.DOCS_COMPLETE);
    expect(r.missingCriteria).toHaveLength(0);
  });
});

describe("risk adjustment scenarios", () => {
  it("blocks carry-forward without current-year reassessment", () => {
    const r = evaluateCase(dom("risk_adjustment"), {
      assessed_current_year: false, face_to_face_encounter: false,
      documentation_retained: true, carried_from_prior_year: true,
    });
    expect(r.status).toBe(STATUS.BLOCKED);
    expect(ruleIds(r).has("RA01")).toBe(true);
  });
  it("supports a reassessed diagnosis with an encounter", () => {
    const r = evaluateCase(dom("risk_adjustment"), {
      assessed_current_year: true, face_to_face_encounter: true,
      documentation_retained: true, carried_from_prior_year: false,
    });
    expect(r.status).toBe(STATUS.DOCS_COMPLETE);
  });
});

describe("quality scenarios", () => {
  it("pends an unsupported numerator hit", () => {
    const r = evaluateCase(dom("quality"), {
      evidence_record_present: false, result_value_present: false,
      numerator_hit: true, exclusion_code_present: false,
    });
    expect(r.status).toBe(STATUS.PENDED);
  });
  it("accepts a coded exclusion", () => {
    const r = evaluateCase(dom("quality"), {
      evidence_record_present: false, result_value_present: false,
      numerator_hit: false, exclusion_code_present: true,
    });
    expect(r.status).toBe(STATUS.PASSED);
    expect(ruleIds(r).has("Q003")).toBe(true);
  });
});

describe("contract scenarios", () => {
  it("blocks a claim past the timely filing limit", () => {
    const r = evaluateCase(dom("contract"), {
      days_to_payment: 20, fee_schedule_2026: true, days_since_service: 120, clean_claim: true,
    });
    expect(r.status).toBe(STATUS.BLOCKED);
    expect(ruleIds(r).has("K003")).toBe(true);
  });
  it("flags a prompt-pay / fee-schedule breach", () => {
    const r = evaluateCase(dom("contract"), {
      days_to_payment: 41, fee_schedule_2026: false, days_since_service: 60, clean_claim: true,
    });
    expect(r.status).toBe(STATUS.SLA_BREACH);
  });
});

describe("cms regulatory scenarios", () => {
  it("flags a standard decision past 7 days", () => {
    const r = evaluateCase(dom("cms_regulatory"), {
      decision_days: 9, expedited: false, rationale_included: true, appeal_rights_included: true,
    });
    expect(r.status).toBe(STATUS.SLA_BREACH);
  });
  it("flags an expedited decision past 72 hours", () => {
    const r = evaluateCase(dom("cms_regulatory"), {
      decision_days: 4, expedited: true, rationale_included: true, appeal_rights_included: true,
    });
    expect(r.status).toBe(STATUS.SLA_BREACH);
    expect(ruleIds(r).has("M002")).toBe(true);
  });
});

describe("traceability", () => {
  it("every finding on every default case cites a source clause (100%)", () => {
    for (const d of SEED_DOMAINS) {
      const r = evaluateCase(d, d.cases[0].values);
      expect(traceabilityCoverage(r)).toBe(100);
      for (const f of r.findings) expect(f.sourceClause.trim().length).toBeGreaterThan(0);
    }
  });
  it("builds an audit trail whose output status matches the result", () => {
    const d = dom("imaging");
    const r = evaluateCase(d, d.cases[0].values);
    const trail = buildAuditTrail(d, r);
    expect(trail.length).toBe(r.findings.length);
    for (const row of trail) {
      expect(row.sourceClause.trim().length).toBeGreaterThan(0);
      expect(row.outputStatus).toBe(r.status);
    }
  });
});

describe("seed data completeness", () => {
  it("has at least 7 domains", () => {
    expect(SEED_DOMAINS.length).toBeGreaterThanOrEqual(7);
  });
  it("no domain is missing seed data", () => {
    for (const d of SEED_DOMAINS) {
      expect(d.rules.length).toBeGreaterThan(0);
      expect(d.cases.length).toBeGreaterThan(0);
      expect(d.caseFields.length).toBeGreaterThan(0);
      expect(d.changedClauses.length).toBeGreaterThan(0);
      expect(d.impactedTeams.length).toBeGreaterThan(0);
      expect(d.summary.length).toBeGreaterThan(0);
      expect(d.oldText.length).toBeGreaterThan(0);
      expect(d.newText.length).toBeGreaterThan(0);
    }
  });
  it("every rule carries a non-empty source clause", () => {
    for (const d of SEED_DOMAINS) {
      for (const r of d.rules) {
        expect(r.sourceClause.trim().length).toBeGreaterThan(0);
        expect(r.humanReviewRequired).toBe(true);
      }
    }
  });
});
