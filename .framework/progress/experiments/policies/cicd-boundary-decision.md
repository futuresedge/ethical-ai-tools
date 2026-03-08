# Decision: CICD Joins the Domain

By bringing CICD inside the domain boundary, the pipeline is no longer an external system that the domain *observes* — it becomes a set of domain actors with write authority, commands they issue, and events they produce. The pink sticky becomes a yellow sticky.[^7_1]

This is consistent with where AI-assisted DevOps is heading: pipelines are already largely automated, and the gap between "an agent writes code" and "an agent deploys code" is increasingly artificial.

***

## What Changes Immediately

### The External Systems Map

The event storming session identified the CICD Pipeline, Staging Environment, and Production Environment as three separate external pink stickies. Under this decision:[^7_1]


| Was | Now |
| :-- | :-- |
| CICD Pipeline — external system (pink) | CICD Agent — domain actor (yellow) |
| Staging Environment — external system (pink) | Staging Environment — infrastructure the CICD Agent governs |
| Production Environment — external system (pink) | Production Environment — infrastructure the CICD Agent governs |
| Version Control — external system (pink) | Could remain external, or become a CICD Agent responsibility |

The CICD Agent becomes a new domain actor in Zone 5 — the first actor that operates exclusively in that zone.

***

## The CICD Agent: What It Owns

Following the same template as every other agent in the framework, the CICD Agent needs a clean job statement, write authority, and a defined artefact:

**Job statement:** The CICD Agent executes and verifies all automated delivery operations — integration testing, staging promotion, staging verification, and production promotion — and reports outcomes to the Observable Stream as first-class domain events.

**Write authority by state:**


| Feature State | CICD Agent Write Authority |
| :-- | :-- |
| `ALL_TASKS_COMPLETE` | Runs integration tests → emits `IntegrationTestsPassed` or `IntegrationTestsFailed` |
| `INTEGRATION_TESTS_PASSED` | Promotes to staging → emits `PromotedToStaging` |
| `PROMOTED_TO_STAGING` | Verifies staging environment → emits `StagingEnvironmentVerified` or `StagingEnvironmentVerificationFailed` |
| `USER_TESTING_PASSED` | Promotes to production → emits `FeaturePromotedToProduction` |

**Artefact it owns:** `deployment-record.md` — an append-only log of every deployment action, environment state at the time of execution, exit codes, and test outputs. This is the Zone 5 equivalent of `proof-of-completion` in Zone 4.

***

## H13 Resolved

With CICD inside the domain, H13 has a clean answer:

> **`StagingEnvironmentVerificationFailed` is a domain failure. The CICD Agent owns it. The policy fires to the Feature Owner Agent for review, consistent with every other failure in the framework.**

The policy table for Zone 5 now completes:


| ID | Trigger | Policy | Actor |
| :-- | :-- | :-- | :-- |
| P5.01 | `AllTasksCompleted` | CICD Agent runs integration tests | CICD Agent |
| P5.02 | `IntegrationTestsPassed` | CICD Agent promotes to staging | CICD Agent |
| P5.03 | `PromotedToStaging` | CICD Agent verifies staging environment | CICD Agent |
| P5.04 | `StagingEnvironmentVerified` | Feature Owner Agent plans user testing | Feature Owner Agent |
| P5.05 | `UserTestingPassed` | CICD Agent promotes to production | CICD Agent |
| P5.06 | `FeaturePromotedToProduction` | System marks feature complete | System Policy |
| P5.07 | `IntegrationTestsFailed` | Feature Owner Agent reviews → CICD Agent retries or FO closes | Feature Owner Agent |
| **P5.08** | **`StagingEnvironmentVerificationFailed`** | **Feature Owner Agent reviews → CICD Agent retries or FO closes** | **Feature Owner Agent** |
| P5.09 | `UserTestingFailed` | Feature Owner Agent reviews → CICD Agent retries or FO closes | Feature Owner Agent |

**P5.08 is now resolved.** The failure routes to a review — consistent with every other failure in the system.[^7_1]

***

## What the CICD Agent Needs to Read

Following the read model pattern, the CICD Agent needs:

- **Before running integration tests:** Full task list with all `COMPLETED` status confirmations, integration test suite, environment contract baseline
- **Before promoting to staging:** Integration test results (passed), staging environment spec
- **Before verifying staging:** Staging deployment confirmation, staging environment contract (equivalent to Zone 4's environment contract, but at feature level)
- **Before promoting to production:** User testing results (passed), production environment spec, staging verification confirmation

***

## New Invariants for Zone 5

The domain now owns these rules mechanically:

1. The CICD Agent may not run integration tests unless every task in the Feature's task list is in `COMPLETED` or `CLOSED` status
2. The CICD Agent may not promote to staging unless integration tests have passed in the current cycle — a prior passing run does not count if tasks have changed
3. The CICD Agent's `deployment-record.md` is append-only and constitutes proof of delivery — equivalent to `proof-of-completion` at task level
4. No human trigger is required for any CICD Agent action — all fires are policy-triggered
5. The FO retains authority to halt any CICD Agent action by issuing `HaltDelivery` — an emergency stop that transitions the Feature to `DELIVERY_HALTED`

***

## What This Means for the Framework Design

Bringing CICD inside the domain has three second-order consequences worth noting before the Zone 5 Event Storming session:

**1. Zone 5 now has a first-class actor.**
Every other zone had clearly defined actors at the point of storming. Zone 5 was thin partly because its primary actor — the CICD Agent — was sitting outside the boundary. With it inside, the Zone 5 session will be materially more productive.

**2. The "idea to deployed" value proposition is now structurally complete.**
The domain boundary now runs from `IdeaCaptured` (Zone 1) to `FeaturePromotedToProduction` (Zone 5) without any external handoff. Every state transition is a domain event. Every failure routes to a domain review. The Observable Stream covers the entire lifecycle.[^7_2]

**3. The CICD Agent needs its own Zone 0 creation cycle.**
It is a new agent class, operating in a zone that was previously external, with no existing pattern in the Pattern Library. That puts it at **NV Score 2, BR Score 3 → QA Tier 3**: full 7-step creation cycle with FO approval at Step 7. This is the first real test of the Zone 0 process.

***

## What the Zone 5 Event Storming Session Now Needs to Storm

The decision to bring CICD into the domain changes the Zone 5 session agenda:

- **Orange storm:** What are all the events the CICD Agent can produce? Include failure events from the start — pipeline failures, environment drift, test flakiness, rollback events
- **Sad path emphasis (IP-01):** For every CICD Agent success event, there is at least one failure event. Both on the board from the first pass
- **New hotspots to expect:** What does the CICD Agent do when a staging promotion fails mid-flight? Does it retry autonomously or always route to review? What is the retry limit before FO escalation? What constitutes a valid staging environment verification — is it a health check, a smoke test, or a full regression?
- **Deployment record spec:** What does `deployment-record.md` need to contain to serve as genuine proof of delivery?
- **Rollback policy:** If `FeaturePromotedToProduction` is followed immediately by a critical failure, does the domain own rollback, or is that outside scope?