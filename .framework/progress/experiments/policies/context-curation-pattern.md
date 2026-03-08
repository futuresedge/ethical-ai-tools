# The Context Curation Pattern

Every significant work start is preceded by a three-step chain: **curate → review → approve**. No work begins with unreviewed or unapproved context. This is not a guideline — it is a structural invariant enforced by the agent template's READS constraint: no agent may begin work without a `context-package.md` in `APPROVED` status in its READS list 

***

## Context Curation Policy Across All Zones

### Zone 2 — UI Design Context

| Step | Event | Command | Actor |
|---|---|---|---|
| Curate | `FeatureAccepted` | `CurateUIContext` | Context Agent |
| Review | `UIDesignContextCurated` | `ReviewUIContext` | QA Agent Definition |
| Approve | `UIDesignContextReviewed` | `AcceptUIContext` | QA Agent Definition |
| Work begins | `UIDesignContextAccepted` | `DesignUI` | UI Design Agent |

**What the context package contains:**
- Feature spec
- Feature-level AC
- Brand guidelines (full, not summarised)
- Design system / component library reference
- Success criteria from the parent idea

**Curation invariant:** The Context Agent must not summarise or compress any source artefact when producing the UI context package. Compression is lossy — a downstream agent working from a summary of brand guidelines will miss specifics that matter at design time.

***

### Zone 3 — Task Context

| Step | Event | Command | Actor |
|---|---|---|---|
| Curate | `TestsAccepted` | `CurateContext` | Context Agent |
| Review | `ContextCurated` | `ReviewContext` | QA Agent Definition |
| Approve | `ContextReviewed` | `ApproveContext` | FO (human gate) |
| Work begins | `ContextApproved` | `PublishTask` | FO |

**What the context package contains:**
- Task spec
- Task-level AC
- Accepted test suite (with expected outputs)
- UI artefact reference (read-only, from Zone 2)
- Feature-level AC (read-only reference — for intent checking only)
- Environment contract template

**Zone 3 note:** The FO approval gate here is the last human checkpoint before a task enters the execution queue  . This is intentional — task publication is an irreversible commitment to execution, and irreversible decisions require human authority. The QA Agent Definition reviews for completeness and consistency; the FO approves the decision to commit.

***

### Zone 4 — Execution Context (at claim time)

Zone 4 does not have a separate curation step — the context package was curated and approved in Zone 3. What Zone 4 adds is an **environment contract** captured at claim time, which is appended to the already-approved context. This is not curation — it is a snapshot  
| Step | Event | Command | Actor |
|---|---|---|---|
| Snapshot | `TaskClaimed` | `VerifyEnvironment` / `environmentsnapshot` | Task Performer Agent |
| Conflict check | Pre-flight | `preflight_check` | Task Performer Agent (via MCP) |
| Work begins | `EnvironmentVerified` + pre-flight `CLEAR` | `PerformTask` | Task Performer Agent |

**Zone 4 curation invariant:** The Task Performer Agent must not supplement its context package with any files outside its declared READS list, even if those files are reachable. Additional context not in the approved package must be requested through the uncertainty protocol, not sourced independently.

***

### Zone 5 — Feature Delivery Context

This is the unconfirmed Zone 5 pattern — the retrospective flagged it as "the cross-cutting pattern predicts yes" but it was never formally resolved  With the CICD Agent now inside the domain and the Feature Owner Agent owning user testing, the pattern resolves predictably:

| Step | Event | Command | Actor |
|---|---|---|---|
| Curate | `StagingEnvironmentVerified` | `CurateDeliveryContext` | Context Agent |
| Review | `DeliveryContextCurated` | `ReviewDeliveryContext` | Feature Owner Agent |
| Approve | `DeliveryContextReviewed` | `ApproveDeliveryContext` | FO (human gate) |
| Work begins | `DeliveryContextApproved` | `PlanUserTesting` | Feature Owner Agent |

**What the delivery context package contains:**
- Feature-level AC and success metrics
- Integration test results summary
- Staging environment verification record
- User testing plan template
- Prior user testing history (if feature was previously tested and failed)

**Zone 5 note:** The FO approval gate before user testing mirrors the Zone 3 gate before task publication — both are points of irreversible commitment, and both are human decisions  
***

### Zone 0 — Agent Creation Context

Consistent with the pattern everywhere else:

