# Review Result Template
> Produced by: QA Reviewer agent
> Stored at: .framework/features/[slug]/tasks/[task-slug]/review-result.md
> This file is the Task Performer's verdict. It does not get edited after writing.

---

## Template

```
# Review Result
TASK:      [task-slug]
FEATURE:   [feature-slug]
REVIEWED:  [date]
REVIEWER:  QA Reviewer Agent
RESULT:    PASS | FAIL | HOLD

***

## AC Coverage

| Condition ID | Result | Evidence Reference | Notes |
|---|---|---|---|
| TAC-[slug]-01 | PASS/FAIL/NOTE | [proof-of-completion section or line] | |
| TAC-[slug]-02 | PASS/FAIL/NOTE | [reference] | |

***

## Test Results

| Test ID | Result | Actual Output | Expected Output | Notes |
|---|---|---|---|---|
| T-[slug]-01 | PASS/FAIL | [actual] | [expected from task-tests.md] | |
| T-[slug]-02 | PASS/FAIL | [actual] | [expected] | |

***

## Proof of Completion

COMPLETE:  YES | NO
HONEST:    YES | NO

IF NO on either:
[Describe exactly what is missing or misleading]

***

## Failures (if any)
> Required section if RESULT is FAIL. Empty if PASS.

FAILURE-1
CONDITION/TEST: [TAC-ID or Test ID]
EXPECTED:       [exact expected outcome from AC or test]
ACTUAL:         [what was found in proof-of-completion]
ACTION REQUIRED: [what the Task Performer must do to resolve this]

***

## Notes (non-blocking observations)
> Items that did not affect the result but should be logged.

- [note]
- [note]

IF NONE: "No notes."

***

## Disposition

IF RESULT: PASS
  Task is complete. Feature Orchestrator may update task status.

IF RESULT: FAIL
  Task is returned to Task Performer.
  Task Performer must address all FAILURE entries above.
  Task Performer must update proof-of-completion.md.
  QA Reviewer will re-review on next submission.

IF RESULT: HOLD
  Task output is acceptable but contains mocked dependencies.
  Final PASS requires integration verification in Zone 5.
  [List which mocks require integration:]
  - [mock description and sibling task that replaces it]

```

---

## Filling rules

RESULT field:
  Set first. It must be consistent with the tables below it.
  If any row in AC Coverage is FAIL → RESULT must be FAIL.
  If any row in Test Results is FAIL → RESULT must be FAIL.
  If all rows PASS but any test is mocked → RESULT must be HOLD.

AC Coverage table:
  Every TAC condition must appear. No conditions may be omitted.
  Evidence Reference must be specific — not "see proof-of-completion".
  Cite the specific section, screenshot, or output line.

Test Results table:
  Every test in task-tests.md must appear. No tests may be omitted.
  Actual Output must be the literal value observed — not a description.
  If the test was not run: RESULT = FAIL, Actual Output = "NOT RUN".

FAILURE entries:
  One entry per failure. Do not combine failures.
  ACTION REQUIRED must be specific enough that the Task Performer can act
  without asking a clarifying question.
  WRONG:  "Fix the form validation"
  RIGHT:  "The email field does not show an error message when the field is
           empty. Expected: 'Please enter a valid email address' visible below
           the field. Actual: no error displayed, form submits with empty email."