# FEATURE Aggregate Specification v0.1

```
Version: 0.1
Date: 2026-02-27
Status: Draft — Zone 5 sections marked with ⚠️ HOTSPOT H13 pending Zone 5 Event Storming session
Source session: Event Storming session 2026-02-21
Related documents:
  - task-aggregate-spec-v0.2.md
  - event-storming-domain-map-v1.0.md
  - event-storming-retrospective.md
```

***

## 1. What It Is

A Feature is the unit of product value in the framework. It is a consistency boundary that spans from the moment an accepted idea is defined as a feature to the moment it is live in production. A Feature is defined by the Feature Owner Agent, approved by the Product Owner, decomposed into Tasks, and delivered through integration, staging, and production deployment.

A Feature is the only aggregate that owns end-to-end delivery responsibility. It does not own the internal contents of its child Tasks — those belong to the Task aggregate — but it does own the task list, the feature-level acceptance criteria, the UI artefact, the integration test results, and all deployment state.

**Zone span:** Zones 2–5

**Primary write authority:** Feature Owner Agent (Zones 2–3), System Policy (Zone 5)

**Terminal states:** `COMPLETED` (in production), `REJECTED` (closed, will not proceed), `ICED` (actively deprioritised, revisitable)

**Parent aggregate:** Idea — a Feature cannot exist without an accepted Idea.

**Child aggregates:** Task — Tasks are children of Feature. Feature owns the task list (references to Task aggregates). Feature does not own the internal contents of individual Tasks.

***

## 2. What It Owns

A Feature owns exactly these artefacts. Nothing outside this list belongs to the Feature aggregate.

| Artefact | Description | Set by |
|---|---|---|
| `feature_spec` | Description, scope, constraints, and business context of the feature | Feature Owner Agent |
| `feature_acceptance_criteria` | Explicit, testable conditions for feature-level done (distinct from task-level AC) | Feature Owner Agent |
| `success_metrics` | Measurable outcomes that define business success for the feature | Feature Owner Agent |
| `ui_artefact` | Designed UI output, reviewed and accepted, added to downstream task context | UI Design Agent |
| `task_list` | Ordered references to all child Task aggregates spawned for this feature | Feature Owner Agent |
| `integration_test_results` | Output of the automated integration test run triggered on all-tasks-complete | System Policy / CI-CD Pipeline |
| `user_testing_plan` | Approach and criteria for user testing in Zone 5 | Feature Owner Agent ⚠️ |
| `user_testing_results` | Outcomes of user testing sessions | Feature Owner Agent ⚠️ |
| `staging_deployment_status` | Current state of the feature in the staging environment | System Policy ⚠️ |
| `production_deployment_status` | Current state of the feature in production | System Policy ⚠️ |
| `feature_status` | Current state in the lifecycle (see state transitions below) | Varies by stage |
| `state_transition_log` | Immutable record of every status change, by whom, when | System |

> ⚠️ **HOTSPOT H13** — The artefacts marked above involve the CI/CD pipeline and staging/production environments. Write authority and failure ownership for these artefacts (who sets them, who is responsible when they fail) is unresolved until the Zone 5 Event Storming session determines whether `StagingEnvironmentVerificationFailed` is a domain event or a pipeline event. These fields are included here as placeholders only.

***

## 3. Valid State Transitions

