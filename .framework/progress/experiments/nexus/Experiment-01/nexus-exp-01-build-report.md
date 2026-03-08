# Nexus Experiment 01 — Build Report
**Date:** 2026-03-01  
**Status:** Phases 1–3 complete and verified. Phase 4 implemented, pending install + test.

---

## What was built

### Phase 1 — Foundation
**Status: COMPLETE · Verified: 20/20 tests (phases 1+2 plan)**

| File | Purpose |
|---|---|
| `nexus/schema.sql` | 5 SQLite tables: `tasks`, `documents`, `audit_log`, `stream_events`, `tool_registry` |
| `nexus/db.ts` | Singleton DB connection · WAL mode · CWD-independent path · idempotent schema apply |
| `nexus/server.ts` (initial) | MCP STDIO server · `get_context_card` + `raise_uncertainty` universal tools |
| `nexus/package.json` | `@modelcontextprotocol/sdk`, `better-sqlite3`, `zod`, `tsx`, `typescript` |
| `nexus/tsconfig.json` | `NodeNext` module resolution · strict mode |
| `nexus/.nvmrc` | Pins Node 22 (required for better-sqlite3 native build) |
| `.vscode/mcp.json` | Nexus MCP server entry with absolute Node 22 + tsx paths |

**Key decisions:**
- `better-sqlite3` requires Node 22 — no prebuilts for Node 25. Absolute path to `/Users/peteargent/.nvm/versions/node/v22.21.1/bin/node` in mcp.json.
- VS Code launches MCP servers without shell environment — all paths must be absolute.
- tsx invoked via `node nexus/node_modules/tsx/dist/cli.mjs` (not shell shim).

---

### Phase 2 — OCAP Dynamic Tool Registration
**Status: COMPLETE · Verified: 20/20 tests**

`nexus/server.ts` extended with:

| Addition | Purpose |
|---|---|
| `registerTaskTools(task_id)` | Registers 4 task-scoped tools per active task; stores `RegisteredTool` handles in `taskToolHandles` Map |
| `read_task_spec_{slug}` | Read task specification document |
| `write_proof_template_{slug}` | Write proof template (CLAIMED state guard + audit) |
| `append_work_log_{slug}` | Append entry to work log (CLAIMED state guard + audit) |
| `submit_proof_{slug}` | Compound tool: write proof + state→PROOFSUBMITTED + stream event + audit (atomic transaction) |
| `activate_task` | Management tool: DEFINED→CLAIMED gate + audit write + `registerTaskTools()` |
| Startup re-registration loop | Re-registers CLAIMED tasks from `tool_registry` on server restart |

**Key decisions:**
- `server.tool()` returns `RegisteredTool` handle with `.remove()` — handles stored per task.
- Notification via `server.server.notification().catch()` — `McpServer` wraps `Server`; correct SDK path.
- All write tools check state before executing — `writeDocument()` and `appendDocument()` throw if state ≠ CLAIMED.

**Verified live:** E1 (write blocked on DEFINED), E2 (submit blocked without template), G1 (startup re-registration), C1 (notification fix post-restart).

---

### Phase 3 — Per-Task Agent Spec Generation + deactivate_task
**Status: COMPLETE · Verified: 13/13 tests (+ H7 conditional)**

| File / Change | Purpose |
|---|---|
| `.github/agents/task-performer.template.md` | Template with `{{TASK_ID}}`, `{{TASK_SLUG}}`, `{{TASK_TITLE}}` · 6 tools in frontmatter · `claude-sonnet-4-5` |
| `nexus/server.ts` — imports | Added `fs`, `path`, `url` imports; `__root` constant (workspace root) |
| `nexus/server.ts` — `agentSpecPath()` | Absolute path to generated `.agent.md` file |
| `nexus/server.ts` — `renderAgentSpec()` | Reads template; replaces all 3 tokens; throws if template missing |
| `nexus/server.ts` — `ToolHandle` type + `taskToolHandles` Map | Stores `RegisteredTool` handles per task for revocation |
| `nexus/server.ts` — `activate_task` extended | Renders + writes spec before DB transaction; compensating `unlinkSync` if DB fails |
| `nexus/server.ts` — `deactivate_task` | New management tool: `.remove()` all handles + delete spec + `deregistered_at` + state→DEACTIVATED + audit |

