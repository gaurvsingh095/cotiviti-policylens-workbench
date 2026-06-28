# 8-Minute Final Video Script
## Cotiviti Intern Assessment — PolicyLens Workbench

**Presenter:** Gaurvendra Pratap Singh Pundhir  
**University:** University of Arizona  
**Target length:** 8 minutes  
**Format:** PowerPoint + live app demo + camera on  
**Final MP4 filename:** `Cotiviti_Intern_Demo.mp4`

---

## Before Recording

Open:
1. PowerPoint deck in presentation mode
2. PolicyLens Workbench running locally in browser
3. Camera on
4. Screen recording on

---

## 0:00–0:25 — Slide 1: Title

**Show:** Title slide.

**Say:**

Hi, my name is Gaurvendra Pratap Singh Pundhir from the University of Arizona. For this assessment, I selected the healthcare content management topic and built **PolicyLens Workbench**.

PolicyLens Workbench is a working product prototype for turning healthcare policy updates into structured rules, synthetic QA test cases, reviewer actions, and audit-ready evidence.

This prototype uses synthetic data only. It does not process PHI and does not make real clinical, payment, or coverage decisions.

---

## 0:25–1:05 — Slide 2: The Problem

**Show:** Problem slide.

**Say:**

The problem I focused on is that healthcare policies are not just documents. They are operational instructions.

A policy update can affect prior authorization, payment integrity, billing and coding edits, clinical documentation requirements, provider communication, appeals, compliance, and engineering implementation.

In the traditional process, teams move from policy PDFs or internal policy updates into spreadsheets, emails, meetings, Jira tickets, QA documents, and reviewer checklists.

That creates a manual handoff problem. Teams have to understand what changed, what rules are affected, what needs testing, who needs to approve it, and how to preserve evidence for audit or appeal.

---

## 1:05–1:45 — Slide 3: Traditional Process vs PolicyLens

**Show:** Traditional process / workflow gap slide.

**Say:**

Traditionally, a policy analyst reads the old and new policy, manually summarizes changes, sends notes to operations, engineering translates requirements into logic, QA writes test cases, reviewers approve the logic, and compliance later asks for evidence.

PolicyLens Workbench compresses and governs that workflow.

The product takes a policy change and turns it into a structured operational package: changed clauses, affected workflows, candidate rules, synthetic scenario results, QA tests, reviewer queue items, and audit evidence.

The value is faster policy review, fewer handoff errors, better QA coverage, clearer provider-facing explanations, and stronger auditability.

---

## 1:45–2:20 — Slide 4: Why This Topic

**Show:** Why this topic slide.

**Say:**

I chose this topic because it is directly relevant to payer operations and healthcare analytics.

A generic clinical NLP demo can become just a summarizer. A clinical decision-making assistant can create safety and regulatory concerns if it appears to influence treatment decisions.

This project focuses on healthcare content management as an operating layer: billing and coding policies, documentation requirements, prior authorization criteria, payer-provider rules, and payment integrity edits.

That is where structured interpretation, governance, and auditability can create real operational value.

---

## 2:20–2:55 — Slide 5: Product Concept

**Show:** Product lifecycle slide.

**Say:**

PolicyLens Workbench follows this lifecycle:

Policy intake, version diff, operational impact map, candidate rule extraction, reviewer workflow, synthetic scenario testing, QA test generation, and audit package export.

The thesis is that healthcare policy content should become a governed operating layer. It should be compared, structured, tested, reviewed, and audited before it affects payment integrity, prior authorization, risk adjustment, or quality workflows.

For the live demo, I’ll focus on one primary use case: **Imaging Prior Authorization**.

---

## 2:55–3:15 — Slide 6: Use Case Setup

**Show:** Imaging Prior Authorization use case slide.

**Say:**

The old imaging policy said clinical notes should be submitted when available and conservative therapy may be considered.

The new policy is stricter. Clinical notes must be included, at least six weeks of conservative therapy must be documented unless the case is urgent, urgent cases must route within 72 hours, and denied or pended responses must include a specific reason tied to failed criteria.

Now I’ll switch to the working prototype.

---

## 3:15–3:45 — App Demo: Command Center

**Action:** Switch to browser app.  
**Show:** Command Center.

**Say:**

Here is the working prototype.

I’m starting in the **Command Center**, which gives a portfolio-level view of the policy operations workspace.

The app includes seven seeded healthcare policy domains, including Imaging Prior Authorization, Billing and Coding Edit Policy, Clinical Documentation Requirement, Risk Adjustment Documentation, Quality Measure Evidence Review, Payer-Provider Contract Terms, and CMS Regulatory Update.

The command center shows candidate rules, review queue items, QA tests, high-risk changes, traceability, and audit readiness.

Instead of teams tracking policy implementation across emails and disconnected documents, this dashboard centralizes operational readiness.

---

## 3:45–4:10 — App Demo: Policy Library

**Action:** Click **Policy Library**.  
**Show:** Imaging Prior Authorization.

**Say:**

Next, I’ll open the **Policy Library**.

For this demo, I’m focusing on **Imaging Prior Authorization**.

Here we can see the old policy version, the new policy version, the effective date, impacted teams, and policy context.

This is the intake layer. A real version could ingest policy updates from internal policy documents, payer bulletins, CMS updates, contract terms, or coding policy libraries. For this prototype, all data is synthetic.

