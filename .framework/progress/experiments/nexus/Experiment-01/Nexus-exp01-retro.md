# Nexus Experiment 01 — Retrospective
**Date:** 2026-03-02  
**Scope:** Phases 1–5 of Nexus Exp-01 — full lifecycle implementation and hypothesis verification  
**Format:** Framework Owner retro (learn + discard + carry forward)

---

## Experiment Summary

Nexus Experiment 01 asked whether a trust-based multi-agent coordination layer could be built on the VS Code MCP stack with structural — not policy-based — isolation between agents, and whether a single SQL query could reconstruct everything that happened in a task lifecycle.

**Result: All five hypotheses PASS.** The architecture is sound. The implementation is working. The experiment is complete.

---

## Hypothesis Outcomes

| # | Hypothesis | Verdict | Key finding |
|---|---|---|---|
| H1 | STDIO MCP server callable from VS Code, zero auth infrastructure | **PASS** | Server auto-launches from `mcp.json`; tool calls return DB data; no auth layer needed |
| H2 | Runtime tool registration/deregistration reflected live in VS Code | **PASS** | `tools/list_changed` triggers live UI refresh; fallback (static server instances) retired |
| H3 | Agent spec files hot-reloaded by VS Code on filesystem change | **PASS** | Appeared and disappeared in `@` selector within seconds; witnessed multiple times |
| H4 | GitHub webhook events attributed to `webhook:github` in audit_log | **PASS** | Parser, attribution, and filtering all correct; D1 deviation named (push not create) |
| H5 | Single SQL query reconstructs complete chain of custody | **PASS** | 8-row audit log covers full lifecycle; both actors; action strings self-describing |

---

## What Was Built

Five phases, building incrementally:

| Phase | Deliverable |
|---|---|
| 1 | MCP STDIO server + SQLite + `get_context_card` + `raise_uncertainty` |
| 2 | Dynamic tool registration — `activate_task`, 4 scoped tools per task, `deactivate_task` |
| 3 | Agent spec generation from template with placeholder hydration; `taskToolHandles` Map for atomic deregistration |
| 4 | Fastify webhook server (port 3001); `webhook-parser.ts`; GitHub MCP entry in `mcp.json` |
| 5 | Full E2E lifecycle probe; chain-of-custody verified; grammar v0.2 promoted |

**Files created:**
- `nexus/server.ts` — main MCP STDIO server (~420 lines)
- `nexus/webhook.ts` — Fastify HTTP server
- `nexus/webhook-parser.ts` — pure parsing functions for GitHub payloads
- `nexus/db.ts` — SQLite singleton, WAL mode
- `nexus/schema.sql` — 5 tables: tasks, documents, audit_log, stream_events, tool_registry
- `.github/agents/task-performer.template.md` — hydrated at activation time
- `.vscode/mcp.json` — Nexus STDIO entry + GitHub HTTP entry

---

## What Surprised Us

### 1. OCAP made authentication irrelevant, not just deferred
The original framing assumed authentication was a problem to solve later. The actual finding is that it is not a problem at all in this context. The MCP spec prohibits using session IDs for authorisation. OAuth tokens identify VS Code, not the agent. STDIO transport has no auth layer. Rather than these being gaps, they turned out to be irrelevant: OCAP tool possession is structurally stronger than identity checking. Absent capabilities cannot be used regardless of who is asking. The framing shifted from "we'll add auth later" to "auth is the wrong model."

### 2. VS Code hot-reloads both `.agent.md` files AND tool lists in the same session
H2 and H3 were treated as separate hypotheses with separate fallback paths. Both passed cleanly, and their mechanisms turn out to be composited in VS Code: `tools/list_changed` refreshes the tool selector; filesystem watch on `.github/agents/` refreshes the agent selector. Both fire on the same `activate_task` call. The result is that a task appears fully-formed in VS Code (agent + tools) within seconds of `activate_task`, and disappears completely on `deactivate_task`. This was the highest-risk hypothesis pair and it resolved with zero friction.

