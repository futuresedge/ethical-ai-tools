# Event Storming Domain Map

## Agentic Development Framework — Full Lifecycle

**Version:** 1.0   
**Status:** Draft   
**Session Date:** 2026-02-21   
**Facilitator:** Perplexity AI   
**Domain Expert:** Pete Argent   
**Scope:** From *human has an idea for a feature* to *working feature in production*   
**Method:** Event Storming — Big Picture \+ Process Modelling (Alberto Brandolini)

---

## How to Read This Document

This document is the written representation of an Event Storming board. It replaces visual sticky notes with explicitly typed text elements. Every element carries its type in brackets so no visual channel is required to interpret it.

**Element types used:**

- `[DOMAIN EVENT]` — something that happened; past tense fact; state change  
- `[COMMAND]` — the action that caused an event; present tense imperative  
- `[ACTOR]` — human or agent that issues a command  
- `[POLICY]` — reactive logic: "Whenever X, do Y"; automatic  
- `[READ MODEL]` — information an actor needs to make a decision  
- `[AGGREGATE]` — consistency boundary; receives commands, produces events  
- `[EXTERNAL SYSTEM]` — outside the domain boundary  
- `[HOTSPOT]` — resolved question; documents the decision and its rationale

---

## Section 1 — Domain Overview

The Agentic Development Framework is a structured workflow for delivering software features using a team of specialised AI agents coordinated by a human Product Owner. Work flows through five delivery zones from idea capture to production deployment. Agents are spawned, assigned, and operate with defined authority boundaries. Every state change produces an immutable domain event. The framework is designed to make agent behaviour legible, verifiable, and trustworthy to non-technical humans.

The domain was stormed across one session producing 40+ domain events, 9 actors, 30+ commands, 30+ policies, 13 read models, 4 aggregates, 7 external system boundaries, and 13 hotspots — all resolved.

---

## Section 2 — Delivery Zones

The domain is divided into five sequential zones. Zone boundaries represent the most significant handoff points and the highest failure risk if crossed without adequate preparation.

| Zone | Name | Description | Active Aggregates |
| :---- | :---- | :---- | :---- |
| 1 | **Idea** | Capture, discuss, evaluate, and prioritise ideas | Idea |
| 2 | **Feature Definition** | Define feature, UI design, acceptance criteria, success metrics | Feature |
| 3 | **Task Preparation** | Decompose to tasks, write tests, curate context, publish | Feature, Task |
| 4 | **Task Execution** | Claim, verify environment, perform, review, unit test | Task |
| 5 | **Feature Delivery** | Integration tests, staging, user testing, production | Feature |

**Critical zone boundary note:** Zone 5 belongs entirely to the **Feature** aggregate, not the Task aggregate. Tasks complete at the end of Zone 4\. Features own everything in Zone 5\.

**Zone 3 is the highest-complexity zone.** It contains more handoffs, more actors, more review gates, and more potential failure points than any other zone. It is where the framework either works or fails.

---

## Section 3 — Domain Events by Zone

### Zone 1 — Idea

**Happy path:**

- `[DOMAIN EVENT]` `IdeaCaptured` — human records a new idea  
- `[DOMAIN EVENT]` `IdeaDiscussed` — idea is reviewed and discussed  
- `[DOMAIN EVENT]` `IdeaAccepted` — idea approved for development into a feature  
- `[DOMAIN EVENT]` `IdeaPrioritised` — idea ranked in the backlog  
- `[DOMAIN EVENT]` `SuccessCriteriaEstablished` — measurable outcomes defined for the idea

**Sad path:**

- `[DOMAIN EVENT]` `IdeaRejected` — idea closed; will not proceed  
- `[DOMAIN EVENT]` `IdeaIced` — idea actively deprioritised; ranked low; not dead, can be revisited

**Domain term definition — "Iced":** An active decision to deprioritise. Distinct from Rejected (a closed decision). An iced item remains in the backlog at low priority and can be re-evaluated. It is not deferred indefinitely — it has a status that can be surfaced and acted on.

---

### Zone 2 — Feature Definition

**Happy path:**

- `[DOMAIN EVENT]` `FeatureDefined` — feature specified from accepted idea  
- `[DOMAIN EVENT]` `FeatureReviewed` — feature reviewed by Feature Owner Agent  
- `[DOMAIN EVENT]` `FeatureAccepted` — feature approved to proceed  
- `[DOMAIN EVENT]` `FeaturePrioritised` — feature ranked in delivery order  
- `[DOMAIN EVENT]` `FeatureDevelopmentPlanned` — delivery approach established  
- `[DOMAIN EVENT]` `SuccessMetricsCollectionPlanned` — how success will be measured is defined  
- `[DOMAIN EVENT]` `AcceptanceCriteriaDefined` — human-readable success statements written  
- `[DOMAIN EVENT]` `AcceptanceCriteriaReviewed` — AC reviewed for quality and completeness  
- `[DOMAIN EVENT]` `AcceptanceCriteriaAccepted` — AC approved; ready for decomposition  
- `[DOMAIN EVENT]` `UIDesignContextCurated` — context prepared for UI Design Agent before work begins  
- `[DOMAIN EVENT]` `UIDesigned` — UI design produced  
- `[DOMAIN EVENT]` `UIPrototyped` — interactive prototype created  
- `[DOMAIN EVENT]` `UIReviewed` — UI design reviewed by QA Agent (Definition)  
- `[DOMAIN EVENT]` `UIAccepted` — UI design approved  
- `[DOMAIN EVENT]` `UIArtefactAddedToTaskContext` — UI design becomes part of the context package for downstream tasks

