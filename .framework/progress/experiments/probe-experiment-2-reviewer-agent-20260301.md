# Probe Result: Experiment 2 — Reviewer Agent (Gate Model)
DATE:    2026-03-01
STATUS:  COMPLETE

---

## Hypothesis

A dedicated Reviewer Agent operating in three modes (feature-spec, ac, decomposition)
can catch real errors in framework artefacts before they propagate downstream, producing
ACCEPTED / ACCEPTED WITH NOTES / RETURNED verdicts without false positives.

SUCCESS CRITERIA:
  1. Catches at least one real issue humans caught (e.g. non-observable success condition,
     constraint bleeding into implementation, atomicity failure)
  2. Does not flag obviously correct content as errors

---

## What Was Built

Agent: `artefact-reviewer.agent.md` — three-mode reviewer (feature-spec, ac, decomposition)
Skills consumed:
  - feature-definition/references/definition-checklist.md
  - acceptance-criteria/references/four-ac-conditions.md
  - acceptance-criteria/references/given-when-then-format.md
  - acceptance-criteria/references/ac-vs-tests.md
  - feature-decomposition/references/decomposition-rules.md
  - feature-decomposition/references/independence-test.md

Run against: navbar feature (all three Zone 2 artefacts)

---

## Results

### Mode 1: Feature Spec Review
VERDICT: ACCEPTED WITH NOTES
BLOCKING FAILURES: 0
NOTES RAISED:
  - PERFORMANCE constraint used solution-space language ("static .astro component") rather
    than an observable bound. Low-severity. Did not block.
  - "Visitors" in problem statement is a generic noun where a persona name was expected.
    Compensated by Section 3. Did not block.
CORRECTNESS: No false positives. Both notes were real and a human reviewer agreed on reflection.
SC1: Partially met — no blocking failures on a well-formed spec (expected result)
SC2: PASS

### Mode 2: AC Review
VERDICT: RETURNED → revised → ACCEPTED
BLOCKING FAILURES: 3 atomicity violations
  - FAC-navbar-01: "and" in Then clause (blog link + dashboard link = two observables)
  - FAC-navbar-02: same pattern (home link + dashboard link)
  - FAC-navbar-03: "fully visible and no horizontal scrollbar" = two distinct outcomes
CORRECTNESS: All three failures were genuine. The AC Writer had produced compound Then clauses
  that violated the atomic rule. A human reviewer (Framework Owner) independently confirmed
  the same findings. FAC-navbar-04 was correctly left unchanged — no false positive.
REVISION CYCLE: AC Writer revised criteria (4 → 7 criteria). Resubmitted. ACCEPTED.
SC1: PASS — caught 3 real atomicity failures before they reached decomposition
SC2: PASS

### Mode 3: Decomposition Review
VERDICT: ACCEPTED WITH NOTES
BLOCKING FAILURES: 0
NOTES RAISED:
  - Coverage table referenced old AC IDs (pre-atomicity split). Required update post-AC revision.
  - Assumption that blog pages already import Header.astro was unverified. Flagged for
    Task 1 executor to confirm before proceeding.
CORRECTNESS: Both notes were real and acted on (coverage table updated; assumption noted
  in task directory for Task Spec Writer to verify).
SC1: PASS — coverage ID staleness is a real systemic risk
SC2: PASS

---

## Overall Verdict: EXPERIMENT PASSED

Both success criteria met across all three modes.

Strongest result: AC mode caught three atomicity failures and triggered a complete revision
cycle that wouldn't have happened without a structured review gate. The intra-criterion
atomicity failure (FAC-03a/03b split) is the type of subtle error a quick human pass
would likely miss.

---

## Learnings

### L1: The gate model works as designed
Downstream work (decomposition) did not run while AC was incorrect. Human gates at each
handoff reinforced the mechanic naturally — no special enforcement was needed beyond the
verdict output.

### L2: Multi-mode agent creates mode-determination ambiguity
The reviewer determines mode from the artefact path rather than receiving an explicit mode
declaration. This works but is implicit. A future option: split into three single-mode
reviewers. Trade-off: simpler READS set per agent vs. higher agent count.
DEFERRED — not a blocking problem at current scale.

### L3: ACCEPTED WITH NOTES findings carry real value
Both accepted-with-notes findings (constraint language, stale coverage IDs) were acted on.
Notes are not cosmetic — they are friction signals that the Retro Facilitator should read.

### L4: Downstream staleness is a structural risk
When AC was revised (4→7 criteria), the decomposition coverage table silently became stale.
The reviewer caught this only because it reviewed decomposition AFTER the AC revision.
The pipeline must enforce strict write→review→revise→proceed sequencing.
A batched or parallelised review would miss this class of error.

---

## Assumption Evidence

ASSUMPTION 1 (AC can always be made explicit and testable)
DIRECTION: FOR (partial)
EVIDENCE: All 7 final AC criteria passed atomic/verifiable/unambiguous checks. However,
  FAC-03a ("navbar is fully visible") required additional scoping ("no part of it clipped
  or hidden") to become verifiable. Some criteria require precision work to cross the
  testability threshold — they don't arrive there automatically.

ASSUMPTION 2 (PO consistently available and decisive at every gate)
DIRECTION: FOR
EVIDENCE: Human gate was present and decisive at every handoff. No gate was stuck waiting.
  Sprint scope was small — availability not yet stress-tested.

---

## What's Next: Experiment 3

TARGET: Task Spec Writer
AGENT:  task-spec-writer.agent.md (new — Zone 3)
INPUT:  .framework/features/navbar/decomposition.md → Task 1: navbar-component
OUTPUT: .framework/features/navbar/tasks/navbar-component/task-spec.md
GOAL:   Produce a task spec a Task Performer can execute without asking clarifying questions
SC1:    Spec contains all 8 sections with no UNKNOWN or TBD fields except open questions
SC2:    A reviewer reading the spec can confirm scope against decomposition.md with no ambiguity
