# Pre‑flight checks, uncertainty protocol, and call‑repeat via MCP tools

## 1) Pre‑flight check as a required MCP tool

Implement a single MCP tool that every executor agent must call before doing work, driven by `.framework/context-tree.md` and the agent spec.  

- **Tool name (example):** `preflight_check`
- **Inputs:**
  - `agent_name`
  - `task_id` / feature slug
  - paths for declared READS/WRITES/NEVER from the agent’s `.agent.md`
- **Checks it performs:**
  - All declared READS files exist and are non-empty.
  - No conflict between any loaded artefacts (apply the **Context Conflict Rule** from the context tree: when two files disagree, do not average; log and stop).  
  - Precondition invariants for the aggregate state (e.g. for Task Performer, task must be `PUBLISHED`, env contract present, etc.).  
- **Outputs:**
  - `status` ∈ {`CLEAR`, `ASSUMED`, `BLOCKED`}
  - `assumptions[]` (structured list)
  - `conflicts[]` (if any)
- **Policy:**
  - `CLEAR` → agent may proceed.
  - `ASSUMED` → agent proceeds but assumptions are appended to the task’s `uncertainty-log.md`.
  - `BLOCKED` → agent **must** call `agentraiseuncertainty` and stop. No override in the agent spec.

This directly enforces “don’t just attempt it anyway” in tooling, not in vibes. Every executor’s `.agent.md` template includes a “always call `preflight_check` before main work” block.  

***

## 2) Uncertainty as a first‑class MCP skill

Your draft already defines an **uncertainty-protocol** skill and `agentraiseuncertainty` tool, with a schema for what the agent must log.   You extend that:

- **Tool:** `agentraiseuncertainty`
- **Inputs (already sketched):**
  - `what` — what is unclear
  - `why` — why it blocks progress
  - `needed` — what information would resolve it
  - `context_paths` — files the agent was reading when it got stuck
- **Behaviour:**
  - Writes an entry to `.framework/features/<slug>/tasks/<task>/uncertainty-log.md` (or the zone-equivalent)  
  - Emits `UncertaintyRaised` event into the Observable Stream.  
  - Triggers the appropriate **zone Advisor Agent** via MCP (you wire advisor servers as separate MCP servers or tools).
- **Follow‑up tools for Advisor:**
  - `research_uncertainty`
  - `define_mitigation`
  - `review_mitigation`

In Nexus MCP terms, this is just another server with tools; what makes it “behaviour” is that every agent spec includes “on BLOCKED pre-flight, call `agentraiseuncertainty` and yield”.

***

## 3) Certainty score as part of the uncertainty tool, not its own thing

Instead of a separate “certainty score” feature, make certainty one of the fields in the uncertainty protocol / pre-flight output:

- In **pre-flight**, the tool computes a `self_assessed_certainty` (0–1 or 0–10) from the agent’s own reasoning step.
- Policy:
  - If `certainty < threshold` but preconditions are mechanically satisfied, pre-flight returns `ASSUMED` with a required `assumptions[]` list.
  - Threshold is declared per agent in its `.agent.md` (“CERTAINTY_THRESHOLD: 0.8”).

This gives you the benefits of a certainty score (telemetry, trend analysis, routing to human if persistently low) without making it the only gate. A high score never bypasses invariant checks.

***

## 4) Call‑repeat at zone boundaries via MCP “handoff” tools

You already have the **context tree** and VS Code layering model: context cards, skills, prompt files, agent files.   To implement call‑repeat at zone boundaries:

- Add a standard MCP tool: `handoff_repeatback`.
- **When it runs:**
  - At four points: Idea→Feature, Feature→Task, Task→Execution, Execution→CICD.
  - Called by the receiving agent as its first action after loading its context card.
- **Inputs:**
  - `handoff_context_paths` (the curated card + key artefacts)
  - `agent_role` (e.g. `TaskOwner`, `TaskPerformer`, `CICDAgent`)
- **Outputs:**
  - `job_statement` — “I understand my job is to…”
  - `deliverable` — “I will produce…”
  - `assumptions[]`
- **Where it goes:**
  - Writes to a small `.framework/.../handoff-repeatback.md` for that boundary.
  - Emits a `HandoffRepeatBack` event on the Observable Stream.
- **Review:**
  - The zone’s QA agent (Definition or Execution) is configured, via its MCP spec, to watch for `HandoffRepeatBack` events and run a lightweight check:
    - If the repeat matches the spec intent → flag as `OK` and let the executor proceed.
    - If not → instruct the executor to raise uncertainty instead of starting work.

In tooling terms, these are just well-named MCP tools plus some routing rules; the “CRM/aviation” behaviour emerges from the combination of:

- “Always call `handoff_repeatback` on cross-zone handoffs”
- “Always call `preflight_check` before execution”
- “Always call `agentraiseuncertainty` on BLOCKED pre-flight or QA not-OK”

***

## 5) Where this lives in the Nexus MCP stack

Concretely, in your VS Code / Nexus MCP setup this looks like:  

- **Always-on instructions (.github/copilot-instructions.md):**
  - Sanctuary rules, “never proceed on BLOCKED pre-flight”, “always surface and log uncertainties”.
- **Skill files:**
  - `uncertainty-protocol.skill.md` that wraps `agentraiseuncertainty`, `research_uncertainty`, etc.
  - `preflight-check.skill.md` that defines how to call the `preflight_check` MCP tool for this repo.
  - `handoff-repeatback.skill.md` that defines the cross-zone repeat interface.
- **Agent files (.agent.md):**
  - For each agent: a short “Lifecycle” section:
    - Step 1: call `preflight_check`.
    - Step 2: if zone boundary, call `handoff_repeatback`.
    - Step 3: if pre-flight status is BLOCKED or QA marks repeatback as unclear, call `agentraiseuncertainty` and stop.
- **MCP config:**
  - Nexus MCP server exports tools:
    - `environmentsnapshot`, `contextcardgenerate`, `agentaction`, `feedlive`, `agentraiseuncertainty`, `preflight_check`, `handoff_repeatback` as HTTP/STDIO MCP tools.  
  - Router config (Nexus or client) ensures these tools are available to all relevant agents.

With that, “ask agents if they are uncertain and make them stop instead of guessing” is not a cultural aspiration; it’s literally encoded in the protocol: they cannot transition into “do work” without going through MCP tools that either return CLEAR/ASSUMED or force an uncertainty raise.