**Sad path:**

- `[DOMAIN EVENT]` `FeatureRejected` — feature closed; will not proceed  
- `[DOMAIN EVENT]` `FeatureIced` — feature deprioritised; can be revisited  
- `[DOMAIN EVENT]` `AcceptanceCriteriaRejected` — AC returned for revision  
- `[DOMAIN EVENT]` `UIRejected` — UI design rejected; triggers revision

**Key insight from session:** UI Design is not only a review gate — it is a context-producing activity. It needs curated context *in* (UIDesignContextCurated) and produces an artefact that becomes mandatory context *out* (UIArtefactAddedToTaskContext) for all downstream task performers.

---

### Zone 3 — Task Preparation

**Happy path:**

- `[DOMAIN EVENT]` `FeatureDecomposedToTasks` — Feature Owner Agent breaks feature into atomic tasks  
- `[DOMAIN EVENT]` `TaskDefined` — Task Owner Agent specifies a single task  
- `[DOMAIN EVENT]` `TaskReviewed` — task reviewed for quality  
- `[DOMAIN EVENT]` `TaskAccepted` — task approved  
- `[DOMAIN EVENT]` `TaskAcceptanceCriteriaDefined` — explicit, testable conditions for task completion written  
- `[DOMAIN EVENT]` `TaskAcceptanceCriteriaReviewed` — task AC reviewed  
- `[DOMAIN EVENT]` `TaskAcceptanceCriteriaAccepted` — task AC approved  
- `[DOMAIN EVENT]` `TestsWritten` — Test Writer Agent produces executable tests from task acceptance criteria  
- `[DOMAIN EVENT]` `TestsReviewed` — QA Agent (Definition) reviews test suite  
- `[DOMAIN EVENT]` `TestsAccepted` — test suite approved  
- `[DOMAIN EVENT]` `ContextCuratedByAgent` — Context Agent assembles context package  
- `[DOMAIN EVENT]` `ContextReviewedByAgent` — QA Agent (Definition) reviews context package  
- `[DOMAIN EVENT]` `ContextApprovedByHuman` — Product Owner approves context package  
- `[DOMAIN EVENT]` `TaskSkillsDeclared` — required capabilities for Task Performer recorded  
- `[DOMAIN EVENT]` `TaskPublished` — task made available for claiming

**Sad path:**

- `[DOMAIN EVENT]` `TaskRejected` — task rejected; returned for revision  
- `[DOMAIN EVENT]` `TaskAcceptanceCriteriaRejected` — task AC rejected; returned for revision  
- `[DOMAIN EVENT]` `TestsRejected` — test suite rejected; returned to Test Writer Agent

**Key insight from session — Acceptance Criteria vs Tests:** Acceptance criteria live in the **problem space**: human-readable statements of intent describing what success looks like from the perspective of the goal. Tests live in the **solution space**: explicit executable outcomes with exact expected outputs, environment requirements, and commands — machine-verifiable with no ambiguity.

The Test Writer Agent translates AC from problem space to solution space. If it cannot write an explicit executable test for an AC item, this is not a test-writing failure — it is evidence the AC is underspecified. The agent raises an uncertainty back to the Task Owner Agent rather than guessing. The Test Writer Agent is therefore the domain's **first ambiguity detector**.

**Key insight from session — Context curation is a first-class process:** Context curation is not a single step — it is a recurring pattern that appears in Zones 2, 3, and 4 with its own actor chain: Context Agent curates → QA Agent (Definition) reviews → Product Owner approves. No agent reviews its own artefact.

---

### Zone 4 — Task Execution

**Happy path:**

- `[DOMAIN EVENT]` `TaskClaimed` — Task Performer Agent claims the task  
- `[DOMAIN EVENT]` `EnvironmentLoaded` — execution environment initialised  
- `[DOMAIN EVENT]` `EnvironmentVerified` — Task Performer Agent confirms environment matches expected state  
- `[DOMAIN EVENT]` `ContextLoaded` — context package loaded by Task Performer Agent  
- `[DOMAIN EVENT]` `ContextLoadVerified` — context load confirmed complete and valid  
- `[DOMAIN EVENT]` `ContextQueried` — agent queries for additional context on demand  
- `[DOMAIN EVENT]` `TaskInProgress` — task execution begun  
- `[DOMAIN EVENT]` `TaskPerformed` — task work completed by Task Performer Agent  
- `[DOMAIN EVENT]` `TaskReviewedByQA` — QA Agent (Execution) reviews completed task  
- `[DOMAIN EVENT]` `TaskAcceptedByQA` — QA Agent (Execution) accepts the task  
- `[DOMAIN EVENT]` `TaskUnitTested` — unit tests executed by QA Agent (Execution)  
- `[DOMAIN EVENT]` `UnitTestsPassed` — all unit tests pass with explicit matched outputs  
- `[DOMAIN EVENT]` `TaskMarkedAsCompleted` — task reaches terminal completed state

