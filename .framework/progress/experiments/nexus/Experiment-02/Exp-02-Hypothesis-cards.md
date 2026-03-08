# Experiment 02: Hypothesis Cards

***

## Hypothesis Card — Phase 1: Real Agent, Real Work

**Hypothesis:** A Task Performer agent instantiated from a generated spec, briefed only by its context card, will perform a real implementation task — writing code, running tests, and capturing literal command output — without calling tools outside its declared scope, without path-navigating outside its task documents, and without requiring Pete to intervene.

**Test:** Activate a real task from the Astro blog backlog (not task-9x — a real task). Instantiate `@Task Performer (task-XX)` in Copilot Chat. The agent must: call `get_context_card` first, call `write_proof_template_task_XX` before any implementation, write and run real code, capture literal `npm test` output, and call `submit_proof_task_XX` with that output. Pete observes but does not prompt or guide after the initial task assignment.

**Pass:**

- Agent calls `get_context_card` as its first tool call (verifiable in audit log)
- Proof template is written before any code (timestamp in audit log confirms order)
- No tool calls appear outside the declared spec tools (audit log is the source of truth)
- `submit_proof` contains literal command output, not assertions
- Task state transitions to `PROOFSUBMITTED` automatically on `submit_proof`
- Pete does not need to intervene at any point during execution

**Fail:** Agent attempts tools outside its scope (OCAP gap — critical), agent writes assertions instead of literal output in proof (Evidence Gate gap — significant), agent goes in circles without `raise_uncertainty` (context card gap — moderate), Pete needs to prompt mid-task to unblock (context card insufficient — moderate).

**Fallback:** If agent attempts out-of-scope tools and they fail structurally (OCAP holds), the attempt itself is data — log it and continue. If the agent goes in circles, trigger `raise_uncertainty` manually once as a guided recovery, note the trigger condition, and use it to improve the context card template. If proof contains assertions, RETURN the task and record what the proof template was missing.

***

## Hypothesis Card — Phase 2: Real GitHub Operations

**Hypothesis:** When the Task Performer agent uses the GitHub MCP server to create a real branch (`task/task-XX`) and push real code, GitHub fires a webhook to the Nexus endpoint (not curl-simulated), and the event appears in the audit log attributed to `actor: webhook:github` within 10 seconds.

**Test:** During the Phase 1 real agent run, verify that the branch creation and push operations produce webhook payloads at the Nexus endpoint. Use `gh webhook forward` (GitHub CLI) instead of ngrok for local delivery reliability. Query `audit_log WHERE actor = 'webhook:github'` and confirm the events arrived with correct `task_id` attribution.

**Pass:**
- At least one `github:push` entry appears with `task_id = 'task-XX'` and `actor = 'webhook:github'`
- Event arrives within 10 seconds of the agent's push
- The `content` column contains the real commit SHA (not a simulated value)
- A PR creation event appears after `submit_proof` triggers PR creation via GitHub MCP

**Fail:** Webhook delivery fails (infrastructure issue — use `gh webhook forward` fallback immediately), OR branch name doesn't parse to `task_id` correctly (parser bug — fix and re-test), OR GitHub MCP remote server routes through infrastructure that bypasses repo webhooks (architectural gap — requires explicit Nexus tool call as fallback).

**Fallback:** If `gh webhook forward` also fails locally, have the agent call `log_github_event(task_id, event_type, sha)` explicitly after each GitHub operation. This is behavioural enforcement for Phase 2 only — mark it as a known degradation, not an architecture change. Real webhook delivery must be confirmed before Exp-03.

***

## Hypothesis Card — Phase 3: QA Agent Instantiation and Scoping

**Hypothesis:** When `submit_proof` transitions task state to `PROOFSUBMITTED`, a QA Execution agent can be instantiated with a generated spec scoped to the same task — with only read tools for task documents and one write tool (`submit_qa_review_task_XX`) — and the QA agent's tool set is provably disjoint from the Task Performer's tool set for the same task.

**Test:** After Phase 1 completes and task is in `PROOFSUBMITTED` state, call `activate_qa("task-XX")`. Confirm `task-qa-task-XX.agent.md` is generated. Confirm the QA agent's tool list contains `read_proof_task_XX`, `read_task_spec_task_XX`, `submit_qa_review_task_XX` — and does NOT contain `write_proof_template_task_XX` or `submit_proof_task_XX`. Open both agent specs in side-by-side view and confirm the tool sets are disjoint for write tools.

