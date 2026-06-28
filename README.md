# Cotiviti Intern Assessment Submission
# PolicyLens Workbench

**Candidate:** Gaurvendra Pratap Singh Pundhir  
**University:** University of Arizona  
**Topic selected:** Content Management in Health Care

## Submission overview

PolicyLens Workbench is a production-grade prototype for AI-native healthcare content management. It demonstrates how healthcare policy updates can be compared, converted into source-cited candidate rules, tested against synthetic cases, reviewed by humans, connected to QA test cases, and exported as audit-ready evidence.

The prototype uses synthetic policy text and synthetic case data only. It does not process PHI and does not make real clinical, payment, or coverage decisions.

## Demo Video

Watch the recorded demo here:  
[PolicyLens Workbench Demo Video](https://drive.google.com/file/d/1GTppM7jCYbcBdyq9kgMUZeT8HpaK09fW/view?usp=sharing)

A backup MP4 may also be included in the repository under:

`video/Cotiviti_Intern_Demo.mp4`
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


```