**Sad path:**

- `[DOMAIN EVENT]` `EnvironmentVerificationFailed` — environment does not match expected state  
- `[DOMAIN EVENT]` `ContextLoadFailed` — context package failed to load correctly  
- `[DOMAIN EVENT]` `UncertaintyRaised` — Task Performer Agent encounters something it cannot resolve alone  
- `[DOMAIN EVENT]` `UncertaintyResearched` — Advisor Agent investigates the uncertainty  
- `[DOMAIN EVENT]` `UncertaintyMitigationDefined` — Advisor Agent proposes a resolution  
- `[DOMAIN EVENT]` `UncertaintyMitigationReviewed` — mitigation reviewed  
- `[DOMAIN EVENT]` `UncertaintyMitigationAccepted` — mitigation approved; task can resume  
- `[DOMAIN EVENT]` `UncertaintyMitigationRejected` — mitigation rejected; task blocked  
- `[DOMAIN EVENT]` `UncertaintyResolved` — uncertainty cleared; task returns to in-progress  
- `[DOMAIN EVENT]` `TaskBlocked` — unexpected problem encountered during execution; cannot proceed  
- `[DOMAIN EVENT]` `TaskReturnedToQueue` — task returned for human review and republish or close  
- `[DOMAIN EVENT]` `TaskRejectedByQA` — QA Agent (Execution) rejects completed task  
- `[DOMAIN EVENT]` `TaskUnitTestsFailed` — one or more unit tests fail against expected outputs  
- `[DOMAIN EVENT]` `ReturnedTaskReviewedByHuman` — Product Owner reviews a returned task  
- `[DOMAIN EVENT]` `TaskRepublished` — Product Owner republishes task (as-is or modified)  
- `[DOMAIN EVENT]` `TaskClosed` — Product Owner permanently closes task; terminal state

**Domain term definitions:**

- **Task Blocked:** An unexpected problem encountered *during execution* — not a handoff failure, not a review failure. Something the agent hit mid-work that it cannot resolve alone. Distinct from Task Rejected and Task Returned to Queue.  
- **Task Returned to Queue:** A consequence event, not a primary state. Triggered by Task Blocked, Task Rejected by QA, or Unit Tests Failed. Always requires Product Owner human review before re-publishing.

**Uncertainty sub-flow note:** The uncertainty sequence (Raised → Researched → Mitigation Defined → Reviewed → Accepted/Rejected → Resolved/Blocked) is a complete mini-system within Zone 4\. It deserves its own dedicated Event Storming pass and will be the subject of a future session. It has its own aggregate (Uncertainty) and its own actor (Advisor Agent).

---

### Zone 5 — Feature Delivery

**Happy path:**

- `[DOMAIN EVENT]` `IntegrationTestsRan` — integration tests executed automatically  
- `[DOMAIN EVENT]` `IntegrationTestsPassed` — all integration tests pass  
- `[DOMAIN EVENT]` `PromotedToStaging` — feature deployed to staging environment  
- `[DOMAIN EVENT]` `StagingEnvironmentVerified` — staging environment confirmed valid  
- `[DOMAIN EVENT]` `UserTestingPlanned` — user testing approach defined  
- `[DOMAIN EVENT]` `UserTestingConducted` — user testing sessions run  
- `[DOMAIN EVENT]` `UserTestingPassed` — user testing meets acceptance threshold  
- `[DOMAIN EVENT]` `TaskCommitted` — code committed to version control  
- `[DOMAIN EVENT]` `FeaturePromotedToProduction` — feature deployed to production  
- `[DOMAIN EVENT]` `FeatureMarkedAsCompleted` — feature reaches terminal completed state

**Sad path:**

- `[DOMAIN EVENT]` `IntegrationTestsFailed` — integration tests fail; Feature Owner Agent reviews  
- `[DOMAIN EVENT]` `StagingEnvironmentVerificationFailed` — staging environment invalid  
- `[DOMAIN EVENT]` `UserTestingFailed` — user testing does not meet threshold; Feature Owner Agent reviews

**Key insight from session:** Zone 5 belongs to the Feature aggregate, not the Task aggregate. This was a major architectural decision made during the session. Individual tasks complete at the end of Zone 4\. Zone 5 is triggered automatically when all tasks within a feature are marked complete — it is a feature-level process, not a task-level one.

---

## Section 4 — Actors

### Product Owner

- `[ACTOR]` Type: **Human**  
- Zone scope: All zones — the only actor active across every zone  
- Authority: Approval gates between zones; final decision on publish, re-publish, or close; the only actor with authority to make irreversible decisions  
- Commands issued: Accept/Reject/Ice Idea, Accept/Reject/Ice Feature, Approve Context, Publish Task, Review Returned Task, Republish Task, Close Task  
- Read models required: Idea Summary \+ Strategic Fit; Feature Spec \+ AC Preview; Context Package Summary; Task Readiness Checklist; Full Return History \+ Uncertainty Log \+ Verification History

---

### Feature Owner Agent

