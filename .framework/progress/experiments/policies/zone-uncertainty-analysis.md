# Zone-by-Zone Uncertainty Analysis

This is the most practically useful input for the Uncertainty Sub-flow session. Here is the full analysis by zone, derived directly from the read models, actors, and failure patterns in the framework. 

***

## Zone 0 — Framework Evolution

The Zone 0 Advisor Agent handles uncertainties raised by the Framework Owner Agent during agent class creation.

**Most common uncertainty types:**
- A proposed agent class appears to overlap with an existing agent's write authority — unclear who owns the boundary
- NV Score cannot be confidently assigned — the proposed class is partially novel but has some precedent
- The NEVER list cannot be fully specified because the agent's scope is not yet well-defined enough
- A proposed agent class requires a skill that does not yet exist in the skill inventory

**Context snapshot must contain:**
- Agent Class Requirements document (the draft being worked on)
- Current agent roster (all existing agent class names, zones, and WRITES paths)
- Pattern Library (all prior approved agent classes with their NV scores)
- Base Agent Template structure
- Context tree — the READS/WRITES/NEVER map for the whole system

***

## Zone 1 — Idea Capture

Zone 1 is human-operated, but the Feature Owner Agent acts on the `IdeaAccepted` event. Uncertainties here arise at the threshold between idea and feature. 

**Most common uncertainty types:**
- The accepted idea contains contradictory success criteria — cannot write a coherent feature spec
- The idea's scope is ambiguous — unclear whether it represents one feature or several
- Success criteria are outcome-stated but the domain model has no equivalent concept — e.g., "users should feel confident" has no testable feature-level translation
- The idea references a dependency (another feature, an external system) that has no current domain representation

**Context snapshot must contain:**
- The accepted idea document
- Success criteria as written by the FO
- The current feature backlog (to check for overlap or dependency)
- Any prior ideas in `ICED` or `REJECTED` status that appear related — history of similar ideas informs scope

**Note:** Zone 1 uncertainties are reviewed by the FO directly — the stakes of building the wrong thing are too high for an agent review gate here. 

***

## Zone 2 — Feature Definition

Zone 2 has the richest uncertainty surface because it runs two parallel tracks simultaneously — AC definition and UI design — and both must complete before anything downstream can proceed. 

**Most common uncertainty types — AC track:**
- An acceptance criterion cannot be written in unambiguous GivenWhenThen format — the intended behaviour has multiple valid interpretations
- Two acceptance criteria within the same feature contradict each other
- An acceptance criterion requires a technical implementation decision to be made before the problem-space statement can be written — the feature spec is leaking into solution space
- Success criteria from the idea cannot be translated into verifiable feature-level AC — too qualitative

**Most common uncertainty types — UI design track:**
- Brand guidelines conflict with an accepted acceptance criterion — e.g., brand requires a single-column layout but AC requires two interactive panels visible simultaneously
- The curated UI context is incomplete — missing component library references, or references a design token that does not exist
- The feature spec is ambiguous about the interaction model — cannot design UI without knowing whether the interaction is inline, modal, or page-level
- An accepted UI design component does not exist in the design system — should it be built, substituted, or does the AC need to change?

**Context snapshot must contain:**
- Feature spec (current draft)
- Feature-level acceptance criteria (current state)
- Brand guidelines (full, not summarised — design decisions require specificity)
- Design system / component library reference
- Success criteria from the parent idea (for intent checking)
- QA Agent Definition's review notes if the uncertainty arose after a review rejection

**Reviewer:** QA Agent Definition — already the Zone 2 quality gate for both AC and UI. 

***

## Zone 3 — Task Preparation

Zone 3 is the highest-complexity zone in the system, with more handoffs than any other. Uncertainties here tend to surface at the translation boundaries — AC to tests, and combined artefacts to context package. 

**Most common uncertainty types — Test Owner Agent:**
- An acceptance criterion cannot produce at least one executable test — this is the formally named ambiguity detection trigger (Invariant 9) 
- Two acceptance criteria produce tests that contradict each other — passing one would fail the other
- The expected system behaviour is clear but the environment required to verify it is not specified — cannot write a test without knowing the environment contract
- A test requires a third-party service or data state that is not described in the feature spec

**Most common uncertainty types — Context Agent:**
- Two accepted artefacts (e.g., feature spec and UI artefact) contain conflicting information about the same behaviour — the context conflict rule fires, agent stops 
- The context package would exceed the declared budget for the task type — compression is not possible without losing information that appears essential
- A task spec references a shared resource (database schema, API contract) that is not in any of the declared READS files
- The UI artefact references a component or state that is not mentioned in the task spec or AC — unclear whether to include it