| Step | Event | Command | Actor |
|---|---|---|---|
| Curate | `GapConfirmed` | `CurateAgentRequirements` | Framework Owner Agent |
| Review | `RequirementsDocumentDrafted` | `ReviewRequirements` | Agent Spec QA |
| Approve (NV ≤ 1) | `RequirementsReviewed` | `ApproveRequirements` | Framework Owner Agent |
| Approve (NV ≥ 2) | `RequirementsReviewed` | `ApproveRequirements` | FO (human gate) |
| Work begins | `RequirementsApproved` | `CommissionSpecTests` | Framework Owner Agent |

***

## The Formal Cross-Cutting Policy

Formalising what was previously only a named pattern:

```
POLICY: ContextCurationBeforeWork (Cross-cutting, all zones)

Whenever a new agent is about to begin significant work in any zone:
  1. A context package specific to that work MUST be curated
     by the Context Agent (or zone-equivalent curator)
  2. The context package MUST be reviewed by the zone's quality gate agent
  3. The context package MUST be approved by the zone's approval authority
     before the working agent may claim or begin their task
  4. No working agent may supplement an approved context package
     with artefacts outside its declared READS list
  5. If curation, review, or approval produces a conflict or rejection,
     the uncertainty protocol fires before work is attempted
```

***

## The Context Agent Spec Sketch

The Context Agent is a Zone 3 curator — but following the curation pattern, it operates in every zone with a zone-specific variant. Here is the Zone 3 spec:

```yaml
---
name: ContextAgent
description: "Curates the minimum necessary approved context package for a task before it is published to the execution queue."
tools:
  - preflight_check
  - agentraiseuncertainty
  - feedlive
  - contextcardgenerate           # assembles the context card
  - patternsearch                 # checks pattern library for similar task types
model: [gpt-5.1, gpt-4.1-mini]
---

ZONE: 3 Task Preparation
TYPE: EXECUTOR
QA_TIER: 2
CERTAINTY_THRESHOLD: 0.85

READS:
  - .framework/features/<feature>/tasks/<task>/task-spec.md
  - .framework/features/<feature>/tasks/<task>/task-ac.md
  - .framework/features/<feature>/tasks/<task>/task-tests.md
  - .framework/features/<feature>/ui-artefact.md
  - .framework/features/<feature>/feature-ac.md          # read-only, intent only
  - AGENTS.md                                            # stack constraints

WRITES:
  - .framework/features/<feature>/tasks/<task>/context-package.md

NEVER:
  - proof-of-completion.md
  - review-result.md
  - sibling task context-package.md
  - feature-spec.md content (reference slug only)
```

**Lifecycle:**

```text
1. On TestsAccepted → CurateContext
   - Call preflight_check
   - If BLOCKED or certainty < threshold → agentraiseuncertainty, STOP

2. Call patternsearch against pattern library:
   - Has a context package for this task type been curated before?
   - If yes: load pattern as starting structure, verify still current
   - If no: curate from scratch using contextcardgenerate

3. Apply Minimum Necessary Rule:
   - Include only what the Task Performer needs to do THIS task
   - Do not include feature-level context beyond what is required
     for intent checking — task performers do not need the full
     feature spec, only their task's AC and approved tests

4. Apply Context Conflict Rule:
   - If any two READS files contradict each other:
     DO NOT average, DO NOT choose one silently
     Log conflict to uncertainty-log.md
     Call agentraiseuncertainty, STOP

5. Write context-package.md
   - Emit ContextCurated event via feedlive

6. Yield to QA Agent Definition for review (no self-review)
```

***

## Key Invariants for Context Curation

These should be added to the Policy Registry as formal invariants:

1. **No agent begins significant work without an APPROVED context package.** A missing or `DRAFT` context package is a failure condition, not a warning — it must block the pre-flight check.
2. **The curator never reviews their own package.** The agent that curates the context is never the agent that approves it.
3. **Compression is prohibited.** Source artefacts may be selected and filtered, but not paraphrased or summarised within the package. Lossy compression of guidelines or constraints is an error class of its own.
4. **The context conflict rule is mandatory.** If any two artefacts in the package contradict each other, the curator stops and raises uncertainty. Proceeding with a known conflict is a framework invariant violation.
5. **Context packages are versioned.** If a source artefact changes after a context package is approved (e.g., AC is revised after context was approved for a task), the package must be invalidated and re-curated. A stale package is treated the same as a missing package.