import type { PolicyDomain } from "../types/policy";

// ---------------------------------------------------------------------------
// All data below is fully synthetic. No PHI. No real policies, patients, or
// payment data. Crafted for demonstration of the PolicyLens workflow only.
// ---------------------------------------------------------------------------

const IMAGING: PolicyDomain = {
  domainId: "imaging",
  name: "Imaging Prior Authorization",
  category: "Utilization Management",
  icon: "scan",
  oldVersion: "2025.1",
  newVersion: "2026.1",
  effectiveDate: "2026-01-01",
  oldText:
    "Advanced imaging services may require prior authorization. Clinical notes should be submitted when available. Conservative therapy may be considered during review. Urgent requests are reviewed according to standard operational timelines. Denial communications should explain the general reason for non-approval.",
  newText:
    "Advanced imaging services require prior authorization for members age 18 and older. Clinical notes must be included with the request. Requests must document at least six weeks of conservative therapy unless the case is urgent. Urgent requests must be routed for review within 72 hours. If a request is denied or pended, the response must include a specific reason tied to the failed policy criteria.",
  summary: [
    "Prior authorization is now required for members age 18 and older.",
    "Clinical notes move from optional to required.",
    "At least six weeks of conservative therapy must be documented unless urgent.",
    "Urgent requests carry a 72-hour routing commitment.",
    "Denials and pends must cite the specific failed criterion.",
  ],
  whyItMatters:
    "Imaging prior authorization is high-volume and time-sensitive. The old version's permissive language ('should', 'may') left reviewers to interpret requirements case by case. The new version converts those into hard criteria with an explicit age floor, a documented therapy minimum, a 72-hour urgent window, and a denial-reason obligation — exactly the kind of change that needs structured rules so every reviewer applies it the same way.",
  changedClauses: [
    {
      changeType: "REQUIREMENT_CHANGED",
      oldText: "Advanced imaging services may require prior authorization.",
      newText: "Advanced imaging services require prior authorization for members age 18 and older.",
      note: "Permissive 'may' became a hard requirement with an explicit age floor.",
    },
    {
      changeType: "NEW_DOCUMENTATION",
      oldText: "Clinical notes should be submitted when available.",
      newText: "Clinical notes must be included with the request.",
      note: "Documentation tightened from optional to required.",
    },
    {
      changeType: "THRESHOLD_CHANGED",
      oldText: "Conservative therapy may be considered during review.",
      newText: "Requests must document at least six weeks of conservative therapy unless the case is urgent.",
      note: "Introduces a concrete six-week threshold with an urgent exception.",
    },
    {
      changeType: "TIMELINE_CHANGED",
      oldText: "Urgent requests are reviewed according to standard operational timelines.",
      newText: "Urgent requests must be routed for review within 72 hours.",
      note: "Defines a measurable 72-hour service-level commitment.",
    },
    {
      changeType: "AUDIT_REQUIREMENT_ADDED",
      oldText: "Denial communications should explain the general reason for non-approval.",
      newText: "If a request is denied or pended, the response must include a specific reason tied to the failed policy criteria.",
      note: "Adds an auditable, criterion-specific denial-reason obligation.",
    },
  ],
  impactedTeams: [
    { team: "Policy Ops", icon: "clipboard", workflow: "Change intake & sign-off", system: "Policy registry", risk: "medium", note: "Owns the change and reviewer approval." },
    { team: "Clinical Review", icon: "stethoscope", workflow: "PA case review", system: "UM platform", risk: "high", note: "Applies age, therapy, and urgent criteria." },
    { team: "Payment Integrity", icon: "shield", workflow: "Edit authoring", system: "Edit engine", risk: "medium", note: "Translates criteria into operational edits." },
    { team: "Compliance", icon: "gavel", workflow: "Denial-reason audit", system: "Audit log", risk: "high", note: "Confirms denial-reason obligation is met." },
    { team: "Member Services", icon: "headset", workflow: "Urgent intake", system: "CRM", risk: "low", note: "Flags urgent requests for the 72-hour path." },
  ],
  caseFields: [
    { key: "patient_age", label: "Member age", kind: "int", default: 52, help: "Age in years.", min: 0, max: 100 },
    { key: "conservative_therapy_weeks", label: "Conservative therapy (weeks)", kind: "int", default: 5, help: "Documented weeks of therapy.", min: 0, max: 12 },
    { key: "clinical_notes_included", label: "Clinical notes included", kind: "bool", default: false, help: "Were clinical notes attached?" },
    { key: "urgent", label: "Urgent request", kind: "bool", default: false, help: "Flagged urgent?" },
  ],
  cases: [
    { id: "imaging_fail_therapy", label: "Default failing case", description: "Adult, notes present, only 5 weeks therapy, not urgent.", values: { patient_age: 52, conservative_therapy_weeks: 5, clinical_notes_included: true, urgent: false } },
    { id: "imaging_met", label: "Criteria-met case", description: "Adult, 6 weeks therapy, notes present, not urgent.", values: { patient_age: 52, conservative_therapy_weeks: 6, clinical_notes_included: true, urgent: false } },
    { id: "imaging_missing_docs", label: "Missing documentation case", description: "Adult, therapy met, clinical notes missing.", values: { patient_age: 52, conservative_therapy_weeks: 6, clinical_notes_included: false, urgent: false } },
    { id: "imaging_urgent", label: "Urgent review case", description: "Urgent — therapy minimum waived, 72-hour window.", values: { patient_age: 52, conservative_therapy_weeks: 0, clinical_notes_included: true, urgent: true } },
    { id: "imaging_underage", label: "Underage / ineligible case", description: "Member under 18 — age eligibility fails.", values: { patient_age: 17, conservative_therapy_weeks: 6, clinical_notes_included: true, urgent: false } },
  ],
  rules: [
    { ruleId: "R001", domainId: "imaging", ruleType: "eligibility", condition: "Member age >= 18", threshold: "18", action: "Allow if met, else escalate", severity: "hard", sourceClause: "Advanced imaging services require prior authorization for members age 18 and older.", humanReviewRequired: true },
    { ruleId: "R002", domainId: "imaging", ruleType: "workflow", condition: "Prior authorization required", threshold: "true", action: "Route to PA workflow", severity: "info", sourceClause: "Advanced imaging services require prior authorization for members age 18 and older.", humanReviewRequired: true },
    { ruleId: "R003", domainId: "imaging", ruleType: "eligibility", condition: "Conservative therapy >= 6 weeks unless urgent", threshold: "6 weeks", action: "Fail if under threshold and not urgent", severity: "hard", sourceClause: "Requests must document at least six weeks of conservative therapy unless the case is urgent.", humanReviewRequired: true },
    { ruleId: "R004", domainId: "imaging", ruleType: "documentation", condition: "Clinical notes included", threshold: "true", action: "Pend if missing", severity: "hard", sourceClause: "Clinical notes must be included with the request.", humanReviewRequired: true },
    { ruleId: "R005", domainId: "imaging", ruleType: "operations", condition: "Urgent requests routed within 72 hours", threshold: "72 hours", action: "Route to urgent review", severity: "soft", sourceClause: "Urgent requests must be routed for review within 72 hours.", humanReviewRequired: true },
    { ruleId: "R006", domainId: "imaging", ruleType: "compliance", condition: "Denials/pends cite specific failed criterion", threshold: "true", action: "Attach specific reason", severity: "soft", sourceClause: "If a request is denied or pended, the response must include a specific reason tied to the failed policy criteria.", humanReviewRequired: true },
  ],
  qaTests: [],
};

