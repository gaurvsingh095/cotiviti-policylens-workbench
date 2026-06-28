import type {
  PolicyDomain,
  CandidateRule,
  Finding,
  EvaluationResult,
  AuditTrailRow,
} from "../types/policy";

// ---------------------------------------------------------------------------
// Deterministic policy engine. No model, no network — plain testable logic so
// every evaluation is reproducible and auditable. Each finding carries the
// source clause of the rule it came from.
// ---------------------------------------------------------------------------

export const STATUS = {
  APPROVED: "APPROVED_FOR_REVIEW",
  NOT_APPROVED: "NOT_APPROVED_MISSING_CRITERIA",
  PENDED: "PENDED_FOR_DOCUMENTATION",
  URGENT: "ROUTE_TO_URGENT_REVIEW",
  HUMAN: "HUMAN_REVIEW_REQUIRED",
  FLAGGED: "FLAGGED_PRE_PAYMENT_REVIEW",
  PASSED: "PASSED_BASIC_CHECK_HUMAN_REVIEW",
  DOCS_COMPLETE: "DOCUMENTATION_COMPLETE_HUMAN_REVIEW",
  BLOCKED: "BLOCKED_NON_COMPLIANT",
  SLA_BREACH: "FLAGGED_SLA_BREACH",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  [STATUS.APPROVED]: "Approved for review",
  [STATUS.NOT_APPROVED]: "Not approved — missing criteria",
  [STATUS.PENDED]: "Pended for documentation",
  [STATUS.URGENT]: "Route to urgent review",
  [STATUS.HUMAN]: "Human review required",
  [STATUS.FLAGGED]: "Flagged — pre-payment review",
  [STATUS.PASSED]: "Passed basic check — human review",
  [STATUS.DOCS_COMPLETE]: "Documentation complete — human review",
  [STATUS.BLOCKED]: "Blocked — non-compliant",
  [STATUS.SLA_BREACH]: "Flagged — SLA breach",
};

export const STATUS_TONE: Record<string, EvaluationResult["tone"]> = {
  [STATUS.APPROVED]: "ok",
  [STATUS.PASSED]: "ok",
  [STATUS.DOCS_COMPLETE]: "ok",
  [STATUS.NOT_APPROVED]: "block",
  [STATUS.BLOCKED]: "block",
  [STATUS.PENDED]: "warn",
  [STATUS.URGENT]: "warn",
  [STATUS.FLAGGED]: "warn",
  [STATUS.SLA_BREACH]: "warn",
  [STATUS.HUMAN]: "info",
};

type CaseValues = Record<string, number | boolean | string>;

function ruleOf(dom: PolicyDomain, id: string): CandidateRule | undefined {
  return dom.rules.find((r) => r.ruleId === id);
}

function finding(rule: CandidateRule, status: Finding["status"], message: string): Finding {
  return {
    ruleId: rule.ruleId,
    ruleType: rule.ruleType,
    status,
    message,
    sourceClause: rule.sourceClause,
  };
}

function pack(
  domainId: string,
  status: string,
  headline: string,
  explanation: string,
  missing: string[],
  findings: Finding[],
): EvaluationResult {
  return {
    domainId,
    status,
    statusLabel: STATUS_LABELS[status] ?? status,
    tone: STATUS_TONE[status] ?? "info",
    headline,
    explanation,
    missingCriteria: missing,
    findings,
    humanReviewRequired: true,
  };
}

const num = (v: CaseValues[string]): number => (typeof v === "number" ? v : Number(v) || 0);
const bool = (v: CaseValues[string]): boolean => v === true || v === "true";

