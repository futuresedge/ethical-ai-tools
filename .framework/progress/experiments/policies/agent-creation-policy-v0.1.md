# Agent Creation Policy
## Nexus Agentic Development Framework — Zone 0

**Version:** 0.1
**Status:** Draft
**Applies to:** All new agent classes and agent template revisions in Nexus

***

## How to Read This Document

This policy governs how new agent classes are created in Nexus. It covers who makes each decision, what checks are required, and when a human needs to be involved.

The document is structured in four parts:
1. **Glossary** — what every term means
2. **Responsibility Tree** — who does what
3. **The Creation Flow** — the step-by-step process
4. **The Oversight Rule** — how much QA is needed for different types of work

***

## Part 1: Glossary

**Agent**
A software process that performs a defined job autonomously. An agent has a fixed set of files it reads, exactly one artefact it writes, and a list of files it is explicitly forbidden from touching. Agents do not improvise their scope — they operate within declared boundaries.

**Agent Class**
A category of agent defined by its job, zone, and artefact. "Task Performer Agent" is an agent class. There can be many instances of a class running simultaneously, but they all follow the same template.

**Agent Template**
The reusable specification file for an agent class. It defines the agent's job, what it reads, what it writes, what it is forbidden from reading, and which skills it loads. Every agent that Nexus creates is an instance of a template.

**Base Agent Template**
The minimum valid structure that every agent template must conform to. It enforces the framework's design rules structurally — not as advice, but as required fields. No agent template is valid unless it satisfies the base template.

**Framework Owner (FO)**
The human responsible for the overall health and evolution of the framework. FO makes high-level decisions, approves new agent classes when the NV Score is 2 or above, and handles escalations from the FOA. FO does not review or approve every new agent class — that is the FOA's job — but FO sets the standards and makes the final call on high-novelty work.

**Framework Owner Agent (FOA)**
The agent responsible for the health and completeness of the agent roster. It identifies when a new agent class is needed, commissions the tests and template, reviews the output, and either approves it or escalates to FO. It does not build agents itself — it delegates and oversees.

**Agent Template Creator**
The agent that writes agent templates. It receives a requirements document and a test suite, and produces a conformant agent template file. It does not decide what the agent should do — that is specified by the FOA in the requirements document.

**Agent Spec QA**
The specialist agent that (a) writes the acceptance tests for a proposed agent template, and (b) later runs those same tests against the finished template. It is the independent reviewer in the creation flow — the Agent Template Creator cannot review its own output.

**Agent Class Requirements Document**
The document the FOA writes before any template is built. It specifies the agent's job (one sentence), its zone, its candidate READS/WRITES/NEVER files, and its NV Score. This document is the contract that the Agent Template Creator works from and that Agent Spec QA tests against.

**Zone**
A stage in the delivery pipeline. The five delivery zones are Idea (1), Feature Definition (2), Task Preparation (3), Task Execution (4), and Feature Delivery (5). Zone 0 is the framework evolution zone — it operates on the framework itself, not on features.

**Write Authority**
The exclusive right to change a named artefact. Only one agent holds write authority over an artefact at any point in time. No agent may modify an artefact it does not have write authority for. No agent may review its own artefact.

**Artefact**
A file produced by an agent. Each agent produces exactly one artefact per invocation — written to a declared path. Artefacts are the unit of handoff between agents.

**Acceptance Criteria (AC)**
Human-readable statements that describe what success looks like. Written in plain language. Each criterion must be independently verifiable — a test can be derived from it — and unambiguous.

**Spec Test**
An executable check derived from acceptance criteria. Spec tests are what Agent Spec QA runs against a finished template to determine pass or fail. They test whether the template satisfies its requirements, not whether the code works.

**Proof of Completion**
Literal captured output proving work is done. For agent template creation, this means the actual test results from running the spec test suite against the template — not a claim that tests passed.

**NV Score (Novelty Score)**
A number from 0 to 3 that measures how much prior evidence exists for a proposed agent class. 0 means it has been done before with documented results. 3 means it is genuinely new territory with no prior precedent. The NV Score determines whether the FOA can approve independently or must escalate to FO.

**Pattern Library**
The repository of documented agent class designs that have been approved and deployed. When the FOA assesses a new agent class, it checks the pattern library first. A pattern library entry with NV = 0 means the FOA can approve the new class without FO's review.

**Observable Stream**
The append-only event log that every agent action writes to. Every state change in Nexus emits a domain event to this stream. It is the shared source of truth — not any individual agent's memory.

**Invariant**
A rule that must always be true. Invariants are enforced mechanically. If a command would violate an invariant, the system rejects it.

***

## Part 2: Responsibility Tree