const BILLING: PolicyDomain = {
  domainId: "billing",
  name: "Billing & Coding Edit Policy",
  category: "Payment Integrity",
  icon: "receipt",
  oldVersion: "2025.1",
  newVersion: "2026.1",
  effectiveDate: "2026-01-01",
  oldText:
    "Claims with procedure modifiers may be reviewed after payment. Modifier documentation should be available upon request. Duplicate line items may be denied when identified.",
  newText:
    "Claims containing modifier 59 must include distinct procedural service documentation. Duplicate line items submitted for the same member, provider, service date, and procedure code must be flagged prior to payment. Claims missing required modifier documentation should be pended for documentation review before denial.",
  summary: [
    "Modifier 59 claims require distinct procedural service documentation.",
    "Duplicate detection moves from post-payment to pre-payment.",
    "Duplicate definition is now a precise four-key match.",
    "Missing modifier documentation pends before denial.",
  ],
  whyItMatters:
    "Billing edits move money. The old version reviewed modifiers after payment and denied duplicates reactively, meaning dollars left before review. The new version pushes detection pre-payment with a precise four-key duplicate definition and a pend-before-deny path — improving payment integrity while protecting providers from premature denials.",
  changedClauses: [
    { changeType: "CODING_RULE_UPDATED", oldText: "Claims with procedure modifiers may be reviewed after payment.", newText: "Claims containing modifier 59 must include distinct procedural service documentation.", note: "Specifies modifier 59 and a documentation requirement." },
    { changeType: "TIMELINE_CHANGED", oldText: "Duplicate line items may be denied when identified.", newText: "Duplicate line items submitted for the same member, provider, service date, and procedure code must be flagged prior to payment.", note: "Shifts duplicate handling to pre-payment with a four-key definition." },
    { changeType: "NEW_DOCUMENTATION", oldText: "Modifier documentation should be available upon request.", newText: "Claims missing required modifier documentation should be pended for documentation review before denial.", note: "Introduces an explicit pend-before-deny path." },
  ],
  impactedTeams: [
    { team: "Payment Integrity", icon: "shield", workflow: "Pre-payment edits", system: "Edit engine", risk: "high", note: "Owns modifier and duplicate edits." },
    { team: "Claims Ops", icon: "receipt", workflow: "Claim adjudication", system: "Claims platform", risk: "high", note: "Applies pend-before-deny logic." },
    { team: "Provider Relations", icon: "handshake", workflow: "Provider notices", system: "Provider portal", risk: "medium", note: "Communicates documentation pends." },
    { team: "Compliance", icon: "gavel", workflow: "Edit audit", system: "Audit log", risk: "medium", note: "Validates pre-payment flagging." },
  ],
  caseFields: [
    { key: "modifier_59_present", label: "Modifier 59 present", kind: "bool", default: true, help: "Is modifier 59 on the line?" },
    { key: "distinct_service_documented", label: "Distinct service documented", kind: "bool", default: false, help: "Distinct procedural service documented?" },
    { key: "duplicate_line_item", label: "Duplicate line item", kind: "bool", default: false, help: "Suspected duplicate?" },
    { key: "same_member_provider_date_code", label: "Same member/provider/date/code", kind: "bool", default: false, help: "Matches all four duplicate keys?" },
  ],
  cases: [
    { id: "billing_doc_missing", label: "Default failing case", description: "Modifier 59 present, distinct service not documented.", values: { modifier_59_present: true, distinct_service_documented: false, duplicate_line_item: false, same_member_provider_date_code: false } },
    { id: "billing_clean", label: "Criteria-met case", description: "Modifier 59 with documentation, no duplicate.", values: { modifier_59_present: true, distinct_service_documented: true, duplicate_line_item: false, same_member_provider_date_code: false } },
    { id: "billing_duplicate", label: "Duplicate pre-payment case", description: "Four-key duplicate match — flag pre-payment.", values: { modifier_59_present: false, distinct_service_documented: false, duplicate_line_item: true, same_member_provider_date_code: true } },
  ],
  rules: [
    { ruleId: "B001", domainId: "billing", ruleType: "documentation", condition: "Modifier 59 requires distinct procedural documentation", threshold: "true", action: "Pend if missing", severity: "hard", sourceClause: "Claims containing modifier 59 must include distinct procedural service documentation.", humanReviewRequired: true },
    { ruleId: "B002", domainId: "billing", ruleType: "coding", condition: "Duplicate key = member + provider + service date + procedure code", threshold: "4-key match", action: "Flag duplicate", severity: "hard", sourceClause: "Duplicate line items submitted for the same member, provider, service date, and procedure code must be flagged prior to payment.", humanReviewRequired: true },
    { ruleId: "B003", domainId: "billing", ruleType: "workflow", condition: "Missing modifier docs pend before denial", threshold: "true", action: "Pend, do not deny", severity: "soft", sourceClause: "Claims missing required modifier documentation should be pended for documentation review before denial.", humanReviewRequired: true },
    { ruleId: "B004", domainId: "billing", ruleType: "operations", condition: "Duplicates flagged prior to payment", threshold: "pre-payment", action: "Flag for pre-payment review", severity: "hard", sourceClause: "Duplicate line items submitted for the same member, provider, service date, and procedure code must be flagged prior to payment.", humanReviewRequired: true },
  ],
  qaTests: [],
};

