# Pre-Experiment-02: Open Questions Analysis
**Date:** 2026-03-02  
**Purpose:** Break down each open question from `OpenQuestions.md` — what the question actually means technically, what options exist, and which decisions must be made before Experiment 02 can run.

**Urgency classification:**
- 🔴 **BLOCKER** — Exp-02 cannot run without a decision
- 🟡 **NEEDED** — Exp-02 can start but a specific hypothesis test will be underspecified without it
- 🟢 **DEFERRED** — Exp-02 tests remain valid regardless; decision can wait for Exp-03

---

## Q1 — Policy Engine implementation in STDIO + SQLite

**Urgency: 🟡 NEEDED for H4 pass/fail classification. Not a blocker (manual fallback exists).**

### What the question actually is

The Policy Engine is the piece that watches for state transitions and fires consequences automatically — for example: when `submit_proof` transitions state to `PROOFSUBMITTED`, automatically emit a stream event AND notify the orchestrator that the QA agent should be spun up. In Exp-01 we wired these consequences directly into the tool handler (the `submit_proof` tool itself writes the audit entry, emits the stream event, and updates state in the same SQLite transaction). That works for a single tool. The Policy Engine question is: what happens when the consequence is not "emit a stream event" but "instantiate a new agent" — something that happens *after* the tool call completes?

The concrete problem: MCP STDIO is request-response. The server can't push anything; it can only respond to tool calls. `notifications/tools/list_changed` exists — but it requires the client to pull an updated tool list, which VS Code does. What the server cannot do unprompted is re-activate the conversation or fire a new agent.

### The options

**Option A — Hard-code consequences in tool handlers (current approach, Exp-01)**
Each tool handler is responsible for its own downstream consequences. `submit_proof` transitions state, writes audit, emits stream event. Pete manually calls `activate_qa`.

- Pro: Zero infrastructure. Zero complexity. Works today.
- Con: Every tool must know about its consequences. Adding a new consequence means editing the tool handler. Not scalable. Requires Pete to manually step between lifecycle phases (MANUAL-GATE pattern).
- Appropriate for: Exp-02. This is what we have.

**Option B — SQLite trigger + polling loop**
A `state_transitions` table defines `(from_state, to_state, spawned_action)` rows. A background `setInterval` loop (running in the same Node process as the MCP server) checks for unprocessed transitions and fires `spawned_action`. When the loop detects a transition, it calls a function that emits `notifications/tools/list_changed`.

- Pro: Declarative policy. New lifecycle rules are rows in a table, not code changes. `state_transitions` table already exists in the schema design (from Exp-01 sessions).
- Con: Polling introduces latency. The loop runs in the same process — any crash takes both down. Logic for "already processed" rows needs a `processed_at` column. The loop cannot actually instantiate a new agent — it can only signal that tools have changed and leave the agent activation to an API call.
- Appropriate for: Exp-03 if Exp-02 confirms the MANUAL-GATE cost is real and painful.

**Option C — VS Code task trigger (external)**
Policy Engine runs as a VS Code task or a separate Node process watching the SQLite db file with `fs.watch`. On state change detected, it calls the Nexus HTTP API (we have a webhook server on port 3001 already) to trigger consequences.