**Most common uncertainty types — Task Owner Agent:**
- Feature decomposition produces a task that cannot be made independent — it has a hard dependency on the output of a sibling task that may not be complete first
- A task's required skills cannot be declared because the task involves a capability not represented in the known skill inventory
- The task scope, after decomposition, is too large to be atomic — splitting it further would violate the feature's acceptance criteria granularity

**Context snapshot must contain:**
- Task spec (what the Task Owner Agent defined)
- Task-level AC (current state)
- Feature spec (read-only reference — not editable, but needed for intent checking)
- UI artefact reference (for context conflict detection)
- Environment contract template — what fields are expected
- Skill inventory — to check whether required skills exist

**Reviewer:** QA Agent Definition — same agent as Zone 2, different artefact type. 

***

## Zone 4 — Task Execution

Zone 4 had the most developed uncertainty model before this redesign, since the original sub-flow lived here. The failure modes are the most concrete and technical. 

**Most common uncertainty types — Task Performer Agent:**
- Environment verification fails — the environment state does not match the environment contract captured at claim time
- A tool required by the task is unavailable, returns unexpected output, or behaves differently than the task spec assumed
- The context package is internally consistent but insufficient — a decision is required that the context package does not resolve
- The proof of completion format is ambiguous — the task spec describes what to do but not what output format constitutes literal proof
- Two items in the context package contradict each other — the conflict rule fires 
- A dependency output from a prior task (referenced in context) is stale or has changed since the context was curated

**Most common uncertainty types — mid-execution (not environment):**
- An implementation path that satisfies one acceptance criterion would violate another
- The task encounters an edge case not covered by any acceptance criterion or test — the agent cannot proceed without a decision about whether to handle it or raise it
- A required API, schema, or service endpoint has changed since the context package was assembled

**Context snapshot must contain:**
- Context package (the curated, approved package — this is the Task Performer's only authorised read source) 
- Environment contract (the snapshot taken at claim time)
- Uncertainty log for this task (all prior uncertainties, including resolved ones — this travels with the task)
- Tool output / error log (the literal captured output that triggered the uncertainty)

**Note:** The Zone 4 Advisor Agent has the highest token budget of any Advisor Agent — the context package alone can be substantial, and the tool output / error log may be verbose. This was flagged in the context tree as justified by the uncertainty resolution scope. 

**Reviewer:** QA Agent Execution — already the Zone 4 quality gate. 

***

## Zone 5 — Feature Delivery

Zone 5 uncertainties are the newest category, following the decision to bring CICD into the domain. The failure modes here are infrastructure and integration-level rather than specification-level.

**Most common uncertainty types — CICD Agent:**
- Integration tests produce non-deterministic results — same code, different pass/fail on repeated runs
- Staging environment verification fails in a way that cannot be attributed to the deployed code — environment configuration issue vs. application issue is unclear
- An integration test fails but the failure appears to be in a test fixture or test data, not the application code
- Staging promotion succeeds but a post-promotion health check returns an unexpected state that was not covered by the staging environment spec
- A production promotion is blocked by an external dependency (upstream service, certificate, DNS) that is outside the deployed code

**Most common uncertainty types — Feature Owner Agent (Zone 5):**
- User testing results are mixed — some criteria clearly pass, others clearly fail, but a subset is genuinely ambiguous about intent
- User testing uncovers a behaviour that is technically within AC but produces a clearly undesirable outcome — the AC was correct but incomplete
- Integration test failure details are insufficient to determine whether the fix belongs in a task revision or a feature spec revision

**Context snapshot must contain:**
- Deployment record (the CICD Agent's append-only artefact — all deployment actions, environment states, exit codes)
- Integration test results (full output, not summary — non-determinism diagnosis requires the raw logs)
- Staging environment spec (what the environment was expected to look like)
- Feature-level AC and success metrics (for intent checking against user testing results)
- Prior uncertainty log at feature level (if any uncertainties were raised in Zone 2 or Zone 3 that remain relevant to delivery)

**Reviewer:** Feature Owner Agent — Zone 5 review authority. For escalation, the FO resolves. 

***

## The Pattern Across All Zones

Two uncertainty types appear in almost every zone, just in different forms: 

- **Conflict between two accepted artefacts** — something upstream was accepted independently, but when combined with another accepted artefact, they contradict each other. This is the context conflict rule. Every Advisor Agent's context snapshot must always include both conflicting artefacts, not just one.
- **Ambiguity that was not detectable at definition time** — the artefact passed its quality gate correctly, but a downstream translation (AC → test, spec → context, code → deployment) reveals an ambiguity that was invisible at the earlier stage. These are the most expensive uncertainties because they require tracing back through the zone boundary to fix the root artefact.

Both of these reinforce why the context snapshot cannot be a summary — it must be the literal artefacts involved, so the Advisor Agent can make a specific, verifiable determination rather than a general recommendation.