const CLINICAL: PolicyDomain = {
  domainId: "clinical",
  name: "Clinical Documentation Requirement",
  category: "Utilization Management",
  icon: "file-text",
  oldVersion: "2025.1",
  newVersion: "2026.1",
  effectiveDate: "2026-01-01",
  oldText:
    "Clinical documentation may be requested to support medical necessity review. Reviewers may request additional information when submitted documentation is incomplete.",
  newText:
    "Clinical documentation is required to support medical necessity review. The submitted record must include diagnosis, relevant history, prior treatment, and ordering provider rationale. Incomplete submissions must be pended with a specific documentation request. Review decisions must maintain a traceable connection to the policy criteria used.",
  summary: [
    "Documentation moves from optional to required.",
    "Four record elements are now mandatory.",
    "Incomplete submissions get a specific documentation pend.",
    "Every decision must trace to policy criteria.",
  ],
  whyItMatters:
    "Medical-necessity decisions are only as defensible as the record behind them. The old version made documentation optional and discretionary. The new version enumerates four required elements, requires a specific pend when any is missing, and demands that every decision trace back to policy criteria — turning a soft expectation into an auditable checklist.",
  changedClauses: [
    { changeType: "REQUIREMENT_CHANGED", oldText: "Clinical documentation may be requested to support medical necessity review.", newText: "Clinical documentation is required to support medical necessity review.", note: "Optional request became a hard requirement." },
    { changeType: "NEW_DOCUMENTATION", oldText: "Reviewers may request additional information when submitted documentation is incomplete.", newText: "The submitted record must include diagnosis, relevant history, prior treatment, and ordering provider rationale.", note: "Enumerates four required documentation elements." },
    { changeType: "AUDIT_REQUIREMENT_ADDED", oldText: "", newText: "Review decisions must maintain a traceable connection to the policy criteria used.", note: "New traceability obligation for every decision." },
  ],
  impactedTeams: [
    { team: "Clinical Review", icon: "stethoscope", workflow: "Medical-necessity review", system: "UM platform", risk: "high", note: "Validates the four required elements." },
    { team: "HIM / Coding", icon: "file-text", workflow: "Record completeness", system: "EHR interface", risk: "medium", note: "Confirms documentation elements present." },
    { team: "Compliance", icon: "gavel", workflow: "Traceability audit", system: "Audit log", risk: "high", note: "Confirms decision-to-criteria trace." },
    { team: "Provider Relations", icon: "handshake", workflow: "Documentation pends", system: "Provider portal", risk: "low", note: "Sends specific documentation requests." },
  ],
  caseFields: [
    { key: "diagnosis_present", label: "Diagnosis present", kind: "bool", default: true, help: "Diagnosis documented?" },
    { key: "history_present", label: "Relevant history present", kind: "bool", default: false, help: "History documented?" },
    { key: "prior_treatment_present", label: "Prior treatment present", kind: "bool", default: false, help: "Prior treatment documented?" },
    { key: "provider_rationale_present", label: "Provider rationale present", kind: "bool", default: true, help: "Rationale documented?" },
  ],
  cases: [
    { id: "clinical_partial", label: "Default failing case", description: "Diagnosis and rationale present; history and prior treatment missing.", values: { diagnosis_present: true, history_present: false, prior_treatment_present: false, provider_rationale_present: true } },
    { id: "clinical_complete", label: "Criteria-met case", description: "All four required elements present.", values: { diagnosis_present: true, history_present: true, prior_treatment_present: true, provider_rationale_present: true } },
    { id: "clinical_missing_one", label: "Missing documentation case", description: "Only ordering provider rationale missing.", values: { diagnosis_present: true, history_present: true, prior_treatment_present: true, provider_rationale_present: false } },
  ],
  rules: [
    { ruleId: "C001", domainId: "clinical", ruleType: "documentation", condition: "Documentation required for medical-necessity review", threshold: "true", action: "Require record", severity: "hard", sourceClause: "Clinical documentation is required to support medical necessity review.", humanReviewRequired: true },
    { ruleId: "C002", domainId: "clinical", ruleType: "documentation", condition: "Diagnosis present", threshold: "true", action: "Pend if missing", severity: "hard", sourceClause: "The submitted record must include diagnosis, relevant history, prior treatment, and ordering provider rationale.", humanReviewRequired: true },
    { ruleId: "C003", domainId: "clinical", ruleType: "documentation", condition: "Relevant history present", threshold: "true", action: "Pend if missing", severity: "hard", sourceClause: "The submitted record must include diagnosis, relevant history, prior treatment, and ordering provider rationale.", humanReviewRequired: true },
    { ruleId: "C004", domainId: "clinical", ruleType: "documentation", condition: "Prior treatment present", threshold: "true", action: "Pend if missing", severity: "hard", sourceClause: "The submitted record must include diagnosis, relevant history, prior treatment, and ordering provider rationale.", humanReviewRequired: true },
    { ruleId: "C005", domainId: "clinical", ruleType: "documentation", condition: "Ordering provider rationale present", threshold: "true", action: "Pend if missing", severity: "hard", sourceClause: "The submitted record must include diagnosis, relevant history, prior treatment, and ordering provider rationale.", humanReviewRequired: true },
    { ruleId: "C006", domainId: "clinical", ruleType: "workflow", condition: "Incomplete submissions pended with specific request", threshold: "true", action: "Pend with specifics", severity: "soft", sourceClause: "Incomplete submissions must be pended with a specific documentation request.", humanReviewRequired: true },
    { ruleId: "C007", domainId: "clinical", ruleType: "compliance", condition: "Decision traceable to policy criteria", threshold: "true", action: "Maintain audit trace", severity: "soft", sourceClause: "Review decisions must maintain a traceable connection to the policy criteria used.", humanReviewRequired: true },
  ],
  qaTests: [],
};

