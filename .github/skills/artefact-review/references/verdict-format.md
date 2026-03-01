# Verdict Format and Gate Rules
> Load when: writing any review output file
> Used by: Feature Spec Reviewer, AC Reviewer, Decomposition Reviewer, Task Spec Reviewer

---

## Verdict values

ACCEPTED           — all checklist items pass; no blocking failures
ACCEPTED WITH NOTES — all checklist items pass; one or more non-blocking improvement notes
RETURNED           — one or more checklist items fail; pipeline is paused

NEVER issue ACCEPTED if any checklist item is FAILED.
NEVER issue ACCEPTED WITH NOTES if a note describes a blocking failure — that is RETURNED.

---

## Output format

```
VERDICT: [ACCEPTED | ACCEPTED WITH NOTES | RETURNED]
MODE: [feature-spec | ac | decomposition | task-spec]
FEATURE: [feature-slug]
TASK: [task-slug — task-spec mode only; omit for other modes]
DATE: [ISO 8601]

CHECKS PASSED:
- [each checklist item that passed — one line each, specific enough to be useful signal]

CHECKS FAILED: (RETURNED only — omit section entirely if verdict is not RETURNED)
- [item name: what is missing or wrong, specific enough to fix without guessing]
- [one entry per failed item; do not bundle multiple failures into one line]

NOTES: (ACCEPTED WITH NOTES only — omit section entirely if no notes)
- [improvement suggestion that does not block acceptance — one note per line]
- [notes must be actionable and specific; never vague]

## Required fixes (RETURNED only — omit if not RETURNED)
[For each CHECKS FAILED entry: provide the exact correction needed.
No guessing required from the receiving agent — the fix must be unambiguous.]
```

---

## Gate rules by mode

feature-spec mode    NEVER hand off to Write Feature AC unless verdict is ACCEPTED or ACCEPTED WITH NOTES
ac mode              NEVER hand off to Task Decomposer unless verdict is ACCEPTED or ACCEPTED WITH NOTES
decomposition mode   NEVER hand off to Zone 3 unless verdict is ACCEPTED or ACCEPTED WITH NOTES
task-spec mode       NEVER hand off to Write Task AC unless verdict is ACCEPTED or ACCEPTED WITH NOTES

RETURNED verdict = pipeline paused. The receiving agent does not run until a passing verdict is issued.

---

## Revision history in review files

When a RETURNED artefact is revised and resubmitted, append the new verdict below the old one
with a revision header. Do not delete the original RETURNED verdict. Format:

```
## Revision 2 — [ISO date]
VERDICT: ACCEPTED
...

---

## Revision 1 — [ISO date] (RETURNED)
...
```

This creates a traceable record of what was wrong and how it was fixed —
valuable retro signal.