- `[ACTOR]` Type: **Agent**  
- Zone scope: Zones 2–3  
- Authority: Feature definition, acceptance criteria, decomposition; write authority over Feature aggregate in Zones 2–3  
- Commands issued: Define Feature, Review Feature, Define Acceptance Criteria, Decompose Feature, Establish Success Criteria  
- Read models required: Accepted Idea \+ Success Criteria (before Define Feature); Accepted Feature \+ UI Artefact (before Decompose Feature)  
- Spawning: Not spawned per feature — persistent agent. Spawns Task Owner Agents after decomposition.

---

### Task Owner Agent

- `[ACTOR]` Type: **Agent**  
- Zone scope: Zone 3  
- Authority: Single task definition and acceptance criteria; write authority over Task aggregate in Zone 3  
- Commands issued: Define Task, Review Task, Define Task Acceptance Criteria, Declare Skills  
- Read models required: Feature Decomposition \+ Feature Acceptance Criteria (before Define Task); Feature Context \+ UI Artefact \+ Feature Tests (before Define Task Acceptance Criteria)  
- Spawning: **Spawned by Feature Owner Agent after feature decomposition. One Task Owner Agent per task. System is hierarchical at the creation boundary — not market-based.** Task Owner Agents inherit feature context at birth and need less context than the Feature Owner Agent because it was filtered before they were created.

---

### UI Design Agent

- `[ACTOR]` Type: **Agent**  
- Zone scope: Zone 2  
- Authority: UI design and prototyping; write authority over UI artefact  
- Commands issued: Design UI, Prototype UI, Revise UI  
- Read models required: Feature Spec \+ Success Criteria \+ Brand Guidelines (before Design UI)

---

### Test Writer Agent

- `[ACTOR]` Type: **Agent**  
- Zone scope: Zone 3  
- Authority: Translation of acceptance criteria into executable tests; write authority over test suite  
- Commands issued: Write Tests, Revise Tests  
- Read models required: Task Acceptance Criteria \+ Expected System Behaviour \+ Environment Contract (before Write Tests)  
- Special behaviour: If acceptance criteria are too ambiguous to produce at least one explicit executable test, raises an uncertainty back to Task Owner Agent rather than guessing. This makes the Test Writer Agent the domain's first ambiguity detector.

---

### Context Agent

- `[ACTOR]` Type: **Agent**  
- Zone scope: Zones 2–4 (curation occurs in each)  
- Authority: Context curation only; does not review its own artefacts  
- Commands issued: Curate Context (UI), Curate Context (Task), Load Context, Query Context  
- Read models required: Task Spec \+ Acceptance Criteria \+ Test Suite \+ UI Artefact \+ Feature Context (before Curate Context)

---

### QA Agent (Definition)

- `[ACTOR]` Type: **Agent — Zone 3 specialist**  
- Zone scope: Zones 2–3  
- Authority: Reviews artefacts produced by other agents in Zones 2–3; does not produce primary artefacts  
- Commands issued: Review Tests, Review UI Context, Review Task Context  
- Read models required: Task Acceptance Criteria \+ Expected Test Outputs (before Review Tests); Task Spec \+ Context Package (before Review Context)  
- Scope note: One specialist agent covering Zones 2–3. Distinct from QA Agent (Execution). Has broader context load than QA Agent (Execution) because it must understand the feature level.

---

### QA Agent (Execution)

- `[ACTOR]` Type: **Agent — Zone 4 specialist**  
- Zone scope: Zone 4  
- Authority: Task review, unit test execution, accept/reject decisions on completed tasks  
- Commands issued: Review Task, Run Unit Tests, Accept Task, Reject Task  
- Read models required: Task Acceptance Criteria \+ Expected Test Outputs (before Review Task); Test Suite \+ Acceptance Criteria \+ Proof of Completion (before Run Unit Tests)  
- Scope note: One specialist agent covering Zone 4 only. Narrower context load than QA Agent (Definition) — needs task-level context only, not feature-level.

---

### Task Performer Agent

- `[ACTOR]` Type: **Agent**  
- Zone scope: Zone 4  
- Authority: Execution of task work; environment verification; proof of completion capture  
- Commands issued: Claim Task, Verify Environment, Perform Task, Raise Uncertainty, Submit For Review  
- Read models required: Full Approved Context Package (before Claim Task); Current Environment State (before Verify Environment); Uncertainty History for this Task (before Raise Uncertainty)  
- Critical constraint: **Proof of completion must be literal captured command output — not assertions.** "Tests passed" is not valid proof. The exact command output proving tests passed in a verified environment is required.

---

### Advisor Agent

- `[ACTOR]` Type: **Agent**  
- Zone scope: Zone 4 — uncertainty sub-flow only  
- Authority: Uncertainty research, mitigation definition and review; holds elevated context relative to Task Performer Agent  
- Commands issued: Research Uncertainty, Define Mitigation, Review Mitigation, Accept Mitigation, Reject Mitigation  
- Read models required: Uncertainty Description \+ Task Context \+ Environment State \+ Full Uncertainty Log (before Research Uncertainty)  
- Spawning: Assigned when Task Performer Agent raises an uncertainty. Holds more context than a standard Task Performer Agent.

---

## Section 5 — Commands

