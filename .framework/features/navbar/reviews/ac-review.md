# AC Review
FEATURE: navbar
MODE:    ac
DATE:    2026-02-28

---

## Revision 2 — 2026-02-28

VERDICT: ACCEPTED
MODE: ac
FEATURE: navbar
DATE: 2026-02-28

All three atomicity failures from Revision 1 are corrected. Criteria count: 7 (was 4).

CHECKS PASSED:
- FAC-navbar-01a: GIVEN/WHEN/THEN atomic — single Then (blog link presence) ✓
- FAC-navbar-01b: GIVEN/WHEN/THEN atomic — single Then (dashboard link presence) ✓
- FAC-navbar-02a: GIVEN/WHEN/THEN atomic — single Then (home link presence) ✓
- FAC-navbar-02b: GIVEN/WHEN/THEN atomic — single Then (dashboard link presence) ✓
- FAC-navbar-03a: GIVEN/WHEN/THEN atomic — single Then (navbar fully visible, not clipped) ✓
- FAC-navbar-03b: GIVEN/WHEN/THEN atomic — single Then (no horizontal scrollbar) ✓
- FAC-navbar-04:  GIVEN/WHEN/THEN atomic — single Then (no content overlap) — unchanged ✓
- All GIVEN tense: past perfect ("has navigated") ✓
- All WHEN tense: simple present ("views") ✓
- All THEN tense: simple present active; no "should be" / "will be" ✓
- Actor named in GIVEN on all criteria ✓
- No "and" in any Then clause ✓
- No vague qualifiers without grounding ✓
- No implementation references (no component names, hooks, state) ✓
- All criteria problem-space — user-observable outcomes only ✓
- Traceability table updated to 7 rows matching new IDs ✓
- Notes section updated to document all three splits and their rationale ✓
- Status reset to DRAFT — correct; STATUS: ACCEPTED is written by the human PO ✓

CHECKS FAILED: NONE

Pipeline status: UNBLOCKED. Decomposition coverage table must be updated to reference the new criterion IDs (01a, 01b, 02a, 02b, 03a, 03b) before task packages are built.

---

## Revision 1 — 2026-02-28 (RETURNED)

CHECKS PASSED:
- All four criteria use correct Given/When/Then structure
- GIVEN tense is past perfect ("has navigated") throughout — correct
- WHEN tense is simple present ("views") throughout — correct
- THEN tense is simple present active throughout — correct
- Actor is named in GIVEN for all criteria ("a visitor")
- No passive voice ("should be", "will be") in any criterion
- No implementation references (no component names, hook names, state references)
- Problem-space language throughout — each Then describes a user-observable outcome
- No vague qualifiers that cannot be resolved by context ("fully visible" in FAC-03 is borderline but acceptable in context)
- FAC-navbar-04: atomic — single Then outcome, no "and", unambiguous, verifiable, problem-space ✓
- FAC-navbar-03 and FAC-navbar-04 were correctly split from a compound success condition (notes section confirms awareness)
- Traceability table is present and maps all criteria to feature spec sections
- Notes section is present and explains the FAC-03/04 split rationale

CHECKS FAILED:
- FAC-navbar-01 — atomicity (four-ac-conditions Condition 2): The Then clause reads "the navbar displays a link to the blog index (`/blog`) AND a link to the dashboard (`/dashboard`)". The "and" joins two distinct observable outcomes: presence of `/blog` link and presence of `/dashboard` link. These must be split into two separate criteria. Under the framework rule: "If 'and' appears in the Then clause — split into two criteria."

- FAC-navbar-02 — atomicity (four-ac-conditions Condition 2): The Then clause reads "the navbar displays a link to the home page (`/`) AND a link to the dashboard (`/dashboard`)". Same failure as FAC-navbar-01 — two distinct observables joined by "and" in the Then. Must be split into two criteria.

- FAC-navbar-03 — atomicity (four-ac-conditions Condition 2): The Then clause reads "the navbar is fully visible AND no horizontal scrollbar is present on the page". These are two distinct outcomes: (1) navbar visibility, (2) absence of scrollbar. The Notes section correctly split 03 and 04 from a compound success condition, but did not apply the same split logic within FAC-03 itself. The two Then outcomes must be separated into two criteria.

---

## Required fixes (specific, no guessing needed)

**FAC-navbar-01** → split into:
- FAC-navbar-01a: GIVEN / WHEN same → THEN the navbar displays a link to the blog index (`/blog`)
- FAC-navbar-01b: GIVEN / WHEN same → THEN the navbar displays a link to the dashboard (`/dashboard`)

**FAC-navbar-02** → split into:
- FAC-navbar-02a: GIVEN / WHEN same → THEN the navbar displays a link to the home page (`/`)
- FAC-navbar-02b: GIVEN / WHEN same → THEN the navbar displays a link to the dashboard (`/dashboard`)

**FAC-navbar-03** → split into:
- FAC-navbar-03a: GIVEN / WHEN same → THEN the navbar is fully visible (no part of the navbar is clipped or hidden)
- FAC-navbar-03b: GIVEN / WHEN same → THEN no horizontal scrollbar is present on the page

**Note:** FAC-navbar-04 requires no changes.
Traceability table and Notes section will need updating to reflect the new criterion IDs after the split.

---

## Pipeline status

This verdict PAUSES the pipeline. The decomposition (`decomposition.md`) has been reviewed and is otherwise sound, but it was produced against an AC that is being returned. Once the AC is corrected and accepted, the decomposition coverage check should be re-run to confirm all new criterion IDs are covered.
