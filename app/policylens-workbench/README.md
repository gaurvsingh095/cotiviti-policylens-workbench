# PolicyLens Workbench

**A healthcare policy operations workbench that converts policy text into auditable operational rules, synthetic QA test cases, reviewer actions, and exportable audit packages.**

PolicyLens Workbench is a production-grade React/TypeScript application that demonstrates the full lifecycle of a policy change: read the new policy, see exactly what changed, understand who it impacts, turn it into structured candidate rules, review those rules, test them against synthetic cases, and export a complete, source-traceable audit package — all in the browser, with no PHI and no API keys.

---

## The problem

Healthcare payers and payment-integrity organizations rewrite policy constantly. Each revision has to be read, interpreted, turned into operational edits and rules, reviewed, tested, and applied consistently — usually by hand, often with permissive language (`"should"`, `"may"`) that two reviewers read two different ways. The translation from prose to operational logic is slow, inconsistent, and hard to audit.

## The solution

PolicyLens Workbench turns that translation into a structured, reviewable, and auditable workflow:

- **Source-cited rules.** Every candidate rule carries the exact policy clause it was derived from.
- **Deterministic evaluation.** A plain, testable engine evaluates synthetic cases the same way every time — no black box.
- **Human-in-the-loop.** Every rule is a candidate that a reviewer must approve, reject, or send back for revision.
- **End-to-end traceability.** Each decision traces source clause → rule → finding → output status, exportable as a single JSON audit package.

---

## Features

| Page | What it does |
|---|---|
| **Command Center** | Portfolio dashboard: domains, rules, QA tests, tracked changes, reviewer progress, and per-domain charts. |
| **Policy Library** | Browse 7 synthetic domains with old/new policy text and version metadata. |
| **Version Diff** | Old vs. new clauses, each labeled by change type (documentation, timeline, threshold, audit, coding…). |
| **Impact Map** | Impacted teams, workflows, systems, and a risk-profile radar. |
| **Rule Studio** | Approve / reject / request revision on each candidate rule, with reviewer notes and source clauses. |
| **Scenario Lab** | Select a synthetic case, edit inputs (sliders/toggles), and run a live deterministic evaluation with findings. |
| **QA Tests** | Synthetic QA tests generated from cases, each linked to a rule with an expected status. |
| **Reviewer Queue** | All rule decisions, filterable by status, scoped to the current domain or the whole portfolio. |
| **Audit Pack** | One exportable JSON package: policy, changes, rules + decisions, QA, scenario result, traceability, responsible-use note. |
| **Future Add-ons** | Roadmap items marked "Coming soon" — plus a working, offline policy-assistant preview. |
| **Responsible Use** | Synthetic-only, no-PHI, no-real-decisions, human-validation-required principles. |

Core MVP behaviors are 100% functional: the domain selector drives every page, reviewer decisions persist to `localStorage`, scenario evaluation is live, and the audit pack reflects the current state.

---

## Tech stack

- **Vite** + **React 18** + **TypeScript** (strict)
- **TailwindCSS** for styling (navy / blue / teal palette)
- **Lucide React** for icons
- **Recharts** for charts
- **Vitest** for tests
- Local TypeScript seed data, browser/local state, optional `localStorage` persistence

No backend, no API keys, no network calls.

---

## Setup

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run preview  # preview the production build
npm test         # run the Vitest suite
```

Open the dev server URL (default `http://localhost:5173`).

### Serve with Flask (Python host)

The app is a static front end; Flask can host the production build without changing any UI or app logic.

```bash
npm install && npm run build      # produces dist/
pip install -r requirements.txt   # installs Flask
python server.py                  # serves dist/ at http://localhost:8000
```

Set a different port with `PORT=8080 python server.py`. Flask only serves the
built files — all policy logic still runs in the browser, so the UI is identical
to the dev/preview build. For production, run it behind a WSGI server (e.g.
`gunicorn server:app`).

---

## Tests

```bash
npm test
```

The suite covers:

- **Scenario outputs** for all 7 domains (representative pass/fail/pend/flag/block cases).
- **Source traceability** — every finding on every default case cites a source clause (100% coverage).
- **QA linkage** — every generated QA test links to a real rule in its domain.
- **Audit package generation** — required sections present, reviewer decisions reflected, valid JSON, every domain builds.
- **Seed completeness** — at least 7 domains, none missing rules, cases, fields, clauses, teams, or text.

---

## Demo flow (about 3 minutes)

1. **Command Center** — show the 7-domain portfolio, the rules/QA chart, and reviewer progress.
2. **Policy Library** — open Imaging Prior Authorization; read old vs. new text and "why this matters".
3. **Version Diff** — walk the labeled clause changes (`should` → `must`, the six-week threshold, the 72-hour window).
4. **Impact Map** — show impacted teams, systems, and the risk radar.
5. **Rule Studio** — expand a rule, read its source clause, add a note, and approve it.
6. **Scenario Lab** — raise "Conservative therapy" to 6 and watch the decision flip to approved; toggle notes off to pend; toggle urgent to route for 72-hour review.
7. **QA Tests** — show generated tests linked to rules with expected statuses.
8. **Reviewer Queue** — filter by status; jump back to Rule Studio.
9. **Audit Pack** — copy or download the full JSON package and point out the traceability trail.
10. **Switch domains** (sidebar selector) to Billing, Risk Adjustment, Quality, Contract, or CMS — every page updates.
11. **Future Add-ons** & **Responsible Use** — roadmap and guardrails.

---

## Seed data (7 synthetic domains)

1. **Imaging Prior Authorization** — age floor, conservative-therapy minimum, documentation, urgent routing.
2. **Billing & Coding Edit Policy** — modifier 59 documentation, four-key duplicate detection, pend-before-deny.
3. **Clinical Documentation Requirement** — four required record elements, specific pends, traceability.
4. **Risk Adjustment Documentation** — current-year reassessment, face-to-face encounter, no carry-forward.
5. **Quality Measure Evidence Review** — dated evidence, result values, coded exclusions.
6. **Payer-Provider Contract Terms** — 30-day prompt pay, fee-schedule version, 90-day timely filing.
7. **CMS Regulatory Update** — 7-day / 72-hour decision windows, rationale and appeal rights, metrics reporting.

Each domain ships with old/new versions, changed clauses, impacted teams, candidate rules (source-cited), synthetic cases, generated QA tests, and full audit traceability.

---

## Responsible use

PolicyLens Workbench is a proof-of-concept. It uses synthetic policy text and synthetic case data. It does **not** process PHI and does **not** make real medical, payment, or coverage decisions. Every extracted rule requires human validation before operational use. The app runs entirely in the browser on local state with no external API calls.

---

## Limitations

- Synthetic, simplified policies and cases — not real payer policy.
- The rule set is authored for these domains; it is not a general policy parser.
- Evaluation is deterministic demonstration logic, not a certified adjudication engine.
- Not for production use against real data without the appropriate engineering, validation, security, and compliance controls.

## Future roadmap

- RAG policy assistant with citations (a deterministic offline preview ships today)
- FHIR / Da Vinci (CRD, DTR, PAS) mapping
- PDF and document ingestion with automated clause extraction
- Claims-system connector for production-volume evaluation
- Provider portal for pre-submission transparency
- Model-evaluation harness for LLM rule extraction
- Enterprise RBAC and SSO

---

*PolicyLens Workbench · synthetic proof of concept · no PHI · not a clinical or claims decision system.*