const RISK_ADJ: PolicyDomain = {
  domainId: "risk_adjustment",
  name: "Risk Adjustment Documentation",
  category: "Risk & Coding",
  icon: "activity",
  oldVersion: "2025.1",
  newVersion: "2026.1",
  effectiveDate: "2026-01-01",
  oldText:
    "Chronic conditions may be reported based on prior-year history. Diagnoses should be supported by clinical documentation. Annual reassessment is recommended.",
  newText:
    "Chronic conditions must be documented and assessed in the current calendar year to be reported. Each reported diagnosis must be supported by a face-to-face encounter record. Conditions not reassessed in the current year must not be carried forward. Supporting documentation must be retained for audit.",
  summary: [
    "Conditions must be assessed in the current calendar year.",
    "Each diagnosis needs a face-to-face encounter record.",
    "Prior-year carry-forward without reassessment is prohibited.",
    "Supporting documentation must be retained for audit.",
  ],
  whyItMatters:
    "Risk adjustment drives capitated payment and is heavily audited. The old version allowed prior-year carry-forward and soft documentation expectations, creating RADV exposure. The new version requires current-year reassessment, a face-to-face encounter per diagnosis, and audit retention — closing common findings before they happen.",
  changedClauses: [
    { changeType: "REQUIREMENT_CHANGED", oldText: "Chronic conditions may be reported based on prior-year history.", newText: "Chronic conditions must be documented and assessed in the current calendar year to be reported.", note: "Eliminates prior-year-only reporting." },
    { changeType: "NEW_DOCUMENTATION", oldText: "Diagnoses should be supported by clinical documentation.", newText: "Each reported diagnosis must be supported by a face-to-face encounter record.", note: "Requires a face-to-face encounter per diagnosis." },
    { changeType: "CLAUSE_ADDED", oldText: "", newText: "Conditions not reassessed in the current year must not be carried forward.", note: "Explicitly prohibits unreassessed carry-forward." },
    { changeType: "AUDIT_REQUIREMENT_ADDED", oldText: "Annual reassessment is recommended.", newText: "Supporting documentation must be retained for audit.", note: "Adds an audit retention obligation." },
  ],
  impactedTeams: [
    { team: "Risk Adjustment", icon: "activity", workflow: "HCC capture", system: "RA platform", risk: "high", note: "Owns current-year reassessment logic." },
    { team: "HIM / Coding", icon: "file-text", workflow: "Encounter validation", system: "EHR interface", risk: "high", note: "Confirms face-to-face encounter support." },
    { team: "Compliance", icon: "gavel", workflow: "RADV readiness", system: "Audit log", risk: "high", note: "Maintains audit retention." },
    { team: "Provider Relations", icon: "handshake", workflow: "Reassessment outreach", system: "Provider portal", risk: "medium", note: "Coordinates current-year visits." },
  ],
  caseFields: [
    { key: "assessed_current_year", label: "Assessed current year", kind: "bool", default: false, help: "Condition reassessed this year?" },
    { key: "face_to_face_encounter", label: "Face-to-face encounter", kind: "bool", default: false, help: "Supported by an encounter record?" },
    { key: "documentation_retained", label: "Documentation retained", kind: "bool", default: true, help: "Retained for audit?" },
    { key: "carried_from_prior_year", label: "Carried from prior year", kind: "bool", default: true, help: "Carried forward from last year?" },
  ],
  cases: [
    { id: "ra_carryforward", label: "Default failing case", description: "Carried from prior year, not reassessed this year.", values: { assessed_current_year: false, face_to_face_encounter: false, documentation_retained: true, carried_from_prior_year: true } },
    { id: "ra_supported", label: "Criteria-met case", description: "Assessed this year with a face-to-face encounter.", values: { assessed_current_year: true, face_to_face_encounter: true, documentation_retained: true, carried_from_prior_year: false } },
    { id: "ra_no_encounter", label: "Missing encounter case", description: "Assessed but no face-to-face encounter record.", values: { assessed_current_year: true, face_to_face_encounter: false, documentation_retained: true, carried_from_prior_year: false } },
  ],
  rules: [
    { ruleId: "RA01", domainId: "risk_adjustment", ruleType: "eligibility", condition: "Condition assessed in current year", threshold: "current year", action: "Fail if not assessed", severity: "hard", sourceClause: "Chronic conditions must be documented and assessed in the current calendar year to be reported.", humanReviewRequired: true },
    { ruleId: "RA02", domainId: "risk_adjustment", ruleType: "documentation", condition: "Face-to-face encounter record present", threshold: "true", action: "Pend if missing", severity: "hard", sourceClause: "Each reported diagnosis must be supported by a face-to-face encounter record.", humanReviewRequired: true },
    { ruleId: "RA03", domainId: "risk_adjustment", ruleType: "compliance", condition: "No carry-forward without reassessment", threshold: "true", action: "Block carry-forward", severity: "hard", sourceClause: "Conditions not reassessed in the current year must not be carried forward.", humanReviewRequired: true },
    { ruleId: "RA04", domainId: "risk_adjustment", ruleType: "compliance", condition: "Documentation retained for audit", threshold: "true", action: "Flag if not retained", severity: "soft", sourceClause: "Supporting documentation must be retained for audit.", humanReviewRequired: true },
  ],
  qaTests: [],
};

