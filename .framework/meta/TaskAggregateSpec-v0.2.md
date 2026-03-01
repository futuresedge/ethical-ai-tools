<!-- @format -->

# Task Aggregate Specification

**Version:** 0.2  
**Status:** Draft  
**Last Updated:** 2026-02-21  
**Produced by:** Event Storming Session — Big Picture + Process Modelling  
**Author:** Pete Argent

**Related files:**

- [EventStormingSession-01-TaskAggregate-Retrospective.md](./EventStormingSession-01-TaskAggregate-Retrospective.md) — retrospective of the event storming session that produced this spec, with links to all session artefacts and a record of how each hotspot was resolved.

---

## 1. What It Is

A Task is the **atomic unit of executable work** in the Agentic Development Framework. It is a consistency boundary — one thing that must be updated atomically, with one designated agent holding write authority at each stage of its lifecycle.

A Task is created by a Task Owner Agent (spawned by a Feature Owner Agent after feature decomposition), executed by a Task Performer Agent, and verified by a QA Agent (Execution). It is the only aggregate that carries proof of completion.

A Task exists entirely within **Zones 3 and 4** of the delivery pipeline:

- **Zone 3 — Task Preparation:** from task creation to task published
- **Zone 4 — Task Execution:** from task claimed to task completed

Tasks are children of a Feature aggregate. They do not exist independently. A Task Owner Agent is spawned by the Feature Owner Agent at the moment of feature decomposition — one Task Owner Agent per task.

---

## 2. What It Owns

A Task owns exactly the following artefacts. Nothing outside this list belongs to the Task aggregate. Artefacts from the Feature aggregate (feature spec, UI artefact, feature-level tests) are **read-only references** within a Task — they are not owned by it.

| Artefact               | Description                                                                                               | Set by                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `task_id`              | Unique immutable identifier, assigned at creation                                                         | System                                                                             |
| `parent_feature_id`    | Reference to the owning Feature aggregate                                                                 | System                                                                             |
| `task_spec`            | Description, constraints, and scope of work                                                               | Task Owner Agent                                                                   |
| `acceptance_criteria`  | Human-readable statements of intent — what success looks like from the problem space                      | Task Owner Agent                                                                   |
| `required_skills`      | Declared capability requirements for a Task Performer                                                     | Task Owner Agent                                                                   |
| `test_suite`           | Explicit executable tests with exact expected outputs — solution space translation of acceptance criteria | Test Writer Agent                                                                  |
| `context_package`      | Curated, reviewed, and approved context needed by the Task Performer                                      | Context Agent (curates) / QA Agent Definition (reviews) / Product Owner (approves) |
| `environment_contract` | Verified snapshot of environment state captured at claim time                                             | Task Performer Agent                                                               |
| `proof_of_completion`  | Literal captured command output proving task is done — not assertions                                     | Task Performer Agent                                                               |
| `verification_history` | Full append-only log of all review decisions and test outcomes                                            | QA Agent (Execution)                                                               |
| `uncertainty_log`      | All uncertainties raised, researched, and resolved — preserved through re-queue                           | Advisor Agent                                                                      |
| `status`               | Current state in the lifecycle                                                                            | Varies by stage — see Section 4                                                    |
| `state_transition_log` | Immutable record of every status change: who, what, when                                                  | System                                                                             |

---

## 3. The Distinction Between Acceptance Criteria and Tests

This distinction is foundational to the Task aggregate's integrity.

**Acceptance Criteria** live in the **problem space.** They are human-readable statements describing what success looks like from the perspective of intent:

> _"When a user submits the form with an empty email field, they receive a validation error"_

**Tests** live in the **solution space.** They describe what success looks like in machine-verifiable terms, with no ambiguity:

> Command: `submit_form(email="")`  
> Expected output: `{ error: "Email is required", status: 400 }`  
> Environment: test DB seeded, form rendered in node environment

The acceptance criterion tells you _what_ must be true. The test tells you _exactly how you will know_ it is true.