// --- Imaging -------------------------------------------------------------
function evalImaging(dom: PolicyDomain, c: CaseValues): EvaluationResult {
  const findings: Finding[] = [];
  const missing: string[] = [];
  const age = num(c.patient_age);
  const weeks = num(c.conservative_therapy_weeks);
  const notes = bool(c.clinical_notes_included);
  const urgent = bool(c.urgent);

  const rAge = ruleOf(dom, "R001")!;
  if (age < 18) {
    findings.push(finding(rAge, "fail", `Member age ${age} is below the policy minimum of 18.`));
    missing.push("Member age is below the eligibility threshold (18).");
  } else findings.push(finding(rAge, "pass", `Member age ${age} meets the minimum of 18.`));

  findings.push(finding(ruleOf(dom, "R002")!, "needs_review", "Service is subject to the prior authorization workflow."));

  const rNotes = ruleOf(dom, "R004")!;
  if (!notes) {
    findings.push(finding(rNotes, "needs_documentation", "Clinical notes were not included with the request."));
    missing.push("Clinical notes must be included with the request.");
  } else findings.push(finding(rNotes, "pass", "Clinical notes are included."));

  const rUrgent = ruleOf(dom, "R005")!;
  const rTher = ruleOf(dom, "R003")!;
  if (urgent) {
    findings.push(finding(rUrgent, "needs_review", "Urgent request — route for review within 72 hours."));
    findings.push(finding(rTher, "needs_review", "Conservative-therapy minimum is waived for urgent cases."));
  } else if (weeks < 6) {
    findings.push(finding(rTher, "fail", `Only ${weeks} weeks of conservative therapy documented; policy requires 6.`));
    missing.push("At least 6 weeks of conservative therapy must be documented.");
  } else findings.push(finding(rTher, "pass", `${weeks} weeks of conservative therapy meet the 6-week minimum.`));

  findings.push(finding(ruleOf(dom, "R006")!, "needs_review", "Any denial or pend must cite the specific failed criterion."));

  const hasFail = findings.some((f) => f.status === "fail");
  const needsDocs = findings.some((f) => f.status === "needs_documentation");
  if (hasFail && age < 18)
    return pack(dom.domainId, STATUS.HUMAN, "Ineligible on age — escalate to human review", "The member does not meet the minimum age in the policy. Eligibility exceptions are not automated, so this routes to a human reviewer.", missing, findings);
  if (hasFail)
    return pack(dom.domainId, STATUS.NOT_APPROVED, "Required criteria not met", "One or more required criteria failed. The request cannot proceed to approval until the missing items below are resolved.", missing, findings);
  if (needsDocs)
    return pack(dom.domainId, STATUS.PENDED, "Pended — documentation required", "Required documentation is missing. The request is pended with a specific documentation request rather than denied.", missing, findings);
  if (urgent)
    return pack(dom.domainId, STATUS.URGENT, "Urgent — route for 72-hour review", "The request is flagged urgent. It is routed for human review within the 72-hour policy window; the therapy minimum is waived.", missing, findings);
  return pack(dom.domainId, STATUS.APPROVED, "Criteria met — route for human review", "All required criteria are satisfied. The request is eligible to be routed to a human reviewer for the final decision.", missing, findings);
}

// --- Billing -------------------------------------------------------------
function evalBilling(dom: PolicyDomain, c: CaseValues): EvaluationResult {
  const findings: Finding[] = [];
  const missing: string[] = [];
  const mod = bool(c.modifier_59_present);
  const dist = bool(c.distinct_service_documented);
  const dup = bool(c.duplicate_line_item);
  const key = bool(c.same_member_provider_date_code);

  const rMod = ruleOf(dom, "B001")!;
  if (mod && !dist) {
    findings.push(finding(rMod, "needs_documentation", "Modifier 59 present but distinct procedural service is not documented."));
    missing.push("Distinct procedural service documentation for modifier 59.");
  } else if (mod) findings.push(finding(rMod, "pass", "Modifier 59 is supported by distinct procedural documentation."));
  else findings.push(finding(rMod, "needs_review", "No modifier 59 on the claim line."));

  const rKey = ruleOf(dom, "B002")!;
  const rPre = ruleOf(dom, "B004")!;
  if (dup && key) {
    findings.push(finding(rKey, "fail", "Duplicate matches on member, provider, service date, and procedure code."));
    findings.push(finding(rPre, "fail", "Duplicate must be flagged for pre-payment review."));
    missing.push("Duplicate line item must clear pre-payment review.");
  } else {
    findings.push(finding(rKey, "pass", "No four-key duplicate match detected."));
    findings.push(finding(rPre, "needs_review", "No pre-payment duplicate flag required."));
  }

  const rRoute = ruleOf(dom, "B003")!;
  if (mod && !dist) findings.push(finding(rRoute, "needs_documentation", "Missing modifier documentation routes to pend, not immediate denial."));
  else findings.push(finding(rRoute, "needs_review", "Pend-before-deny path available if documentation is later found missing."));

  if (dup && key)
    return pack(dom.domainId, STATUS.FLAGGED, "Duplicate flagged for pre-payment review", "The line item matches an existing claim on all four duplicate keys. It is flagged for pre-payment review before any payment is made.", missing, findings);
  if (mod && !dist)
    return pack(dom.domainId, STATUS.PENDED, "Pended — modifier 59 documentation missing", "Modifier 59 requires distinct procedural service documentation, which is missing. The claim pends for documentation rather than denying.", missing, findings);
  return pack(dom.domainId, STATUS.PASSED, "Passed basic policy check — human review required", "No modifier or duplicate issues were detected. The claim passes the basic policy check and proceeds to human review.", missing, findings);
}

