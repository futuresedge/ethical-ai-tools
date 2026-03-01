# Conflict Detection
> Rules for identifying and handling conflicts between source artefacts.
> Applied during context curation before context-package is written.

---

## What counts as a conflict

TYPE 1 — Direct contradiction
Two artefacts assert opposite things about the same condition.

  task-spec.md:  "must not trigger a full page reload"
  ui-artefact.md: "on save, redirect to /profile/confirmation"

  A redirect IS a full page navigation. These cannot both be true.

TYPE 2 — Scope overlap with divergent constraints
Two artefacts cover the same behaviour with different specifics.

  task-ac.md:     "confirmation message reads: 'We'll be in touch within 2 business days'"
  ui-artefact.md: "confirmation message: 'Thanks, we'll respond shortly'"

  These are not contradictory in kind, but the exact copy differs. One must be authoritative.

TYPE 3 — Missing dependency
The task-ac requires something that no artefact in the source set defines.

  task-ac.md:     "THEN the submission event is fired to the analytics layer"
  context sources: no definition of analytics layer, event format, or endpoint

  The performer cannot implement this without information that is not present.

TYPE 4 — Stale reference
An artefact references another artefact by path, but that path does not exist or
contains a different version of what is referenced.

---

## How to handle each type

TYPE 1 — Direct contradiction:
  DO NOT include either version in context-package
  WRITE to uncertainty-log:
    WHAT:    [quote both contradicting statements with source file]
    WHY:     task cannot be implemented without knowing which is authoritative
    RESOLVE: human decision required — which artefact takes precedence?
  STOP — do not produce context-package until resolved

TYPE 2 — Scope overlap with divergent constraints:
  APPLY authority hierarchy (see below)
  IF hierarchy is clear: use the authoritative version, note the override
  IF hierarchy is unclear: treat as TYPE 1

TYPE 3 — Missing dependency:
  WRITE to uncertainty-log:
    WHAT:    [name the missing definition]
    WHY:     task-ac condition [ID] cannot be verified without it
    RESOLVE: [what specific information is needed]
  INCLUDE in context-package: a NOTE section flagging the missing dependency
  PROCEED: the context-package can be written if all other conditions are clear
  DO NOT: omit the AC condition that depends on the missing information

TYPE 4 — Stale reference:
  WRITE to uncertainty-log:
    WHAT:    [name the missing or version-mismatched file]
    WHY:     [which artefact references it and how]
    RESOLVE: file must be regenerated or path must be corrected
  STOP — do not produce context-package until resolved

---

## Authority hierarchy
When two artefacts conflict on the same point, this order determines which wins:

1. task-ac.md          ← highest authority — QA reviews against this
2. task-spec.md
3. ui-artefact.md
4. AGENTS.md (stack)
5. feature-spec.md     ← lowest authority at task scope — most likely to be stale

---

## Conflict log format

Append to: .framework/features/[slug]/tasks/[task-slug]/uncertainty-log.md

CONFLICT-[n]
TYPE:     [1 / 2 / 3 / 4]
SOURCES:  [file-a.md line/section] vs [file-b.md line/section]
WHAT:     [exact quote or description of each conflicting statement]
WHY:      [what task AC condition this blocks]
RESOLVE:  [what decision or information resolves it]
STATUS:   OPEN