The Test Writer Agent's job is to translate acceptance criteria from the problem space into explicit execution outcomes in the solution space. **If a Test Writer Agent cannot write an explicit executable test for an acceptance criterion, that is not a test-writing failure — it is evidence that the acceptance criterion is underspecified.** The agent raises an uncertainty back to the Task Owner Agent rather than guessing.

---

## 4. Valid State Transitions

```
CREATED
  └→ ACCEPTANCE_CRITERIA_DEFINED
       └→ TESTS_WRITTEN
            └→ TESTS_ACCEPTED
                 └→ CONTEXT_READY
                      └→ PUBLISHED
                           └→ CLAIMED
                                ├→ ENVIRONMENT_VERIFIED
                                │    └→ IN_PROGRESS
                                │         ├→ UNCERTAINTY_RAISED (mid-task)
                                │         │    ├→ RESOLVED → IN_PROGRESS
                                │         │    └→ BLOCKED → RETURNED_TO_QUEUE
                                │         └→ UNDER_REVIEW
                                │              ├→ UNIT_TESTING
                                │              │    ├→ COMPLETED ✓ (terminal)
                                │              │    └→ UNIT_TESTS_FAILED → RETURNED_TO_QUEUE
                                │              └→ REJECTED → RETURNED_TO_QUEUE
                                └→ ENVIRONMENT_VERIFICATION_FAILED
                                     └→ UNCERTAINTY_RAISED
                                          ├→ RESOLVED → IN_PROGRESS
                                          └→ BLOCKED → RETURNED_TO_QUEUE

RETURNED_TO_QUEUE
  └→ [Human Review]
       ├→ PUBLISHED (re-publish as-is or modified)
       └→ CLOSED ✗ (terminal)
```

**Notes on state transitions:**

- `TESTS_WRITTEN` requires QA Agent (Definition) review before transitioning to `TESTS_ACCEPTED`. A rejection returns to `TESTS_WRITTEN` with the Test Writer Agent for revision.
- `CONTEXT_READY` requires QA Agent (Definition) review after curation, then Product Owner approval before transitioning to `PUBLISHED`.
- `RETURNED_TO_QUEUE` always requires Product Owner human review before the task can re-enter `PUBLISHED` status. The Product Owner may re-publish as-is, modify and re-publish, or close the task permanently.
- `COMPLETED` and `CLOSED` are the only terminal states. A task in `COMPLETED` cannot be modified. A task in `CLOSED` cannot be re-opened.
- The `uncertainty_log` and `verification_history` are preserved through `RETURNED_TO_QUEUE` — they are never reset on re-claim.

---

## 5. Write Authority by State

Only the designated agent may transition the task out of a given state. No other agent has write authority for that transition.

| Current State                     | Write Authority                          | Valid Transitions                                             |
| --------------------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| `CREATED`                         | Task Owner Agent                         | → `ACCEPTANCE_CRITERIA_DEFINED`                               |
| `ACCEPTANCE_CRITERIA_DEFINED`     | Task Owner Agent                         | → `TESTS_WRITTEN`                                             |
| `TESTS_WRITTEN`                   | QA Agent (Definition)                    | → `TESTS_ACCEPTED` or back to `TESTS_WRITTEN` (rejection)     |
| `TESTS_ACCEPTED`                  | Context Agent                            | → `CONTEXT_READY`                                             |
| `CONTEXT_READY`                   | QA Agent (Definition) then Product Owner | → `PUBLISHED`                                                 |
| `PUBLISHED`                       | Task Performer Agent                     | → `CLAIMED`                                                   |
| `CLAIMED`                         | Task Performer Agent                     | → `ENVIRONMENT_VERIFIED` or `ENVIRONMENT_VERIFICATION_FAILED` |
| `ENVIRONMENT_VERIFIED`            | Task Performer Agent                     | → `IN_PROGRESS`                                               |
| `ENVIRONMENT_VERIFICATION_FAILED` | Task Performer Agent                     | → `UNCERTAINTY_RAISED`                                        |
| `IN_PROGRESS`                     | Task Performer Agent                     | → `UNDER_REVIEW` or `UNCERTAINTY_RAISED`                      |
| `UNCERTAINTY_RAISED`              | Advisor Agent                            | → `RESOLVED` or `BLOCKED`                                     |
| `RESOLVED`                        | Task Performer Agent                     | → `IN_PROGRESS`                                               |
| `BLOCKED`                         | System (policy)                          | → `RETURNED_TO_QUEUE`                                         |
| `UNDER_REVIEW`                    | QA Agent (Execution)                     | → `UNIT_TESTING` or `REJECTED`                                |
| `REJECTED`                        | System (policy)                          | → `RETURNED_TO_QUEUE`                                         |
| `UNIT_TESTING`                    | QA Agent (Execution)                     | → `COMPLETED` or `UNIT_TESTS_FAILED`                          |
| `UNIT_TESTS_FAILED`               | System (policy)                          | → `RETURNED_TO_QUEUE`                                         |
| `RETURNED_TO_QUEUE`               | Product Owner (human review)             | → `PUBLISHED` or `CLOSED`                                     |