```
DEFINED
  → REVIEWED
  → ACCEPTED
  → REJECTED  (terminal)
  → ICED      (terminal-ish, revisitable)

ACCEPTED
  → ACCEPTANCE_CRITERIA_DEFINED
  → UI_DESIGN_IN_PROGRESS  (parallel path, triggered by policy)

ACCEPTANCE_CRITERIA_DEFINED
  → ACCEPTANCE_CRITERIA_ACCEPTED
  → ACCEPTANCE_CRITERIA_REJECTED  (returns to DEFINED for revision)

ACCEPTANCE_CRITERIA_ACCEPTED
  → DECOMPOSED  (Feature Owner Agent decomposes to tasks)

DECOMPOSED
  → TASKS_IN_PROGRESS  (one or more Task aggregates are PUBLISHED or active)

TASKS_IN_PROGRESS
  → ALL_TASKS_COMPLETE  (policy trigger: all child Tasks reach COMPLETED)

ALL_TASKS_COMPLETE
  → INTEGRATION_TESTS_RUNNING  (automatic, no human trigger)

INTEGRATION_TESTS_RUNNING
  → INTEGRATION_TESTS_PASSED
  → INTEGRATION_TESTS_FAILED  → Feature Owner Agent review ⚠️

INTEGRATION_TESTS_PASSED
  → PROMOTED_TO_STAGING  ⚠️

PROMOTED_TO_STAGING
  → STAGING_VERIFIED  ⚠️
  → STAGING_VERIFICATION_FAILED  ⚠️ H13 UNRESOLVED

STAGING_VERIFIED
  → USER_TESTING_PLANNED  ⚠️
  → USER_TESTING_CONDUCTED  ⚠️
  → USER_TESTING_PASSED  ⚠️
  → USER_TESTING_FAILED  → Feature Owner Agent review ⚠️

USER_TESTING_PASSED
  → PROMOTED_TO_PRODUCTION  ⚠️

PROMOTED_TO_PRODUCTION
  → COMPLETED  (terminal)
```

**Notes on state transitions:**
- `REJECTED` and `ICED` can be triggered at any active state by the Product Owner. `ICED` is distinct from `REJECTED` — the feature is actively deprioritised, not closed, and can be revisited.
- `COMPLETED` is the only fully terminal state. A feature in `COMPLETED` cannot be modified.
- `REJECTED` is a terminal state. If the work is still needed, a new Feature must be created from the original Idea or a new Idea.
- The `UI_DESIGN_IN_PROGRESS` path runs in parallel with acceptance criteria definition — both must complete before decomposition can begin.
- States marked ⚠️ are contingent on H13 resolution and should be treated as provisional until the Zone 5 session.

***

## 4. Write Authority by State

Only the designated actor may transition the Feature out of a given state. No other actor has write authority for that transition.

| Current State | Write Authority | Valid Transitions |
|---|---|---|
| `DEFINED` | Feature Owner Agent | `REVIEWED` |
| `REVIEWED` | Product Owner | `ACCEPTED`, `REJECTED`, `ICED` |
| `ACCEPTED` | Feature Owner Agent | `ACCEPTANCE_CRITERIA_DEFINED`, triggers `UI_DESIGN_IN_PROGRESS` via policy |
| `ACCEPTANCE_CRITERIA_DEFINED` | QA Agent Definition (review) then Product Owner | `ACCEPTANCE_CRITERIA_ACCEPTED`, `ACCEPTANCE_CRITERIA_REJECTED` |
| `ACCEPTANCE_CRITERIA_REJECTED` | Feature Owner Agent | `ACCEPTANCE_CRITERIA_DEFINED` (revision) |
| `ACCEPTANCE_CRITERIA_ACCEPTED` | Feature Owner Agent | `DECOMPOSED` |
| `DECOMPOSED` | System Policy | `TASKS_IN_PROGRESS` (on first task published) |
| `TASKS_IN_PROGRESS` | System Policy | `ALL_TASKS_COMPLETE` (when all child tasks reach `COMPLETED`) |
| `ALL_TASKS_COMPLETE` | System Policy | `INTEGRATION_TESTS_RUNNING` (automatic) |
| `INTEGRATION_TESTS_RUNNING` | System / CI-CD Pipeline ⚠️ | `INTEGRATION_TESTS_PASSED`, `INTEGRATION_TESTS_FAILED` |
| `INTEGRATION_TESTS_FAILED` | Feature Owner Agent ⚠️ | `INTEGRATION_TESTS_RUNNING` (re-run after fix) |
| `INTEGRATION_TESTS_PASSED` | System Policy ⚠️ | `PROMOTED_TO_STAGING` |
| `PROMOTED_TO_STAGING` | System / CI-CD Pipeline ⚠️ | `STAGING_VERIFIED`, `STAGING_VERIFICATION_FAILED` |
| `STAGING_VERIFICATION_FAILED` | ⚠️ H13 UNRESOLVED | ⚠️ H13 UNRESOLVED |
| `STAGING_VERIFIED` | Feature Owner Agent ⚠️ | `USER_TESTING_PLANNED` |
| `USER_TESTING_PLANNED` | Feature Owner Agent ⚠️ | `USER_TESTING_CONDUCTED` |
| `USER_TESTING_CONDUCTED` | Feature Owner Agent ⚠️ | `USER_TESTING_PASSED`, `USER_TESTING_FAILED` |
| `USER_TESTING_FAILED` | Feature Owner Agent ⚠️ | `USER_TESTING_PLANNED` (re-run) ⚠️ |
| `USER_TESTING_PASSED` | System Policy ⚠️ | `PROMOTED_TO_PRODUCTION` |
| `PROMOTED_TO_PRODUCTION` | System / CI-CD Pipeline ⚠️ | `COMPLETED` |
| `COMPLETED` | None — immutable | — |
| `ICED` | Product Owner | `ACCEPTED` (if revisited), `REJECTED` (if closed permanently) |
| `REJECTED` | None — terminal | — |

