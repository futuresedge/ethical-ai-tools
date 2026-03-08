# Session Summary
**Date:** 3 March 2026
**Participants:** Framework Owner (FO), AI Assistant

***

## Matters Discussed

- Developing the Agent Creation Policy into a human- and agent-readable document with glossary and responsibility tree
- Identifying all policy gaps remaining after the event storming session
- Options and recommendation for the CICD boundary (H13)
- Bringing CICD inside the domain boundary
- Restructuring the Uncertainty sub-flow as a cross-cutting primitive rather than a Zone 4 sub-flow
- Zonal Advisor Agents — one per zone with scoped context
- Uncertainty types and context snapshot requirements per zone
- The behavioural gap: agents attempting work silently when uncertain
- Pre-flight check, call-repeat loop, and certainty score as mechanisms for surfacing uncertainty before execution
- A layered model combining all three mechanisms
- MCP tooling implementation of the behavioural model
- The Task Performer Agent spec as a concrete implementation sketch
- Formalising the context curation cross-cutting policy including the Context Agent spec

***

## Decisions Made

### Terminology
- **"Pete" is now "Framework Owner (FO)"** across all documents. All prior document references to "Pete" should be updated on next revision.

### H13 — CICD Boundary
- **CICD is brought inside the domain.** The CICD Pipeline, Staging Environment, and Production Environment move from pink external system stickies to a domain actor: **CICD Agent**.
- `StagingEnvironmentVerificationFailed` is now a domain failure. P5.08 resolves: failure routes to Feature Owner Agent review, consistent with every other failure in the framework.
- H13 is **resolved**. Zone 5 implementation is no longer blocked.

### Uncertainty Sub-flow
- The Uncertainty sub-flow is **no longer a Zone 4 sub-flow**. It is a **cross-cutting domain primitive** available to all agents in all zones.
- The `UncertaintyRaised` event is independent of any aggregate — it carries a `zone` and `parent-ref` field that routes it correctly.
- The `P4.U` policy numbering is replaced by `P.U` (cross-cutting, all zones).

### Zonal Advisor Agents
- There is **one Advisor Agent per zone** (Zones 0–5), replacing the single Advisor Agent.
- Each Advisor Agent's NEVER list enforces that it cannot read artefacts from other zones.
- The `zone` field on the Uncertainty aggregate is the dispatch key — it determines which Advisor Agent is invoked.
- The **mitigation reviewer is the zone's existing quality gate agent** — no new actors required:
  - Zone 0: FO
  - Zone 1: FO
  - Zone 2: QA Agent Definition
  - Zone 3: QA Agent Definition
  - Zone 4: QA Agent Execution
  - Zone 5: Feature Owner Agent (FO for escalation)
- **P.U6 and P.U7 are resolved** (second rejection path): second rejection → `EscalateToFO` → FO resolves or closes parent work item.

### Agent Naming
- **Advisor Agent → Uncertainty Owner Agent** — owns the Uncertainty aggregate outright, consistent with the naming convention (Feature Owner, Task Owner). [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/4e1b72e0-f288-433d-98d2-429a3ac23f68/continuing-on-from-the-event-s-JyBjI3OZSCeqGeN4mkS3YA.md)
- **Test Writer Agent → Test Owner Agent** — owns the test suite artefact and the ambiguity detection gate.
- QA Agent Definition, QA Agent Execution, Context Agent, UI Design Agent — names unchanged.

### Pre-flight and Uncertainty Behaviour
- **Agents must not attempt work silently when uncertain.** This is enforced by tooling, not convention.
- **A layered behavioural model** is adopted:
  - **Layer 1 — Pre-flight check** (mandatory, all agents, all zones): runs before any work begins; outputs `CLEAR`, `ASSUMED`, or `BLOCKED`.
  - **Layer 2 — Comprehension repeat-back** (zone boundaries only, four points in the lifecycle): receiving agent states what it understands its job to be; reviewed by zone QA agent before work begins.
  - **Layer 3 — Certainty score** (intra-zone handoffs in Zones 3 and 4): declared threshold per agent class; below threshold forces uncertainty raise.
- **`BLOCKED` pre-flight is non-overridable** — the agent cannot proceed and must call `agentraiseuncertainty`.
- **Certainty threshold** is a declared field in every agent template (`CERTAINTY_THRESHOLD:`).