### 3. The grammar needed to evolve once confronted with the evidence
`get_` was initially defined as side-effect-free. The H5 chain-of-custody test revealed a real gap: if an agent reads context but produces no proof or document, the audit log has a hole — we know it acted, but not what information it was working from. Promoting `get_` to an audit-writing verb filled this without changing the architecture. The grammar is not just documentation; it is a design constraint that becomes visible under test. The test found it.

### 4. Two processes sharing one SQLite file required WAL mode — but it just worked
The webhook server (Fastify, port 3001) and the MCP server (STDIO) share `nexus.db`. WAL mode, set in `db.ts`, makes this safe for concurrent reads/writes. This was anticipated as a risk and handled proactively. It produced zero issues across all testing phases.

### 5. Tool naming is chain-of-custody data, not just organisation
This became clear when reading the verbatim audit log. `write_proof_template_task_99` tells you: verb (write), subject (proof_template), scope (task_99) — without any join to another table. Every audit row is self-describing. This was designed in (the grammar decision), but its value in practice exceeded the design intent. The full lifecycle was reconstructable by a human reading the audit log with no prior knowledge of the schema.

---

## What the Grammar Learned

NexusToolGrammar evolved once during this experiment:

**v0.1 (start):**

- `get_` — no audit obligation. "Read-only. No side effects."
- `read_` — no audit obligation. "Returns document content."

**v0.2 (2026-03-02, after H5 test):**
- `get_` — **writes one audit_log entry**. Rationale: records which system state the agent was working from. `get_` operates on system resources that may change (context cards are regenerated); the audit record captures the version an agent received.
- `read_` — unchanged. Task documents are versioned artefacts; the version number is the audit trail. An agent reading `proof_template v1` is recorded by the document version, not by an audit row.

The distinction that emerged: `get_` reads system state (mutable → audit); `read_` reads task documents (versioned → no audit needed). This distinction was not in the original design. The test found it.

---

## Named Deviations (carried forward as design decisions)

| # | Item | Spec said | Reality | Decision |
|---|---|---|---|---|
| D1 | Branch creation event | `github:create` | `github:push` (with `created: true`) | GitHub fires `push` on first branch push; `create` is a separate event we don't subscribe to. `github:push` is correct. |
| D2 | Phase 5 seed task ID | `task-07` | `task-99` | task-07 was CLAIMED at probe time. Probes should always use a dedicated test task ID that is cleaned up after. |
| D3 | Audit rows per phase spec | 9 | 8 (after grammar v0.2) | `read_task_spec` correctly absent (v0.2 grammar); `get_context_card` correctly present (v0.2 grammar). |

---

## Friction Points

### Friction 1 — Shell quoting in the terminal
Multi-line JSON strings in curl commands caused the shell to enter `dquote` state repeatedly across Phase 4 and Phase 5 testing. Every time this happened, the test run had to be abandoned and re-launched via a Node.js script. The fix was consistent and fast (create a `.mjs` runner), but the pattern repeated more than it should have.

**Carry forward:** Never use inline JSON curl for MCP/webhook testing. Always write a `.mjs` probe script. Codify this as a testing convention.

### Friction 2 — Review scripts used relative paths, broke in background terminal
The background terminal CWD is the workspace root, not `nexus/`. Scripts using `./nexus.db` or `./node_modules/better-sqlite3` failed silently or with cryptic errors. Fixed by using absolute paths via `join(__dir, ...)`.

**Carry forward:** All probe and review scripts must use `join(__dir, ...)` for all paths. `__dir` is always the script's own directory. Never rely on CWD.

### Friction 3 — Task-07 state collision across phases
Phase 5 spec targeted task-07. task-07 was CLAIMED from Phase 2/3 testing, which made the Phase 5 `INSERT` fail on UNIQUE constraint. The workaround (task-99) was quick but required a named deviation.

**Carry forward:** Define a convention: probe tasks use IDs in the `9x` range (task-90 through task-99). Production/real tasks use IDs defined in the `.framework` pipeline. Never let probe tasks bleed into the main task namespace.

