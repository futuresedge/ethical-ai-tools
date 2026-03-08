# Agent Creation Policy
## Nexus Agentic Development Framework — Zone 0

**Version:** 0.2
**Status:** Draft
**Applies to:** All new agent classes and agent template revisions in Nexus

***

## How to Read This Document

This policy governs how new agent classes are created in Nexus. It covers who makes
each decision, what checks are required, and when a human needs to be involved.

The document is structured in six parts:
1. **Glossary** — what every term means
2. **Responsibility Tree** — who does what
3. **The Creation Flow** — the step-by-step process
4. **The Oversight Rule** — how much QA is needed for different types of work
5. **The Base Agent Template** — the minimum valid structure every template must conform to
6. **Bootstrapping Exception** — the one-time manual setup and why it satisfies this policy

***

## Part 1: Glossary

**Agent**
A software process that performs a defined job autonomously. An agent has a fixed set
of files it reads, exactly one artefact it writes, and a list of files it is explicitly
forbidden from touching. Agents do not improvise their scope — they operate within
declared boundaries.

**Agent Class**
A category of agent defined by its job, zone, and artefact. "Task Performer Agent" is
an agent class. There can be many instances of a class running simultaneously, but they
all follow the same template.

**Agent Template**
The reusable specification file for an agent class. It defines the agent's job, what it
reads, what it writes, what it is forbidden from reading, and which skills it loads.
Every agent that Nexus creates is an instance of a template.

**Base Agent Template**
The minimum valid structure that every agent template must conform to. It enforces the
framework's design rules structurally — not as advice, but as required fields. No agent
template is valid unless it satisfies the base template.

**Performer Agent**
Any agent of `TYPE: EXECUTOR` or `TYPE: ORCHESTRATOR` that produces a primary artefact.
A Performer Agent requires a designated Reviewer Agent before it can be activated. A
Performer Agent template with no named reviewer fails its spec tests.

**Reviewer Agent**
An agent whose sole write authority is a review or QA artefact for a specific Performer
Agent's output. A Reviewer Agent is the paired counterpart of exactly one Performer Agent
class, unless it is explicitly designated as a shared zone-level reviewer with FO approval.
A Reviewer Agent reads the Performer Agent's WRITES path — this linkage is tested.

**Agent Pair**
The atomic unit of Zone 0 output: one Performer Agent template and one Reviewer Agent
template, approved in the same Zone 0 cycle. Neither template is activatable without the
other. An Agent Pair is recorded as a single Pattern Library entry with both classes named.

**Shared Reviewer**
A Reviewer Agent that serves more than one Performer Agent class within the same zone.
A Shared Reviewer must be explicitly approved by FO and documented in the Pattern Library.
It does not exempt the Zone 0 cycle from producing paired requirements documents — it
means one side of the pair already exists and is named.

**Framework Owner (FO)**
The human responsible for the overall health and evolution of the framework. FO makes
high-level decisions, approves new agent classes when the NV Score is 2 or above, and
handles escalations from the FOA. FO does not review or approve every new agent class —
that is the FOA's job — but FO sets the standards and makes the final call on high-novelty
work.

**Framework Owner Agent (FOA)**
The agent responsible for the health and completeness of the agent roster. It identifies
when a new agent class is needed, commissions the tests and templates, reviews the output,
and either approves it or escalates to FO. It does not build agents itself — it delegates
and oversees.

**Agent Template Creator**
The agent that writes agent templates. It receives a requirements document and a test
suite, and produces a conformant agent template file. It does not decide what the agent
should do — that is specified by the FOA in the requirements document.

**Agent Spec QA**
The specialist agent that (a) writes the acceptance tests for a proposed agent template,
and (b) later runs those same tests against the finished template. It is the independent
reviewer in the creation flow — the Agent Template Creator cannot review its own output.
When a pair is being created, Agent Spec QA writes and runs tests for both templates, and
additionally runs the cross-reference test confirming the Reviewer reads the Performer's
WRITES path.

**Agent Class Requirements Document**
The document the FOA writes before any template is built. It specifies the agent's job
(one sentence), its zone, its candidate READS/WRITES/NEVER files, and its NV Score. When
the requirements document describes a Performer Agent, it must also name the paired
Reviewer Agent class — either an existing approved class, or a new class whose requirements
document is written in the same step. This document is the contract the Agent Template
Creator works from and that Agent Spec QA tests against.

