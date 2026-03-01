# Test vs AC — Derivation Rules
> How to derive a test from an AC condition.
> Companion to ac-vs-tests.md in the acceptance-criteria skill.

---

## The derivation relationship

One AC condition → one or more tests
One test → exactly one AC condition (via TRACES TO)

Tests never exist without a parent AC condition.
AC conditions may have multiple tests (e.g. happy path + error path).

---

## What changes between AC and test

| AC contains | Test replaces with |
|---|---|
| Actor description ("an authenticated user") | Exact setup state ("user fixture with id:42, session token: present") |
| Observable outcome ("the name is visible") | Exact assertion ("element text equals 'Alice Updated'") |
| Vague timing ("without a page reload") | Measurable constraint ("no navigation event fired within 500ms") |
| System behaviour ("the form validates") | DOM/network assertion ("aria-invalid=true on #email-field") |

---

## Derivation process — step by step

STEP 1: Read the AC condition (GIVEN / WHEN / THEN)
STEP 2: For GIVEN — translate actor + precondition into exact setup state
STEP 3: For WHEN — translate action into exact input or event
STEP 4: For THEN — translate each observable outcome into an exact assertion
STEP 5: Assign TEST ID and TRACES TO
STEP 6: Apply test-output-spec.md format

---

## Error path tests

Every AC condition that describes a success path implies an error path.
The error path test should be written alongside the happy path test.

AC (happy path):
  GIVEN an authenticated user is on their profile page
  WHEN  they enter a valid display name and click Save
  THEN  the updated name is visible within 500ms

Derived tests:
  T-[slug]-01 (happy path): valid name → name visible within 500ms
  T-[slug]-02 (error path): empty name → error message visible, save disabled
  T-[slug]-03 (error path): name > 50 chars → error message visible, save disabled

The error path tests do not require a separate AC condition — they are implied
by the AC condition's constraint ("valid display name").

---

## What tests do not do

Tests do not add new requirements.
If a test would fail for a reason not described in any AC condition —
the test is wrong, not the implementation.

Tests do not describe implementation.
"WHEN the useForm hook receives a submit event" is not a test input.
"WHEN a user clicks the button with text 'Save'" is.

Tests do not reference internal state.
Redux store updates, React state changes, hook invocations — not assertions.
Only DOM state, network requests, and user-observable outcomes are valid assertions.