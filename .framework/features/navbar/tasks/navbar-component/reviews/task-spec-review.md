# Task Spec Review

VERDICT: RETURNED
MODE: task-spec
FEATURE: navbar
TASK: navbar-component
DATE: 2026-03-01

---

CHECKS PASSED:
- Section 1: Output described in a single sentence; OUTPUT path `src/components/Header.astro` matches decomposition.md exactly; TYPE is stated and fits the artefact category; path is unique in this feature (Task 2 uses `src/pages/index.astro`)
- Section 2: IN SCOPE has 4 specific items, each corresponding directly to a decomposition BOUNDARY; OUT OF SCOPE has 5 items; one integration concern (wiring into `index.astro`) is explicitly deferred; no IN/OUT overlap detected
- Section 3: SATISFIES list contains all 7 ACs from decomposition SATISFIES (FAC-01a partial, FAC-01b partial, FAC-02a, FAC-02b, FAC-03a, FAC-03b, FAC-04); each carries a one-line summary rather than a full Given/When/Then; DESCRIPTION and ACCEPTANCE blocks are verbatim copies from decomposition.md
- Section 4: DEPENDS ON TASKS states NONE explicitly; EXTERNAL DEPENDENCIES lists 4 items with clear descriptions; no env vars required; no circular dependency possible (Layer 1 task)
- Section 4: Reviewer note from README.md satisfied — codebase confirmed that both `src/layouts/BlogPost.astro` and `src/pages/blog/index.astro` already import `Header.astro`; result recorded in Section 8 rather than left as speculation
- Section 6: STACK constraints are filtered to this artefact type (Astro static component) — not a full dump of AGENTS.md; PERFORMANCE addresses JS payload explicitly; ACCESSIBILITY addresses nav landmark, link text, sr-only
- Section 7: 5 present-tense outcome assertions; each is observable and specific enough to map to a test; no duplicates; criteria address links, styling, mobile viewport, dark mode, and blog page continuity independently
- Sizing: estimated 3 TAC conditions and 4 tests — well within the recommended 1–7 / 3–8 bounds; scope spans a single artefact
- Consistency: task slug, OUTPUT path, DEPENDS ON, and SATISFIES list all match decomposition.md with no scope expansion

---

CHECKS FAILED:

- Section 5 — interface incomplete: The existing `Header.astro` renders social icon anchors (Mastodon, Twitter, GitHub) in a `.social-links` wrapper. Decomposition BOUNDARIES explicitly states "Removing or adding social links beyond the three navigation links specified" is OUT OF SCOPE — meaning these links must be retained. Section 5 lists only three nav links and `ModeToggle`; it is entirely silent on the social icon anchors. A Task Performer reading the spec has no signal that these elements must be preserved, and would likely remove them during the Tailwind rewrite.

- Section 2 clarity — vague language: IN SCOPE item 3 contains "properly constrained on mobile" — "properly" is flagged vague language per the task-definition checklist. The decomposition states the constraint specifically ("no horizontal scrollbar", "no overlap"). The paraphrase degrades specificity.

- Section 8 — ambiguity not surfaced: The social links disposition is an unresolved ambiguity that was not raised in Section 8. The section declares "No open questions" prematurely. Because the interface spec is silent on social links (fail above), and the decomposition's CSS scope ("Replace all inline `<style>` CSS") implies that any retained social link elements also need their styles migrated, the implementer faces two adjacent unknowns without a resolution path. Section 8 should have flagged this before closing.

---

## Required fixes

**Fix 1 — Section 5 INTERNAL REFERENCES:**
Add a SOCIAL LINKS block documenting retention and Tailwind migration requirement. Suggested text:

```
SOCIAL LINKS (retained — removal is out of scope per decomposition BOUNDARIES):
  - Mastodon icon anchor — `href="https://m.webtoo.ls/@astro"`, `target="_blank"`, SVG preserved verbatim
  - Twitter icon anchor — `href="https://twitter.com/astrodotbuild"`, `target="_blank"`, SVG preserved verbatim
  - GitHub icon anchor — `href="https://github.com/withastro/astro"`, `target="_blank"`, SVG preserved verbatim
  NOTE: All wrapper (`<div class="social-links">`) and anchor CSS must be migrated to Tailwind v4
  utility classes as part of the full `<style>` block replacement (IN SCOPE item 2).
```

**Fix 2 — Section 2, IN SCOPE item 3:**
Replace "properly constrained on mobile (375px) with no horizontal scrollbar and no content overlap"
with specific language drawn from the feature ACs. Suggested replacement:

```
- Implement a responsive layout: horizontal on desktop; on 375px viewport, all navbar content
  fits within the viewport width with no horizontal scrollbar and no vertical overlap
  with page content below the navbar
```

**Fix 3 — Section 8:**
Remove the current "No open questions" close and replace with a verified resolution that
acknowledges the social links question was identified and resolved. Suggested text:

```
VERIFIED:
  1. Both `src/layouts/BlogPost.astro` and `src/pages/blog/index.astro` already import
     `Header.astro`. No rewiring required. Confirmed by codebase inspection 2026-03-01.
  2. Social icon links (Mastodon, Twitter, GitHub) must be retained — decomposition
     BOUNDARIES explicitly places removal OUT OF SCOPE. Their wrapper CSS must be
     migrated to Tailwind as part of the full `<style>` block replacement.
     Both dispositions documented in Section 5.

No open questions. Task is ready for AC writing.
```

---

## Revision 2 — 2026-03-01

VERDICT: ACCEPTED
MODE: task-spec
FEATURE: navbar
TASK: navbar-component
DATE: 2026-03-01

CHECKS PASSED:
- Fix 1 resolved: Section 5 now includes a SOCIAL LINKS block documenting all three social icon anchors, explicit retention rationale (decomposition BOUNDARIES), and CSS migration requirement — implementer has no ambiguity about preservation
- Fix 2 resolved: IN SCOPE item 3 now states "fits within the viewport width with no horizontal scrollbar and no vertical overlap with page content below the navbar" — vague "properly" removed; language is specific and testable
- Fix 3 resolved: Section 8 VERIFIED block now explicitly documents both the blog import confirmation and the social links retention decision, referencing Section 5 for the full record; premature close corrected
- All previously passing checks remain intact — no regressions introduced by the revision
- Downstream readiness: Write Task AC agent can produce TAC from this spec without asking questions; Curate Context agent can extract relevant sections without ambiguity; Task Performer has unambiguous file target and complete interface specification

Pipeline unblocked. Handoff to Write Task AC agent is approved.