***

## 5. Invariants

These rules must always be true. Any command or state transition that violates an invariant is rejected by the system. Invariants are enforced mechanically, not by convention.

1. A Feature cannot enter `DECOMPOSED` unless `feature_acceptance_criteria` is in `ACCEPTED` status and the `ui_artefact` is in `ACCEPTED` status. Both must be present before task decomposition begins.
2. No Task aggregate may be created without a parent Feature in `DECOMPOSED` or later status.
3. Feature-level `acceptance_criteria` and task-level `acceptance_criteria` are distinct artefacts owned by different aggregates. Feature AC defines what the feature must achieve. Task AC defines what a specific piece of work must do. They are not interchangeable.
4. The `task_list` is append-only during decomposition. No task may be removed from the task list after it has been created. If a task is no longer needed, it must be `CLOSED` via the Task aggregate's own lifecycle — the Feature's task list still records it.
5. A Feature cannot enter `ALL_TASKS_COMPLETE` unless every task in `task_list` is in either `COMPLETED` or `CLOSED` status. A task in any other state (including `PUBLISHED` or `RETURNEDTOQUEUE`) blocks this transition.
6. Integration tests must run automatically on `ALL_TASKS_COMPLETE`. No human trigger is required and no human can skip this step.
7. No agent reviews its own artefact. The Feature Owner Agent that defines the feature spec and acceptance criteria cannot also be the agent that reviews it. Review authority belongs to a separate actor (QA Agent Definition for the spec; Product Owner for acceptance).
8. `state_transition_log` is append-only. No entry may be modified or deleted under any circumstances.
9. A feature in `COMPLETED` status is immutable. No artefact within a completed feature may be modified.
10. A feature in `REJECTED` status cannot be re-opened. If the work is still needed, a new Feature must be created.
11. ⚠️ **HOTSPOT H13** — Invariants governing `STAGING_VERIFICATION_FAILED` failure ownership are pending. Whether the domain must handle this failure with a policy and actor, or whether it simply observes the outcome, is unresolved.

***

## 6. Actors and Their Relationship to This Aggregate

