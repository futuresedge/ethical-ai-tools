# Policy Gap Inventory: What We Have and What's Missing

Policies are organised by status. Each gap has a source (where it was identified) and a blocking status (what it prevents).

***

## What We Have (Confirmed Stable)

The Policy Registry v0.1 contains 39 policies across five zones:[^5_1]

- **Zone 1** — 1 policy (IdeaAccepted → DefineFeature)
- **Zone 2** — 7 policies (feature definition, AC, UI design, parallel gate)
- **Zone 3** — 6 policies (task prep, tests, context curation, publish gate)
- **Zone 4** — 16 policies (execution happy path, sad path, uncertainty sub-flow)
- **Zone 5** — 9 policies (provisional, pending H13)

**Zone 0** now has a draft policy set from this session — the Agent Creation Policy v0.1.

***

## Policy Gaps Identified

### Gap 1 — Zone 5: CICD Boundary (H13)

**Source:** Event storming session, never resolved[^5_1]
**Status:** Blocking Zone 5 implementation
**The question:** If `StagingEnvironmentVerificationFailed`, does the domain own it (policy + actor responds) or does the pipeline own it (domain only observes)?
**What's missing:** P5.08 — the only policy in the entire registry with no resolution. Also blocks the full sad-path for P5.07 and P5.09 — the failure review loops for integration test failure and user testing failure have no commands, read models, or exit conditions defined.
**Needed:** Dedicated Zone 5 Event Storming session

***

### Gap 2 — Zone 4 Uncertainty Sub-flow: Second Rejection Path

**Source:** Policy Registry v0.1 open items; retrospective IP-03[^5_2][^5_1]
**Status:** Does not block Zones 3–4 implementation, but leaves a hole in the BLOCKED state resolution path
**The question:** When the Advisor Agent's mitigation is also rejected — what happens? Can the uncertainty sub-flow be re-entered from BLOCKED, or must it always route through Framework Owner review?
**What's missing:** P4.U7 onwards — the full path from second-rejection BLOCKED to resolution
**Needed:** Dedicated Uncertainty Sub-flow Event Storming session

***

### Gap 3 — Zone 5: Context Curation Pattern

**Source:** Policy Registry v0.1 cross-cutting pattern note[^5_1]
**Status:** Low urgency, but inconsistent with an established cross-cutting principle
**The question:** Does the Feature Owner Agent need a curated context card before `PlanUserTesting`? The pattern predicts yes — context curation precedes every significant work start in Zones 2, 3, and 4 — but it was never confirmed for Zone 5.
**What's missing:** Either a `CurateFeatureDeliveryContext` policy before P5.04, or an explicit decision that Zone 5 is the exception
**Needed:** Resolved in the Zone 5 Event Storming session

***

### Gap 4 — Zone 3: AC Ambiguity Escalation

**Source:** H8 resolution; noted in Policy Registry v0.1 as a "critical reactive behaviour" but never given a policy ID[^5_1]
**Status:** The behaviour exists in the Test Owner Agent spec, but has no formal policy entry
**The question:** When the Test Owner Agent raises an uncertainty because AC is too ambiguous to produce a test, what is the policy that fires, who receives it, and what are the valid responses from the Task Owner Agent?
**What's missing:** A named policy P3.07 (or similar) covering `ACTooAmbiguousToTest → RaiseUncertainty → Task Owner Agent revises AC`. Currently it is an invariant but not a reactive policy with a named command and actor.
**Needed:** Add to Policy Registry as a discrete policy entry

***

### Gap 5 — Zone 0: Framework Evolution (New — from this session)

**Source:** This session[^5_2]
**Status:** Not blocking current delivery zones, but needed before Nexus builds the FOA
**What's missing:** The full Zone 0 policy set, including:

