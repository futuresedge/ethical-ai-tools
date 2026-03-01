# Four Primitives and Seven Principles
> Source: Agentic-Development-Framework.md
> Load when: assessing any artefact, answering any strategic question about how the framework works

---

## The Core Problem This Framework Addresses

Coordination overhead consumes 38–50% of knowledge work time. In Sprint 6 baseline data:
- Total sprint time: 8 hours
- Coordination overhead: 38% (3.04 hours)
- Value work: 47%

Six observed failure modes ground the framework design (not hypothetical risks):
- P1: Unverifiable environment state → agents operated in silently different environments
- P2: Silent failure modes → tools appeared to succeed while failing (bun test, lsof, vitest config)
- P3: Knowledge produced but not consumed → docs written and violated in the same sprint
- P4: Verification positioned too late → QA first-pass rate 33%
- P5: Agent specification accumulation → spec grows until it becomes the problem it was meant to solve
- P6: No shared ground truth → each agent constructs its own model of the world

---

## The Four Primitives

### 1. Evidence Gate
PROBLEM ADDRESSED: monitoring costs, enforcement costs
PRINCIPLE: trust the evidence, not the agent
MECHANISM: before any work crosses a boundary, produce a proof template — exact commands,
  outputs, and formats that constitute completion. Work = making the template true with literal output.
ADDRESSES: P2 (silent failures), P4 (late verification)
COMPONENTS:
  - Proof template (pre-specified commands and expected output formats)
  - Literal capture (actual command output — not summaries or assertions)
  - Exit codes (explicit success/failure)
  - Environment snapshot (state under which evidence was captured)
  - Timestamp and agent signature

### 2. Environment Contract
PROBLEM ADDRESSED: synchronization costs, handoff costs
PRINCIPLE: environment is a shared fact, not a per-agent assumption
MECHANISM: before work begins, a verifiable snapshot of environmental conditions is created
  and stored as a shared artefact. All agents work against the same contract. Divergence triggers alerts.
ADDRESSES: P1 (environment drift)
FIELDS: database URL, test runner, node environment, server port, server health, config location,
  required dependencies

### 3. Context Card
PROBLEM ADDRESSED: search costs, context-switching costs
PRINCIPLE: context delivered, not carried; agent specs describe roles, not knowledge
MECHANISM: agents receive task-specific briefing cards generated on-demand from a knowledge base,
  containing only what is relevant to this task. Knowledge base grows; specs don't.
ADDRESSES: P3 (knowledge not consumed), P5 (spec accumulation)
COMPONENTS:
  - Task type
  - Relevant patterns (surfaced from knowledge base)
  - Known anti-patterns
  - Environment notes
  - Previous failures (relevant to this task type)

### 4. Observable Stream
PROBLEM ADDRESSED: waiting costs, monitoring costs
PRINCIPLE: legibility builds trust — humans see what agents are doing, not just what they claim
MECHANISM: every significant agent action emits a plain-English event to a visible stream.
  Humans and meta-agents observe work in real-time, enabling intervention before problems compound.
ADDRESSES: P6 (no shared truth) — Observable Stream and Evidence Gate together create shared facts
FORMAT: [timestamp] Agent: Plain-English description of action

---

## How Primitives Combine (Workflow Sequence)

1. Task Start: Environment Contract created and signed
2. Context Delivery: Context Card generated from knowledge base
3. Work Begins: agent emits Observable Stream events
4. Completion: agent fills Evidence Gate proof template with literal output
5. Handoff: next agent verifies contract, reviews evidence, receives updated card
6. Human Review: Product Owner monitors stream, reviews proof, approves/returns

---

## The Seven Principles

1. EVIDENCE OVER ASSERTION
   No claim accepted without literal, captured proof.
   Test: can you reproduce the claimed outcome from the output alone?

2. ENVIRONMENT AS SHARED FACT
   Captured, signed, verifiable by all agents.
   Failure: two agents with different views of environment state = P1 recurrence.

3. CONTEXT DELIVERED, NOT CARRIED
   Task-specific cards generated on-demand from knowledge base.
   Failure: agents self-curating context = search costs shift back to agents.

4. SILENT FAILURES ARE SYSTEM FAILURES
   Any condition that looks like success but isn't is a framework defect.
   Test: would this failure be visible in the Observable Stream before it compounded?

5. TRUST ACCUMULATED, NOT GRANTED
   Each verified task adds a marble. Autonomy expands with evidence.
   Implication: new agents start with minimal autonomy; no trust is implied by role names.

6. FAILURE SURFACED, NOT HIDDEN
   Graceful failure is a designed capability, not a special case.
   All failures route to review first — no automatic retries without human visibility.

7. STREAM IS COORDINATION
   Observable events are the primary coordination mechanism.
   Implication: an agent that acts without emitting events is opaque and untrustworthy.

---

## Trust Model

Human-AI trust requires EVIDENCE-BASED foundations, not reputation-based.
Each claim must carry proof. Model: forensic chain-of-custody — evidence is admissible because
you can verify every hand it passed through.

Three pre-conditions for effective coordination (from implementation science):
  Capability: psychological ability to engage in risk-taking and learning
  Opportunity: social environments that support information exchange
  Motivation: commitment to shared goals and resilience under stress

Trust-building may be MORE important than the selection of specific implementation strategies.
For human-AI teams: trust mechanisms are load-bearing infrastructure, not auxiliary features.

---

## Context Engineering Model

### The lost-in-the-middle problem
Language models have a finite attention budget. Every token competes.
A poorly structured 200-token agent file produces worse output than a well-structured 50-token one —
not because it contains wrong information, but because it contains too much.

### The three context questions (per operation)
1. What does this agent need to READ? → named files only, not categories
2. What does this agent WRITE? → one artefact, one location
3. What is this agent explicitly FORBIDDEN from reading? → if it can reach it, it might load it

### Static vs dynamic content
STATIC (instructions, skills): place at top of context window → maximises cache hit rate
DYNAMIC (task-specific input): place at bottom
HIGH-VALUE CACHE TARGETS: Context Agent, Test Writer, QA Reviewer (batch across all tasks in feature)

### The compression node rule
Context Curation agent: input is intentionally larger than output.
Goal: minimum sufficient tokens for the next executor to act correctly.
NEVER let an executor agent self-curate — it must receive a pre-built context package.

### Instruction format rule
WRONG: "You should carefully read the task acceptance criteria and produce a comprehensive test suite..."
RIGHT:
  READS: task-ac.md only
  WRITES: task-tests.md
  FORMAT: Given/When/Then, one test per AC condition
  NEVER: read feature-spec.md or parent AC

Critical rules: top of file. Boundaries (NEVER): bottom of file. Nothing important in the middle.