| Actor | Type | Role in Feature Lifecycle |
|---|---|---|
| Product Owner | Human | Accepts/rejects/ices the feature after review; approves feature-level acceptance criteria; the only actor who can `REJECT` or `ICE` a feature at any stage |
| Feature Owner Agent | Agent | Defines feature spec; defines feature-level acceptance criteria; establishes success metrics; decomposes feature into tasks; spawns Task Owner Agents; owns Zone 2–3 write authority over this aggregate |
| UI Design Agent | Agent | Designs and prototypes the UI artefact after receiving curated UI context; produces the artefact that is added to task context packages downstream |
| Context Agent | Agent | Curates context for UI Design Agent before design begins; adds the accepted UI artefact to downstream task context packages |
| QA Agent Definition | Agent | Reviews feature-level acceptance criteria before Product Owner approval; reviews UI context before design begins |
| System Policy | Automated | Triggers Zone 5 transitions (integration tests, staging promotion, production promotion) without human or agent command; fires on objective conditions |
| CI-CD Pipeline | External System ⚠️ | Executes integration tests, staging promotions, and production deployments; H13 determines whether this is inside or outside the domain boundary |

***

## 7. Commands It Receives

| Command | Issued by | Precondition |
|---|---|---|
| `DefineFeature` | Feature Owner Agent | Idea in `ACCEPTED` state |
| `ReviewFeature` | Feature Owner Agent | Feature in `DEFINED` state |
| `AcceptFeature` | Product Owner | Feature reviewed |
| `RejectFeature` | Product Owner | Feature in any active state |
| `IceFeature` | Product Owner | Feature in any active state |
| `EstablishSuccessCriteria` | Feature Owner Agent | Feature in `ACCEPTED` state |
| `DefineAcceptanceCriteria` | Feature Owner Agent | Feature in `ACCEPTED` state |
| `ReviewAcceptanceCriteria` | QA Agent Definition | AC defined by Feature Owner Agent |
| `ApproveAcceptanceCriteria` | Product Owner | AC reviewed by QA Agent Definition |
| `RejectAcceptanceCriteria` | Product Owner | AC reviewed by QA Agent Definition |
| `CurateUIContext` | Context Agent | Feature in `ACCEPTED` state (parallel to AC definition) |
| `ReviewUIContext` | QA Agent Definition | UI context curated |
| `DesignUI` | UI Design Agent | UI context reviewed and accepted |
| `PrototypeUI` | UI Design Agent | UI designed |
| `ReviewUI` | QA Agent Definition | UI designed or prototyped |
| `AcceptUI` | QA Agent Definition | UI reviewed |
| `RejectUI` | QA Agent Definition | UI reviewed — triggers `ReviseUI` |
| `ReviseUI` | UI Design Agent | UI rejected |
| `AddUIArtefactToTaskContext` | Context Agent | UI artefact accepted |
| `DecomposeFeature` | Feature Owner Agent | AC in `ACCEPTED`, UI artefact in `ACCEPTED` |
| `RunIntegrationTests` | System Policy | All tasks in `task_list` are `COMPLETED` or `CLOSED` |
| `PromoteToStaging` | System Policy ⚠️ | Integration tests passed |
| `VerifyStagingEnvironment` | System / CI-CD Pipeline ⚠️ | Feature promoted to staging |
| `PlanUserTesting` | Feature Owner Agent ⚠️ | Staging environment verified |
| `ConductUserTesting` | Feature Owner Agent ⚠️ | User testing planned |
| `PromoteToProduction` | System Policy ⚠️ | User testing passed |
| `MarkFeatureComplete` | System Policy ⚠️ | Feature promoted to production |

***

## 8. Events It Produces

Every state transition produces an immutable domain event emitted to the Observable Stream. Events are past-tense facts. They cannot be modified after emission.

**Zone 2 — Feature Definition:**
- `FeatureDefined`
- `FeatureReviewed`
- `FeatureAccepted`
- `FeatureRejected`
- `FeatureIced`
- `SuccessCriteriaEstablished`
- `AcceptanceCriteriaDefined`
- `AcceptanceCriteriaReviewed`
- `AcceptanceCriteriaAccepted`
- `AcceptanceCriteriaRejected`
- `UIDesignContextCurated`
- `UIDesignContextReviewed`
- `UIDesignContextAccepted`
- `UIDesigned`
- `UIPrototyped`
- `UIReviewed`
- `UIAccepted`
- `UIRejected`
- `UIArtefactAddedToTaskContext`