```
FO (Product Owner)
│
│  Approves new agent classes when NV ≥ 2
│  Approves changes to the Base Agent Template
│  Bootstraps the FOA and Agent Spec QA (one-time, manual)
│
└── Framework Owner Agent (FOA)
    │
    │  Identifies gaps in the agent roster
    │  Writes Agent Class Requirements documents
    │  Decides NV Score and QA Tier
    │  Reviews spec tests before template work begins
    │  Reviews finished templates before approval
    │  Adds learnings to the Pattern Library
    │  Approves new agent classes when NV ≤ 1
    │
    ├── Agent Spec QA
    │   │
    │   │  Writes spec tests and acceptance criteria
    │   │  Reviews spec tests (FOA approves, not Agent Spec QA)
    │   │  Runs spec tests against finished templates
    │   │  Issues PASS or FAIL with literal test output
    │   │  Does NOT write agent templates
    │   │  Does NOT review its own spec tests
    │
    └── Agent Template Creator
        │
        │  Writes agent templates from requirements + spec tests
        │  Revises templates when tests fail
        │  Does NOT write spec tests
        │  Does NOT approve its own templates
        │  Does NOT define what the agent is responsible for
```

**Invariants on this tree:**
- Agent Spec QA may not review its own spec tests — the FOA does that
- Agent Template Creator may not review its own templates — Agent Spec QA does that
- No agent in Zone 0 approves its own artefact
- The FOA cannot approve a class with NV ≥ 2 — FO must approve
- FO cannot be replaced in the approval role for NV ≥ 2 by any agent

***

## Part 3: The Creation Flow

### How a new agent class comes to exist

A new agent class begins with a **gap signal** — evidence that the current agent roster cannot handle a task type that has appeared in the system. Gap signals come from three sources:

1. An `UnknownTaskTypeEncountered` event in the Observable Stream
2. A retrospective finding that a task type was handled poorly because no specialist agent exists for it
3. A direct directive from FO

The FOA is the only agent that acts on gap signals.

***

### The seven steps

**Step 1 — FOA identifies the gap**

The FOA reads the gap signal and checks the Pattern Library and current agent roster. If a suitable agent class already exists, or a Zone 0 cycle for this gap is already in progress, the signal is absorbed — no new cycle starts. If no match exists, the FOA proceeds to Step 2.

***

**Step 2 — FOA writes the Agent Class Requirements document**

The FOA writes `agent-class-requirements.md` before any other work begins. This document must contain:

- **Job statement** — one sentence describing what this agent is hired to do
- **Zone** — which delivery zone(s) this agent operates in
- **Candidate READS** — files this agent will likely need to read (named paths, not categories)
- **Candidate WRITES** — the single artefact this agent will produce
- **Candidate NEVER** — files this agent must never access
- **NV Score** — 0, 1, 2, or 3 (see Part 4 for scoring rules)
- **QA Tier** — 0 through 4 (determined by the NV Score and Blast Radius Score)

> **If NV ≥ 2, the FOA shares the requirements document with FO before proceeding.** FO may reshape the requirements, approve them, or halt the cycle. Spending tokens on a test cycle for something FO will reshape is waste. The escalation happens here — not after the template is built.

***

**Step 3 — FOA commissions spec tests**

The FOA hands the requirements document to Agent Spec QA with the instruction: *"Write the spec tests and acceptance criteria for a template that satisfies these requirements."*

Agent Spec QA produces:
- `spec-tests.md` — the executable checks that the finished template must pass
- `acceptance-criteria.md` — the human-readable criteria the spec tests derive from

Agent Spec QA does not decide whether the requirements are correct. It translates them faithfully into tests. If the requirements are ambiguous, Agent Spec QA raises that as an uncertainty to the FOA before writing tests.

***

**Step 4 — FOA reviews the spec tests**

The FOA reviews the spec tests before any template work begins. The FOA checks:

- Do the tests cover every item in the requirements document?
- Are each test's pass/fail conditions unambiguous?
- Is the test for the base template conformance present?
- Is there a test for NEVER list non-emptiness?

If the spec tests are incomplete or unclear, the FOA returns them to Agent Spec QA with specific feedback. This loop continues until the FOA accepts the spec tests. **The spec test loop closes before the template loop opens.**

***

**Step 5 — FOA commissions the agent template**

The FOA hands the requirements document and the accepted spec tests to Agent Template Creator with the instruction: *"Write an agent template that satisfies these requirements and passes these tests."*

Agent Template Creator produces `agent-template-[class-name].agent.md` conforming to the Base Agent Template structure (see below).

***

**Step 6 — Agent Spec QA runs the tests**

Agent Spec QA runs `spec-tests.md` against the finished template. It produces a `test-results.md` file containing:

- The result of each test (PASS or FAIL)
- Literal evidence for each result — not assertions
- A summary verdict: PASS ALL or FAIL with failed test list

If any test fails, the FOA returns the template to Agent Template Creator with the test results attached. Agent Template Creator revises and resubmits. **The revision loop continues until all tests pass.**

***

**Step 7 — FOA reviews and approves**

Once all tests pass, the FOA reviews the template for:

- Context tree consistency — does this agent's READS/WRITES/NEVER map correctly onto the context tree?
- Clean boundary — does this agent's job overlap with any existing agent's write authority?
- Learnings — is there anything from this cycle worth recording in the Pattern Library?