**Zone**
A stage in the delivery pipeline. The five delivery zones are Idea (1), Feature Definition
(2), Task Preparation (3), Task Execution (4), and Feature Delivery (5). Zone 0 is the
framework evolution zone — it operates on the framework itself, not on features.

**Write Authority**
The exclusive right to change a named artefact. Only one agent holds write authority over
an artefact at any point in time. No agent may modify an artefact it does not have write
authority for. No agent may review its own artefact.

**Artefact**
A file produced by an agent. Each agent produces exactly one artefact per invocation —
written to a declared path. Artefacts are the unit of handoff between agents.

**Acceptance Criteria (AC)**
Human-readable statements that describe what success looks like. Written in plain language.
Each criterion must be independently verifiable — a test can be derived from it — and
unambiguous.

**Spec Test**
An executable check derived from acceptance criteria. Spec tests are what Agent Spec QA
runs against a finished template to determine pass or fail. They test whether the template
satisfies its requirements, not whether the code works.

**Cross-Reference Test**
A mandatory spec test that applies whenever an Agent Pair is created. It verifies that the
Reviewer Agent's READS list contains the exact file path declared in the Performer Agent's
WRITES field. A pair cannot achieve PASS ALL without this test passing.

**Proof of Completion**
Literal captured output proving work is done. For agent template creation, this means the
actual test results from running the spec test suite against the template — not a claim that
tests passed.

**NV Score (Novelty Score)**
A number from 0 to 3 that measures how much prior evidence exists for a proposed agent
class. 0 means it has been done before with documented results. 3 means it is genuinely
new territory with no prior precedent. The NV Score determines whether the FOA can approve
independently or must escalate to FO. When scoring an Agent Pair, both classes are scored
independently and the higher score governs the QA Tier for the whole cycle.

**Blast Radius (BR)**
A number from 0 to 4 that measures how many future operations an agent template will
govern. When scoring an Agent Pair, both classes are scored independently and the higher
score governs the QA Tier for the whole cycle.

**QA Tier**
The level of scrutiny applied to a Zone 0 cycle. Determined by the NV Score and Blast
Radius. See Part 4.

**Pattern Library**
The repository of documented agent class designs that have been approved and deployed.
Pattern Library entries for Agent Pairs include both class names and the `PAIRED_WITH:`
relationship. When the FOA assesses a new Performer Agent, it checks the Pattern Library
for an existing approved reviewer before deciding whether a new reviewer class is needed.

**Observable Stream**
The append-only event log that every agent action writes to. Every state change in Nexus
emits a domain event to this stream. It is the shared source of truth — not any individual
agent's memory.

**Invariant**
A rule that must always be true. Invariants are enforced mechanically. If a command would
violate an invariant, the system rejects it.

***

## Part 2: Responsibility Tree

