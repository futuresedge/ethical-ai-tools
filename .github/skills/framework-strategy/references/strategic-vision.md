# Strategic Vision and Open Questions
> Source: Agentic-Development-Framework.md, Roadmap-v1.md, TopAssumptionsAfterEventStormingSession.md, DecisionLog-20260228.md
> Load when: answering HMW questions, assessing strategic alignment, advising on framework direction

---

## The Long-Game Vision

### Phase sequence (do not skip ahead)
1. NOW: Build evidence-based trust through the four primitives (Zones 1–4)
2. PHASE 2: Validate that primitives reduce coordination costs in controlled settings
3. PHASE 3: Extend to low-trust environments (freelance marketplaces, cross-border teams)
4. PHASE 5: Cryptographic enforcement layer makes trust properties verifiable and portable at scale

Smart contracts and token economics are NOT the foundation. They are the institutional layer that
makes a working foundation portable. The OG vision remains valid — the sequence matters.

### The institutional innovation hypothesis
If coordination mechanisms work reliably in low-trust environments where parties have no
reputation history and limited recourse, they unlock economic participation for billions of
knowledge workers currently excluded from global markets due to institutional trust deficits.
This is not an efficiency argument — it is a participation argument.

### What counts as validation (current phase)
- Context Card: -50% context gathering time vs. Sprint 6 baseline
- Environment Contract: -70% environment debugging time
- Evidence Gate: -40% handoff verification time
- QA first-pass rate: 33% → 80%

Three structured probes in progress:
  Probe 1: Evidence Gate — one developer→QA handoff with proof template. Pass: zero mismatches over 3 tasks.
  Probe 2: Environment Contract — capture snapshot, deliberately drift, measure detection. Pass: drift detected before execution.
  Probe 3: Context Card — one task with generated card. Pass: task completes without agent requesting additional context.

---

## Top 10 Load-Bearing Assumptions
> Source: TopAssumptionsAfterEventStormingSession.md
> Ordered by consequence if wrong. All currently UNTESTED unless marked otherwise.

1. AC CAN ALWAYS BE MADE EXPLICIT AND TESTABLE
   The Test Writer's "ambiguity detector" role only works if no valid AC is inherently qualitative.
   If it is, the pipeline either blocks everything or passes things it shouldn't.
   STATUS: UNTESTED

2. PRODUCT OWNER IS CONSISTENTLY AVAILABLE AND DECISIVE AT EVERY GATE
   Framework has no graceful fallback for slow or absent human review.
   STATUS: UNTESTED — single PO, no load testing

3. ENVIRONMENT STATE CAN BE FULLY AND RELIABLY CAPTURED IN A SNAPSHOT
   External services, network conditions, and race conditions may not be capturable.
   The contract might miss exactly the class of failures it was designed to prevent.
   STATUS: UNTESTED

4. LITERAL COMMAND OUTPUT IS SUFFICIENT AND RELIABLE PROOF OF COMPLETION
   Evidence Gate rejects assertions — but a passing output from a flawed test suite is still wrong.
   The gate doesn't catch flawed tests, only missing assertions.
   STATUS: UNTESTED

5. CONTEXT CAN BE CURATED TO MINIMUM NECESSARY WITHOUT CRITICAL LOSS
   For novel tasks with no prior patterns, the card may be incomplete in invisible ways.
   STATUS: UNTESTED

6. HIERARCHICAL AGENT SPAWNING IS THE RIGHT COORDINATION MODEL AT ALL SCALES
   Feature Owner → Task Owner hierarchy may become a bottleneck at greater feature complexity.
   Resolution of H9 assumed context inheritance at birth outweighs rigidity costs.
   STATUS: ASSUMPTION COMMITTED (H9 resolved) — not yet stress-tested

7. TWO SPECIALIST QA AGENTS HAVE SUFFICIENTLY DIFFERENT CONTEXT TO JUSTIFY THE SPLIT
   H11 resolved as Zone 2–3 QA (Definition) + Zone 4 QA (Execution). If the context difference
   is smaller than expected, this adds coordination cost with no quality gain.
   STATUS: ASSUMPTION COMMITTED (H11 resolved) — not yet stress-tested

8. OBSERVABLE STREAM PROVIDES SUFFICIENT LEGIBILITY FOR NON-TECHNICAL HUMANS
   Raw stream events may need aggregation or dashboards before they're genuinely useful.
   STATUS: UNTESTED

