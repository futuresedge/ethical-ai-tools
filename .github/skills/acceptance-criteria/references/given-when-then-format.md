# Given / When / Then Format
> The required format for all AC in this framework — feature-scope and task-scope.

---

## Structure

GIVEN: the precondition — the state of the world before the action
WHEN:  the trigger — the single action taken by the actor
THEN:  the outcome — the observable state after the action

---

## Rules

ONE Given per criterion.
If multiple preconditions are needed — use AND within Given, not a second Given.
  CORRECT: Given a user is authenticated AND their profile is incomplete
  WRONG:   Given a user is authenticated / Given their profile is incomplete

ONE When per criterion.
If two actions are needed — split into two criteria.

ONE Then per criterion.
See four-ac-conditions.md Condition 2 (atomic).

---

## Actor must be named in Given or When

FAIL: "When the form is submitted"       ← who submits it?
PASS: "When an authenticated user submits the form"

FAIL: "Given the page has loaded"        ← loaded for whom?
PASS: "Given an unauthenticated visitor has navigated to /commissions"

---

## Tense and voice

GIVEN: past perfect or simple past — "a user has navigated", "the session has expired"
WHEN:  simple present — "a user submits", "the system receives"
THEN:  simple present, active — "the form displays", "the page redirects"

NEVER: "should be", "will be", "would be"
ALWAYS: present-tense assertion

---

## Examples

### Feature-scope AC

GIVEN an unauthenticated visitor is on the /commissions page
WHEN  they submit the enquiry form with all required fields completed
THEN  the page displays a confirmation message: "We'll be in touch within 2 business days"
AND   the form fields are cleared
AND   a submission event is fired to the analytics layer

Note: three AND clauses above should be split into three separate AC criteria.

### Task-scope AC (narrower, more specific)

GIVEN the CommissionsForm component has mounted with no pre-filled values
WHEN  a user submits the form with a valid email and a message of 20+ characters
THEN  the Formspree endpoint receives a POST request with the correct form ID
AND   the response status is 200
AND   the onSuccess callback fires within 1000ms of the response

---

## What Given/When/Then is not

NOT a test. The test is derived FROM this.
NOT a user story. User stories describe intent. AC describes the verifiable outcome.
NOT a specification of implementation. No component names, hook names, or state references.