**Zone 3 — Decomposition:**
- `FeatureDecomposedToTasks`

**Zone 5 — Feature Delivery ⚠️:**
- `IntegrationTestsRan`
- `IntegrationTestsPassed`
- `IntegrationTestsFailed`
- `PromotedToStaging`
- `StagingEnvironmentVerified`
- `StagingEnvironmentVerificationFailed` ⚠️ H13
- `UserTestingPlanned`
- `UserTestingConducted`
- `UserTestingPassed`
- `UserTestingFailed`
- `FeaturePromotedToProduction`
- `FeatureMarkedAsCompleted`

***

## 9. Policies That Fire on Feature Events

These are the reactive rules triggered by Feature events. They are automatic — no human or agent decision is required.

| Trigger Event | Policy | Command Issued |
|---|---|---|
| `IdeaAccepted` | Whenever idea accepted, Feature Owner Agent defines feature | `DefineFeature` |
| `FeatureAccepted` | Whenever feature accepted, Feature Owner Agent defines AC | `DefineAcceptanceCriteria` |
| `FeatureAccepted` | Whenever feature accepted, Context Agent curates UI context (parallel) | `CurateUIContext` |
| `UIDesignContextAccepted` | Whenever UI context accepted, UI Design Agent designs UI | `DesignUI` |
| `UIRejected` | Whenever UI rejected, UI Design Agent revises | `ReviseUI` |
| `UIAccepted` | Whenever UI accepted, Context Agent adds artefact to task context | `AddUIArtefactToTaskContext` |
| `AcceptanceCriteriaRejected` | Whenever AC rejected, Feature Owner Agent revises | `DefineAcceptanceCriteria` |
| `AcceptanceCriteriaAccepted` | Whenever AC accepted, Feature Owner Agent decomposes | `DecomposeFeature` |
| `FeatureDecomposedToTasks` | Whenever decomposed, Feature Owner Agent spawns one Task Owner Agent per task | Spawn `TaskOwnerAgent` (×n) |
| `AllTasksCompleted` (system-computed) | Whenever all tasks complete, system runs integration tests | `RunIntegrationTests` |
| `IntegrationTestsPassed` | Whenever integration tests pass, system promotes to staging | `PromoteToStaging` ⚠️ |
| `IntegrationTestsFailed` | Whenever integration tests fail, Feature Owner Agent reviews | Feature Owner Agent review ⚠️ |
| `StagingEnvironmentVerified` | Whenever staging verified, Feature Owner Agent plans user testing | `PlanUserTesting` ⚠️ |
| `StagingEnvironmentVerificationFailed` | ⚠️ H13 UNRESOLVED | ⚠️ H13 UNRESOLVED |
| `UserTestingPassed` | Whenever user testing passes, system promotes to production | `PromoteToProduction` ⚠️ |
| `UserTestingFailed` | Whenever user testing fails, Feature Owner Agent reviews | Feature Owner Agent review ⚠️ |
| `FeaturePromotedToProduction` | Whenever in production, system marks feature complete | `MarkFeatureComplete` ⚠️ |

> **Design principle confirmed in session:** Failure always routes to a review — never directly to a retry. No failure state triggers an automatic retry without a review step. This applies to Feature as it does to Task.

***

## 10. Read Models Required

Each actor needs the following information available at the moment they issue a command. A missing or stale Read Model is a failure condition, not a warning.

