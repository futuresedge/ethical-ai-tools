# Task AC Constraints
> Additional constraints that apply specifically to task-scope AC.
> Read in addition to four-ac-conditions.md and given-when-then-format.md.

---

## Task AC is narrower than Feature AC

Feature AC: describes what the feature delivers to a user
Task AC:    describes what this specific unit of work delivers to the feature

Task AC must:
- Reference only the scope of this task — not adjacent tasks
- Be completable without any other task being done first (independence rule)
- Produce at least one explicit, testable output

Task AC must not:
- Repeat feature-level AC verbatim — it should refine and scope it
- Reference implementation of sibling tasks
- Describe outcomes that require integration with incomplete work

---

## The independence test

BEFORE writing task AC, apply this test:
Can this task's AC be verified in isolation, with sibling tasks not yet done?

IF NO:
  The task has a hidden dependency.
  Either: restructure the task boundaries (go back to decomposition)
  Or:     make the dependency explicit in the task-spec and reflect it in AC

---

## Sizing constraint

A task should produce between 1 and 5 AC conditions.
FEWER THAN 1: the task is undefined — return to task-spec
MORE THAN 5:  the task is too large — return to decomposition

---

## Relationship to feature AC

Task AC refines feature AC — it does not replace or ignore it.
Each task AC condition should be traceable to at least one feature AC condition.

IF a task AC condition has no parent in feature AC:
  Either: the feature AC is incomplete (flag to Feature Owner)
  Or:     the task is out of scope (flag to Task Owner)

---

## Output format

Each task AC condition must include:

CONDITION ID: TAC-[task-slug]-[n]   e.g. TAC-commissions-form-01
GIVEN:        [precondition]
WHEN:         [trigger]
THEN:         [observable outcome]
TRACES TO:    [parent feature AC condition ID]

---

## Example

CONDITION ID: TAC-commissions-form-01
GIVEN:  the CommissionsForm component is mounted with all fields empty
WHEN:   a user submits the form without entering an email address
THEN:   the email field displays the error message "Please enter a valid email address"
        and the form does not submit
TRACES TO: FAC-commissions-03
  (Feature AC: "The form validates all required fields before submission")
