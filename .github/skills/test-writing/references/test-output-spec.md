# Test Output Specification
> The required format for all tests produced in this framework.
> Applies to: feature-tests.md and task-tests.md

---

## The non-negotiable rule

A test without an explicit expected output is not a test.
It is a description of a behaviour — which is what AC is for.

WRONG: "Then the form should submit successfully"
WRONG: "Then the user sees a confirmation"
WRONG: "Then the error state is displayed"

RIGHT: "Then the page displays the text: 'We'll be in touch within 2 business days'"
RIGHT: "Then the HTTP response status received by the client is 200"
RIGHT: "Then the email field renders with aria-invalid='true' and the
        text 'Please enter a valid email address' is visible below the field"

---

## Required test format

```
TEST ID:   [T-feature-slug-n] or [T-task-slug-n]
TRACES TO: [AC condition ID — FAC-n or TAC-n]
TITLE:     [one-line description of what is being verified]

GIVEN:
  [system state before the test runs — specific, not general]
  [include component mount state, data state, user auth state as applicable]

WHEN:
  [exact action performed — specific enough to be automated]

THEN:
  [EXPECTED OUTPUT 1]: [exact value, text, status code, state — no vague language]
  [EXPECTED OUTPUT 2]: [if multiple outcomes, list each on its own line]

NOTES (optional):
  [timing constraints, environment requirements, known flakiness risks]
```

---

## Expected output types — with examples

### Text content
WRONG:  "THEN a success message appears"
RIGHT:  "THEN the element with data-testid='confirmation-message' contains the
         text 'We'll be in touch within 2 business days'"

### HTTP / network
WRONG:  "THEN the form submits successfully"
RIGHT:  "THEN a POST request is made to the Formspree endpoint
         AND the response status code is 200
         AND the response body contains { 'next': 'https://formspree.io/...' }"

### Visibility / DOM state
WRONG:  "THEN the error is shown"
RIGHT:  "THEN the element with id='email-error' has CSS display != 'none'
         AND its text content is 'Please enter a valid email address'"

### Navigation / routing
WRONG:  "THEN the user is redirected"
RIGHT:  "THEN window.location.pathname equals '/commissions/confirmation'"

### Timing
WRONG:  "THEN the update appears quickly"
RIGHT:  "THEN within 500ms of the response, the display name shown in
         [data-testid='profile-name'] equals 'Alice Updated'"

### Accessibility state
WRONG:  "THEN the field is marked invalid"
RIGHT:  "THEN the input element has aria-invalid='true'
         AND aria-describedby references the id of the visible error element"

---

## Multiplicity rule

ONE expected output per THEN line.
If a single action produces multiple outcomes — list each on its own THEN line.
Each THEN line maps to one assertion in the eventual automated test.

---

## Test ID convention

Feature-scope tests:   T-[feature-slug]-[n]     e.g. T-commissions-01
Task-scope tests:      T-[task-slug]-[n]         e.g. T-build-form-01
Traces To reference:   FAC-[n] or TAC-[slug]-[n]