---

## 4:10–4:45 — App Demo: Version Diff

**Action:** Click **Version Diff**.  
**Show:** Old vs new clauses.

**Say:**

Now I’ll open **Version Diff**.

This page compares old and new policy language.

One key change is that clinical notes move from “should be submitted when available” to “must be included.” That is operationally important because “should” and “must” create different workflows.

Another change is conservative therapy. The old policy said conservative therapy may be considered. The new policy requires at least six weeks unless the case is urgent.

There is also a new 72-hour urgent review requirement and a requirement that denied or pended responses include a specific reason tied to failed criteria.

This reduces manual policy comparison work and helps teams identify changes that affect operations, QA, provider communication, and compliance.

---

## 4:45–5:10 — App Demo: Impact Map

**Action:** Click **Impact Map**.  
**Show:** Teams, workflows, risks.

**Say:**

Next is the **Impact Map**.

This shows which workflows and teams are affected by the policy change.

For imaging prior authorization, impacted areas include prior authorization intake, clinical review, provider communication, compliance review, engineering or rule configuration, and QA testing.

This helps prevent downstream misses. Instead of discovering late that a policy change also requires QA tests or provider communication updates, the impact is mapped early.

---

## 5:10–5:45 — App Demo: Rule Studio

**Action:** Click **Rule Studio**.  
**Show:** R-IMG-003 or conservative therapy rule.

**Say:**

Now I’ll open **Rule Studio**.

This is where policy language becomes structured candidate rules.

For example, this rule is tied to the conservative therapy requirement. It has a rule ID, source clause, plain-English interpretation, condition, severity, owner team, affected workflow, and review status.

The important boundary is that these are candidate rules, not automatically approved operational logic. A reviewer can approve, reject, request revision, or add notes.

This improves the handoff from policy teams to engineering and QA because the implementation team receives structured, source-linked rule requirements instead of vague policy notes.

---

## 5:45–6:40 — App Demo: Scenario Lab

**Action:** Click **Scenario Lab**.  
**Show:** Default imaging case.

Inputs to show:
- Member age: 52
- Clinical notes included: true
- Conservative therapy weeks: 5
- Urgent: false

**Say:**

Now I’ll open **Scenario Lab**.

This is where teams can test synthetic cases before rules affect real workflows.

I’ll use the default imaging case: member age 52, clinical notes included, five weeks of conservative therapy, and not urgent.

**Action:** Click **Run Scenario**.

The system returns **NOT_APPROVED_MISSING_CRITERIA** because the synthetic case only documents five weeks of conservative therapy, while the policy requires at least six weeks unless the case is urgent.

This is not a real denial. It is a synthetic policy test showing how the rule behaves.

Now I’ll change conservative therapy from five weeks to six weeks and run it again.

**Action:** Change therapy weeks from 5 to 6. Click **Run Scenario** again.

Now the result changes to criteria met with human review required.

This shows that the rule logic is working, while still preserving the human review boundary.

---

## 6:40–7:05 — App Demo: QA Tests

**Action:** Click **QA Tests**.  
**Show:** Generated tests.

**Say:**

Next, I’ll open **QA Tests**.

Every rule that becomes operational needs test coverage. This page generates synthetic QA test cases linked to candidate rules.

For the imaging domain, the tests include missing clinical notes, five versus six weeks of conservative therapy, urgent routing, and criteria-met cases.

This is valuable for engineering and QA teams because it translates policy intent into testable behavior and reduces the risk of incorrect implementation.

---

## 7:05–7:30 — App Demo: Reviewer Queue

**Action:** Click **Reviewer Queue**.  
**Show:** Review statuses.

**Say:**

Now I’ll open **Reviewer Queue**.

This centralizes governance. Rules that need approval, rejection, or revision can be reviewed by clinical policy, compliance, payment integrity, or operations teams.

This is where the product becomes more than a rules engine. It creates a controlled workflow so rules do not become implementation-ready without human validation.

---

## 7:30–7:55 — App Demo: Audit Pack

**Action:** Click **Audit Pack**.  
**Show:** JSON/export evidence.

**Say:**

Finally, I’ll open **Audit Pack**.

This brings together the policy versions, changed clauses, candidate rules, reviewer statuses, QA tests, scenario results, traceability information, and responsible-use note.

The exportable package is important because healthcare operations often need to answer: what source language created this rule, who reviewed it, what tests were run, and what evidence supports the output?

This improves audit readiness and makes policy implementation easier to explain during compliance review, appeals, or internal quality checks.

---

## 7:55–8:20 — Future Add-ons + Closing

**Action:** Click **Future Add-ons**, or stay on Audit Pack if short on time.

**Say:**

The Future Add-ons page shows where this could go next: a RAG-based policy chat agent with source citations, PDF ingestion, FHIR and HL7 Da Vinci mapping, claims system connectors, provider-facing requirement portals, model evaluation, role-based access control, and a production audit database.

To close, PolicyLens Workbench demonstrates how AI-native content management can help healthcare organizations move from policy text to auditable operational rules.

It is not designed to replace reviewers. It is designed to help policy, compliance, operations, and engineering teams work faster with better structure, better testing, and better traceability.

Thank you for reviewing my submission.