// --- Clinical ------------------------------------------------------------
function evalClinical(dom: PolicyDomain, c: CaseValues): EvaluationResult {
  const findings: Finding[] = [];
  const missing: string[] = [];
  findings.push(finding(ruleOf(dom, "C001")!, "needs_review", "Documentation is required to support medical-necessity review."));
  const fields: [string, string, string][] = [
    ["C002", "diagnosis_present", "Diagnosis"],
    ["C003", "history_present", "Relevant history"],
    ["C004", "prior_treatment_present", "Prior treatment"],
    ["C005", "provider_rationale_present", "Ordering provider rationale"],
  ];
  for (const [id, k, label] of fields) {
    const r = ruleOf(dom, id)!;
    if (bool(c[k])) findings.push(finding(r, "pass", `${label} is present in the submitted record.`));
    else {
      findings.push(finding(r, "needs_documentation", `${label} is missing from the submitted record.`));
      missing.push(label);
    }
  }
  const rPend = ruleOf(dom, "C006")!;
  if (missing.length) findings.push(finding(rPend, "needs_documentation", "Incomplete submission pends with a specific documentation request."));
  else findings.push(finding(rPend, "pass", "Submission is complete; no documentation pend required."));
  findings.push(finding(ruleOf(dom, "C007")!, "needs_review", "Review decision must trace back to the policy criteria used."));

  if (missing.length)
    return pack(dom.domainId, STATUS.PENDED, "Pended — documentation incomplete", "The record is missing required elements. It is pended with a specific request naming exactly what to supply.", missing, findings);
  return pack(dom.domainId, STATUS.DOCS_COMPLETE, "Documentation complete — human review required", "All required documentation elements are present. The record proceeds to human medical-necessity review with a full audit trail.", missing, findings);
}

// --- Risk Adjustment -----------------------------------------------------
function evalRiskAdjustment(dom: PolicyDomain, c: CaseValues): EvaluationResult {
  const findings: Finding[] = [];
  const missing: string[] = [];
  const assessed = bool(c.assessed_current_year);
  const f2f = bool(c.face_to_face_encounter);
  const retained = bool(c.documentation_retained);
  const carried = bool(c.carried_from_prior_year);

  const rAssess = ruleOf(dom, "RA01")!;
  if (!assessed) {
    findings.push(finding(rAssess, "fail", "Condition was not assessed in the current calendar year."));
    missing.push("Current-year assessment of the condition.");
  } else findings.push(finding(rAssess, "pass", "Condition was assessed in the current calendar year."));

  const rEnc = ruleOf(dom, "RA02")!;
  if (!f2f) {
    findings.push(finding(rEnc, "needs_documentation", "No face-to-face encounter record supports the diagnosis."));
    missing.push("Face-to-face encounter record for the diagnosis.");
  } else findings.push(finding(rEnc, "pass", "A face-to-face encounter record supports the diagnosis."));

  const rCarry = ruleOf(dom, "RA03")!;
  if (carried && !assessed) findings.push(finding(rCarry, "fail", "Condition is carried forward without current-year reassessment."));
  else findings.push(finding(rCarry, "pass", "No prohibited carry-forward detected."));

  const rRetain = ruleOf(dom, "RA04")!;
  if (!retained) findings.push(finding(rRetain, "needs_review", "Supporting documentation is not confirmed retained for audit."));
  else findings.push(finding(rRetain, "pass", "Supporting documentation is retained for audit."));

  const hasFail = findings.some((f) => f.status === "fail");
  const needsDocs = findings.some((f) => f.status === "needs_documentation");
  if (hasFail)
    return pack(dom.domainId, STATUS.BLOCKED, "Cannot report — current-year support missing", "The condition cannot be reported because it was not reassessed this year or is improperly carried forward. This blocks reporting until resolved.", missing, findings);
  if (needsDocs)
    return pack(dom.domainId, STATUS.PENDED, "Pended — encounter documentation required", "The diagnosis needs a face-to-face encounter record before it can be reported. It is pended for documentation.", missing, findings);
  return pack(dom.domainId, STATUS.DOCS_COMPLETE, "Supported — human review required", "Current-year assessment and encounter support are present. The diagnosis proceeds to human review with a full audit trail.", missing, findings);
}