- Pro: Decoupled from MCP server. Crash-safe. Could also send desktop notifications or open a new Copilot Chat panel.
- Con: Requires a second persistent process. File watch on SQLite WAL files is unreliable (VS Code's SQLite viewer has trouble with WAL). HTTP callback adds an external dependency.
- Appropriate for: Later. This is the right long-term architecture but over-engineered for Exp-02/03.

**Option D — Consequence-on-call (lazy evaluation)**
No background loop. When Pete calls `activate_qa`, the server checks whether `submit_proof` was called first. If yes, execute. The state guard IS the Policy Engine — the consequence fires when the next agent is activated, not at the moment the prior agent's action completes.

- Pro: No extra infrastructure. State machine is the only policy. Works in STDIO.
- Con: Latency is unbounded — consequences fire on manual activation, not automatically. This is effectively the MANUAL-GATE pattern with a nicer name.
- Appropriate for: Exp-02, honestly. The "Policy Engine" might just be a name for "tight state guards."

### Decision required

**For Exp-02:** Choose between Option A (MANUAL-GATE — explicit Pete actions between lifecycle phases) and Option D (consequence-on-call — Pete calls `activate_qa` which self-validates the prior state). Both require zero new infrastructure. The test plan H4 fallback documents this as a manual gate and treats it as a measurement rather than a failure.

**Recommendation:** Use Option D for Exp-02. State guards on each management tool (`activate_qa` validates task is `PROOFSUBMITTED` or `AWAITINGQAREVIEW`) provide implicit policy without a polling loop. Record the manual activation cost — how many explicit Pete calls were required to move a task from start to approved. That number is the argument for the real Policy Engine in Exp-03.

**Decision: ☐** Option A (hard-code) / **☐** Option D (consequence-on-call) / **☐** Option B (polling, build for Exp-03)

---

## Q2 — Proof template authorship: Task Owner or Task Performer?

**Urgency: 🔴 BLOCKER — H1 requires knowing who calls `write_proof_template_task_XX` and when.**

### What the question actually is

The proof template defines what a completed proof must contain — which commands were run, what literal output is expected, which acceptance criteria must be evidenced. Two approaches are possible:

**Option A — Task Owner authors the proof template (upstream, during task spec creation)**
Pete (or Zone 3 agents) writes the proof template when the task spec is written. The template is in the DB when the Task Performer is instantiated. `write_proof_template_task_XX` is a Zone 3 tool, not in the Task Performer's tool set.

- Pro: Proof requirements are part of task definition — the "what passing looks like" is defined before implementation begins. Removes ambiguity about what the agent must prove. No agent can soften the template.
- Con: Zone 3 must anticipate what commands and outputs are relevant. For novel tasks (first time we're doing X), Zone 3 may not know. Template may be too generic or wrong.
- Tool implication: `write_proof_template_task_XX` is NOT in the Task Performer spec. The tool exists only in Zone 3 / management context. Task Performer calls `read_proof_template_task_XX` (already exists) to read it before implementation.

**Option B — Task Performer authors the proof template (first action, before implementation)**
The Task Performer's first action after `get_context_card` is to call `write_proof_template_task_XX`. The agent declares what it will prove before it implements anything. This is visible in the audit log as a committed declaration.

- Pro: Template is contextual — the agent knows the full task context and writes a specific template. The act of declaring it before implementation creates a commitment: the agent cannot later submit a proof that doesn't match what it declared. Audit log shows declaration before implementation (timestamp evidence).
- Con: The agent could write a weak template to make a weak proof acceptable. There is no external check on the quality of the template itself. Requires the Task Performer to have `write_proof_template_task_XX` in its tool set.
- Tool implication: `write_proof_template_task_XX` IS in the Task Performer spec. It's one of the allowed write tools.

**What Exp-01 + the current task-performer template established:**
Looking at the current template (`.github/agents/task-performer.template.md`), `write_proof_template_task_XX` is listed as a tool. That means Option B was the implicit choice. But it was never made explicit as a design decision.

**The audit trail implication:**
The question matters because it changes what the audit log looks like and what the QA agent reads. Under Option A: `write_proof_template` appears in Zone 3 time, before task activation. Under Option B: it appears immediately after `get_context_card`, before any code. Option B creates a cleaner lifecycle story in the audit trail — the agent's proof declaration is visible as step 2 of its lifecycle.

**The Quality concern under Option B:**
The QA agent reads the proof template (`read_proof_template_task_XX`) and compares it against the submitted proof. If the Task Performer wrote a template that says "show that the code runs" (vague) and then submitted output that says "it ran" (also vague), QA has no external baseline to RETURN against. The proof gate is agent-relative, not externally set.

This is a real gap. Under Option A, Pete (or Zone 3) sets the bar. Under Option B, the agent sets its own bar.

**Hybrid option — Option C:**
Zone 3 writes a minimal acceptance criteria list in the task spec (already in the task spec `doc_type`). The Task Performer writes the proof template to satisfy those criteria specifically. QA reviews the proof against both the template AND the task spec AC. This preserves the audit-trail benefit of Option B while giving QA an external baseline.

### Decision required

**For H1 Exp-02, this is a blocker.** The Task Performer agent will be given a context card. The context card must tell the agent what to do first. If Option B (or C), the agent's first two calls are: `get_context_card`, then `write_proof_template_task_XX`. If Option A, the first call is `get_context_card` — and then `read_proof_template_task_XX` to see what's already been written.

**Decision: ☐** Option A (Task Owner writes template before task goes live) / **☐** Option B (Task Performer writes template as first act) / **☐** Option C (hybrid: AC in spec, Performer writes template to match)

**My read:** Option B with a constraint — the context card must instruct the agent that the proof template must reference the AC from the task spec explicitly. This makes it checkable by QA without requiring Zone 3 to pre-write the template. But Pete needs to confirm.

---

## Q3 — Observable stream format and display mechanism

**Urgency: 🟡 NEEDED for H5. Exp-02 H1–H4 can run without it; the H5 test is specifically timed reconstruction from stream events.**

### What the question actually is

`stream_events` rows exist in the DB. We defined them as "plain English descriptions." What we didn't define:
1. How Pete actually reads them during a session
2. What the format of each event description is (free text? structured? length limit?)
3. Whether stream events are a real-time feed or a historical record queried post-hoc

### What we're actually testing in H5

H5 times Pete reading stream events and reconstructing the full task story. For this to be testable, we need a concrete mechanic for how Pete reads them — not just "query the DB."

### The options

**Option A — SQL query in terminal (current approach)**
```sql
SELECT description FROM stream_events WHERE task_id = 'task-XX' ORDER BY id;
```
Pete runs this at the end of the lifecycle. Reads the list. Reconstructs.

- Pro: Zero infrastructure. Works today. Deterministic.
- Con: Not real-time. Requires terminal access and knowing the `task_id`. Not how a non-technical observer would experience it.
- Appropriate for: Exp-02. The hypothesis is about readability, not real-time delivery.

**Option B — Fastify `/stream/:task_id` endpoint (Server-Sent Events)**
The webhook server (Fastify, port 3001) exposes `GET /stream/task-XX` as an SSE endpoint. Pete opens it in a browser or `curl -N`. Events push as they happen.

- Pro: Real-time. Readable without SQL. Closer to the vision of "observable stream."
- Con: Requires implementing SSE in Fastify. Requires Pete to open a browser tab or terminal tab during the agent run. Adds complexity to Phase 2 of Exp-02 (build work needed).
- Appropriate for: Exp-03 when the lifecycle is proven and we need the stream to feel like a real product.

**Option C — `GET /stream/task-XX` returns full event history as JSON/text (not SSE)**
Simpler than Option B: the Fastify server exposes a read endpoint that returns all stream events for a task as plain text. Pete hits it with `curl` or opens it in a browser.

- Pro: No SSE complexity. Still removes the SQL barrier. Easy to implement (5 lines of Fastify route).
- Con: Not real-time — same as Option A but with a different query mechanism.
- Appropriate for: Exp-02 if we want to move past "terminal SQL query" without SSE complexity.

**Format decision (independent of delivery mechanism):**

Each `description` must follow a pattern. Based on what's been used in Exp-01:

| Verb | Pattern | Example |
|---|---|---|
| Push events | `"🔀 Push to task branch — sha: XXXXXXX"` | `"🔀 Push to task branch — sha: a3f9c2b"` |
| PR events | `"📬 PR opened: <title>"` | `"📬 PR opened: Add blog search feature"` |
| QA request | `"📋 QA review requested for task-XX"` | |
| QA outcome | `"✅ APPROVED: <one-line summary>"` / `"🔁 RETURNED: <specific reason>"` | |
| Proof submit | `"📄 Proof submitted by Task Performer"` | |

Rules that need to be decided:
- Max description length? (suggestion: 120 chars — fits one line in a terminal)
- Emoji required or optional? (suggestion: required — gives scannable structure without reading every word)
- Must every stream event be interpretable without any other row? (suggestion: yes — this is the H5 test criterion)

### Decision required

**For H5:** Decide the display mechanism (Option A is fine for Exp-02) and formalise the description format rules. Without format rules, the H5 pass criterion ("Pete can read stream events without technical knowledge") has no benchmark.

**Decision: ☐** Option A (SQL query, Exp-02 only) / **☐** Option C (Fastify read endpoint, Exp-02) / **☐** Option B (SSE, Exp-03)

**On format:** Suggest adopting the table above as the v1 stream event format. Add a `description_format` convention to NexusToolGrammar (or a new `NexusStreamFormat.md`). **Decision: ☐** Formalise format before H5 / **☐** Let Exp-02 execution surface the right format empirically.

---

## Q4 — Webhook retry and idempotency

**Urgency: 🟢 DEFERRED — Not a blocker for Exp-02. `gh webhook forward` handles local delivery. Idempotency matters for production use, not experimental validation.**

### What the question actually is

GitHub guarantees at-least-once delivery. The same webhook payload can arrive more than once if the first delivery times out. The `X-GitHub-Delivery` header is a UUID per delivery attempt — the same event resent has the same delivery UUID. Nexus currently has no deduplication logic: if the same push fires twice, two `audit_log` rows appear for the same commit.

### Why this matters eventually

A duplicate `github:push` row in the audit log would pass Exp-02 tests (presence check) but would confuse the H5 reconstruction ("why are there two push events?"). It would also produce incorrect counts in any query like `COUNT(*) WHERE tool_name = 'github:push'`.

### Options

**Option A — Deduplication column on stream_events**
Add `delivery_id TEXT UNIQUE` to `stream_events`. The webhook handler stores `X-GitHub-Delivery`. SQLite `INSERT OR IGNORE` discards duplicates silently.

- Pro: Simple. One schema change. One line in the webhook handler.
- Con: `audit_log` still gets duplicates (only `stream_events` is deduplicated). Need to decide if both tables need deduplication or just one.

**Option B — Idempotency on both tables**
Add `delivery_id` to both `audit_log` and `stream_events`. Any row with a duplicate `delivery_id` is silently dropped.

- Pro: Correct. No duplicate rows anywhere.
- Con: Schema migration needed. `delivery_id` is only available for webhook-sourced rows — MCP tool rows would have `NULL` delivery_id (which is fine, SQLite UNIQUE constraint allows multiple NULLs).

**Option C — Ignore for now**
`gh webhook forward` in local dev doesn't retry unless the server returns a 5xx. In practice, Exp-02 won't see duplicate deliveries. Document as a known gap and add deduplication before production use.

### Decision for Exp-02

Option C. Document `X-GitHub-Delivery` as the deduplication key and plan Option B as a schema migration for Exp-03 setup. Not worth the schema churn now — the experiment tests presence, not cardinality.

---

## Q5 — Context card generation: bootstrapping from empty knowledge base

**Urgency: 🟡 NEEDED before H1. Pete writes the first context card manually — but the agent's first action is `get_context_card`. We need to confirm the card is written and what it should contain.**

### What the question actually is

The context card is what the agent reads first. It frames the task — state, scope, tools available, what passing looks like, and any relevant background from prior work. In the vision, Zone 3 generates context cards by querying the knowledge base. For Exp-02, the knowledge base is empty (or nearly empty). Pete will write the first context cards by hand.

The question is: what does a good context card contain, and how do we know when our manually written card is good enough for the agent not to go in circles?

### What a context card must contain for H1 to pass

Looking at the H1 pass criteria:
- Agent calls `get_context_card` first → card must exist before `activate_task`
- Agent doesn't need Pete to intervene → card must be self-sufficient
- Agent writes `write_proof_template_task_XX` before any code → card must instruct this explicitly
- Agent doesn't call out-of-scope tools → card must name the tools clearly

### Minimum viable context card structure (Exp-02)

```
task_id: task-XX
title: <task title>
state: CLAIMED
tools_available: [list of 6 tools by exact name]

context: <2-3 sentences about what this task is and any relevant system context>
implementation_hints: <optional — specific files, commands, or constraints relevant to this task>

what_passing_looks_like:
  - proof template written before any implementation
  - code changes tested with literal command output captured
  - submit_proof contains actual terminal output, not assertions

instruction_sequence:
  1. Call write_proof_template_task_XX first — declare what you will prove
  2. Implement
  3. Run tests — capture literal output
  4. Call submit_proof_task_XX with that literal output
  5. Call request_review_task_XX
```

### The bootstrapping gap

The knowledge base has nothing in it beyond what we've manually seeded. The context card generation loop — "agent completes task → system learns patterns → next context card is better" — doesn't start until at least one task completes. For Exp-02, Pete is the knowledge base.

This is fine and known. The decision needed is: does the context card live in `documents` (queried by `get_context_card`), or does `get_context_card` query `tasks` + `documents` at runtime and build the card dynamically?

### Options

**Option A — Context card is a pre-written document in the `documents` table**
Pete (or Zone 3) writes the context card explicitly. `get_context_card` fetches `doc_type = 'context_card'` for the task. Card is static — written before agent activation.

- Pro: Agent reads exactly what Pete wrote. No generation logic. Simple to audit.
- Con: Must be written before every `activate_task`. Manual overhead per task.

**Option B — Context card is generated at call time by `get_context_card`**
The tool queries `tasks`, `documents` (for task spec), and `tool_registry` (for tools) and assembles the card inline. No pre-written card document.

- Pro: Always current. No management overhead. Works even if Pete forgets to write the card.
- Con: The generated card has no domain context — it knows the state and tools but not the background, hints, or external dependencies. Riskier for the agent going in circles.

**Option C — Hybrid: generated skeleton + Pete-written additions**
`get_context_card` generates the structural parts (state, tools, task title) and reads an optional `context_notes` field from `documents` that Pete can write. If no notes exist, returns the structural card only.

- Pro: Never fails (skeleton always generatable). Pete can enrich without being required to.
- Con: Requires a new `doc_type = 'context_notes'` or a field in `tasks`. Slightly more complex.

### Decision required for H1

**For Exp-02:** Option A is the lowest-risk choice for H1. Pete writes a concrete, specific context card before running the experiment. The card is the test probe — if the agent goes in circles, the card was insufficient, and we learn what was missing.

If we choose Option B or C, we need to also update `server.ts` before Exp-02 runs.

**Decision: ☐** Option A (pre-written doc, Pete authors) / **☐** Option B (generated at runtime) / **☐** Option C (hybrid)

---

## Q6 — VS Code degradation with 10+ dynamically generated agent specs

**Urgency: 🟢 DEFERRED — Exp-02 uses 2–3 agents maximum. Not a near-term concern.**

### What the question actually is

Each `activate_task` and `activate_qa` writes a `.agent.md` file to `.github/agents/`. If a sprint runs 10 parallel tasks, 20+ spec files accumulate. VS Code parses all of them on hot reload. At some threshold, the agent selector may become slow, cluttered, or unreliable.

### What we know from Exp-01

Hot reload works cleanly with 1–2 agents. We've never tested more than 3 simultaneous agent spec files.

### Options if degradation occurs

- **Naming prefix strategy:** All generated specs use `task-performer-task-XX.agent.md` and `qa-execution-task-XX.agent.md`. VS Code may support filtering — the user could type `task-` to see only task agents. Test this before assuming it's a problem.
- **Cleanup-driven design:** `deactivate_task` already deletes the spec file. If activation/deactivation are disciplined, at most 2 spec files exist per task simultaneously. Sprint-level parallelism would be 2N files for N active tasks. This may be fine.
- **Spec consolidation:** Instead of one file per task, one file per role with dynamically scoped tools registered. Not recommended — loses the naming clarity that makes tool possession visible.

### Decision for Exp-02

None needed. Run the experiment with DEACTIVATE as a hygiene requirement — deactivated tasks delete their spec files. If VS Code shows any latency at 6+ files, document it and flag for Exp-03 load testing.

---

## Summary: What must be decided before Exp-02 runs

| Question | Urgency | Decision needed | My read |
|---|---|---|---|
| Q1 — Policy Engine | 🟡 NEEDED | Manual-gate vs consequence-on-call | Option D (consequence-on-call state guards) |
| Q2 — Proof template authorship | 🔴 BLOCKER | Task Owner vs Task Performer vs Hybrid | Option B (Task Performer writes first) with a constraint from the context card |
| Q3 — Stream format and display | 🟡 NEEDED | SQL query vs Fastify endpoint; formalise emoji/format rules | Option A display + formalise event format table |
| Q4 — Webhook idempotency | 🟢 DEFERRED | Plan Option B, implement before Exp-03 | Ignore for Exp-02 |
| Q5 — Context card bootstrapping | 🟡 NEEDED | Pre-written vs generated vs hybrid | Option A (Pete writes, Exp-02 is a card quality test) |
| Q6 — VS Code scale | 🟢 DEFERRED | Monitor in Exp-03 | Cleanup hygiene (deactivate deletes spec) covers Exp-02 |

**The only genuine Exp-02 blocker is Q2.** Everything else has a workable default. Q2 determines what the Task Performer's tool set looks like, what the context card instructs, and what QA reviews against. Decide Q2 and Exp-02 can begin.