const QUALITY: PolicyDomain = {
  domainId: "quality",
  name: "Quality Measure Evidence Review",
  category: "Quality & Stars",
  icon: "award",
  oldVersion: "2025.1",
  newVersion: "2026.1",
  effectiveDate: "2026-01-01",
  oldText:
    "Quality measure compliance may be established through claims data. Supplemental evidence can be considered when available. Exclusions are applied at reviewer discretion.",
  newText:
    "Quality measure compliance must be supported by a dated clinical evidence record, not claims alone. Supplemental evidence must include the service date and result value. Approved exclusions must reference a defined exclusion code. Numerator hits without supporting evidence must be pended for review.",
  summary: [
    "Compliance must rest on dated clinical evidence, not claims alone.",
    "Supplemental evidence must carry a service date and result value.",
    "Exclusions must reference a defined exclusion code.",
    "Unsupported numerator hits are pended for review.",
  ],
  whyItMatters:
    "Stars and quality scores influence revenue and reputation, and measure audits are unforgiving. Claims-only compliance and discretionary exclusions invite invalidation. The new version requires dated evidence with result values and coded exclusions, making each numerator hit defensible.",
  changedClauses: [
    { changeType: "REQUIREMENT_CHANGED", oldText: "Quality measure compliance may be established through claims data.", newText: "Quality measure compliance must be supported by a dated clinical evidence record, not claims alone.", note: "Claims-only compliance is no longer sufficient." },
    { changeType: "NEW_DOCUMENTATION", oldText: "Supplemental evidence can be considered when available.", newText: "Supplemental evidence must include the service date and result value.", note: "Requires structured date and result on supplemental evidence." },
    { changeType: "CODING_RULE_UPDATED", oldText: "Exclusions are applied at reviewer discretion.", newText: "Approved exclusions must reference a defined exclusion code.", note: "Replaces discretion with coded exclusions." },
    { changeType: "AUDIT_REQUIREMENT_ADDED", oldText: "", newText: "Numerator hits without supporting evidence must be pended for review.", note: "Adds a pend path for unsupported numerator hits." },
  ],
  impactedTeams: [
    { team: "Quality / Stars", icon: "award", workflow: "Measure abstraction", system: "Quality platform", risk: "high", note: "Owns evidence and exclusion logic." },
    { team: "HIM / Coding", icon: "file-text", workflow: "Evidence capture", system: "EHR interface", risk: "medium", note: "Supplies dated result values." },
    { team: "Compliance", icon: "gavel", workflow: "Measure audit", system: "Audit log", risk: "high", note: "Validates coded exclusions." },
    { team: "Analytics", icon: "bar-chart", workflow: "Rate computation", system: "Reporting", risk: "medium", note: "Recomputes numerator with evidence." },
  ],
  caseFields: [
    { key: "evidence_record_present", label: "Dated evidence record", kind: "bool", default: false, help: "Dated clinical evidence present?" },
    { key: "result_value_present", label: "Result value present", kind: "bool", default: false, help: "Supplemental result value present?" },
    { key: "numerator_hit", label: "Numerator hit", kind: "bool", default: true, help: "Counts toward the measure numerator?" },
    { key: "exclusion_code_present", label: "Exclusion code present", kind: "bool", default: false, help: "Approved exclusion code referenced?" },
  ],
  cases: [
    { id: "quality_unsupported", label: "Default failing case", description: "Numerator hit with no dated evidence record.", values: { evidence_record_present: false, result_value_present: false, numerator_hit: true, exclusion_code_present: false } },
    { id: "quality_supported", label: "Criteria-met case", description: "Numerator hit with dated evidence and result value.", values: { evidence_record_present: true, result_value_present: true, numerator_hit: true, exclusion_code_present: false } },
    { id: "quality_excluded", label: "Coded exclusion case", description: "Excluded with a defined exclusion code.", values: { evidence_record_present: false, result_value_present: false, numerator_hit: false, exclusion_code_present: true } },
  ],
  rules: [
    { ruleId: "Q001", domainId: "quality", ruleType: "documentation", condition: "Dated clinical evidence record present", threshold: "true", action: "Pend if missing", severity: "hard", sourceClause: "Quality measure compliance must be supported by a dated clinical evidence record, not claims alone.", humanReviewRequired: true },
    { ruleId: "Q002", domainId: "quality", ruleType: "documentation", condition: "Supplemental evidence has date and result value", threshold: "true", action: "Pend if missing", severity: "hard", sourceClause: "Supplemental evidence must include the service date and result value.", humanReviewRequired: true },
    { ruleId: "Q003", domainId: "quality", ruleType: "coding", condition: "Exclusions reference a defined exclusion code", threshold: "true", action: "Reject uncoded exclusion", severity: "soft", sourceClause: "Approved exclusions must reference a defined exclusion code.", humanReviewRequired: true },
    { ruleId: "Q004", domainId: "quality", ruleType: "workflow", condition: "Unsupported numerator hits pended", threshold: "true", action: "Pend for review", severity: "soft", sourceClause: "Numerator hits without supporting evidence must be pended for review.", humanReviewRequired: true },
  ],
  qaTests: [],
};