**Pass:**
- QA agent appears in VS Code agent selector within 5 seconds of `activate_qa`
- QA agent cannot call `write_proof_template_task_XX` (tool not in its registry)
- Task Performer agent (if still active) cannot call `submit_qa_review_task_XX` (tool not in its registry)
- The disjoint property is structural — confirmed by attempting cross-calls and observing "tool not found" errors, not permission errors

**Fail:** Either agent can call the other's write tools (OCAP gap at the QA layer — critical), QA spec generation fails (template issue — fix immediately), or VS Code shows both agents' tools merged in one context (VS Code bug — document and find workaround).

**Fallback:** If QA spec hot-reload fails for any reason (Phase 3 of Exp-01 confirmed it works, so this would be a regression), use a static `qa-execution.agent.md` with universal tools only, and rely on the `submit_qa_review` tool's server-side state check to enforce that only PROOFSUBMITTED tasks can receive QA reviews. Less elegant but structurally sound at the server layer.

***

## Hypothesis Card — Phase 4: `request_` Verb and Cross-Agent Handoff

**Hypothesis:** The Task Performer agent can signal the completion of its work and the need for QA review via `request_review_task_XX` — a tool that writes no documents, emits a stream event, transitions state to `AWAITINGQAREVIEW`, and produces an audit entry — without the agent needing to know anything about the QA agent or the QA lifecycle.

**Test:** After proof submission, have the Task Performer agent call `request_review_task_XX`. Verify: state transitions from `PROOFSUBMITTED` to `AWAITINGQAREVIEW`, a stream event is emitted readable as "Task Performer requested QA review for task-XX", an audit entry is written with `tool_name: request_review_task_XX`, and the QA agent is activatable (manually by Pete for Exp-02) immediately after the request fires.

**Pass:**
- State transition is automatic on `request_review` (no Pete action required for the transition itself)
- Stream event is self-explanatory without opening any document
- Audit log shows the request as a distinct event between `submit_proof` and the QA agent's first action — the handoff boundary is visible as a named moment in the audit trail
- The Task Performer has no tool to interact with the QA review once `request_review` fires (its review-related tools are absent)

**Fail:** State doesn't transition automatically (requires additional tool call or Pete action — design gap), stream event text requires context to interpret, or the audit log doesn't clearly show the handoff boundary as a discrete event.

**Fallback:** If auto-transition on `request_review` isn't achievable in Exp-02 without a Policy Engine, Pete manually calls `advance_state(task_id, "AWAITINGQAREVIEW")` as a one-step approval. Mark this as P-02-MANUAL-GATE in the audit log. This is the data point that motivates building the Policy Engine in Exp-03.

***

## Hypothesis Card — Phase 5: First Complete Loop

**Hypothesis:** A single task lifecycle — from real agent implementation through QA review and final state — produces an audit trail where every entry is attributable, every handoff is a named event, and Pete can answer "is this task done and trustworthy?" from the audit log alone, in under 2 minutes, without opening any file, any GitHub page, or any agent output.

**Test:** After QA reviews and calls `submit_qa_review_task_XX` with an outcome (`APPROVED` or `RETURNED`), query the full audit log for the task. Read only the stream events. Time how long it takes Pete to confidently reconstruct: what was built, what proof was submitted, what QA found, and what the outcome was.

**Pass:**
- Audit log contains at least one entry for each lifecycle moment: task activation, context card retrieval, proof template creation, code push (webhook), proof submission, QA request, QA review, final state transition
- Every entry has non-null `tool_name`, `actor`, `timestamp`
- Stream events narrate the full story in plain English — no technical knowledge required to read them
- Final task state is unambiguous from the audit log (`APPROVED` or `RETURNED`)
- Pete's reconstruction time: under 2 minutes
- If `RETURNED`: the QA review findings are in the audit log and Pete can see exactly what failed and why

**Fail:** Any lifecycle moment is missing from the audit log (chain of custody gap), the stream events require Pete to open documents to understand what happened, or Pete cannot determine the outcome state from the audit log alone. 

**Fallback:** If stream events are insufficient, enrich the text in `submit_qa_review` to include the outcome summary inline in the stream event (not just "QA review submitted" but "QA review submitted — APPROVED: all AC met, tests passing in correct environment"). This is a text change, not an architecture change.