```
FO (Product Owner)
│
│  Approves new agent classes when NV ≥ 2
│  Approves changes to the Base Agent Template
│  Approves Shared Reviewer designations
│  Bootstraps the FOA and Agent Spec QA (one-time, manual)
│
└── Framework Owner Agent (FOA)
    │
    │  Identifies gaps in the agent roster
    │  Writes Agent Class Requirements documents (one per class; two per pair cycle)
    │  Determines whether a new Performer requires a new or existing Reviewer
    │  Decides NV Score and QA Tier (using the higher score across the pair)
    │  Reviews spec tests before template work begins
    │  Reviews finished templates before approval
    │  Adds learnings to the Pattern Library (one entry per pair, naming both classes)
    │  Approves new agent classes when NV ≤ 1
    │  May NOT activate a Performer Agent without a paired, approved Reviewer Agent
    │
    ├── Agent Spec QA
    │   │
    │   │  Writes spec tests and acceptance criteria for each template in the cycle
    │   │  Runs the Cross-Reference Test when a pair is being created
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
- **A Performer Agent template may not be approved or activated without a paired, approved
  Reviewer Agent template**
- **A Reviewer Agent's READS list must contain the Performer Agent's WRITES path — this
  is a tested invariant, not a convention**
- **The minimum atomic output of a Zone 0 cycle that introduces a new Performer Agent is
  an Agent Pair — both templates, both test suites, both approvals**

***

## Part 3: The Creation Flow

### How a new agent class comes to exist

A new agent class begins with a **gap signal** — evidence that the current agent roster
cannot handle a task type that has appeared in the system. Gap signals come from three
sources:

1. An `UnknownTaskTypeEncountered` event in the Observable Stream
2. A retrospective finding that a task type was handled poorly because no specialist agent
   exists for it
3. A direct directive from FO

The FOA is the only agent that acts on gap signals.

***

### The seven steps

**Step 1 — FOA identifies the gap**

The FOA reads the gap signal and checks the Pattern Library and current agent roster. If a
suitable agent class already exists, or a Zone 0 cycle for this gap is already in progress,
the signal is absorbed — no new cycle starts. If no match exists, the FOA proceeds to
Step 2.

***

**Step 2 — FOA writes the Agent Class Requirements document(s)**

The FOA writes requirements before any other work begins. This is where the pairing
decision is made.

For every Performer Agent requirements document, the FOA must answer:
*"Does an approved Reviewer Agent already exist for this agent's artefact type?"*

- **Yes — existing reviewer** → Name the existing Reviewer Agent class in the Performer's
  requirements document under `REVIEWER:`. This is a single-class cycle; proceed to Step 3
  with one requirements document.
- **No — reviewer needed** → The FOA writes **two** requirements documents in this step:
  one for the Performer, one for the new Reviewer. Both documents enter the cycle together.
  The Performer's requirements document names the new Reviewer class under `REVIEWER:`.
  This is a Pair Cycle; Steps 3–7 run on both documents in parallel.

Each requirements document must contain:

- **Job statement** — one sentence describing what this agent is hired to do
- **Zone** — which delivery zone(s) this agent operates in
- **Candidate READS** — files this agent will likely need to read (named paths, not
  categories)
- **Candidate WRITES** — the single artefact this agent will produce
- **Candidate NEVER** — files this agent must never access
- **NV Score** — 0, 1, 2, or 3
- **QA Tier** — determined by taking the higher NV and BR scores across both documents
  in a Pair Cycle
- **REVIEWER** *(Performer documents only)* — the name of the paired Reviewer Agent class,
  or `SHARED:[class-name]` if a shared reviewer is designated

> **If NV ≥ 2 (using the higher score across the pair), the FOA shares all requirements
> documents with FO before proceeding.** FO may reshape, approve, or halt the cycle.
> The escalation happens here — not after templates are built.

***

**Step 3 — FOA commissions spec tests**

The FOA hands all requirements documents for this cycle to Agent Spec QA with the
instruction: *"Write the spec tests and acceptance criteria for each template in this cycle.
If this is a Pair Cycle, include the Cross-Reference Test confirming the Reviewer's READS
contains the Performer's WRITES path."*

Agent Spec QA produces, for each agent in the cycle:
- `spec-tests-[class-name].md` — the executable checks the finished template must pass
- `acceptance-criteria-[class-name].md` — the human-readable criteria the spec tests
  derive from

In a Pair Cycle, Agent Spec QA additionally produces:
- `spec-tests-pair-crossref.md` — the Cross-Reference Test covering the READS/WRITES link

Agent Spec QA does not decide whether the requirements are correct. It translates them
faithfully into tests. If the requirements are ambiguous, Agent Spec QA raises that as an
uncertainty to the FOA before writing tests.

***

**Step 4 — FOA reviews the spec tests**

The FOA reviews all spec test suites before any template work begins. For each suite, the
FOA checks:

- Do the tests cover every item in the requirements document?
- Are each test's pass/fail conditions unambiguous?
- Is the test for the base template conformance present?
- Is there a test for NEVER list non-emptiness?

In a Pair Cycle, the FOA additionally checks:
- Is the Cross-Reference Test present and unambiguous?
- Does the Cross-Reference Test reference the exact WRITES path declared in the Performer's
  requirements document?

If any suite is incomplete or unclear, the FOA returns it to Agent Spec QA with specific
feedback. **The spec test loop closes before the template loop opens. All suites in a Pair
Cycle must be accepted before any template work begins.**

***

**Step 5 — FOA commissions the agent templates**

The FOA hands each requirements document and its accepted spec tests to Agent Template
Creator. In a Pair Cycle, both commissions are issued together.

Agent Template Creator produces:
- `agent-template-[performer-class-name].agent.md`
- `agent-template-[reviewer-class-name].agent.md` *(Pair Cycle only)*

Both templates must conform to the Base Agent Template structure (see Part 5).

***

**Step 6 — Agent Spec QA runs the tests**

Agent Spec QA runs each spec test suite against its corresponding template. In a Pair
Cycle, Agent Spec QA also runs the Cross-Reference Test against both templates together.

For each template, Agent Spec QA produces a `test-results-[class-name].md` file containing:

- The result of each test (PASS or FAIL)
- Literal evidence for each result — not assertions
- A summary verdict: PASS ALL or FAIL with failed test list

In a Pair Cycle, a combined `test-results-pair-crossref.md` is also produced.

**A Pair Cycle cannot achieve PASS ALL unless every individual test suite passes AND the
Cross-Reference Test passes.** If any test fails, the FOA returns the relevant template(s)
to Agent Template Creator with the test results attached. The revision loop continues until
all tests pass.

***

**Step 7 — FOA reviews and approves**

Once all tests pass, the FOA reviews all templates for:

- Context tree consistency — does each agent's READS/WRITES/NEVER map correctly onto the
  context tree?
- Clean boundary — does either agent's job overlap with any existing agent's write
  authority?
- Pair coherence — does the Reviewer's scope fully cover the Performer's output?
- Learnings — is there anything from this cycle worth recording in the Pattern Library?

The FOA then either:

- **Approves** (NV ≤ 1) — adds both templates to the agent roster and records a Pattern
  Library entry naming both classes and their `PAIRED_WITH:` relationship
- **Escalates to FO** (NV ≥ 2) — sends FO all templates and all test results for final
  approval before activation

**In a Pair Cycle, both templates are approved or neither is.** FO or the FOA may not
activate one half of a pair while holding the other.

Once approved, both templates are active. The Observable Stream receives:
- `AgentClassCreated` for the Performer Agent
- `AgentClassCreated` for the Reviewer Agent
- `AgentPairRegistered` naming both classes and their pairing relationship

***

## Part 4: The Oversight Rule

Not every agent creation cycle needs the same level of scrutiny. The required QA depth is
determined by two scores. In a Pair Cycle, both agents are scored independently and the
**higher** score across the pair governs the QA Tier for the entire cycle.

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

For Pair Cycles: score each agent independently, then apply the higher result to the whole
cycle.

| Tier | Name | What changes |
|---|---|---|
| **1** | Routine | Spec tests still required. Revision loop still applies. FOA approves. No FO involvement. |
| **2** | Elevated | Full 7-step cycle. FOA approves at Step 7. No FO involvement unless the FOA judges it warranted. |
| **3** | High | Full cycle + FO approves the finished templates at Step 7. FO sees: requirements, test results, final templates. |
| **4** | Critical | FO is consulted at Step 2 before spec tests are written. FO approves at Step 7. Two FO touch points. |

***

### What tier does a cycle usually get?

| Scenario | BR | NV | Tier |
|---|---|---|---|
| Revision to existing template (fixing an error) | 3 | 0 | 2 |
| New executor agent; existing reviewer reused | 3 | 0 | 2 |
| New executor + new reviewer pair; established pattern | 3 | 0 | 2 |
| New specialist QA agent for a new artefact type | 3 | 1 | 3 |
| New performer + new reviewer pair; no precedent | 3 | 2 | 3 |
| Shared zone reviewer serving 3+ performers | 4 | 2 | 4 |
| New zone or new framework primitive | 4 | 3 | 4 |
| The Base Agent Template itself | 4 | — | 4 (always) |

***

## Part 5: The Base Agent Template

Every agent template produced by this flow must conform to the following structure. Fields
marked REQUIRED must be present and non-empty for the spec tests to pass.

```
***
name: [AgentClassName]                       # REQUIRED
description: "[One-sentence job statement]"  # REQUIRED — what is this agent hired to do?
tools: ['tool-a', 'tool-b']                  # REQUIRED
model: ['primary-model', 'fallback-model']   # REQUIRED
***