const CONTRACT: PolicyDomain = {
  domainId: "contract",
  name: "Payer-Provider Contract Terms",
  category: "Network & Contracting",
  icon: "handshake",
  oldVersion: "2025.1",
  newVersion: "2026.1",
  effectiveDate: "2026-01-01",
  oldText:
    "Clean claims should be paid promptly. Reimbursement follows the contracted fee schedule. Timely filing limits apply as generally defined.",
  newText:
    "Clean claims must be paid within 30 days of receipt. Reimbursement must follow the 2026 contracted fee schedule version. Claims submitted after the 90-day timely filing limit must be denied with the timely-filing reason. Underpayments identified on audit must be reprocessed within 45 days.",
  summary: [
    "Clean claims must be paid within 30 days.",
    "Reimbursement must use the 2026 fee schedule version.",
    "Timely filing limit is a firm 90 days with a coded denial.",
    "Audited underpayments must be reprocessed within 45 days.",
  ],
  whyItMatters:
    "Contract terms define payment obligations and regulatory exposure on prompt-pay. Vague 'promptly' and 'generally defined' language is hard to operationalize or audit. The new version sets explicit day counts and fee-schedule versioning, which map cleanly to measurable edits and SLAs.",
  changedClauses: [
    { changeType: "TIMELINE_CHANGED", oldText: "Clean claims should be paid promptly.", newText: "Clean claims must be paid within 30 days of receipt.", note: "Defines a 30-day prompt-pay obligation." },
    { changeType: "CODING_RULE_UPDATED", oldText: "Reimbursement follows the contracted fee schedule.", newText: "Reimbursement must follow the 2026 contracted fee schedule version.", note: "Pins reimbursement to a specific fee schedule version." },
    { changeType: "THRESHOLD_CHANGED", oldText: "Timely filing limits apply as generally defined.", newText: "Claims submitted after the 90-day timely filing limit must be denied with the timely-filing reason.", note: "Sets a firm 90-day limit with a coded denial reason." },
    { changeType: "CLAUSE_ADDED", oldText: "", newText: "Underpayments identified on audit must be reprocessed within 45 days.", note: "Adds a 45-day reprocessing obligation." },
  ],
  impactedTeams: [
    { team: "Network Contracting", icon: "handshake", workflow: "Term configuration", system: "Contract system", risk: "high", note: "Owns fee schedule versioning." },
    { team: "Claims Ops", icon: "receipt", workflow: "Prompt-pay SLA", system: "Claims platform", risk: "high", note: "Enforces 30-day payment." },
    { team: "Compliance", icon: "gavel", workflow: "Prompt-pay audit", system: "Audit log", risk: "high", note: "Monitors regulatory exposure." },
    { team: "Finance", icon: "bar-chart", workflow: "Reprocessing", system: "Finance system", risk: "medium", note: "Handles 45-day reprocessing." },
  ],
  caseFields: [
    { key: "days_to_payment", label: "Days to payment", kind: "int", default: 41, help: "Days from receipt to payment.", min: 0, max: 120 },
    { key: "fee_schedule_2026", label: "2026 fee schedule used", kind: "bool", default: false, help: "Correct fee schedule version?" },
    { key: "days_since_service", label: "Days since service", kind: "int", default: 60, help: "Days from service to submission.", min: 0, max: 180 },
    { key: "clean_claim", label: "Clean claim", kind: "bool", default: true, help: "Is this a clean claim?" },
  ],
  cases: [
    { id: "contract_late_pay", label: "Default failing case", description: "Clean claim paid in 41 days on the wrong fee schedule.", values: { days_to_payment: 41, fee_schedule_2026: false, days_since_service: 60, clean_claim: true } },
    { id: "contract_compliant", label: "Criteria-met case", description: "Clean claim paid in 22 days on the 2026 schedule.", values: { days_to_payment: 22, fee_schedule_2026: true, days_since_service: 30, clean_claim: true } },
    { id: "contract_timely", label: "Timely-filing case", description: "Submitted 120 days after service — past the limit.", values: { days_to_payment: 20, fee_schedule_2026: true, days_since_service: 120, clean_claim: true } },
  ],
  rules: [
    { ruleId: "K001", domainId: "contract", ruleType: "operations", condition: "Clean claims paid within 30 days", threshold: "30 days", action: "Flag prompt-pay breach", severity: "hard", sourceClause: "Clean claims must be paid within 30 days of receipt.", humanReviewRequired: true },
    { ruleId: "K002", domainId: "contract", ruleType: "coding", condition: "2026 fee schedule version used", threshold: "2026", action: "Flag wrong schedule", severity: "hard", sourceClause: "Reimbursement must follow the 2026 contracted fee schedule version.", humanReviewRequired: true },
    { ruleId: "K003", domainId: "contract", ruleType: "eligibility", condition: "Submission within 90-day timely filing", threshold: "90 days", action: "Deny with timely-filing reason", severity: "hard", sourceClause: "Claims submitted after the 90-day timely filing limit must be denied with the timely-filing reason.", humanReviewRequired: true },
    { ruleId: "K004", domainId: "contract", ruleType: "operations", condition: "Audited underpayments reprocessed within 45 days", threshold: "45 days", action: "Track reprocessing SLA", severity: "soft", sourceClause: "Underpayments identified on audit must be reprocessed within 45 days.", humanReviewRequired: true },
  ],
  qaTests: [],
};

