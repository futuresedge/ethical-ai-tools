# Review Procedure
> Load when: running any review operation
> Applies to all four review modes

---

## Pre-flight (before loading the checklist)

1. Confirm the artefact under review exists at the declared path — if absent, STOP immediately
2. Confirm all rubric files (skill references) are present — if any absent, STOP
3. Confirm the artefact STATUS field is not already ACCEPTED — if ACCEPTED, do not re-review;
   surface as a question to the caller

---

## Running the checklist

1. Load the mode-specific checklist from the relevant skill references file
2. Run every check — do not skip
3. For each check:
   - PASSED: record in CHECKS PASSED with a specific observation (not just the check label)
   - FAILED: record in CHECKS FAILED with what is wrong and what is needed to fix it
   - If a required section is missing entirely: mark all checks that depend on it as FAILED, not UNKNOWN
4. Do not stop early on a failure — run the full checklist before writing the verdict
5. Determine verdict from results:
   - Any FAILED item → RETURNED
   - Zero FAILED, one or more improvement note → ACCEPTED WITH NOTES
   - Zero FAILED, zero notes → ACCEPTED

---

## Boundary rules (apply throughout)

NEVER invent missing content — if a required field is absent, that is a failure, not a gap to fill
NEVER pass an artefact to resolve ambiguity by assuming the author's intent — ambiguity is a failure
NEVER issue verdict based on a partial checklist run
NEVER modify the artefact under review — this agent reads only
NEVER load artefacts not listed in your READS — if you think you need more context, STOP and raise uncertainty

---

## When Required Fixes are ambiguous

IF you cannot write a specific, unambiguous fix instruction — STOP.
Write: "OPEN QUESTION: [what is unclear]. RESOLVE: [what information would make the fix clear]."
Surface as a potential pipeline escalation to Product Owner.
Do not estimate or round a required fix.

---

## Positive findings have value

CHECKS PASSED entries are not boilerplate. They are confirmation signals.
The Retro Facilitator reads review files to extract mechanism-level evidence.
Write specific observations: not "scope IN SCOPE populated" but
"IN SCOPE lists 3 items that map directly to the three success conditions — clean alignment."