All commands in the domain, grouped by actor.

### Product Owner Commands

| Command | Produces Event |
| :---- | :---- |
| `CaptureIdea` | `IdeaCaptured` |
| `AcceptIdea` | `IdeaAccepted` |
| `RejectIdea` | `IdeaRejected` |
| `IceIdea` | `IdeaIced` |
| `PrioritiseIdea` | `IdeaPrioritised` |
| `AcceptFeature` | `FeatureAccepted` |
| `RejectFeature` | `FeatureRejected` |
| `IceFeature` | `FeatureIced` |
| `ApproveContext` | `ContextApprovedByHuman` |
| `PublishTask` | `TaskPublished` |
| `ReviewReturnedTask` | `ReturnedTaskReviewedByHuman` |
| `RepublishTask` | `TaskRepublished` |
| `CloseTask` | `TaskClosed` |

### Feature Owner Agent Commands

| Command | Produces Event |
| :---- | :---- |
| `DefineFeature` | `FeatureDefined` |
| `ReviewFeature` | `FeatureReviewed` |
| `EstablishSuccessCriteria` | `SuccessCriteriaEstablished` |
| `DefineAcceptanceCriteria` | `AcceptanceCriteriaDefined` |
| `DecomposeFeature` | `FeatureDecomposedToTasks` |

### Task Owner Agent Commands

| Command | Produces Event |
| :---- | :---- |
| `DefineTask` | `TaskDefined` |
| `ReviewTask` | `TaskReviewed` |
| `DefineTaskAcceptanceCriteria` | `TaskAcceptanceCriteriaDefined` |
| `DeclareSkills` | `TaskSkillsDeclared` |

### UI Design Agent Commands

| Command | Produces Event |
| :---- | :---- |
| `DesignUI` | `UIDesigned` |
| `PrototypeUI` | `UIPrototyped` |
| `ReviseUI` | `UIDesigned` (revision) |

### Test Writer Agent Commands

| Command | Produces Event |
| :---- | :---- |
| `WriteTests` | `TestsWritten` |
| `ReviseTests` | `TestsWritten` (revision) |

### Context Agent Commands

| Command | Produces Event |
| :---- | :---- |
| `CurateUIContext` | `UIDesignContextCurated` |
| `CurateTaskContext` | `ContextCuratedByAgent` |
| `LoadContext` | `ContextLoaded` |
| `QueryContext` | `ContextQueried` |

### QA Agent (Definition) Commands

| Command | Produces Event |
| :---- | :---- |
| `ReviewTests` | `TestsReviewed` → `TestsAccepted` or `TestsRejected` |
| `ReviewUIContext` | `UIReviewed` → `UIAccepted` or `UIRejected` |
| `ReviewTaskContext` | `ContextReviewedByAgent` |

### QA Agent (Execution) Commands

| Command | Produces Event |
| :---- | :---- |
| `ReviewTask` | `TaskReviewedByQA` → `TaskAcceptedByQA` or `TaskRejectedByQA` |
| `RunUnitTests` | `TaskUnitTested` → `UnitTestsPassed` or `TaskUnitTestsFailed` |

### Task Performer Agent Commands

| Command | Produces Event |
| :---- | :---- |
| `ClaimTask` | `TaskClaimed` |
| `VerifyEnvironment` | `EnvironmentVerified` or `EnvironmentVerificationFailed` |
| `PerformTask` | `TaskPerformed` |
| `RaiseUncertainty` | `UncertaintyRaised` |
| `SubmitForReview` | `TaskInProgress` → `UNDER_REVIEW` |

### Advisor Agent Commands

| Command | Produces Event |
| :---- | :---- |
| `ResearchUncertainty` | `UncertaintyResearched` |
| `DefineMitigation` | `UncertaintyMitigationDefined` |
| `ReviewMitigation` | `UncertaintyMitigationReviewed` |
| `AcceptMitigation` | `UncertaintyMitigationAccepted` |
| `RejectMitigation` | `UncertaintyMitigationRejected` |

---

## Section 6 — Policies

Policies are the reactive logic of the domain. They fire automatically — no actor decision is required. They are named and explicit here so they can be audited, tested, and improved.

### Zone 1 Policies

- `[POLICY]` Whenever `IdeaAccepted` → Feature Owner Agent: `DefineFeature`

### Zone 2 Policies

- `[POLICY]` Whenever `FeatureAccepted` → Feature Owner Agent: `DefineAcceptanceCriteria`  
- `[POLICY]` Whenever `FeatureAccepted` → Context Agent: `CurateUIContext`  
- `[POLICY]` Whenever `UIDesignContextCurated` → UI Design Agent: `DesignUI`  
- `[POLICY]` Whenever `UIRejected` → UI Design Agent: `ReviseUI`  
- `[POLICY]` Whenever `UIAccepted` → Context Agent: Add UI Artefact to Task Context  
- `[POLICY]` Whenever `AcceptanceCriteriaAccepted` → Feature Owner Agent: `DecomposeFeature`

### Zone 3 Policies