ZONE: [zone-number zone-name]                # REQUIRED
TYPE: [ORCHESTRATOR|EXECUTOR|COMPRESSION|BATCH]  # REQUIRED
QA_TIER: [0-4]                               # REQUIRED

REVIEWER: [ReviewerAgentClassName]           # REQUIRED for TYPE: EXECUTOR and ORCHESTRATOR
                                             # Use SHARED:[class-name] for shared reviewers
                                             # Use NONE:FO-APPROVED:[date] only with explicit
                                             # written FO exemption

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
- **REVIEWER is present and non-empty for any template with TYPE: EXECUTOR or ORCHESTRATOR**
- **The named REVIEWER class exists in the agent roster or is being created in the same
  Zone 0 cycle**

**Additional rule enforced by the Cross-Reference Test (Pair Cycles only):**

- The Reviewer Agent's READS list contains the exact file path declared in the Performer
  Agent's WRITES field

***

## Part 6: Bootstrapping Exception

The FOA and Agent Spec QA cannot be created by the Zone 0 process because Zone 0 does not
yet exist when they are first deployed. FO creates these two agents manually during initial
framework setup.

This is the **bootstrapping exception** — it applies to exactly two agents, once, at
framework initialisation.

**The bootstrapping exception satisfies the Agent Pair invariant.** The FOA and Agent Spec
QA are a de-facto pair: the FOA produces requirements and template commissions; Agent Spec
QA reviews and tests them. They were designed together, deployed together, and neither is
activatable in isolation. The bootstrapping exception is the founding precedent for the
Agent Pair rule, not an exemption from it.