---

## 6. Invariants

These rules must always be true. Any command or state transition that violates an invariant is rejected by the system. Invariants are enforced mechanically, not by convention.

1. **No task may be `PUBLISHED` without `context_package` in status `APPROVED` by the Product Owner.**

2. **No task may be `CLAIMED` unless its current status is `PUBLISHED`.**

3. **No task may enter `UNDER_REVIEW` without `proof_of_completion` populated with literal captured command output.** Assertions ("tests passed", "implementation complete") are not valid proof and must be rejected.

4. **No task may reach `COMPLETED` without every item in `test_suite` returning an explicit pass result matched against its expected output.**

5. **No agent may write to a field outside its designated write authority for the current state.**

6. **`state_transition_log` is append-only.** No entry may be modified or deleted under any circumstances.

7. **`uncertainty_log` travels with the task through `RETURNED_TO_QUEUE`.** It is never reset on re-claim. All prior uncertainty history is visible to the next Task Performer Agent that claims the task.

8. **`environment_contract` must be captured at claim time, before the task enters `IN_PROGRESS`.** It cannot be backfilled after the fact.

9. **No acceptance criterion may be considered accepted if the Test Writer Agent cannot derive at least one explicit executable test from it.** Criteria that are too ambiguous to produce executable tests are returned to the Task Owner Agent as uncertainties before the test suite is written.

10. **A task in `COMPLETED` status is immutable.** No artefact within a completed task may be modified.

11. **A task in `CLOSED` status cannot be re-opened.** If the work is still needed, a new Task must be created.

---

## 7. Actors and Their Relationship to This Aggregate

| Actor                     | Type                                   | Role in Task Lifecycle                                                                            |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Task Owner Agent**      | Agent (spawned by Feature Owner Agent) | Creates the task, defines acceptance criteria, declares required skills                           |
| **Test Writer Agent**     | Agent                                  | Translates acceptance criteria into executable tests; raises uncertainty if AC is ambiguous       |
| **QA Agent (Definition)** | Agent (Zone 3 specialist)              | Reviews test suite; reviews context package before Product Owner approval                         |
| **Context Agent**         | Agent                                  | Curates the context package from task spec, acceptance criteria, tests, and UI artefact           |
| **Product Owner**         | Human                                  | Approves context package; publishes task; reviews returned tasks; makes close/re-publish decision |
| **Task Performer Agent**  | Agent                                  | Claims task; verifies environment; performs work; captures proof; raises uncertainty              |
| **Advisor Agent**         | Agent                                  | Researches uncertainties; defines and reviews mitigation; holds elevated context                  |
| **QA Agent (Execution)**  | Agent (Zone 4 specialist)              | Reviews completed task; runs unit tests; issues accept or reject decision                         |

---

## 8. Commands It Receives

