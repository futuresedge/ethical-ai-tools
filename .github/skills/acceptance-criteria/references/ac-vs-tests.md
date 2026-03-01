# AC vs Tests — The Load-Bearing Distinction
> The single most important rule in the framework.
> Every agent that reads this must internalise it before producing any output.

---

## The rule

AC:   describes a CONDITION the system must satisfy
TEST: describes HOW to verify that condition is satisfied

They are never the same thing.
They are never written by the same agent.
They live in different files.

---

## Why this matters

If AC contains test logic — the AC writer has made assumptions about
implementation that constrain the executor unnecessarily.

If a test is written without a corresponding AC — there is no authoritative
source of truth for what pass/fail means.

If AC and tests are conflated — QA has no independent reference to review against.
The system cannot verify itself.

---

## The boundary, precisely

AC answers: what must be true when this is done?
TEST answers: how do we confirm it is true?

AC is written in problem-space language (observable outcomes).
Tests are written in verification language (inputs, actions, expected outputs).

---

## Examples

### Correct separation

AC:
  GIVEN an authenticated user is on their profile page
  WHEN  they update their display name and save
  THEN  the updated name is visible on the page without a full page reload

TEST (derived from AC):
  GIVEN: user is authenticated, profile page is mounted, display name field shows "Alice"
  WHEN:  user types "Alice Updated" in the display name field and clicks Save
  THEN:  within 500ms, the display name shown on the page reads "Alice Updated"
  AND:   no full page navigation event is recorded in the performance observer

### Wrong — AC contains test logic

AC (BAD):
  GIVEN the ProfileForm component receives a PUT request to /api/users/:id
  WHEN  the response status is 200
  THEN  the useProfile hook updates its local state

This is implementation specification masquerading as AC.
The agent that writes this has overstepped its scope.

---

## Enforcement by zone

Zone 2 AC Writer: writes problem-space conditions only — no test logic
Zone 3 Test Writer: derives tests from AC — does not rewrite AC
Zone 4 QA Reviewer: reviews proof-of-completion against AC and tests independently
                     never conflates the two in its review output

---

## When you see conflation — what to do

READING AC that contains test logic:
  → rewrite as observable outcome, remove implementation references
  → flag in uncertainty-log if scope is unclear

READING tests that are just copies of AC:
  → tests are insufficient — they must specify expected outputs
  → flag as requiring rework before task can proceed