**Key decisions:**
- Fail-fast before DB write: `renderAgentSpec()` throws if template missing → error returned, 0 DB writes (H7 confirmed live).
- State after deactivation: `DEACTIVATED` (not `DEFINED`) — prevents re-activation via existing state guard.
- `deactivate_task` is a management verb — intentional extension beyond the 8-verb grammar set, same rationale as `activate_task`.
- Startup loop does NOT regenerate spec files — only re-registers tools from `tool_registry WHERE deregistered_at IS NULL`.

**Verified live:** H1–H7 (template + spec generation + atomicity), I1–I4 (deactivate normal + idempotency + not-found), J1–J2 (OCAP revocation + registry correctness).

---

### Phase 4 — GitHub Webhook Integration
**Status: IMPLEMENTED · Pending: install + type-check + test**

| File | Purpose |
|---|---|
| `nexus/webhook-parser.ts` | `GitHubPayload` typed interface · `extractTaskId()` (push + PR branch extraction) · `formatStreamEvent()` (plain English for stream_events) |
| `nexus/webhook.ts` | Fastify server on `:3001` · `POST /webhook/github` handler · atomic `db.transaction()` · `host: 0.0.0.0` for ngrok |
| `nexus/package.json` | Added `fastify: ^5.0.0` + `start:webhook` script |
| `.vscode/mcp.json` | Added `github` HTTP MCP entry (`https://api.githubcopilot.com/mcp/`) · nexus absolute paths unchanged |

**Key decisions over the phase doc:**
- N2 guard: missing/non-string `X-GitHub-Event` header returns `{ok:true}` without writing — prevents `github:undefined` rows.
- Atomic transaction wraps both `audit_log` + `stream_events` writes.
- `host: 0.0.0.0` — required for ngrok tunnel (phase doc omits this).
- `formatStreamEvent` defined in `webhook-parser.ts` (was referenced but undefined in phase doc).
- HMAC signature verification deferred — named in JSDoc with production hardening link.
- State gating on webhook writes deferred — webhook is a passive observer, not a gatekeeper.
- `logger: false` — Fastify JSON logs suppressed for clean terminal output.

---

## File inventory (current state)

```
nexus/
  db.ts                    ✅ Phase 1 — unchanged since
  schema.sql               ✅ Phase 1 — unchanged since
  server.ts                ✅ Phase 3 complete
  webhook.ts               ✅ Phase 4 — needs install + test
  webhook-parser.ts        ✅ Phase 4 — needs install + test
  package.json             ✅ Phase 4 — fastify added, needs pnpm install
  tsconfig.json            ✅ Phase 1
  .nvmrc                   ✅ Phase 1
  nexus.db                 live — contains test data from phases 1–3 test runs

.github/agents/
  task-performer.template.md        ✅ Phase 3
  nexus-server-builder.agent.md     ✅ reviewed + accepted
  nexus-webhook-builder.agent.md    ✅ reviewed + accepted
  nexus-probe-runner.agent.md       ✅ reviewed + accepted
  nexus-server-reviewer.agent.md    ✅ created this session

.vscode/
  mcp.json                 ✅ Phase 4 — nexus + github entries present

.framework/progress/experiments/nexus/
  nexus-server-test-plan-phases-1-2.md    ✅ 20/20 PASS
  nexus-server-test-results-phase-3.md    ✅ 13/13 PASS
  nexus-server-test-plan-phase-3.md       ✅ reference
  nexus-server-test-plan-phase-4.md       ✅ 18 tests ready to run
  nexus-exp-01-build-report.md            ← this file
```