| Command                    | Issued by             | Precondition                                                |
| -------------------------- | --------------------- | ----------------------------------------------------------- |
| `DefineTask`               | Task Owner Agent      | Feature decomposed by Feature Owner Agent                   |
| `DefineAcceptanceCriteria` | Task Owner Agent      | Task in `CREATED`                                           |
| `WriteTests`               | Test Writer Agent     | Acceptance criteria in `ACCEPTED` state                     |
| `ReviseTests`              | Test Writer Agent     | Tests rejected by QA Agent (Definition)                     |
| `ReviewTests`              | QA Agent (Definition) | Tests submitted by Test Writer Agent                        |
| `CurateContext`            | Context Agent         | Tests in `ACCEPTED` state                                   |
| `ReviewContext`            | QA Agent (Definition) | Context package curated                                     |
| `ApproveContext`           | Product Owner         | Context package reviewed by QA Agent (Definition)           |
| `PublishTask`              | Product Owner         | Context package in `APPROVED` state                         |
| `ClaimTask`                | Task Performer Agent  | Task in `PUBLISHED` state                                   |
| `VerifyEnvironment`        | Task Performer Agent  | Task in `CLAIMED` state                                     |
| `PerformTask`              | Task Performer Agent  | Environment in `VERIFIED` state                             |
| `RaiseUncertainty`         | Task Performer Agent  | Task in `IN_PROGRESS` or `ENVIRONMENT_VERIFICATION_FAILED`  |
| `ResearchUncertainty`      | Advisor Agent         | Uncertainty raised                                          |
| `DefineMitigation`         | Advisor Agent         | Uncertainty researched                                      |
| `ReviewMitigation`         | Advisor Agent         | Mitigation defined                                          |
| `AcceptMitigation`         | Advisor Agent         | Mitigation reviewed                                         |
| `RejectMitigation`         | Advisor Agent         | Mitigation reviewed — task transitions to `BLOCKED`         |
| `SubmitForReview`          | Task Performer Agent  | `proof_of_completion` populated with literal output         |
| `ReviewTask`               | QA Agent (Execution)  | Task in `UNDER_REVIEW`                                      |
| `RunUnitTests`             | QA Agent (Execution)  | Task accepted in review                                     |
| `AcceptTask`               | QA Agent (Execution)  | Task reviewed — transitions to `UNIT_TESTING`               |
| `RejectTask`               | QA Agent (Execution)  | Task reviewed — transitions to `RETURNED_TO_QUEUE`          |
| `ReviewReturnedTask`       | Product Owner         | Task in `RETURNED_TO_QUEUE`                                 |
| `RepublishTask`            | Product Owner         | Task reviewed after return — may modify before republishing |
| `CloseTask`                | Product Owner         | Task reviewed after return — permanently closes             |

---

## 9. Events It Produces

Every state transition produces an immutable domain event emitted to the Observable Stream. Events are past tense facts. They cannot be modified after emission.

`TaskCreated` · `AcceptanceCriteriaDefined` · `TestsWritten` · `TestsRevised` · `TestsReviewed` · `TestsAccepted` · `TestsRejected` · `ContextCurated` · `ContextReviewed` · `ContextApproved` · `TaskPublished` · `TaskClaimed` · `EnvironmentVerified` · `EnvironmentVerificationFailed` · `TaskInProgress` · `UncertaintyRaised` · `UncertaintyResearched` · `MitigationDefined` · `MitigationReviewed` · `MitigationAccepted` · `MitigationRejected` · `UncertaintyResolved` · `TaskBlocked` · `TaskSubmittedForReview` · `TaskReviewed` · `TaskAccepted` · `TaskRejected` · `UnitTestsRan` · `UnitTestsPassed` · `UnitTestsFailed` · `TaskCompleted` · `TaskReturnedToQueue` · `ReturnedTaskReviewed` · `TaskRepublished` · `TaskClosed`

---

## 10. Read Models Required

Each actor needs the following information available at the moment they issue a command. A missing or stale Read Model is a failure condition, not a warning.