- `[POLICY]` Whenever `FeatureDecomposedToTasks` → Feature Owner Agent: Spawn one Task Owner Agent per task  
- `[POLICY]` Whenever `TaskAcceptanceCriteriaAccepted` → Test Writer Agent: `WriteTests`  
- `[POLICY]` Whenever `TestsRejected` → Test Writer Agent: `ReviseTests`  
- `[POLICY]` Whenever `TestsAccepted` → Context Agent: `CurateTaskContext`  
- `[POLICY]` Whenever `ContextCuratedByAgent` → QA Agent (Definition): `ReviewTaskContext`  
- `[POLICY]` Whenever `ContextReviewedByAgent` → Product Owner: (enables `ApproveContext`)  
- `[POLICY]` Whenever `ContextApprovedByHuman` → Product Owner: (enables `PublishTask`)

### Zone 4 Policies

- `[POLICY]` Whenever `TaskPublished` → Task Performer Agent: `ClaimTask`  
- `[POLICY]` Whenever `TaskClaimed` → Task Performer Agent: `VerifyEnvironment`  
- `[POLICY]` Whenever `EnvironmentVerified` → Task Performer Agent: `PerformTask`  
- `[POLICY]` Whenever `EnvironmentVerificationFailed` → Task Performer Agent: `RaiseUncertainty`  
- `[POLICY]` Whenever `UncertaintyRaised` → Advisor Agent: `ResearchUncertainty`  
- `[POLICY]` Whenever `UncertaintyMitigationAccepted` → Task Performer Agent: Resume `PerformTask`  
- `[POLICY]` Whenever `UncertaintyMitigationRejected` → System: `BlockTask`  
- `[POLICY]` Whenever `TaskBlocked` → System: `ReturnToQueue`  
- `[POLICY]` Whenever `TaskPerformed` → QA Agent (Execution): `ReviewTask`  
- `[POLICY]` Whenever `TaskAcceptedByQA` → QA Agent (Execution): `RunUnitTests`  
- `[POLICY]` Whenever `UnitTestsPassed` → System: `MarkTaskComplete`  
- `[POLICY]` Whenever `TaskRejectedByQA` → System: `ReturnToQueue`  
- `[POLICY]` Whenever `TaskUnitTestsFailed` → System: `ReturnToQueue`  
- `[POLICY]` Whenever `TaskReturnedToQueue` → Product Owner: `ReviewReturnedTask`

### Zone 5 Policies

- `[POLICY]` Whenever all tasks within a feature reach `TaskMarkedAsCompleted` → System: `RunIntegrationTests` *(automatic; no human trigger required)*  
- `[POLICY]` Whenever `IntegrationTestsPassed` → System: `PromoteToStaging`  
- `[POLICY]` Whenever `PromotedToStaging` → System: `VerifyStagingEnvironment`  
- `[POLICY]` Whenever `StagingEnvironmentVerified` → Product Owner: (enables `PlanUserTesting`)  
- `[POLICY]` Whenever `IntegrationTestsFailed` → Feature Owner Agent: Review  
- `[POLICY]` Whenever `UserTestingPassed` → System: `PromoteToProduction`  
- `[POLICY]` Whenever `UserTestingFailed` → Feature Owner Agent: Review  
- `[POLICY]` Whenever `FeaturePromotedToProduction` → System: `MarkFeatureComplete`

**Recurring pattern across all zones:** Failure always routes to a review — never directly to a retry. This is a deliberate trust design decision. No failure state in the domain triggers an automatic retry without a review step.

---

## Section 7 — Aggregates

### `[AGGREGATE]` Idea

- **Zone span:** Zone 1  
- **Owns:** Idea description, discussion notes, status (Captured / Accepted / Rejected / Iced / Prioritised), success criteria  
- **Write authority:** Product Owner  
- **Terminal states:** Accepted (proceeds to Feature), Rejected (closed), Iced (deprioritised, revisitable)

---

### `[AGGREGATE]` Feature

- **Zone span:** Zones 2–5  
- **Owns:** Feature spec, feature-level acceptance criteria, UI artefact, success metrics, task list (references to Task aggregates), integration test results, user testing results, staging and production deployment status, feature status  
- **Write authority by zone:** Feature Owner Agent (Zones 2–3), System/Policy (Zone 5\)  
- **Terminal states:** Completed (in production), Rejected (closed), Iced (deprioritised)  
- **Relationship to Task:** Feature owns the task list. Tasks are children of Feature. Feature does not own the internal contents of individual Tasks — those belong to the Task aggregate.

---

### `[AGGREGATE]` Task

- **Zone span:** Zones 3–4  
- **Owns:** Task spec, task acceptance criteria, required skills, test suite, context package, environment contract, proof of completion, verification history, uncertainty log, status, state transition log  
- **Write authority:** Varies by state — see Task Aggregate Specification v0.2 for the complete write authority table  
- **Terminal states:** Completed (end of Zone 4), Closed (Product Owner decision after return to queue)  
- **Parent aggregate:** Feature  
- **Full specification:** See `task-aggregate-spec-v0.2.md`

---

### `[AGGREGATE]` Uncertainty