All subsequent agent classes, including revisions to the FOA or Agent Spec QA, go through
the Zone 0 process. Any revision that changes the FOA's WRITES path must trigger a
corresponding review of Agent Spec QA's READS, and vice versa — even for routine revisions.

The bootstrapping exception is recorded in the framework manifest as a named decision —
not a workaround.

***

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2026-03-03 | Initial draft. Defines Zone 0 flow, glossary, responsibility tree, oversight tiers, and base template. |
| 0.2 | 2026-03-03 | Introduces Agent Pair as the atomic unit of Zone 0 output. Adds Performer Agent, Reviewer Agent, Shared Reviewer, Cross-Reference Test, and AgentPairRegistered event to glossary. Updates Responsibility Tree invariants, Step 2 pairing decision, Steps 3–7 parallel track for Pair Cycles, QA Tier pair-scoring rule, REVIEWER field in Base Agent Template, Pair Cycle scenario rows, and Bootstrapping Exception to acknowledge the founding pair precedent. |

***

A few things to note about the draft:

- **`NONE:FO-APPROVED:[date]`** is included as a deliberate escape hatch in the `REVIEWER` field for agents that are genuinely standalone (e.g. a pure compression agent with no reviewable output), but it requires an explicit FO decision rather than a silent omission [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_168390a0-2fa2-46bc-b85d-bb5896b959b2/029ca995-50f4-4eac-a3eb-b8e2260d90b8/agent-creation-policy-v0.1.md)
- **`AgentPairRegistered`** is a new Observable Stream event that sits alongside the two `AgentClassCreated` events — it makes the pairing relationship a first-class fact in the audit log, not just a field inside a template [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_168390a0-2fa2-46bc-b85d-bb5896b959b2/029ca995-50f4-4eac-a3eb-b8e2260d90b8/agent-creation-policy-v0.1.md)
- The **60-line limit** on templates is inherited from v0.1 — you may want to revisit this once you see how Pair Cycles produce two templates that reference each other; the cross-reference test file adds a third artefact to manage [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_168390a0-2fa2-46bc-b85d-bb5896b959b2/029ca995-50f4-4eac-a3eb-b8e2260d90b8/agent-creation-policy-v0.1.md)


## Part 6 — Bootstrapping Exception

The following Zone 0 toolkit agents cannot be created by the Zone 0
process because they are the Zone 0 process. They are hand-built
once in the toolkit and deployed as part of the toolkit installation.
No Zone 0 creation cycle is required or possible for these agents:

  - FrameworkOwner
  - UncertaintyOwner
  - ProjectRegistrar
  - EnvironmentContractAuthor
  - TemplateAuthor
  - PatternSeeder
  - BootstrapValidator
  - AgentSpecReviewer

These eight agents constitute the bootstrapping set. All subsequent
agent classes — including any revisions to these eight — go through
the Zone 0 process.

Revisions to bootstrapping agents are Tier 3 or Tier 4 depending on
NV score. They are not exempt from oversight — only from the creation
process. A revision to FrameworkOwner requires FrameworkOwner to
commission its own revision through the standard Zone 0 flow, with
human:director as the final approver (NV ≥ 2 by definition — you
are changing the agent that governs all other agents).

The bootstrapping exception is recorded in the framework manifest
as a named architectural decision, not a workaround.