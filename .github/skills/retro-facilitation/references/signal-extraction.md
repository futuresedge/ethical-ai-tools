# Signal Extraction Rubric
> Load when: reading review artefacts to identify friction, patterns, and learnings
> Applied before writing any section of the retro report

---

## The three signal classes

### Class A — FRICTION SIGNAL
A friction signal is any artefact that shows the process required more effort than expected.
It does NOT mean failure. It is data.

INDICATORS:
  - VERDICT: RETURNED in any review file
  - STATUS: RETURNED before final acceptance
  - Multiple revisions logged in STATUS_LOG
  - uncertainty-log.md exists and contains WHAT/WHY/RESOLVE entries
  - NOTES section in a review contains "STOP" or escalation language
  - A review cites the same rule failure more than once across different criteria

RECORD AS:
  SIGNAL-TYPE: FRICTION
  SOURCE: [file path]
  FINDING: [what the review revealed — one sentence]
  ROOT: [which part of the framework produced this friction — skill / agent spec / process / ambiguity in a rule]

---

### Class B — CONFIRMATION SIGNAL
A confirmation signal is evidence that a framework mechanism worked as designed.

INDICATORS:
  - VERDICT: ACCEPTED or ACCEPTED WITH NOTES on first review
  - Clean run: no RETURNED verdicts for a feature from spec → decomposition
  - uncertainty-log.md absent (agent was never blocked)
  - review-result.md STATUS: PASS on first submission
  - A NOTES entry that shows the agent self-corrected using a skill rule

RECORD AS:
  SIGNAL-TYPE: CONFIRMATION
  SOURCE: [file path]
  FINDING: [what worked — one sentence]
  MECHANISM: [which primitive or principle this confirms is working]

---

### Class C — ASSUMPTION EVIDENCE
Evidence that advances or challenges one of the top 10 load-bearing assumptions.

CHECK EACH ASSUMPTION AGAINST ALL ARTEFACTS. Ask:
  "Did anything in this sprint provide evidence FOR or AGAINST this assumption?"

Match pattern:
  Assumption 1 (AC can always be explicit and testable):
    EVIDENCE FOR: All AC criteria were written in verifiable Given/When/Then without qualitative clauses
    EVIDENCE AGAINST: A criterion had to be re-written because it was inherently qualitative

  Assumption 2 (PO consistently available):
    EVIDENCE FOR: No gate was stuck waiting for human decision
    EVIDENCE AGAINST: A RETURNED artefact sat unactioned for more than one session

  Assumption 5 (Context can be curated to minimum necessary without loss):
    EVIDENCE FOR: Task Performer completed task without requesting additional context
    EVIDENCE AGAINST: uncertainty-log shows agent blocked by missing context not in package

RECORD AS:
  SIGNAL-TYPE: ASSUMPTION EVIDENCE
  ASSUMPTION: [number and short name from TopAssumptionsAfterEventStormingSession.md]
  DIRECTION: FOR | AGAINST | NEUTRAL
  EVIDENCE: [specific finding from artefact — one sentence]

---

## Extraction process (apply to each artefact in scope)

For each review file:
  1. Read the VERDICT / STATUS field first
  2. Read CHECKS FAILED (if present) — each failure is a friction signal
  3. Read NOTES — each note is either friction or confirmation
  4. Read CHECKS PASSED — confirmation signals for the mechanisms cited
  5. Match to assumptions (Class C pass)

For each uncertainty-log:
  1. Each WHAT/WHY/RESOLVE entry = one friction signal
  2. If RESOLVE was never filled in = open question to surface in the report
  3. Note which zone and which agent raised the uncertainty

For each assessment file (Framework Owner):
  1. VERDICT: MISALIGNED or PARTIALLY ALIGNED = friction signal
  2. ISSUES section = friction signal (cite specific issue)
  3. OBSERVATIONS section = confirmation signal
  4. FRAMEWORK NOTES = potential pattern or assumption evidence
  5. OPEN QUESTION = escalate to OPEN QUESTIONS section of report

---

## Pattern detection (run after all signals are extracted)

Look for:
  - Same rule cited in CHECKS FAILED across multiple reviews → skill gap or rule ambiguity
  - Same zone generating multiple uncertainty events → context preparation gap
  - RETURNED verdicts always coming from same type of artefact → skill rubric needs revision
  - ACCEPTED WITH NOTES always citing the same note-type → rule that should be made explicit

Each detected pattern is a candidate for the RECOMMENDATIONS section.
One pattern → one recommendation. Never bundle.

---

## What is NOT a signal

NOT A SIGNAL: the feature itself is complex
NOT A SIGNAL: the AC has many criteria (volume ≠ friction)
NOT A SIGNAL: an ACCEPTED WITH NOTES where the note was minor and resolved silently
NOT A SIGNAL: stylistic differences in how two agents structured their output

Do not over-index on volume. One high-quality RETURNED verdict with a clear root cause
is more valuable than five ACCEPTED artefacts with no analysis.