// --- Quality -------------------------------------------------------------
function evalQuality(dom: PolicyDomain, c: CaseValues): EvaluationResult {
  const findings: Finding[] = [];
  const missing: string[] = [];
  const evidence = bool(c.evidence_record_present);
  const result = bool(c.result_value_present);
  const numerator = bool(c.numerator_hit);
  const exclusion = bool(c.exclusion_code_present);

  const rEvidence = ruleOf(dom, "Q001")!;
  const rResult = ruleOf(dom, "Q002")!;
  const rExcl = ruleOf(dom, "Q003")!;
  const rPend = ruleOf(dom, "Q004")!;

  if (exclusion) {
    findings.push(finding(rExcl, "pass", "A defined exclusion code is referenced."));
    findings.push(finding(rEvidence, "needs_review", "Excluded record — evidence requirement not applicable."));
    findings.push(finding(rResult, "needs_review", "Excluded record — result value not applicable."));
    findings.push(finding(rPend, "needs_review", "Excluded record — no numerator pend required."));
    return pack(dom.domainId, STATUS.PASSED, "Valid coded exclusion — human review required", "The record references a defined exclusion code and is excluded from the measure. It proceeds to human review.", missing, findings);
  }

  findings.push(finding(rExcl, "needs_review", "No exclusion code referenced; evidence path applies."));
  if (!evidence) {
    findings.push(finding(rEvidence, "needs_documentation", "No dated clinical evidence record supports the measure."));
    missing.push("Dated clinical evidence record.");
  } else findings.push(finding(rEvidence, "pass", "A dated clinical evidence record is present."));

  if (!result) {
    findings.push(finding(rResult, "needs_documentation", "Supplemental evidence is missing a service date or result value."));
    missing.push("Service date and result value on supplemental evidence.");
  } else findings.push(finding(rResult, "pass", "Supplemental evidence includes date and result value."));

  if (numerator && missing.length) findings.push(finding(rPend, "needs_documentation", "Numerator hit without supporting evidence is pended for review."));
  else findings.push(finding(rPend, "pass", "No unsupported numerator hit to pend."));

  if (missing.length)
    return pack(dom.domainId, STATUS.PENDED, "Pended — evidence incomplete", "The numerator hit lacks dated evidence or a result value, so it is pended for review rather than counted.", missing, findings);
  return pack(dom.domainId, STATUS.DOCS_COMPLETE, "Evidence complete — human review required", "Dated evidence with a result value supports the measure. It proceeds to human review with a full audit trail.", missing, findings);
}

// --- Contract ------------------------------------------------------------
function evalContract(dom: PolicyDomain, c: CaseValues): EvaluationResult {
  const findings: Finding[] = [];
  const missing: string[] = [];
  const days = num(c.days_to_payment);
  const fee2026 = bool(c.fee_schedule_2026);
  const sinceService = num(c.days_since_service);
  const clean = bool(c.clean_claim);

  const rTimely = ruleOf(dom, "K003")!;
  if (sinceService > 90) {
    findings.push(finding(rTimely, "fail", `Submitted ${sinceService} days after service — past the 90-day timely filing limit.`));
    missing.push("Submission within the 90-day timely filing limit.");
  } else findings.push(finding(rTimely, "pass", `Submitted within the 90-day timely filing limit (${sinceService} days).`));

  const rPrompt = ruleOf(dom, "K001")!;
  if (clean && days > 30) {
    findings.push(finding(rPrompt, "needs_review", `Clean claim paid in ${days} days — exceeds the 30-day prompt-pay obligation.`));
  } else findings.push(finding(rPrompt, "pass", `Payment timing of ${days} days meets the 30-day prompt-pay obligation.`));

  const rFee = ruleOf(dom, "K002")!;
  if (!fee2026) {
    findings.push(finding(rFee, "needs_review", "Reimbursement did not use the 2026 contracted fee schedule version."));
  } else findings.push(finding(rFee, "pass", "Reimbursement used the 2026 contracted fee schedule version."));

  findings.push(finding(ruleOf(dom, "K004")!, "needs_review", "Any audited underpayment must be reprocessed within 45 days."));

  const timelyFail = sinceService > 90;
  const slaIssue = (clean && days > 30) || !fee2026;
  if (timelyFail)
    return pack(dom.domainId, STATUS.BLOCKED, "Deny — timely filing exceeded", "The claim was submitted past the 90-day timely filing limit and must be denied with the timely-filing reason.", missing, findings);
  if (slaIssue)
    return pack(dom.domainId, STATUS.SLA_BREACH, "Flagged — contract SLA breach", "The claim breaches a prompt-pay or fee-schedule term. It is flagged for human review and remediation.", missing, findings);
  return pack(dom.domainId, STATUS.PASSED, "Contract terms met — human review required", "Payment timing, fee schedule, and timely filing all meet the contracted terms. It proceeds to human review.", missing, findings);
}

