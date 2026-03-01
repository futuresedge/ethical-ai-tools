# Probe Result: Experiment 3 — Task Spec Writer (Zone 3, First Artefact)
DATE:    2026-03-01
STATUS:  COMPLETE

---

## Hypothesis

A Task Spec Writer agent can produce a task-spec.md from decomposition.md (Task 1:
navbar-component) that is complete, unambiguous, and executable by a Task Performer
agent without requiring clarifying questions.

SUCCESS CRITERIA:
  1. A performer agent could execute the spec without asking a question
  2. The spec stays within the context and complexity budgets stated in decomposition.md

---

## What Was Built

Artefact: `.framework/features/navbar/tasks/navbar-component/task-spec.md`
Input consumed: `decomposition.md` Task 1 entry, `acceptance-criteria.md`, live codebase
  (both blog import paths verified, existing `Header.astro` examined)
Skill applied: task-definition (task-spec-template.md, task-definition-checklist.md)
Review gate: artefact-reviewer in task-spec mode

---

## Execution Summary

### Round 1 — Task Spec Writer output
STATUS: DRAFT on submission

WHAT THE AGENT DID WELL:
  - Verified the decomposition reviewer's open assumption (blog pages import Header.astro)
    by searching the codebase directly; result recorded in §8 rather than left as inference
  - Section 3 DESCRIPTION and ACCEPTANCE copied verbatim from decomposition.md
  - Section 4 dependencies explicit and correctly marked NONE for a Layer 1 task
  - Section 6 constraints correctly filtered to the Astro static component artefact type
  - Section 7 produced 5 specific, present-tense, observable success criteria

WHAT THE AGENT MISSED:
  - The existing `Header.astro` contains social icon anchors (Mastodon, Twitter, GitHub) in
    a `.social-links` wrapper. The decomposition BOUNDARIES explicitly state that removing
    them is OUT OF SCOPE — they must be retained and their CSS migrated to Tailwind.
  - The spec was entirely silent on this element. Section 5 listed only the three nav links
    and ModeToggle. A Task Performer reading the spec would have removed the social links
    during the Tailwind rewrite with no signal that this was wrong.
  - As a consequence of the §5 gap: §2 IN SCOPE item 3 used the vague word "properly"
    (a checklist-flagged term), and §8 declared "No open questions" prematurely — the social
    links disposition was an unresolved ambiguity that had not been surfaced.

ROOT CAUSE: One gap, three symptoms. The agent did not cross-reference the existing
  component's full DOM structure against the decomposition BOUNDARIES. It read the
  BOUNDARIES entry ("removing social links is OUT OF SCOPE") as a statement that social
  links were not its concern, rather than as a signal that they must be explicitly
  documented as retained.

### Round 2 — Reviewer verdict
VERDICT: RETURNED
FAILURES: 3 (§5 interface incomplete, §2 vague language, §8 premature close)

All three failures traced to the same root cause. Reviewer-required fixes were unambiguous
and included exact replacement text — no interpretation required from the Task Spec Writer.

### Round 3 — Fixes applied, re-review
All three fixes applied correctly:
  - §5: SOCIAL LINKS block added with retention rationale and CSS migration note
  - §2: "properly constrained" replaced with specific 375px/scrollbar/overlap language
  - §8: VERIFIED block updated to record both the import confirmation and the social links decision

VERDICT: ACCEPTED (Revision 2)
STATUS updated to ACCEPTED.

---

## Against Success Criteria

SC1 — Performer executes without asking a question:
  FAIL on initial output. The missing social links would have caused silent, incorrect
  behaviour (removal of elements that must be retained). The reviewer gate caught this
  before it reached a performer.
  PASS after revision. Post-fix spec is unambiguous on all elements.

SC2 — Within context and complexity budgets:
  PASS. §5 interface complexity maps to ~3–4 TAC conditions (within 1–7 bound).
  Success criteria suggest 5–6 tests (within 3–8 bound). Single artefact. No scope expansion.

---

## Overall Verdict: EXPERIMENT PASSED (WITH GATE CATCH)

The task spec writer produced a largely well-structured spec on the first pass. The reviewer
gate caught the single material failure before it could propagate to a Task Performer. The
revision cycle was fast: one round, three targeted fixes, all applied correctly.

The success criterion ("performer executes without asking a question") was not met by the
initial output, but was met after the review-fix cycle. This is the gate working as designed.

---

## Learnings

### L1: The agent read scope boundaries as exclusions, not retention signals
The decomposition BOUNDARIES entry "removing social links is OUT OF SCOPE" was interpreted
as "social links are not this task's concern" rather than "social links must persist and
their CSS must be migrated." The agent needs to treat OUT OF SCOPE entries that name
existing elements as implicit retention requirements, not demarcation lines.

IMPLICATION: The task-spec-template.md could add a signal to §5: "For rewrites of existing
components: enumerate all elements present in the current implementation and explicitly
declare their disposition (retained / removed / modified)." This would force the question
rather than leaving it as an inference.

### L2: One root cause produced three checklist failures — reviewer still caught all three
The three RETURNED failures were not independent errors; they were manifestations of a
single knowledge gap. The reviewer surfaced all three correctly and traced them to the
same source. This is useful signal: the checklist is granular enough to triangulate root
causes, not just list symptoms.

### L3: The reviewer-fix loop was tight — one round
No human clarification was needed between the RETURNED verdict and the applied fixes.
The required-fix instructions in the review were specific enough that the writer could
apply them mechanically. This vindicates the "unambiguous fix text" requirement in the
verdict-format.md rubric.

### L4: Codebase grounding is load-bearing, not optional
The agent that verifies assumptions against the actual source files catches things that
pure-spec reasoning misses. The §8 import verification worked correctly. The §5 social
links gap is evidence that the codebase read was incomplete — the agent examined the
imports and the BOUNDARIES but did not read the full component HTML.

IMPLICATION: Task Spec Writer instructions should explicitly require reading the full
existing artefact (not just its imports) when the output path is a rewrite of an
existing file.

### L5: Review gate prevented a silent downstream error
Without the gate, a Task Performer would have:
  1. Removed the social links (no spec signal to retain them)
  2. Passed its own tests (which wouldn't have tested for them either)
  3. Shipped a component missing elements that were explicitly in scope to preserve

This is the class of error the gate is designed to catch — not obvious failures, but
omissions that look correct until the final artefact is compared to the original.