- **Zone span:** Zone 4 — uncertainty sub-flow  
- **Owns:** Uncertainty description, research findings, mitigation proposal, review outcome, resolution status  
- **Write authority:** Advisor Agent  
- **Terminal states:** Resolved (task resumes), Blocked (task returned to queue)  
- **Relationship to Task:** Child process of Task. The Uncertainty aggregate's log is owned by the Task and travels with it through any return-to-queue cycle. It is never reset.  
- **Note:** This aggregate warrants its own dedicated Event Storming session. The sub-flow is complex enough to be treated as a domain in its own right.

---

## Section 8 — External Systems

External systems are outside the domain boundary. Events flow to and from them but they are not controlled by the domain.

| External System | Events Flow To | Events Flow From |
| :---- | :---- | :---- |
| `[EXTERNAL SYSTEM]` Version Control | `TaskCommitted` | — |
| `[EXTERNAL SYSTEM]` CI/CD Pipeline | `IntegrationTestsRan`, `PromotedToStaging`, `FeaturePromotedToProduction` | `IntegrationTestsPassed`, `IntegrationTestsFailed` |
| `[EXTERNAL SYSTEM]` Staging Environment | `PromotedToStaging` | `StagingEnvironmentVerified`, `StagingEnvironmentVerificationFailed` |
| `[EXTERNAL SYSTEM]` Production Environment | `FeaturePromotedToProduction` | — |
| `[EXTERNAL SYSTEM]` MCP / Nexus | All domain events (observable stream) | Context queries, pattern searches |
| `[EXTERNAL SYSTEM]` LLM Provider | Agent inference requests | Agent responses |
| `[EXTERNAL SYSTEM]` Design Tool | UI artefact exports | `UIArtefactAddedToTaskContext` |

**Open question (H13 — unresolved):** Where does the domain end and the CI/CD pipeline begin — and who is responsible when something fails at that boundary? If Staging Environment Verification Failed, is that the domain's problem or the pipeline's? This must be resolved before Zone 5 is implemented.

---

## Section 9 — Hotspot Log

All 13 hotspots identified during the session. All resolved except H13. Hotspots are the most valuable content in this document for future LLMs — they explain *why* things are the way they are.

---

### H1 — Who decides a task is ready to be published?

**Status:** ✅ Resolved **Decision:** An agent (Task Owner Agent, assisted by QA Agent Definition) can verify all required elements are present. But the decision to publish is made by the **Product Owner** — a human approval gate. **Rationale:** Publishing a task is an irreversible action that commits work to execution. Human authority is required at irreversible decision points.

---

### H2 / H7 — When is a task complete? What is the Definition of Done?

**Status:** ✅ Resolved **Decision:** A task is complete when **unit tests pass at the end of Zone 4** — specifically after QA Agent (Execution) runs the full test suite and all items return explicit matched outputs. This is the terminal `TaskMarkedAsCompleted` event. **Key corollary:** Zone 5 (integration tests, staging, user testing, production) belongs to the Feature aggregate — not the Task aggregate. Tasks do not need to be in production to be complete. **Rationale:** Conflating task completion with feature deployment created ambiguity about who had authority over task status. Separating them by aggregate resolved it cleanly.

---

### H3 — What is the boundary of a Task? What does it own?

**Status:** ✅ Resolved **Decision:** A Task's boundary runs from the moment it is claimed to when it passes unit tests. It owns its acceptance criteria, test suite, context package, environment contract, proof of completion, verification history, and uncertainty log. Feature-level artefacts (feature spec, UI design) are read-only references within a Task — they are not owned by it. **Rationale:** Resolved by the "owner" naming convention for agents — Feature Owner owns the feature boundary, Task Owner owns the task boundary.

---

### H4 — Who curates context?

**Status:** ✅ Resolved **Decision:** Three-step chain: **Context Agent curates → QA Agent (Definition) reviews → Product Owner approves.** No agent reviews its own artefact. This pattern repeats consistently across Zones 2, 3, and 4\. **Rationale:** Independence of review is a domain invariant. The agent that produces an artefact cannot be the agent that validates it.

---

### H5 — When uncertainty mitigation is rejected, what happens to the task?

**Status:** ✅ Resolved **Decision:** Task is marked **Blocked** and assigned to an Advisor Agent with elevated context. If the Advisor Agent's mitigation is also rejected, the task transitions to `TaskReturnedToQueue` for Product Owner human review. **Rationale:** Blocked is a distinct state from Returned — it signals an unexpected mid-execution problem rather than a quality failure on review.

---

### H6 — Who or what decides the feature is complete?

**Status:** ✅ Resolved **Decision:** Feature completion is **automatic** — triggered by policy when: all tasks within the feature are `TaskMarkedAsCompleted` AND integration tests pass AND user testing passes AND feature is promoted to production. No human sign-off required for the completion event itself. Human sign-off occurs earlier at the user testing and context approval gates. **Rationale:** Feature completion meeting objective criteria should not require a human decision — that would introduce unnecessary delay and a potential bottleneck.

---

### H7 — See H2/H7 above.

---

### H8 — Who writes task-level tests?

**Status:** ✅ Resolved **Decision:** The **Test Writer Agent** writes task-level tests autonomously, translating acceptance criteria from the problem space into explicit executable outcomes in the solution space. When acceptance criteria are too ambiguous to produce at least one executable test, the Test Writer Agent raises an uncertainty back to the Task Owner Agent rather than guessing. **Key insight:** The Test Writer Agent is the domain's first ambiguity detector. The quality gate is not at test-writing — it's at acceptance criteria definition. Ambiguous AC becomes visible the moment translation is attempted.