const CMS: PolicyDomain = {
  domainId: "cms_regulatory",
  name: "CMS Regulatory Update",
  category: "Regulatory",
  icon: "landmark",
  oldVersion: "2025.1",
  newVersion: "2026.1",
  effectiveDate: "2026-01-01",
  oldText:
    "Prior authorization decisions should be communicated to providers. Appeals are handled per plan procedures. Decision rationale may be provided on request.",
  newText:
    "Standard prior authorization decisions must be issued within 7 calendar days. Denial notices must include a specific clinical rationale and applicable appeal rights. Plans must report prior authorization metrics for public transparency. Expedited decisions must be issued within 72 hours.",
  summary: [
    "Standard PA decisions must be issued within 7 calendar days.",
    "Denials must include specific rationale and appeal rights.",
    "PA metrics must be reported for public transparency.",
    "Expedited decisions must be issued within 72 hours.",
  ],
  whyItMatters:
    "This mirrors the direction of federal interoperability and prior-authorization rules: firm decision timelines, transparent metrics, and clear appeal rights. Plans that operationalize these as measurable rules avoid regulatory findings and member abrasion. The change is included to show the workbench handling externally-driven regulatory updates, not just internal policy.",
  changedClauses: [
    { changeType: "TIMELINE_CHANGED", oldText: "Prior authorization decisions should be communicated to providers.", newText: "Standard prior authorization decisions must be issued within 7 calendar days.", note: "Sets a firm 7-day standard decision window." },
    { changeType: "NEW_DOCUMENTATION", oldText: "Decision rationale may be provided on request.", newText: "Denial notices must include a specific clinical rationale and applicable appeal rights.", note: "Requires rationale and appeal rights on denials." },
    { changeType: "AUDIT_REQUIREMENT_ADDED", oldText: "", newText: "Plans must report prior authorization metrics for public transparency.", note: "Adds a public metrics-reporting obligation." },
    { changeType: "TIMELINE_CHANGED", oldText: "Appeals are handled per plan procedures.", newText: "Expedited decisions must be issued within 72 hours.", note: "Defines a 72-hour expedited decision window." },
  ],
  impactedTeams: [
    { team: "Regulatory Affairs", icon: "landmark", workflow: "Rule interpretation", system: "Policy registry", risk: "high", note: "Owns regulatory mapping." },
    { team: "Clinical Review", icon: "stethoscope", workflow: "Decision SLAs", system: "UM platform", risk: "high", note: "Meets 7-day / 72-hour windows." },
    { team: "Compliance", icon: "gavel", workflow: "Metrics reporting", system: "Audit log", risk: "high", note: "Publishes PA metrics." },
    { team: "Member Services", icon: "headset", workflow: "Appeal rights notice", system: "CRM", risk: "medium", note: "Communicates rationale and appeals." },
  ],
  caseFields: [
    { key: "decision_days", label: "Decision time (days)", kind: "int", default: 9, help: "Days to issue the decision.", min: 0, max: 30 },
    { key: "expedited", label: "Expedited request", kind: "bool", default: false, help: "Is this an expedited request?" },
    { key: "rationale_included", label: "Rationale included", kind: "bool", default: false, help: "Specific rationale on the notice?" },
    { key: "appeal_rights_included", label: "Appeal rights included", kind: "bool", default: false, help: "Appeal rights on the notice?" },
  ],
  cases: [
    { id: "cms_late", label: "Default failing case", description: "Standard decision issued in 9 days, no rationale or appeal rights.", values: { decision_days: 9, expedited: false, rationale_included: false, appeal_rights_included: false } },
    { id: "cms_compliant", label: "Criteria-met case", description: "Standard decision in 5 days with rationale and appeal rights.", values: { decision_days: 5, expedited: false, rationale_included: true, appeal_rights_included: true } },
    { id: "cms_expedited_late", label: "Expedited breach case", description: "Expedited decision took 4 days (over 72 hours).", values: { decision_days: 4, expedited: true, rationale_included: true, appeal_rights_included: true } },
  ],
  rules: [
    { ruleId: "M001", domainId: "cms_regulatory", ruleType: "operations", condition: "Standard decision within 7 calendar days", threshold: "7 days", action: "Flag SLA breach", severity: "hard", sourceClause: "Standard prior authorization decisions must be issued within 7 calendar days.", humanReviewRequired: true },
    { ruleId: "M002", domainId: "cms_regulatory", ruleType: "operations", condition: "Expedited decision within 72 hours", threshold: "72 hours", action: "Flag expedited breach", severity: "hard", sourceClause: "Expedited decisions must be issued within 72 hours.", humanReviewRequired: true },
    { ruleId: "M003", domainId: "cms_regulatory", ruleType: "documentation", condition: "Denial notice includes rationale and appeal rights", threshold: "true", action: "Pend notice if missing", severity: "hard", sourceClause: "Denial notices must include a specific clinical rationale and applicable appeal rights.", humanReviewRequired: true },
    { ruleId: "M004", domainId: "cms_regulatory", ruleType: "compliance", condition: "PA metrics reported for transparency", threshold: "true", action: "Track reporting obligation", severity: "soft", sourceClause: "Plans must report prior authorization metrics for public transparency.", humanReviewRequired: true },
  ],
  qaTests: [],
};

export const SEED_DOMAINS: PolicyDomain[] = [
  IMAGING, BILLING, CLINICAL, RISK_ADJ, QUALITY, CONTRACT, CMS,
];

