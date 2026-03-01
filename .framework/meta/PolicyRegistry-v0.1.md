# Policy Registry v0.1

## Agentic Development Framework

```
Version: 0.1
Date: 2026-02-27
Status: Draft — Zone 5 policies marked ⚠️ HOTSPOT H13 pending Zone 5 Event Storming session
Source session: Event Storming session 2026-02-21
Related documents:
  - feature-aggregate-spec-v0.1.md
  - task-aggregate-spec-v0.2.md
  - event-storming-domain-map-v1.0.md
```

***

## How to Read This Document

A **policy** is a reactive rule — automatic logic that fires when a domain event occurs, without requiring a human or agent decision. Policies are the intelligence of the system. They encode what happens next as a fact, not a choice.

Every policy in this document follows the format:

> **Whenever** `[Trigger Event]` → **`[Command Issued]`** → by `[Actor]`

Policies marked **⚠️ H13** are provisional. Their trigger events cross the CI/CD boundary whose ownership is unresolved until the Zone 5 Event Storming session.

Policies are grouped by zone, then by flow type (happy path first, sad path second, sub-flows third). The numbering scheme `Pn.nn` is used for cross-referencing from the aggregate specs.

***

## Design Principle: Failure Always Routes to Review

Before the policies themselves, the single most important pattern on the board, noted in the session retrospective, deserves explicit statement here: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

> **No failure event in this domain triggers an automatic retry. Every failure routes to a review first.**

This is not a coincidence of design — it is a deliberate trust decision. Silent retry loops hide root causes. Every failure is made visible and interrogated before re-attempt. This principle applies uniformly across all five zones and all four aggregates.

***

## Zone 1 — Idea Capture

These policies govern the reactive logic within the Idea aggregate. Zone 1 is the sparsest zone — most of its transitions are human decisions (Product Owner) rather than automatic policies.

| ID | Trigger Event | Policy | Command Issued | Actor |
|---|---|---|---|---|
| P1.01 | `IdeaAccepted` | Whenever idea accepted, Feature Owner Agent defines the feature | `DefineFeature` | Feature Owner Agent |

**Zone 1 note:** `IdeaRejected` and `IdeaIced` have no downstream policies — they are terminal or holding states with no automatic consequence. `IdeaPrioritised` has no policy trigger; it informs backlog ordering but does not cause downstream action automatically.

***

## Zone 2 — Feature Definition

These policies govern the Feature aggregate during definition, UI design, and acceptance criteria work. Zone 2 has two parallel tracks that must both complete before decomposition can begin.

### Happy Path

| ID | Trigger Event | Policy | Command Issued | Actor |
|---|---|---|---|---|
| P2.01 | `FeatureAccepted` | Whenever feature accepted, Feature Owner Agent defines acceptance criteria | `DefineAcceptanceCriteria` | Feature Owner Agent |
| P2.02 | `FeatureAccepted` | Whenever feature accepted, Context Agent curates UI design context *(parallel to P2.01)* | `CurateUIContext` | Context Agent |
| P2.03 | `UIDesignContextAccepted` | Whenever UI context accepted, UI Design Agent designs UI | `DesignUI` | UI Design Agent |
| P2.04 | `UIAccepted` | Whenever UI accepted, Context Agent adds UI artefact to task context packages | `AddUIArtefactToTaskContext` | Context Agent |
| P2.05 | `AcceptanceCriteriaAccepted` AND `UIArtefactAddedToTaskContext` | Whenever both AC and UI artefact are accepted, Feature Owner Agent decomposes feature to tasks | `DecomposeFeature` | Feature Owner Agent |

### Sad Path

| ID | Trigger Event | Policy | Command Issued | Actor |
|---|---|---|---|---|
| P2.06 | `UIRejected` | Whenever UI rejected, UI Design Agent revises | `ReviseUI` | UI Design Agent |
| P2.07 | `AcceptanceCriteriaRejected` | Whenever AC rejected, Feature Owner Agent revises | `DefineAcceptanceCriteria` | Feature Owner Agent |