---

### H9 — How are Task Owner Agents created?

**Status:** ✅ Resolved **Decision:** **Feature Owner Agent spawns Task Owner Agents** after feature decomposition. One Task Owner Agent per task. The system is **hierarchical at the creation boundary** — not market-based. **Rationale:** Task Owner Agents need feature context to define meaningful tasks. Spawning them from the Feature Owner Agent means they inherit that context at birth rather than having to acquire it independently. This also simplifies coordination — the Feature Owner Agent knows exactly how many Task Owner Agents exist and what each is responsible for. **Implication:** The earlier concept of a task marketplace (agents claiming tasks from a pool) is not the architecture for task creation. It may still apply to Task Performer Agents claiming published tasks — this is a different boundary.

---

### H10 — Who triggers integration tests?

**Status:** ✅ Resolved **Decision:** Integration tests run **automatically** when all tasks within a feature reach `TaskMarkedAsCompleted`. No human trigger and no agent command required — this is a system policy. **Rationale:** If the trigger were human-initiated, it would create a bottleneck and a potential skip risk. Automatic triggering on objective conditions is more reliable.

---

### H11 — One QA Agent or specialist QA Agents?

**Status:** ✅ Resolved **Decision:** **Two specialist QA Agents** — one per zone cluster:

- **QA Agent (Definition):** Zones 2–3. Reviews tests, UI context, task context. Needs feature-level read model. Higher context load.  
- **QA Agent (Execution):** Zone 4\. Reviews completed tasks, runs unit tests. Needs task-level read model only. Narrower context. **Rationale:** A single QA Agent operating across all zones would require an enormous and impractical context load. Specialist agents with narrow context loads perform more reliably — consistent with the framework's core principle that less context produces better agent performance.

---

### H12 — Task returned to queue — same agent, any agent, or human review first?

**Status:** ✅ Resolved **Decision:** A task returned to queue **always requires Product Owner human review** before it can re-enter `PUBLISHED` status. The Product Owner has three options: re-publish as-is, modify and re-publish, or close the task permanently (`TaskClosed`). **Rationale:** A returned task has a history — it has failed at least once. Automatic re-queuing without review risks the same failure repeating. Human review ensures the root cause is understood before the task is re-attempted.

---

### H13 — Where does the domain end at the CI/CD boundary?

**Status:** 🔴 Unresolved — must be resolved before Zone 5 implementation **Question:** If Staging Environment Verification fails, is that the domain's failure or the CI/CD pipeline's? Who has authority and responsibility at the boundary between `PromoteToStaging` and `StagingEnvironmentVerified`? **Why it matters:** Determines failure ownership at deployment. If the domain owns it, there must be a policy and an actor to respond. If the pipeline owns it, the domain only observes the outcome.

---

## Section 10 — Key Design Decisions Summary

For LLMs reading this document: these are the non-obvious consequential decisions made during the session. They explain design choices that would otherwise appear arbitrary.

| Decision | What it prevents | What it enables |
| :---- | :---- | :---- |
| Tasks complete at end of Zone 4 | Conflating task quality with deployment success | Clean separation of task authority from feature delivery authority |
| Feature Owner spawns Task Owner Agents | Market claiming complexity at task creation | Context inheritance at birth; simpler coordination |
| No agent reviews its own artefact | Silent self-certification failures | Independent review at every quality gate |
| Failure routes to review, never to retry | Silent retry loops hiding root causes | Every failure is visible and interrogated |
| Proof of completion \= literal command output | Confident false assertions by agents | Mechanically verifiable done criteria |
| Test Writer Agent as ambiguity detector | Ambiguous AC reaching execution and failing silently | Ambiguity surfaced at the earliest possible point |
| Human review required before task re-queue | Repeating the same failure on retry | Root cause understanding before re-attempt |
| Two specialist QA Agents | Context overload in a single QA Agent | Reliable, focused review at each zone |
| Zone 5 owned by Feature aggregate | Task status polluted by deployment state | Task aggregate remains clean and atomic |

---

## Section 11 — Documents Produced From This Session

| Document | Status | Purpose |
| :---- | :---- | :---- |
| `event-storming-domain-map.md` (this document) | ✅ Complete v1.0 | LLM-readable canonical board representation |
| `task-aggregate-spec-v0.2.md` | ✅ Complete v0.2 | Full Task aggregate specification with states, invariants, write authority |
| `event-storming-retrospective.md` | ✅ Complete | Session retrospective, improvement proposals, decisions log |
| `event-storming-session-transcript.md` | ✅ Saved | Full conversation transcript; source of truth for all decisions |
| `feature-aggregate-spec.md` | ❌ Not yet written | Next document per roadmap |
| `policy-registry.md` | ❌ Not yet written | All policies from Section 6 as a single authoritative document |
| `uncertainty-subflow-domain-map.md` | ❌ Not yet written | Dedicated Event Storming output for the uncertainty sub-system |

---

## Section 12 — Version History

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | 2026-02-21 | Initial document produced from Event Storming session |