| Actor | Read Model | Needed before |
|---|---|---|
| Feature Owner Agent | Accepted Idea, success criteria | `DefineFeature` |
| Feature Owner Agent | Feature spec, idea context | `EstablishSuccessCriteria`, `DefineAcceptanceCriteria` |
| Feature Owner Agent | Accepted feature AC, accepted UI artefact, task decomposition patterns from knowledge base | `DecomposeFeature` |
| Feature Owner Agent | Integration test failure details ⚠️ | Review after `IntegrationTestsFailed` |
| Feature Owner Agent | User testing failure details, prior testing history ⚠️ | Review after `UserTestingFailed` |
| QA Agent Definition | Feature spec, proposed AC, success criteria | `ReviewAcceptanceCriteria` |
| QA Agent Definition | Feature spec, brand guidelines, success criteria | `ReviewUIContext` |
| QA Agent Definition | UI design, brand guidelines, feature AC | `ReviewUI` |
| Context Agent | Feature spec, accepted AC, success criteria | `CurateUIContext` |
| Context Agent | Accepted UI artefact, all task specs | `AddUIArtefactToTaskContext` |
| UI Design Agent | Feature spec, success criteria, brand guidelines, curated UI context | `DesignUI` |
| Product Owner | Feature spec, AC summary, success metrics | `AcceptFeature` / `RejectFeature` / `IceFeature` |
| Product Owner | AC, QA review notes | `ApproveAcceptanceCriteria` / `RejectAcceptanceCriteria` |
| System Policy | Count and status of all tasks in `task_list` | Compute `AllTasksCompleted` trigger |

***

## 11. Relationship to Other Aggregates

| Aggregate | Relationship |
|---|---|
| Idea | Parent aggregate. A Feature cannot exist without an accepted Idea. The Idea's `success_criteria` carry forward into the Feature's `success_metrics`. |
| Task | Child aggregate. Feature owns the task list (references only). Feature does not own the internal contents of individual Tasks — those belong to the Task aggregate. A Task cannot exist without a parent Feature. |
| Uncertainty | Grandchild process. Uncertainties are raised within Tasks, not directly within Features. Feature is aware of task blockages through the Observable Stream but does not manage uncertainty resolution. |
| Observable Stream | External system. All Feature events are emitted here. The stream is append-only and is the authoritative record of what happened at the feature level. |

***

## 12. Open Hotspots

| Hotspot | Status | Blocking? |
|---|---|---|
| H13 — CI/CD domain boundary | ⚠️ Unresolved — awaiting Zone 5 Event Storming session | Blocks finalisation of all Zone 5 write authority, invariants, and failure policies in this spec |

All other hotspots relevant to the Feature aggregate were resolved in the 2026-02-21 session.

***

## 13. Provenance — Decisions That Shaped This Spec

These are the non-obvious decisions made during the Event Storming session that explain why the Feature aggregate is designed the way it is. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)

| Decision | What It Prevents | What It Enables |
|---|---|---|
| Zone 5 belongs to Feature, not Task | Conflating task completion with deployment success | Clean separation of task authority from feature delivery authority |
| Feature Owner Agent spawns Task Owner Agents | Market claiming complexity at task creation | Context inheritance at birth; simpler coordination |
| Both AC and UI artefact required before decomposition | Decomposing to tasks with incomplete design, causing rework in Zone 3 | Every Task Owner Agent spawned with complete feature context |
| Failure routes to review, never to retry | Silent retry loops masking root causes | Every failure is visible and interrogated before re-attempt |
| Feature completion is policy-triggered, not human-triggered | Human sign-off bottleneck at objective completion | Product Owner authority reserved for earlier, genuinely judgement-requiring gates |
| No agent reviews its own artefact | Silent self-certification failures | Independent review at every quality gate across Zones 2–3 |

***

## 14. Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2026-02-27 | Initial draft from Event Storming session domain map and transcript. Zone 5 sections marked as provisional pending H13 resolution and Zone 5 dedicated session. |

***

**A note on completeness:** This spec is production-ready for Zones 2–3 and provisionally correct for Zone 5. The Zone 5 session will produce a v0.2 that replaces all ⚠️ H13 placeholders with resolved decisions and fills the thin policy/read-model coverage that the retrospective identified. Do not implement Zone 5 from this document alone. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/dfc2085d-c654-495b-b70c-7e41c06054af/event-storming-session-NbbGJS8yQ0.M4J0MHn24rw.md)