### Context Curation
- Context curation is **formally adopted as a cross-cutting policy** (`POLICY: ContextCurationBeforeWork`), not just a named pattern.
- The pattern is confirmed in **all six zones** including Zone 5 (DeliveryContext before PlanUserTesting) and Zone 0 (RequirementsDocument before CommissionSpecTests).
- **Five formal invariants** govern context curation across all zones: no work without an APPROVED package; curator never reviews their own package; compression is prohibited; context conflict rule is mandatory; packages are versioned and invalidated on source change.

### Zone 5 Policy Set
- P5.01–P5.09 are now complete with the CICD Agent as a first-class domain actor.
- P5.08 resolved (see H13 above).
- The CICD Agent's artefact is `deployment-record.md` — the Zone 5 equivalent of `proof-of-completion.md`.
- **FO retains emergency authority** via `HaltDelivery` command, which transitions any Feature to `DELIVERY_HALTED`.

### Zone 0 Policy Set
- Zone 0 now has a **draft policy set** (P0.01–P0.08) covering the full agent creation cycle.
- A **Zone 0 Uncertainty Owner Agent** is added, scoped to framework-level artefacts only.

***

## Artefacts Produced

| Artefact | Status | Notes |
|---|---|---|
| **Agent Creation Policy v0.1** | Draft | Full document — glossary, responsibility tree, 7-step creation flow, NV/BR scoring, QA tier table, Base Agent Template, bootstrapping exception |
| **Policy Gap Inventory** | Complete | 8 gaps identified, sourced, and prioritised with blocking status |
| **H13 CICD Boundary Analysis** | Complete | Three options documented; Option 3 (hybrid) recommended; superseded by FO decision to bring CICD fully inside domain |
| **CICD Agent Spec (outline)** | Draft | Job statement, write authority by Feature state, read model, new invariants, Zone 5 policy table P5.01–P5.09 |
| **Uncertainty Sub-flow Redesign** | Draft | Cross-cutting aggregate design, P.U1–P.U7 policy set, Uncertainty aggregate artefacts and state machine |
| **Zonal Advisor Agent Model** | Draft | One Advisor Agent per zone (0–5), zone-scoped context, reviewer-by-zone table |
| **Uncertainty Types & Context Snapshots by Zone** | Complete | Full analysis for Zones 0–5 — common uncertainty types and required context snapshot contents |
| **Layered Pre-flight / Uncertainty Behaviour Model** | Draft | Layer 1 (pre-flight), Layer 2 (repeat-back), Layer 3 (certainty score) — with aviation analogy applied precisely |
| **MCP Tooling Implementation Design** | Draft | `preflight_check`, `handoff_repeatback`, `agentraiseuncertainty` tool specs; VS Code skill/agent/prompt file placement |
| **Task Performer Agent Spec** | Draft | Full `.agent.md` sketch including READS/WRITES/NEVER, CERTAINTY_THRESHOLD, and lifecycle with all three behavioural layers wired in |
| **Context Curation Cross-Cutting Policy** | Draft | Formal policy statement, per-zone curation tables (Zones 0–5), Context Agent Zone 3 spec, five formal invariants |

***

## Open Items Carried Forward

| Item | Priority | How to resolve |
|---|---|---|
| Zone 5 Event Storming session | High — CICD Agent is now inside the domain, session will be more productive | Dedicated session: storm CICD Agent events, deployment record spec, rollback policy |
| Uncertainty Sub-flow Event Storming session | High | Storm the Uncertainty aggregate as a standalone domain across all six zones with Zonal Advisor Agents |
| Zone 0 Policy Registry | Medium | Write the formal document equivalent to Policy Registry v0.1 for Zone 0 |
| Task retry limits (Gap 6) | Medium | Add to Policy Registry; likely surfaces in Uncertainty Sub-flow session |
| FO unavailability handling (Gap 7) | Medium | Policy decision: formalise `AWAITING_FO` as a Feature aggregate state |
| Idea prioritisation policy (Gap 8) | Low | Short decision; add P1.02 to Policy Registry |
| CICD Agent Zone 0 creation cycle | When ready to build | NV Score 2, BR Score 3 → QA Tier 3; first real test of the Zone 0 process |
| Update all documents to replace "Pete" with "FO" | On next revision | Apply globally to all specs, policies, and domain maps |
| Remaining agent specs | When ready to build | Uncertainty Owner Agents (×6), CICD Agent, Zone 5 Context Agent, remaining Zonal Advisor Agents |