**Zone 2 note — the parallel gate (P2.05):** Both tracks must complete independently before decomposition is unlocked. AC acceptance alone is not sufficient; the UI artefact must also be accepted. This prevents Task Owner Agents from being spawned with incomplete design context — a failure mode that would cost far more to correct in Zone 3 or 4. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

***

## Zone 3 — Task Preparation

Zone 3 is the highest-complexity zone in the system. It contains more handoffs, more actors, more review gates, and more potential failure points than any other zone. Policies here enforce the key design decisions: no agent reviews its own artefact; tests are written before context is curated; context is approved before a task is published. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

### Happy Path

| ID | Trigger Event | Policy | Command Issued | Actor |
|---|---|---|---|---|
| P3.01 | `FeatureDecomposedToTasks` | Whenever feature decomposed, Feature Owner Agent spawns one Task Owner Agent per task | Spawn `TaskOwnerAgent` ×n | Feature Owner Agent |
| P3.02 | `TaskAcceptanceCriteriaDefined` | Whenever task acceptance criteria defined, Test Writer Agent writes tests | `WriteTests` | Test Writer Agent |
| P3.03 | `TestsAccepted` | Whenever tests accepted, Context Agent curates context package | `CurateContext` | Context Agent |
| P3.04 | `ContextReviewed` | Whenever context reviewed by QA Agent Definition, Product Owner may approve | enables `ApproveContext` | Product Owner |
| P3.05 | `ContextApproved` | Whenever context approved, Product Owner may publish task | enables `PublishTask` | Product Owner |

### Sad Path

| ID | Trigger Event | Policy | Command Issued | Actor |
|---|---|---|---|---|
| P3.06 | `TestsRejected` | Whenever tests rejected, Test Writer Agent revises | `ReviseTests` | Test Writer Agent |

**Zone 3 note — the AC ambiguity escalation path:** This is not a named policy in the purple-sticky sense, but it is a critical reactive behaviour established in H8. Whenever the Test Writer Agent encounters acceptance criteria too ambiguous to produce at least one executable test, it raises an uncertainty back to the Task Owner Agent rather than guessing. The Test Writer Agent is the domain's first ambiguity detector. This fires before `P3.02` can complete — it is a pre-condition failure, not a downstream failure. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

**Zone 3 note — `P3.04` and `P3.05` are enables, not automatic fires:** The Product Owner retains the decision to approve context and publish the task. These policies make those decisions available, but do not execute them without human judgment. This is intentional — the Product Owner gate before publication is the last human checkpoint before a task enters the execution queue. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

***

## Zone 4 — Task Execution

Zone 4 policies govern the Task aggregate from claiming through unit testing. This zone also contains the Uncertainty sub-flow, which is complex enough to warrant its own dedicated Event Storming session. Policies here are more numerous and more tightly sequenced than any other zone. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

### Happy Path

| ID | Trigger Event | Policy | Command Issued | Actor |
|---|---|---|---|---|
| P4.01 | `TaskPublished` | Whenever task published, Task Performer Agent claims task | `ClaimTask` | Task Performer Agent |
| P4.02 | `TaskClaimed` | Whenever task claimed, Task Performer Agent verifies environment | `VerifyEnvironment` | Task Performer Agent |
| P4.03 | `EnvironmentVerified` | Whenever environment verified, Task Performer Agent begins work | `PerformTask` | Task Performer Agent |
| P4.04 | `TaskPerformed` | Whenever task performed and proof submitted, QA Agent Execution reviews task | `ReviewTask` | QA Agent Execution |
| P4.05 | `TaskAccepted` | Whenever task accepted in review, QA Agent Execution runs unit tests | `RunUnitTests` | QA Agent Execution |
| P4.06 | `UnitTestsPassed` | Whenever unit tests pass, task is marked complete | `MarkTaskComplete` | System Policy |

### Sad Path