### Friction 4 — Server restart not always visible to the reviewer
The MCP server is launched by VS Code — not in an observable terminal. During Phase 3 review, the first H2 test hit the pre-restart server (Phase 2 code), dirtied the DB, and required a cleanup run. The reviewer had no signal that the wrong server version was running.

**Carry forward:** Add a `SERVER_VERSION` constant to `server.ts` that the server logs on startup and returns in `initialize`. Phase-tagged versions (e.g., `nexus-v0.3`) let a reviewer confirm which code is running before executing tests.

---

## What the Experiment Did Not Prove

These remain open questions for Experiment 02 or later:

1. **Live GitHub traffic through ngrok.** All webhook tests used curl simulation. P1 (ngrok + real GitHub push) was described but not executed. This is infrastructure, not architecture — the parser and DB write are verified. But end-to-end from a real push event remains unconfirmed.

2. **A real agent implementation.** The Task Performer agent was instantiated (spec generated, tools registered) but never ran end-to-end with real work (real code change + real PR). Phase 5 was a lifecycle probe, not a real task. The chain of custody was generated by a script, not an agent making decisions.

3. **Concurrent agents on different tasks.** Two tasks were active simultaneously (task-07 and task-08 during H2). But both were accessed by the same chat session. True concurrent isolation — two separate Copilot Chat sessions, each running a different Task Performer, writing to the same DB — is unverified.

4. **Audit log at scale.** 8 rows per task. This is trivially small. The WHERE clause on `task_id` is fast because SQLite is fast at this scale. At 1,000 tasks × 50 events, the query still returns instantly — but this has not been tested.

5. **Grammar coverage for all 8 verbs.** Only `get_`, `read_`, `write_`, `append_`, `submit_` were exercised. `request_`, `search_`, and `raise_` were defined but not called in the E2E lifecycle.

---

## What to Carry Into Experiment 02

### Architecture decisions confirmed — no changes needed
- OCAP via tool possession ✅
- SQLite + WAL for concurrent multiprocess access ✅  
- Dynamic registration via `RegisteredTool.remove()` ✅
- Template hydration for agent specs ✅
- Webhook attribution with `actor='webhook:github'` ✅
- Grammar v0.2: `get_` audited, `read_` unaudited ✅

### Open design questions for Exp-02

1. **QA agent and state transitions.** The policy engine / state gating exists in `submit_proof` (tool-local guard) but there is no agent with authority to review a proof and advance state to `APPROVED`. Who calls `approve_task` and under what conditions?
2. **`request_` verb.** Not exercised. This is the verb for cross-agent collaboration (Task Performer requests QA review, Feature Owner requests prioritisation). Its audit and capability design needs real usage.
3. **Knowledge base and context cards.** `get_context_card` currently returns raw task row data. The richer vision (sprint learnings, patterns, anti-patterns composed into a briefing) was not built. When does this become necessary?
4. **Idempotent `activate_task`.** Currently `activate_task` rejects if task is already CLAIMED. Should restart-safe re-activation be supported? (i.e., re-registers tools without re-generating spec if spec already exists)

### Convention changes for Exp-02

- Probe task IDs: `task-9x` range, always cleaned up after
- Probe scripts: absolute paths via `__dir`, `.mjs` format, deleted after run
- Terminal testing: always use `.mjs` scripts, never inline curl JSON
- Server version: embed as constant in `server.ts`

---

## Overall Assessment

Nexus Experiment 01 set out to determine whether the architectural thesis was buildable and testable in a single day's work. It was. The five hypotheses were not just confirmed — they were confirmed with enough margin that the fallback paths (static server instances, closing chat panels, enriching action strings) were never needed.

The most important finding is not technical: it is that **the grammar is a design tool, not documentation**. The `get_` rule change was found by running the chain-of-custody test and noticing a hole. The test didn't just verify the system — it improved it. Build-test-improve loops this tight are only possible when the test criteria are precise enough to surface real gaps. The Hypothesis Cards and Test Plans did that work.

The framework is ready to run a real task.
