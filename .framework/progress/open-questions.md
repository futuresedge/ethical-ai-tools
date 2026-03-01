# Open Questions
> Unresolved design questions requiring human decision or further investigation.
> Framework Owner reads this to avoid recycling known decisions.
> Last updated: 2026-03-01

---

## Format

Each entry:
  ID:      OQ-[number]
  RAISED:  [date]
  WHAT:    what is unresolved
  WHY:     why it matters — what depends on it
  RESOLVE: what information or decision would close it
  STATUS:  OPEN | INVESTIGATING | CLOSED

---

## Open Questions

### OQ-001
RAISED:  2026-02-28
WHAT:    H8 — does the Test Writer Agent produce task-level tests autonomously from AC,
         or does a human seed the first test?
WHY:     Resolving H8 unblocks Zone 3 entirely
RESOLVE: Product Owner decision on autonomy level for Test Writer
STATUS:  OPEN

### OQ-002
RAISED:  2026-02-28
WHAT:    H13 — CI/CD boundary ownership in Zone 5
WHY:     Zone 5 policies (staging, production, integration test triggers) cannot be written
         until boundary ownership is resolved
RESOLVE: Zone 5 Event Storming session
STATUS:  OPEN

### OQ-003
RAISED:  2026-02-28
WHAT:    Does the Observable Stream provide sufficient legibility for non-technical humans,
         or do they need aggregated dashboards or exception-only alerts?
WHY:     If the raw stream is overwhelming, the oversight model fails
RESOLVE: First probe with a non-technical human reviewer observing the stream
STATUS:  OPEN

### OQ-004
RAISED:  2026-03-01
WHAT:    No explicit pre-condition stage exists for ensuring task directories are initialised
         before Zone 3 agents run (surfaced when reviewing task-spec-writer.agent.md)
WHY:     Every feature reaching Zone 3 needs .framework/features/[slug]/tasks/[task-slug]/
         to exist before the Task Spec Writer is invoked. Currently the human's responsibility
         but undocumented. At agent-to-agent scale, a missing directory causes a STOP or
         (worse) agent self-creation — the boundary violation pattern already observed.
RESOLVE: Decide whether directory initialisation is: (a) a human pre-condition documented
         in a handoff checklist, (b) a lightweight pre-flight check in the Decomposition
         Reviewer handoff, or (c) a scaffolding step auto-run after decomposition is accepted.
STATUS:  OPEN

---

## Closed Questions

None yet — this log is initialised at sprint start.
