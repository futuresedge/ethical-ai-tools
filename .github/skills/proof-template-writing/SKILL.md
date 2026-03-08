# Proof Template Writing Skill

**Loaded by:** ProofDesigner
**Purpose:** Write proof templates that are unambiguous contracts —
where any competent reviewer can determine pass or fail without
judgment, and any competent performer knows exactly what evidence
to produce.

---

## The Central Rule

A proof template criterion is only valid if a reviewer who has never
seen the task can read the criterion and the submitted evidence and
determine pass or fail without making a judgment call.

If the reviewer needs to use judgment, the criterion is not specific
enough. Rewrite it until the answer is mechanical.

---

## Anatomy of a Proof Template

```
***
task_id:       task-XX
task_name:     [human-readable name]
authored_by:   ProofDesigner (never TaskPerformer)
qa_tier:       [0-4 from task spec]
created:       [date]
***

## Criterion [N]: [Short name]

description:
  [What this criterion verifies. One to three sentences.
   Describe the property being checked, not the implementation.]

evidence_required:
  [Exact description of what evidence must be submitted.
   Include: format, source, and scope.]

passing_condition:
  [The precise condition that constitutes a pass.
   Must be binary — either it passes or it doesn't.]

failing_condition:
  [What would make this criterion fail.
   Explicit, not implied from the passing condition.]
```

Repeat for each criterion. Every AC item produces at least one
criterion. A complex AC item may produce multiple criteria.

---

## Criterion Quality Rules

### Rule 1 — One verifiable property per criterion
Each criterion checks exactly one thing. A criterion that checks
"the form submits and the user receives a confirmation email" is
two criteria: form submission and email delivery. Split it.

### Rule 2 — Evidence format is specified
Do not write "tests pass" — write "the output of `pnpm test` contains
no failing test lines and exits with code 0." The reviewer should
know exactly what to look for before seeing the submission.

### Rule 3 — Passing condition is binary
"Performance is acceptable" is not binary. "Lighthouse performance
score ≥ 90 on three consecutive runs on the staging URL" is binary.
If you find yourself writing "reasonable", "adequate", "good", or
"appropriate" — stop. Replace with a number, a threshold, or a
specific observable state.

### Rule 4 — Failing condition is explicit
Do not make the reviewer infer the failure condition from the passing
condition. State it. "The build exits with code 1" is clearer than
leaving the reviewer to infer that non-zero exit = fail.

### Rule 5 — Evidence is producible before deployment
Proof is submitted before APPROVED state. All evidence must be
producible in the task's execution environment, not in production.
If a criterion can only be verified post-deployment, it belongs in
the post-deploy review, not the proof template.

---

## Translating Acceptance Criteria Into Criteria

Work through each AC item in sequence.

For each AC item, ask:
1. **What is the observable outcome?** Not the implementation, the
   outcome. "A user can submit the contact form" is an outcome.
   "The `handleSubmit` function is called" is an implementation detail.

2. **What evidence would prove this outcome occurred?** For each
   outcome, identify what the TaskPerformer can capture as proof.
   Prefer objective over subjective evidence. Prefer automated over
   manual evidence.

3. **Is this one criterion or multiple?** If an AC item contains
   "and", it is likely multiple criteria. Split before writing.

4. **Is this criterion testable in the execution environment?**
   If not, flag this to TaskOwner before writing the template.
   An untestable criterion is a spec problem, not a proof problem.

If an AC item is ambiguous, raise uncertainty to TaskOwner before
writing the criterion. Do not write a criterion around an ambiguous
AC — you will produce a template that can be gamed.

---

## Evidence Type Taxonomy

Use the most objective evidence type available:

| Type | When to use | Example |
|---|---|---|
| **Command output** | Build, test, lint, type-check | `pnpm build` stdout + exit code |
| **File content** | Generated output verification | Contents of `dist/index.html` |
| **HTTP response** | API or page availability | `curl` status + response body excerpt |
| **Test results** | Functional verification | Full test runner output, not summary |
| **Screenshot** | Visual / UI criteria only | Annotated screenshot with visible element |
| **Metrics output** | Performance criteria | Lighthouse CLI JSON output |
| **Log excerpt** | Service behaviour | Specific log lines with timestamps |

Avoid "manual testing" as evidence. Manual testing is not verifiable
from a submitted proof document. If a criterion requires manual
testing, rewrite it as an automated check or flag it to TaskOwner.

---

## Common Anti-patterns

**"Works correctly"**
→ Works how? Under what conditions? For which inputs?
→ Replace with: the specific output for a specific input.

**"No errors"**
→ Which errors? Detected how? In which tool output?
→ Replace with: "the output of `pnpm build` contains zero lines
   matching the pattern `error:`".

**"Tests pass"**
→ Which tests? All of them? A specific suite?
→ Replace with: "the output of `pnpm test` shows 0 failed tests
   and exits with code 0."

**"Looks good"**
→ This is not a criterion. If visual quality matters, define it:
   what must be visible, where, at what viewport size?

**"Performance is acceptable"**
→ Define the metric, the threshold, and the measurement tool.

**"Compatible with the environment contract"**
→ This is EnvironmentReviewer's job, not a proof criterion.
   Remove it — it will be verified independently.

**Criteria that the TaskPerformer writes their own evidence for**
→ Proof criteria must be verifiable from captured outputs.
   If the TaskPerformer can write any evidence they like and it
   would "pass", the criterion is not a criterion — it is a checkbox.

---

## Self-Check Before Submitting

Before submitting a proof template, answer these questions:

1. Can a reviewer who has not seen this task read each criterion
   and know exactly what evidence to look for? (Yes / No — if No,
   rewrite the criterion.)

2. Could a TaskPerformer read this template and know, before writing
   a single line of code, what they need to produce as proof?
   (Yes / No — if No, rewrite.)

3. Does every AC item appear in at least one criterion? Check off
   each AC item against the criterion list. Gaps are missing criteria.

4. Are any criteria untestable in the execution environment? If yes,
   raise uncertainty to TaskOwner before submitting.

5. Did you write any passing condition that requires judgment?
   ("Sufficient", "reasonable", "adequate" — all require judgment.)
   Replace all of these with measurable thresholds.