# Cotiviti Intern Assessment Submission
# PolicyLens Workbench

**Candidate:** Gaurvendra Pratap Singh Pundhir  
**University:** University of Arizona  
**Topic selected:** Content Management in Health Care

## Submission overview

PolicyLens Workbench is a production-grade prototype for AI-native healthcare content management. It demonstrates how healthcare policy updates can be compared, converted into source-cited candidate rules, tested against synthetic cases, reviewed by humans, connected to QA test cases, and exported as audit-ready evidence.

The prototype uses synthetic policy text and synthetic case data only. It does not process PHI and does not make real clinical, payment, or coverage decisions.

## Folder structure

```text
report/
  Cotiviti_Intern_Report_PolicyLens_Workbench.docx

slides/
  Cotiviti_Intern_Presentation_PolicyLens_Workbench.pptx

video/
  Cotiviti_Intern_Demo_Video_Script.md
  [Place final MP4 here after recording]

app/
  policylens-workbench/
    React + TypeScript app source code

docs/
  App_QA_Verification.md
  Final_Submission_Checklist.md
  Submission_Email.md
```

## App setup

```bash
cd app/policylens-workbench
npm install
npm run dev
npm test
npm run build
```

## Verified app status

- 7 synthetic policy domains
- 33 source-cited candidate rules
- 23 synthetic cases
- 27 changed clauses
- 28 editable case fields
- 33 tests passed
- Production build succeeded

## Suggested recording flow

1. Start with the PowerPoint title slide.
2. Explain the problem and product thesis.
3. Open PolicyLens Workbench Command Center.
4. Show Imaging Prior Authorization in Policy Library.
5. Walk through Version Diff and Impact Map.
6. Open Rule Studio and show source-cited candidate rules.
7. Run the default imaging case in Scenario Lab.
8. Change therapy weeks from 5 to 6 and rerun.
9. Show QA Tests and Reviewer Queue.
10. Export/copy the Audit Pack.
11. Close on Future Add-ons and Responsible Use.
```