- `P0.01` — `UnknownTaskTypeEncountered → FOA AssessGap`
- `P0.02` — `GapConfirmed (NV ≥ 2) → FOA EscalateToFrameworkOwner` (before spec tests)
- `P0.03` — `AgentClassRequirementsAccepted → FOA CommissionSpecTests`
- `P0.04` — `SpecTestsAccepted → FOA CommissionAgentTemplate`
- `P0.05` — `TemplateTestsFailed → FOA ReturnToCreator`
- `P0.06` — `TemplateTestsPassed (NV ≤ 1) → FOA ApproveAgentClass`
- `P0.07` — `TemplateTestsPassed (NV ≥ 2) → FOA EscalateToFrameworkOwner`
- `P0.08` — `AgentClassApproved → AddToRoster + UpdatePatternLibrary`
- Deduplication policy: what happens when two gap signals arrive for the same missing class simultaneously
- Template revision vs. new class distinction: error correction vs. evolution
**Needed:** Zone 0 Policy Registry — a dedicated document equivalent to the main Policy Registry

***

### Gap 6 — Zone 4: Task Retry Limits

**Source:** Design thinking session; sprint retrospectives[^5_3]
**Status:** Not blocking, but a known failure mode from real sprint data
**The question:** If a task is returned to the queue, revised, and fails again — is there a retry limit? The current policy (P4.10) routes every returned task to Framework Owner review, but there is no policy governing what happens if a task fails repeatedly after review-approved re-publishes.
**What's missing:** A policy for `TaskFailedRepeatedly → EscalateOrClose` — either a hard retry count (e.g. three returns → FO decision on whether the task itself is flawed) or an escalation trigger
**Needed:** Add to Policy Registry; may surface in the Uncertainty Sub-flow session

***

### Gap 7 — Cross-Cutting: Framework Owner Availability

**Source:** Assumptions audit, Assumption 2[^5_2]
**Status:** Architectural risk, not a missing policy per se — but needs a policy response
**The question:** The framework requires FO at multiple gates: context approval, task publishing, returned task review, Zone 0 escalations, and NV ≥ 2 approvals. There is no policy for what happens when FO is unavailable — the pipeline stalls silently.
**What's missing:** A `FrameworkOwnerUnavailable` handling policy, or explicit documentation that stalling at FO gates is acceptable behaviour (i.e. it is by design, not a failure)
**Needed:** A policy decision: is FO unavailability a domain failure or an acceptable pause? If the latter, the gates need a `AWAITING_FO` state that is visible in the Observable Stream

***

### Gap 8 — Zone 1: Idea Prioritisation

**Source:** Policy Registry v0.1 Zone 1 note[^5_1]
**Status:** Low urgency
**The question:** `IdeaPrioritised` currently has no downstream policy — it informs backlog ordering but causes no automatic action. As the backlog grows, there may need to be a policy that triggers re-ordering or surfacing the next accepted idea to the Feature Owner Agent.
**What's missing:** Either a `P1.02` `IdeaPrioritised → ReorderBacklog` or an explicit decision that backlog management is FO-driven with no automatic policy
**Needed:** A short decision, not a full session

***

## Summary: Policy Work Queue

| \# | Gap | Blocking? | How to resolve |
| :-- | :-- | :-- | :-- |
| 1 | Zone 5 CICD boundary (H13) | Yes — Zone 5 implementation | Zone 5 Event Storming session |
| 2 | Uncertainty sub-flow second rejection | No — but leaves a hole | Dedicated Uncertainty sub-flow session |
| 3 | Zone 5 context curation pattern | No — low urgency | Confirm in Zone 5 session |
| 4 | AC ambiguity escalation (no policy ID) | No — behaviour exists, just unnamed | Add P3.07 to Policy Registry |
| 5 | Zone 0 policy set | No — FO builds Zone 0 last | Write Zone 0 Policy Registry |
| 6 | Task retry limits | No — risk without a bound | Add to Policy Registry; revisit in uncertainty session |
| 7 | FO unavailability handling | Architectural risk | Policy decision: stall = acceptable pause? |
| 8 | Idea prioritisation policy | No — low urgency | Short decision, add to Policy Registry |

The two sessions that unlock the most gaps are the **Zone 5 Event Storming session** (clears gaps 1 and 3) and the **Uncertainty Sub-flow session** (clears gap 2 and likely 6). Gaps 4, 7, and 8 can be resolved in focused short decisions without a full session.