// --- CMS Regulatory ------------------------------------------------------
function evalCms(dom: PolicyDomain, c: CaseValues): EvaluationResult {
  const findings: Finding[] = [];
  const missing: string[] = [];
  const days = num(c.decision_days);
  const expedited = bool(c.expedited);
  const rationale = bool(c.rationale_included);
  const appeal = bool(c.appeal_rights_included);

  const rStd = ruleOf(dom, "M001")!;
  const rExp = ruleOf(dom, "M002")!;
  if (expedited) {
    const hours = days * 24;
    if (hours > 72) {
      findings.push(finding(rExp, "fail", `Expedited decision took ${days} days (${hours} hours) — exceeds the 72-hour limit.`));
      missing.push("Expedited decision within 72 hours.");
    } else findings.push(finding(rExp, "pass", `Expedited decision issued within 72 hours (${hours} hours).`));
    findings.push(finding(rStd, "needs_review", "Standard 7-day window not applicable to expedited requests."));
  } else {
    if (days > 7) {
      findings.push(finding(rStd, "fail", `Standard decision took ${days} days — exceeds the 7-day limit.`));
      missing.push("Standard decision within 7 calendar days.");
    } else findings.push(finding(rStd, "pass", `Standard decision issued within ${days} days.`));
    findings.push(finding(rExp, "needs_review", "Expedited 72-hour window not applicable to standard requests."));
  }

  const rNotice = ruleOf(dom, "M003")!;
  if (!rationale || !appeal) {
    findings.push(finding(rNotice, "needs_documentation", "Denial notice is missing specific rationale and/or appeal rights."));
    if (!rationale) missing.push("Specific clinical rationale on the denial notice.");
    if (!appeal) missing.push("Applicable appeal rights on the denial notice.");
  } else findings.push(finding(rNotice, "pass", "Denial notice includes rationale and appeal rights."));

  findings.push(finding(ruleOf(dom, "M004")!, "needs_review", "Prior authorization metrics must be reported for public transparency."));

  const hasFail = findings.some((f) => f.status === "fail");
  const needsDocs = findings.some((f) => f.status === "needs_documentation");
  if (hasFail)
    return pack(dom.domainId, STATUS.SLA_BREACH, "Flagged — regulatory SLA breach", "A required decision timeline was exceeded. This is a regulatory exposure and is flagged for human review and reporting.", missing, findings);
  if (needsDocs)
    return pack(dom.domainId, STATUS.PENDED, "Pended — notice content incomplete", "The decision notice is missing required rationale or appeal rights. It is pended until the notice is complete.", missing, findings);
  return pack(dom.domainId, STATUS.PASSED, "Regulatory criteria met — human review required", "Decision timelines and notice content meet the regulatory update. It proceeds to human review and metrics reporting.", missing, findings);
}

const EVALUATORS: Record<string, (dom: PolicyDomain, c: CaseValues) => EvaluationResult> = {
  imaging: evalImaging,
  billing: evalBilling,
  clinical: evalClinical,
  risk_adjustment: evalRiskAdjustment,
  quality: evalQuality,
  contract: evalContract,
  cms_regulatory: evalCms,
};

export function evaluateCase(dom: PolicyDomain, values: CaseValues): EvaluationResult {
  const evaluator = EVALUATORS[dom.domainId];
  if (!evaluator) throw new Error(`No evaluator registered for domain ${dom.domainId}`);
  return evaluator(dom, values);
}

export function buildAuditTrail(dom: PolicyDomain, result: EvaluationResult): AuditTrailRow[] {
  const byId = new Map(dom.rules.map((r) => [r.ruleId, r]));
  return result.findings.map((f) => ({
    sourceClause: f.sourceClause,
    ruleId: f.ruleId,
    ruleCondition: byId.get(f.ruleId)?.condition ?? "",
    finding: f.message,
    findingStatus: f.status,
    outputStatus: result.status,
  }));
}

export function traceabilityCoverage(result: EvaluationResult): number {
  if (!result.findings.length) return 0;
  const traced = result.findings.filter((f) => f.sourceClause.trim().length > 0).length;
  return Math.round((100 * traced) / result.findings.length);
}