9. ZONE 5 CAN BE RELIABLY TRIGGERED BY POLICY WHEN ALL TASKS COMPLETE
   Assumes integration tests are comprehensive enough that an automated pass is trustworthy.
   Zone 5 is currently under-specified.
   STATUS: UNTESTED — Zone 5 Event Storming session pending

10. UNCERTAINTY SUB-FLOW HANDLES ALL CLASSES OF MID-EXECUTION BLOCKAGE
    Tool failures, environment corruption, and malformed task specs may not fit the uncertainty
    pattern cleanly and could fall to BLOCKED with no clear resolution path.
    STATUS: UNTESTED — sub-flow needs dedicated Event Storming session

---

## Committed Design Decisions
> Source: DecisionLog-20260228.md

These are no longer open questions — do not recommend revisiting them without new evidence:

- AGENTS PARTITION BY CONTEXT NEED, NOT ORGANISATIONAL ROLE
- ORCHESTRATORS RECEIVE PATHS AND SUMMARIES ONLY — never artefact content
- EVERY AGENT HAS AN EXPLICIT READ BUDGET — READS, WRITES, NEVER
- NO EXECUTOR BEGINS WORK WITHOUT A PRIOR CONTEXT CURATION EVENT
- THE CONTEXT AGENT IS A COMPRESSION AGENT — input intentionally larger than output
- BATCH HIGH-VALUE CACHE TARGETS — Context Agent, Test Writer, QA Reviewer process all tasks
  in a feature sequentially before execution begins
- AGENT INSTRUCTIONS READ LIKE A LINTER CONFIG, NOT DOCUMENTATION
- STATIC RULES FIRST IN EVERY AGENT FILE, DYNAMIC CONTEXT LAST — maximises cache hit rate
- SKILLS CARRY THE WEIGHT THAT AGENT FILES SHOULDN'T — substantive, stable, cacheable
- MEASURE EVERYTHING — VS Code export + observable stream events as telemetry

---

## Roadmap Priorities
> Source: Roadmap-v1.md

### Immediate (current)
- Photograph/digitise event storming board into Miro or FigJam
- Update Task Aggregate Spec for H11 (two QA agents) and H12 (human gate on return, CLOSED state)
- Resolve H8: does Test Writer produce task-level tests autonomously, or does human seed first?
  H8 resolution UNBLOCKS Zone 3 entirely.

### First probe milestone
End-to-end manual run: one story, one feature, one task, full Zone 3 → Zone 4 flow.
Success: hand a task from Task Owner to Task Performer with zero ambiguity about what done looks like.
Maintain a friction journal — every friction point becomes the next set of red stickies.

### Unresolved hotspots
- H13: CI/CD boundary ownership → Zone 5 Event Storming session required before Zone 5 is specified
- Zone 5 is under-specified until H13 is resolved

---

## Open Research Questions (do not prematurely close)

1. Can Context Cards reliably identify relevant patterns for novel task types with no prior examples?
2. Does the Observable Stream provide sufficient legibility for non-technical humans, or do they need
   aggregated dashboards?
3. At what team size does hierarchical spawning (Feature Owner → Task Owner) become a coordination bottleneck?
4. How do the primitives perform under adversarial conditions (untrusted agents, contested claims)?
5. What is the optimal balance between automated policy triggers and human decision points?

---

## Zone Policy Structure (summary)
> Source: PolicyRegistry-v0.1.md

CORE DESIGN PRINCIPLE: No failure event triggers automatic retry. Every failure routes to review first.
This is deliberate — silent retry loops hide root causes.

Zone 1: IdeaAccepted → DefineFeature (Feature Owner Agent)
Zone 2: FeatureAccepted → DefineAC + CurateUIContext (parallel)
        Both tracks must complete before DecomposeFeature is unlocked (P2.05 gate)
Zone 3: TaskDefined → WriteTaskAC → CurateContext + WriteTaskTests (parallel) → Publish
Zone 4: TaskClaimed → EnvironmentVerified → TaskPerformed → QAReview → COMPLETED or RETURNED
Zone 5: AllTasksCompleted + IntegrationTestsPass → StagingDeploy → ProductionDeploy
        H13 (CI/CD boundary ownership): UNRESOLVED — Zone 5 policies marked HOTSPOT