| ID | Trigger Event | Policy | Command Issued | Actor |
|---|---|---|---|---|
| P4.07 | `EnvironmentVerificationFailed` | Whenever environment verification fails, Task Performer Agent raises uncertainty | `RaiseUncertainty` | Task Performer Agent |
| P4.08 | `TaskRejected` | Whenever task rejected by QA Agent Execution, task returned to queue | `ReturnToQueue` | System Policy |
| P4.09 | `UnitTestsFailed` | Whenever unit tests fail, task returned to queue | `ReturnToQueue` | System Policy |
| P4.10 | `TaskReturnedToQueue` | Whenever task returned to queue, Product Owner reviews | `ReviewReturnedTask` | Product Owner |

### Uncertainty Sub-flow

These policies govern the Uncertainty aggregate within Zone 4. They fire within an active task when the Task Performer Agent encounters something that cannot be resolved independently. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

| ID | Trigger Event | Policy | Command Issued | Actor |
|---|---|---|---|---|
| P4.U1 | `UncertaintyRaised` | Whenever uncertainty raised, Advisor Agent researches it | `ResearchUncertainty` | Advisor Agent |
| P4.U2 | `UncertaintyResearched` | Whenever uncertainty researched, Advisor Agent defines mitigation | `DefineMitigation` | Advisor Agent |
| P4.U3 | `MitigationDefined` | Whenever mitigation defined, Advisor Agent reviews it | `ReviewMitigation` | Advisor Agent |
| P4.U4 | `MitigationAccepted` | Whenever mitigation accepted, uncertainty resolved, Task Performer Agent resumes | `PerformTask` | Task Performer Agent |
| P4.U5 | `MitigationRejected` | Whenever mitigation rejected, task transitions to BLOCKED | `BlockTask` | System Policy |
| P4.U6 | `TaskBlocked` | Whenever task blocked, task returned to queue | `ReturnToQueue` | System Policy |

**Zone 4 — Uncertainty sub-flow note:** The full Uncertainty sub-flow (Raised → Researched → Mitigation Defined → Reviewed → Accepted/Rejected → Resolved/Blocked) is a complete mini-system within Zone 4. `P4.U1` through `P4.U6` represent only what was captured in the main session. A dedicated Uncertainty sub-flow Event Storming session will expand these policies significantly — particularly around what happens when the Advisor Agent's mitigation is also rejected a second time, and whether the sub-flow can be re-entered from `BLOCKED` or must always route through Product Owner review. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

**Zone 4 — `P4.10` human gate note:** The Product Owner reviewing a returned task is not a formality. The Product Owner has three distinct outcomes: re-publish as-is, modify and re-publish, or close permanently (`TaskClosed`). A returned task has failed at least once. Automatic re-queuing without review risks the same failure repeating. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

***

## Zone 5 — Feature Delivery

Zone 5 policies are the most provisional in this registry. They were under-specified in the original session (identified in the retrospective as RCA 2) and are all contingent on H13 resolution. They are included here as the best current understanding, but should not be implemented until the Zone 5 Event Storming session is complete. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

### Happy Path ⚠️

| ID | Trigger Event | Policy | Command Issued | Actor |
|---|---|---|---|---|
| P5.01 | `AllTasksCompleted` *(system-computed when all tasks in `task_list` reach `COMPLETED` or `CLOSED`)* | Whenever all tasks complete, system runs integration tests automatically — no human trigger required | `RunIntegrationTests` | System Policy |
| P5.02 | `IntegrationTestsPassed` | Whenever integration tests pass, system promotes feature to staging | `PromoteToStaging` ⚠️ | System Policy ⚠️ |
| P5.03 | `PromotedToStaging` | Whenever promoted to staging, system verifies staging environment | `VerifyStagingEnvironment` ⚠️ | System / CI-CD Pipeline ⚠️ |
| P5.04 | `StagingEnvironmentVerified` | Whenever staging environment verified, Feature Owner Agent plans user testing | `PlanUserTesting` ⚠️ | Feature Owner Agent ⚠️ |
| P5.05 | `UserTestingPassed` | Whenever user testing passes, system promotes to production | `PromoteToProduction` ⚠️ | System Policy ⚠️ |
| P5.06 | `FeaturePromotedToProduction` | Whenever promoted to production, system marks feature complete | `MarkFeatureComplete` ⚠️ | System Policy ⚠️ |

### Sad Path ⚠️