| Actor                 | Read Model                                                                   | Needed before                    |
| --------------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| Task Owner Agent      | Feature decomposition + feature acceptance criteria + UI artefact            | `DefineTask`                     |
| Task Owner Agent      | Feature context + UI artefact + feature-level tests                          | `DefineAcceptanceCriteria`       |
| Test Writer Agent     | Task acceptance criteria + expected system behaviour + environment contract  | `WriteTests`                     |
| QA Agent (Definition) | Task acceptance criteria + expected test outputs                             | `ReviewTests`                    |
| Context Agent         | Task spec + acceptance criteria + test suite + UI artefact + feature context | `CurateContext`                  |
| QA Agent (Definition) | Task spec + context package contents                                         | `ReviewContext`                  |
| Product Owner         | Context package summary + task readiness checklist                           | `ApproveContext` / `PublishTask` |
| Task Performer Agent  | Full approved context package                                                | `ClaimTask`                      |
| Task Performer Agent  | Current environment state                                                    | `VerifyEnvironment`              |
| Task Performer Agent  | Uncertainty history for this task                                            | `RaiseUncertainty`               |
| Advisor Agent         | Uncertainty description + task context + environment state + uncertainty log | `ResearchUncertainty`            |
| QA Agent (Execution)  | Task acceptance criteria + expected test outputs                             | `ReviewTask`                     |
| QA Agent (Execution)  | Test suite + acceptance criteria + proof of completion                       | `RunUnitTests`                   |
| Product Owner         | Full return history + uncertainty log + verification history                 | `ReviewReturnedTask`             |

---

## 11. Policies That Fire on Task Events

These are the reactive rules triggered by Task events. They are automatic — no human or agent decision is required.

| Trigger Event                   | Policy                                                                      | Command Issued          |
| ------------------------------- | --------------------------------------------------------------------------- | ----------------------- |
| `TestsRejected`                 | Whenever tests rejected → Test Writer revises                               | `ReviseTests`           |
| `ContextApproved`               | Whenever context approved → Product Owner may publish                       | (enables `PublishTask`) |
| `TaskClaimed`                   | Whenever task claimed → Task Performer verifies environment                 | `VerifyEnvironment`     |
| `EnvironmentVerified`           | Whenever environment verified → Task Performer begins work                  | `PerformTask`           |
| `EnvironmentVerificationFailed` | Whenever environment verification fails → Task Performer raises uncertainty | `RaiseUncertainty`      |
| `MitigationRejected`            | Whenever mitigation rejected → Task transitions to blocked                  | `BlockTask`             |
| `TaskBlocked`                   | Whenever task blocked → Task returned to queue                              | `ReturnToQueue`         |
| `TaskRejected`                  | Whenever task rejected by QA → Task returned to queue                       | `ReturnToQueue`         |
| `UnitTestsFailed`               | Whenever unit tests fail → Task returned to queue                           | `ReturnToQueue`         |
| `TaskReturnedToQueue`           | Whenever task returned → Product Owner reviews                              | `ReviewReturnedTask`    |

---

## 12. Relationship to Other Aggregates

| Aggregate             | Relationship                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Feature**           | Parent aggregate. Task cannot exist without a parent Feature. Feature owns the task list and feature-level acceptance criteria. |
| **Uncertainty**       | Child process. Raised from within a Task. Uncertainty log is owned by the Task and travels with it.                             |
| **Observable Stream** | External system. All Task events are emitted here. The stream is append-only and is the authoritative record of what happened.  |

---

## 13. Open Questions

No open hotspots remain for this aggregate. All session hotspots relevant to the Task aggregate have been resolved:

| Hotspot                                | Resolution                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| H2/H7 — Definition of done             | Task is done when unit tests pass at end of Zone 4                                          |
| H3 — Task boundary and ownership       | Task owns its AC, tests, context, proof, and history                                        |
| H8 — Who writes task-level tests       | Test Writer Agent autonomously; raises uncertainty if AC is ambiguous                       |
| H9 — How Task Owner Agents are created | Spawned by Feature Owner Agent after decomposition                                          |
| H11 — One or specialist QA agents      | Two specialist agents: QA Agent (Definition) for Zones 2–3, QA Agent (Execution) for Zone 4 |
| H12 — Task returned to queue routing   | Always requires Product Owner human review before re-publish or close                       |

---

## 14. Version History

| Version | Date       | Changes                                                                                                                                                                                                                                                   |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | 2026-02-21 | Initial draft from Event Storming session                                                                                                                                                                                                                 |
| 0.2     | 2026-02-21 | Added two specialist QA agents; added CLOSED terminal state and human review gate on return; added Invariant 9 (AC/test distinction); added Test Writer uncertainty escalation; added full read models table; added policies table; added version history |

