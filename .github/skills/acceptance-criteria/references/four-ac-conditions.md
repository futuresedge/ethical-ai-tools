# The Four AC Conditions
> Every acceptance criterion must satisfy all four before it is accepted.

---

## Condition 1: Unambiguous
ONE interpretation only.
Any two people reading it must reach identical understanding.

FAIL: "The page loads quickly"
PASS: "The page reaches LCP < 2.5s on a simulated mid-range mobile device"

FAIL: "Users can manage their profile"
PASS: "An authenticated user can update their display name and save the change"

TEST: read it aloud to someone unfamiliar with the feature.
If they ask "what does X mean?" — rewrite X.

---

## Condition 2: Atomic
ONE condition per criterion. One Given, one When, one Then.
If "and" appears in the Then clause — split into two criteria.

FAIL: "The form validates input and displays an error and prevents submission"
PASS (3 criteria):
  - "The form displays a field-level error when an invalid email is entered"
  - "The form displays a field-level error when a required field is empty"
  - "The form does not submit while any field-level error is present"

TEST: count the distinct outcomes. If more than one — split.

---

## Condition 3: Verifiable
A test can be written that either passes or fails. No judgement required.

FAIL: "The design feels premium"
FAIL: "The experience is intuitive"
PASS: "The heading uses font-serif at 2.25rem with font-weight 600"
PASS: "A keyboard user can reach the submit button using Tab from the first field"

TEST: can you write a Given/When/Then test that produces a binary pass/fail?
If the test requires a human judgement call — rewrite the criterion.

---

## Condition 4: Problem-space (not solution-space)
AC describes WHAT must be true. Not HOW it is implemented.

FAIL: "The useEffect hook fires after the form submits"
PASS: "After a successful form submission, the confirmation message is visible within 500ms"

FAIL: "The Redux store updates the user object"
PASS: "After the user saves their profile, the updated display name is visible without a page reload"

TEST: does it describe a user-observable outcome, or an implementation detail?
If implementation detail — rewrite as observable outcome.

---

## Quick rejection checklist
Before accepting any AC, confirm:
- [ ] No "and" in the Then clause
- [ ] No vague qualifiers: quickly, easily, properly, correctly, seamlessly
- [ ] No implementation references: component names, function names, state management
- [ ] No passive outcomes: "should be", "will be" → rewrite as present-tense assertions
- [ ] No compound subjects: "admins and users can..." → split by actor