| ID | Trigger Event | Policy | Command Issued | Actor |
|---|---|---|---|---|
| P5.07 | `IntegrationTestsFailed` | Whenever integration tests fail, Feature Owner Agent reviews | Feature Owner Agent review ⚠️ | Feature Owner Agent ⚠️ |
| P5.08 | `StagingEnvironmentVerificationFailed` | ⚠️ **H13 UNRESOLVED** — whether this is a domain failure requiring a domain policy, or a pipeline failure the domain only observes, is the core H13 question | ⚠️ | ⚠️ |
| P5.09 | `UserTestingFailed` | Whenever user testing fails, Feature Owner Agent reviews | Feature Owner Agent review ⚠️ | Feature Owner Agent ⚠️ |

**Zone 5 note — `P5.01` was Hotspot 10:** The decision that integration tests run automatically on all-tasks-complete (rather than requiring a human trigger) was a live hotspot during the session and was resolved as a purple policy. This removes a potential human bottleneck at objective completion and is one of the clearest policy decisions in the whole board. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

**Zone 5 note — H13:** `P5.08` is the only policy in the entire registry with no resolution. The question — if `StagingEnvironmentVerificationFailed`, does the domain own it with a policy and an actor to respond, or does the domain only observe the outcome as an external system event? — will be answered in the Zone 5 session. The answer will determine whether `P5.08` becomes a full domain policy (with a Feature Owner Agent command and a response path) or a read-only observation event with no downstream policy. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

***

## Cross-Cutting Pattern: Context Curation Before Every Significant Work Start

The session retrospective noted that context curation appeared as a pattern in three separate zones before it was named as such. It is worth stating explicitly here as a cross-cutting policy principle, not just a per-zone rule: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

> **No significant work begins without context being explicitly prepared and verified.**

This manifests as:
- `CurateUIContext` before `DesignUI` (Zone 2)
- `CurateContext` before `PublishTask` (Zone 3)
- `FullContextPackageLoaded` before `ClaimTask` (Zone 4)

This is not yet formalised as a named policy — it is a structural pattern that the Zone 5 session should explicitly check for in the feature delivery zone. Does Feature Owner Agent need curated context before planning user testing? The pattern predicts yes.

***

## Policy Count Summary

| Zone | Happy Path Policies | Sad Path Policies | Sub-flow Policies | Total |
|---|---|---|---|---|
| Zone 1 — Idea | 1 | 0 | 0 | 1 |
| Zone 2 — Feature Definition | 5 | 2 | 0 | 7 |
| Zone 3 — Task Preparation | 5 | 1 | 0 | 6 |
| Zone 4 — Task Execution | 6 | 4 | 6 | 16 |
| Zone 5 — Feature Delivery ⚠️ | 6 | 3 (1 unresolved) | 0 | 9 |
| **Total** | **23** | **10** | **6** | **39** |

The session was documented as producing approximately 30 policies. The count here reaches 39 because the uncertainty sub-flow policies were captured as a discrete group during the session but not individually counted in the session summary, and the parallel gate in P2.05 was expanded from a single sticky into its constituent parts. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

***

## Open Items

| Item | Status | Blocking? |
|---|---|---|
| P5.08 — `StagingEnvironmentVerificationFailed` policy | ⚠️ H13 Unresolved — awaiting Zone 5 Event Storming session | Blocks implementation of all Zone 5 failure paths |
| Uncertainty sub-flow — second rejection path | Not yet stormed — awaiting dedicated Uncertainty sub-flow session | Does not block Zone 3/4 implementation but leaves a gap in the `BLOCKED` state's resolution path |
| Zone 5 sad-path detail | Under-specified — the failure review loops for `P5.07` and `P5.09` have no commands, read models, or exit conditions defined | Blocks production-ready Zone 5 implementation |
| Context curation pattern in Zone 5 | Not yet confirmed — does the Feature Owner Agent need a curated context card before `PlanUserTesting`? | Low urgency; worth checking explicitly in the Zone 5 session |

***

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2026-02-27 | Initial draft from Event Storming session transcript and domain map. All Zone 1–4 policies considered stable. Zone 5 policies marked provisional pending H13 resolution. |