---

## DB state (end of session)

| task_id | state | notes |
|---|---|---|
| task-07 | CLAIMED | tools registered; spec file present (Phase 3) |
| task-31 | DEACTIVATED | deactivated in Phase 3 test run |
| task-55 | — | never written (H7 atomicity test confirmed) |
| task-77 | PROOFSUBMITTED | full lifecycle test from Phase 2 |
| task-88 | — | never written (E2 test used task-91 instead) |
| task-91 | DEFINED | forced to DEFINED in E1 test; not reactivated |

---

## What needs to happen next

### Immediate — Phase 4 completion

**1. Install fastify**
```bash
cd nexus && pnpm install
```
This installs `fastify ^5.0.0` and updates `pnpm-lock.yaml`.

**2. Type-check both new files**
```bash
cd nexus && /Users/peteargent/.nvm/versions/node/v22.21.1/bin/node \
  node_modules/typescript/bin/tsc --noEmit
```
Expected: zero errors from `webhook.ts` and `webhook-parser.ts`.

**3. Start the webhook server (separate terminal from MCP server)**
```bash
cd nexus && /Users/peteargent/.nvm/versions/node/v22.21.1/bin/node \
  node_modules/tsx/dist/cli.mjs webhook.ts
# Expected output: "Nexus webhook server listening on :3001"
```

**4. Run test groups K–O (curl-based, no GitHub connectivity needed)**

Follow `nexus-server-test-plan-phase-4.md` groups K through O.  
All 17 tests in groups K–O can run with synthetic curl payloads.

Quick smoke test to start:
```bash
# K2: server up
curl -s http://localhost:3001/ 

# L1: push event → audit_log
curl -s -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/task/task-07","after":"abc123def456"}'
# Expected: {"ok":true}

# L2: stream_events verification (SQL)
# SELECT description FROM stream_events WHERE task_id='task-07' ORDER BY id DESC LIMIT 1;
```

**5. Phase 4 test plan: O1 + O2 (mcp.json checks)**
```bash
grep -A3 '"github"' .vscode/mcp.json        # O1
grep "nvm/versions/node/v22.21.1" .vscode/mcp.json  # O2
```

**6. P1 — Live E2E (requires external setup)**

Only if proceeding with the full §4.4 verification:
```bash
# Terminal 1: ngrok
ngrok http 3001

# Terminal 2: register webhook (replace URL + repo details)
gh api repos/futuresedge/ethical-ai-tools/hooks \
  --method POST \
  --field name=web \
  --field "config[url]=https://<ngrok-id>.ngrok.io/webhook/github" \
  --field "config[content_type]=json" \
  --field "events[]=push" \
  --field "events[]=pull_request" \
  --field "events[]=pull_request_review" \
  --field active=true
```
Then invoke the task-07 Task Performer agent in VS Code, have it push a branch named `task/task-07`, and verify `audit_log WHERE actor='webhook:github'`.

---

### After Phase 4 — Phase 5 (not yet specced)

Phase 5 is the probe runner — not yet implemented. The `nexus-probe-runner.agent.md` spec exists and has been reviewed (ACCEPTED). Likely covers automated verification runs against the live server.

---

## Known technical debt (recorded in code comments)

| Item | Location | Deferral rationale |
|---|---|---|
| HMAC signature verification | `webhook.ts` JSDoc | Phase 4 experiment only; ngrok URL = only access control |
| State gating on webhook writes | `webhook.ts` JSDoc | Webhook is a passive observer; gating is Phase 5+ concern |
| Hardcoded state transitions (`CLAIMED`, `PROOFSUBMITTED`, `DEACTIVATED`) | `server.ts` (3 locations) | Should be driven by `state_transitions` table + Policy Engine |
| `activate_` / `deactivate_` management verbs not in 8-verb grammar set | `server.ts` JSDoc | Intentional management-verb extension; recorded as deviation |
