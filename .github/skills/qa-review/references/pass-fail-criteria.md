# Pass / Fail Criteria
> Definitive rules for what constitutes PASS and FAIL.
> QA Reviewer applies these when evidence is borderline.

---

## The governing principle

QA reviews evidence against criteria. It does not interpret intent.
If the AC says X and the output produces Y — that is a FAIL, even if Y seems fine.
The authority is the written AC condition, not the reviewer's judgement of quality.

---

## Automatic FAIL conditions

Any one of the following produces an automatic FAIL regardless of other factors:

1. A TAC condition has no evidence in proof-of-completion.md
2. A task test result shows actual output ≠ expected output
3. A task test was not run
4. proof-of-completion.md contains "TODO", "placeholder", "coming soon", or equivalent
5. proof-of-completion.md claims PASS for a condition but cites no evidence
6. The output file does not exist at the path declared in context-package.md
7. The output file exists but is empty

---

## Borderline PASS criteria

These situations pass, with a NOTE:

- Output satisfies the THEN condition but via a different mechanism than implied by GIVEN/WHEN
  → PASS + NOTE: "Implementation differs from implied mechanism. AC condition satisfied."

- Output satisfies the condition but includes additional behaviour not covered by AC
  → PASS + NOTE: "Additional behaviour present. Not assessed. Verify intentional."

- Test passes but used a mock
  → HOLD (not PASS, not FAIL) — see review-rubric.md Section 2

---

## Borderline FAIL criteria

These situations fail, even if the intent is clearly correct:

- Output satisfies the spirit of an AC condition but not its literal wording
  → FAIL. AC must be updated if the literal wording was wrong.
  → QA does not update AC. QA returns FAIL with a NOTE explaining the discrepancy.

- A test expected output is almost matched — e.g. text differs by whitespace or punctuation
  → FAIL. Expected outputs are exact. Flag the exact discrepancy.
  → This may indicate the test was written with wrong expected values — QA notes this.

- Output satisfies all AC but proof-of-completion.md is dishonest or incomplete
  → FAIL. Proof quality is non-negotiable.

---

## When AC and tests conflict

IF an AC condition says X and its derived test asserts Y (and X ≠ Y):
  DO NOT resolve by choosing one
  FAIL with NOTE: "AC condition [ID] and test [ID] conflict. See uncertainty-log."
  Write UNCERTAINTY entry in uncertainty-log.md before returning review-result

This is a Zone 3 error (test writing) that reached Zone 4 — it must be
surfaced, not silently resolved by QA.

---

## Repeat failures

IF a task is reviewed for the second time and the same failure is present:
  FAIL as before
  ADD to review-result: "REPEAT FAILURE — this was raised in review [n]. Not resolved."

IF a task is reviewed three or more times with the same failure:
  FAIL as before
  ESCALATE: surface to Task Owner Agent and Product Owner
  The task may need to be re-scoped or its AC revised

---

## What QA never does

- Modifies any source artefact (task-spec, task-ac, tests, context-package)
- Makes implementation suggestions in review-result
- Issues a PASS when evidence is absent "because the intent is clear"
- Issues a FAIL for behaviour not covered by AC or tests
- Resolves conflicts between AC and tests independently