# QA Review Rubric
> Applied by: QA Reviewer agent
> For each task review, apply all sections in order.
> Do not skip sections. Do not combine sections.

---

## What QA reviews — and does not review

REVIEWS:
- Did the output satisfy each task AC condition exactly as written?
- Did each task test pass with the exact expected output specified?
- Is the proof-of-completion file complete and honest?

DOES NOT REVIEW:
- Whether the AC was well-written (that is Zone 3's responsibility)
- Whether the context-package was appropriate (that is the Curate Context agent's responsibility)
- Implementation choices not referenced in AC or tests
- Code style, patterns, or preferences beyond what AC/tests specify

COROLLARY: If an implementation choice is not covered by AC or tests —
QA has no authority to reject it. Mark it as a NOTE, not a FAIL.

---

## Section 1 — AC Coverage

For each TAC condition in task-ac.md:

STEP 1: Read the condition (GIVEN / WHEN / THEN)
STEP 2: Locate evidence in proof-of-completion.md that this condition is satisfied
STEP 3: Assess: is the evidence sufficient, or does it require inference?

PASS:  Evidence directly and unambiguously demonstrates the THEN outcome
FAIL:  Evidence is absent, indirect, or requires inference to connect to the outcome
NOTE:  Evidence present but condition was interpreted — flag interpretation for review

For each condition: record PASS / FAIL / NOTE with reference to the evidence.

---

## Section 2 — Test Results

For each test in task-tests.md:

STEP 1: Read the test (GIVEN / WHEN / THEN expected outputs)
STEP 2: Locate test results in proof-of-completion.md
STEP 3: Compare actual output to expected output — exact match required

PASS:  Actual output matches expected output exactly
FAIL:  Actual output differs from expected output in any way
       (even if the difference seems inconsequential — flag it, do not judge it)
NOTE:  Test used a mock/stub — flag for integration verification in Zone 5

---

## Section 3 — Proof of Completion Quality

Assess whether proof-of-completion.md is complete and honest.

COMPLETE:
- [ ] All TAC conditions addressed (no conditions skipped)
- [ ] All tests referenced (no tests omitted)
- [ ] Output file path stated and matches declared OUTPUT in context-package
- [ ] No "TODO", "placeholder", or "coming soon" in the proof

HONEST:
- [ ] Evidence is direct — not "this should work" or "I believe this passes"
- [ ] Failures acknowledged — proof does not claim PASS for a test that was not run
- [ ] Mocks declared — any mock used is explicitly noted

IF proof-of-completion.md is incomplete or dishonest:
  → Return FAIL regardless of AC coverage
  → Specify exactly what is missing or misleading in review-result.md

---

## Section 4 — Out-of-scope flags (NOTE only, never FAIL)

IF the output does something not covered by AC or tests:
  Record as NOTE in review-result.md
  Do not FAIL on this basis
  Do not remove or alter the extra work

IF the output is missing something not covered by AC or tests:
  Record as NOTE only
  The absence of un-required behaviour is not a failure

---

## Overall result

PASS:     All TAC conditions PASS, all tests PASS, proof-of-completion is complete
FAIL:     One or more TAC conditions FAIL, or one or more tests FAIL,
          or proof-of-completion is incomplete/dishonest
HOLD:     All conditions PASS but one or more tests used mocks that require
          integration verification — cannot issue final PASS until Zone 5