The FOA then either:

- **Approves** (NV ≤ 1) — adds the template to the agent roster and records a Pattern Library entry
- **Escalates to FO** (NV ≥ 2) — sends FO the template and test results for final approval before activation

Once approved, the template is active. The `AgentClassCreated` event is emitted to the Observable Stream.

***

## Part 4: The Oversight Rule

Not every agent creation cycle needs the same level of scrutiny. The required QA depth is determined by two scores.

***

### Score 1 — Blast Radius (BR)

How many future operations will this agent's template govern?

| Score | Meaning |
|---|---|
| 0 | Affects only one-off artefacts; no repeated use |
| 1 | Used repeatedly within a single feature |
| 2 | Used repeatedly across multiple features |
| 3 | Governs all tasks of a given type across the system |
| 4 | Changes how the framework itself operates |

***

### Score 2 — Novelty (NV)

How much prior evidence exists for this agent class?

| Score | Meaning |
|---|---|
| 0 | Exact pattern exists in the Pattern Library with documented results |
| 1 | Variant of a known pattern; some inference required |
| 2 | New agent class in an existing zone; no direct precedent |
| 3 | New zone, new framework primitive, or untested territory |

***

### QA Tier Assignment

```
IF NV = 3 OR BR = 4          → Tier 4: FO approves. Escalate at Step 2, before spec tests.
IF NV = 2 OR BR = 3          → Tier 3: Full cycle (Steps 1–7) + FO approves at Step 7.
IF NV = 1 OR BR ≥ 2          → Tier 2: Full cycle (Steps 1–7). FOA approves at Step 7.
IF NV = 0 AND BR ≤ 1         → Tier 1: Abbreviated cycle. Spec tests still required. FOA approves.
```

| Tier | Name | What changes |
|---|---|---|
| **1** | Routine | Spec tests are still required. Revision loop still applies. FOA approves. No FO involvement. |
| **2** | Elevated | Full 7-step cycle. FOA approves at Step 7. No FO involvement unless the FOA judges it warranted. |
| **3** | High | Full cycle + FO approves the finished template at Step 7. FO sees: requirements, test results, final template. |
| **4** | Critical | FO is consulted at Step 2 before spec tests are written. FO approves at Step 7. Two FO touch points. |

***

### What tier does a new agent class usually get?

| Scenario | BR | NV | Tier |
|---|---|---|---|
| Revision to existing template (fixing an error) | 3 | 0 | 2 |
| New executor agent following an established pattern | 3 | 0 | 2 |
| New specialist QA agent for a new artefact type | 3 | 1 | 3 |
| New agent class in an existing zone, no precedent | 3 | 2 | 3 |
| New zone or new framework primitive | 4 | 3 | 4 |
| The Base Agent Template itself | 4 | — | 4 (always) |

***

## Part 5: The Base Agent Template

Every agent template produced by this flow must conform to the following structure. Fields marked REQUIRED must be present and non-empty for the spec tests to pass.

```
---
name: [AgentClassName]                       # REQUIRED
description: "[One-sentence job statement]"  # REQUIRED — what is this agent hired to do?
tools: ['tool-a', 'tool-b']                  # REQUIRED
model: ['primary-model', 'fallback-model']   # REQUIRED
---

ZONE: [zone-number zone-name]                # REQUIRED
TYPE: [ORCHESTRATOR|EXECUTOR|COMPRESSION|BATCH]  # REQUIRED
QA_TIER: [0-4]                               # REQUIRED

READS:
  - [.path/to/named/file.md]                 # REQUIRED — named files only, not categories

WRITES:
  - [.path/to/output/file.md]                # REQUIRED — exactly one artefact

NEVER:
  - [.path/to/forbidden/file.md]             # REQUIRED — at least one entry

SKILL: [skill-name]                          # REQUIRED if agent has substantive logic
CONTEXT_TREE_REF: [context-tree.md#node]     # REQUIRED — where this agent sits in the tree
```

**Rules enforced by spec tests on every template:**

- READS contains named file paths — not descriptions, categories, or wildcards
- WRITES contains exactly one path — not a directory, not a pattern
- NEVER list is non-empty
- File is under 60 lines
- SKILL pointer references a file that exists at the declared path
- CONTEXT_TREE_REF is present and matches an entry in `context-tree.md`
- QA_TIER is present and set to a value between 0 and 4
- Description is a single sentence — no multi-line prose

***

## Part 6: Bootstrapping Exception

The FOA and Agent Spec QA cannot be created by the Zone 0 process because Zone 0 does not yet exist when they are first deployed. FO creates these two agents manually during initial framework setup.

This is the **bootstrapping exception** — it applies to exactly two agents, once, at framework initialisation. All subsequent agent classes, including revisions to the FOA or Agent Spec QA, go through the Zone 0 process.

The bootstrapping exception is recorded in the framework manifest as a named decision — not a workaround.

***

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2026-03-03 | Initial draft. Defines Zone 0 flow, glossary, responsibility tree, oversight tiers, and base template. |