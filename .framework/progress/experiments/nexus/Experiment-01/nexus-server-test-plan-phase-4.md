# Nexus Server Test Plan — Phase 4
**Date:** 2026-03-01  
**Covers:** Phase 4 §4.1–4.4 — GitHub Webhook Integration  
**Source:** `Nexus-exp-01-phase-04.md`  
**Method:** Direct HTTP calls (curl) + DB SQL + GitHub event simulation + live end-to-end  
**Executor:** Nexus Server Reviewer (acting as probe runner)

---

## Scope

Phase 4 adds:
1. `nexus/webhook.ts` — a standalone Fastify HTTP server on port 3001 (§4.1)
2. GitHub HTTP MCP server registration in `.vscode/mcp.json` (§4.2)
3. GitHub webhook registration via `gh api` + ngrok exposure (§4.3 — infrastructure, not code)
4. End-to-end verification: Task Performer pushes a branch → webhook fires → audit_log updated (§4.4)

The webhook server is a **separate process** from the MCP STDIO server. They share the same `nexus/nexus.db` via SQLite WAL mode (already configured).

---

## Pre-build Review Findings

These must be resolved in the implementation before tests can run:

| # | Finding | Severity | Required resolution |
|---|---|---|---|
| R1 | Fastify not in `nexus/package.json` | BLOCKER | Add `fastify` to dependencies; run `pnpm install` |
| R2 | `formatStreamEvent` referenced but never defined in phase doc | BLOCKER | Implementation must define this function |
| R3 | Phase doc uses `const payload = req.body as any` — TypeScript strict mode | WARNING | Must type or cast properly; avoid bare `any` |
| R4 | Phase doc mcp.json snippet uses `npx tsx` | WARNING | Keep existing absolute-path pattern; do not regress |
| R5 | No HMAC signature verification | NAMED DEFERRAL | Security gap — named as intentional for experiment; must record rationale |
| R6 | Webhook is a separate process | DESIGN NOTE | Needs its own launch mechanism; VS Code task or manual `pnpm tsx nexus/webhook.ts` |

---

## Grammar Pre-check

Phase 4 adds no new MCP tools to `server.ts`. The webhook writes directly to the DB.  
No NexusToolGrammar check required for `webhook.ts` itself — it is not an MCP tool server.  
The `actor` value `'webhook:github'` must match the schema comment in `schema.sql` — verify at K4.

---

## Pre-conditions

- Phase 1–3 fully passing (confirmed 2026-03-01)
- `nexus/webhook.ts` implemented and `fastify` installed
- Webhook server process running on port 3001 (separate from MCP server)
- `nexus/nexus.db` accessible to both processes (WAL mode — confirmed Phase 1)
- `task-07` exists in DB in CLAIMED state (confirmed from prior sessions)
- ngrok or equivalent tunnel running for §4.3 tests (required only for Group P live E2E)

---

## Group K — Webhook server infrastructure (§4.1)

### K1 — Fastify dependency installed
```sh
cat nexus/package.json | grep fastify
# EXPECTED: "fastify": "^5.x.x" (or similar)
```
```sh
ls nexus/node_modules/fastify
# EXPECTED: directory exists
```
PASS criterion: fastify present in package.json and installed.

### K2 — Webhook server starts on port 3001
```sh
# Run in background or separate terminal
pnpm tsx nexus/webhook.ts &
sleep 1
curl -s http://localhost:3001/
# EXPECTED: some response (even 404 is fine — confirms port is open)
```
PASS criterion: no `EADDRINUSE` or unhandled exception; port 3001 listening.

### K3 — Health: POST to unknown route returns non-500
```sh
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/unknown
# EXPECTED: 404 (Fastify default for unknown routes)
```
PASS criterion: 404, not 500 — confirms Fastify default error handling is working.

### K4 — actor value matches schema declaration
```sh
grep "actor" nexus/schema.sql
# EXPECTED: comment mentions 'webhook:github'
grep "webhook:github" nexus/webhook.ts
# EXPECTED: present in the INSERT statement
```
PASS criterion: `actor = 'webhook:github'` is literal-matched between schema comment and implementation.

### K5 — Webhook server imports db.ts (same DB, not a new connection)
```sh
grep "from.*db" nexus/webhook.ts
# EXPECTED: imports from './db.js' (same singleton as server.ts)
```
PASS criterion: shared db.ts import — both processes write to the same SQLite file via WAL.

---

## Group L — Push event handling (§4.1 core logic)

All L tests send synthetic GitHub-style POST payloads via curl. No real GitHub connection needed.

### L1 — Push event on task branch → audit_log entry
```sh
curl -s -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{
    "ref": "refs/heads/task/task-07",
    "after": "abc123def456",
    "action": null,
    "pull_request": null
  }'
# EXPECTED: {"ok":true}
```
Verify audit_log:
```sql
SELECT task_id, tool_name, action, actor FROM audit_log
WHERE task_id = 'task-07' AND tool_name = 'github:push'
ORDER BY id DESC LIMIT 1;
-- EXPECTED: task_id='task-07', tool_name='github:push', actor='webhook:github'
-- action: JSON string containing sha='abc123def456'
```
PASS criterion: `{"ok":true}` returned; audit_log row present with `actor='webhook:github'`.

### L2 — Push event → stream_event entry
Using the same push from L1:
```sql
SELECT task_id, description FROM stream_events
WHERE task_id = 'task-07'
ORDER BY id DESC LIMIT 1;
-- EXPECTED: a human-readable description of the push event
```
PASS criterion: stream_events row present with `task_id='task-07'` and a non-null description (formatStreamEvent output).

### L3 — branch extraction: `refs/heads/task/task-07` → `task-07`
The extraction logic in the phase doc:
```
branch = payload.ref.replace('refs/heads/', '') → 'task/task-07'
task_id = branch.startsWith('task/') ? branch.replace('task/', '') : null → 'task-07'
```
**Confirmed by L1** — if L1 audit_log row has `task_id='task-07'`, extraction is correct.

### L4 — Push event on non-task branch → no audit_log write
```sh
curl -s -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref": "refs/heads/main", "after": "abc123", "action": null}'
# EXPECTED: {"ok":true}
```
Verify:
```sql
SELECT COUNT(*) FROM audit_log WHERE task_id IS NULL AND tool_name = 'github:push';
-- EXPECTED: 0 (null task_id entries should not be written)
```
PASS criterion: `{"ok":true}` but NO new audit_log row or stream_event. Branch without `task/` prefix is silently ignored.

### L5 — Push event with missing ref → no crash
```sh
curl -s -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"action": "sync"}'
# EXPECTED: {"ok":true} — no server crash or 500
```
PASS criterion: webhook returns 200 `{"ok":true}`, server stays up. Empty/missing `ref` is handled by optional chaining (`payload.ref?.replace(...)`).

---

## Group M — Pull request event handling (§4.1)

### M1 — PR opened on task branch → audit_log entry
```sh
curl -s -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -d '{
    "action": "opened",
    "pull_request": {
      "head": { "ref": "task/task-07", "sha": "deadbeef" },
      "title": "feat: implement blog search"
    }
  }'
```
Verify audit_log:
```sql
SELECT task_id, tool_name, action, actor FROM audit_log
WHERE task_id = 'task-07' AND tool_name = 'github:pull_request'
ORDER BY id DESC LIMIT 1;
-- EXPECTED: actor='webhook:github'
-- action JSON should contain: action='opened', sha='deadbeef', title='feat: implement blog search'
```
PASS criterion: PR event creates audit_log row; `tool_name = 'github:pull_request'`.

### M2 — pr_review event
```sh
curl -s -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request_review" \
  -d '{
    "action": "submitted",
    "pull_request": {
      "head": { "ref": "task/task-07", "sha": "deadbeef" },
      "title": "feat: implement blog search"
    }
  }'
```
Verify: `tool_name = 'github:pull_request_review'` in audit_log.  
PASS criterion: review event handled; correct `tool_name`.

---

## Group N — Edge cases and error handling

### N1 — Invalid JSON body → no crash
```sh
curl -s -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -d 'NOT JSON'
# EXPECTED: HTTP 400 (Fastify content-type parse error) — NOT a 500 or server crash
```
PASS criterion: error response returned; webhook server continues running (send L1 payload after to confirm).

### N2 — Missing X-GitHub-Event header
```sh
curl -s -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -d '{"ref": "refs/heads/task/task-07", "after": "abc"}'
# EXPECTED: {"ok":true} or a graceful error — NOT a crash
```
PASS criterion: no server crash; `tool_name` in DB would be `github:undefined` or undefined handling documented.  
NOTE: Phase doc does `req.headers['x-github-event'] as string` — if header absent, value is `undefined`. Check: does `github:undefined` get written, or does implementation guard against it?

### N3 — Duplicate events (same SHA pushed twice) → two audit_log rows
The audit_log is append-only — no deduplication is expected. Verify:
- Send L1 payload twice.
- Verify two rows exist for the same SHA.
PASS criterion: both rows present. audit_log is an immutable ledger, not an idempotent store.

---

## Group O — mcp.json GitHub server registration (§4.2)

### O1 — GitHub MCP entry present in mcp.json
```sh
cat .vscode/mcp.json | grep -A3 '"github"'
# EXPECTED: entry with type: "http" and url: "https://api.githubcopilot.com/mcp"
```
PASS criterion: GitHub server registered; nexus entry unchanged (absolute paths preserved — R4).

### O2 — Nexus absolute-path entry unchanged after mcp.json edit
```sh
grep "nvm/versions/node/v22.21.1" .vscode/mcp.json
# EXPECTED: still present — implementation must not have replaced with npx/tsx shorthand
```
PASS criterion: absolute path to Node 22 preserved. Phase doc's `npx tsx` shorthand must NOT appear in the nexus entry.

---

## Group P — End-to-end live verification (§4.4)

**Requires:** ngrok running, GitHub webhook registered, GitHub MCP server available to Task Performer.

### P1 — Task Performer pushes branch via GitHub MCP → audit_log updated

Pre-conditions:
- task-07 Task Performer agent invoked in VS Code (spec file generated by Phase 3 `activate_task`)
- ngrok exposes `http://localhost:3001`
- GitHub webhook registered pointing to ngrok URL

Steps:
1. Run task-07 Task Performer in VS Code Copilot Chat.
2. Have it create a branch named `task/task-07` and push a commit using GitHub MCP tools.
3. Observe webhook server terminal for incoming POST.
4. Verify:
```sql
SELECT tool_name, action, actor, timestamp FROM audit_log
WHERE task_id = 'task-07' AND actor = 'webhook:github'
ORDER BY id DESC LIMIT 3;
-- EXPECTED: rows with tool_name='github:push', actor='webhook:github'
```
5. Verify stream_events:
```sql
SELECT description FROM stream_events WHERE task_id = 'task-07' ORDER BY id DESC LIMIT 1;
-- EXPECTED: human-readable push description from formatStreamEvent
```

PASS criterion: audit_log contains a row with `actor='webhook:github'` that Nexus did NOT generate via an MCP tool call. This is the single-source-of-truth proof point from §4.4.

---

## ONE Ontology Pre-checks for Phase 4

### `webhook.ts` as an Artifact producer (not an MCP tool)
The webhook is not an MCP tool and has no NexusToolGrammar name. However it interacts with all 6 dimensions:

| Dimension | Check | Expected |
|---|---|---|
| Capability | Webhook is not a tool — it has no OCAP enforcement. Any HTTP client can POST to port 3001. | NAMED DEFERRAL: HMAC signature verification (R5) deferred. For experiment: ngrok URL is the only access control. |
| Accountability | Every processed event writes to audit_log with `actor='webhook:github'` | Test: L1, M1 |
| Quality | Non-task branches silently ignored; malformed payloads handled gracefully | Test: L4, L5, N1, N2 |
| Temporality | Webhook writes regardless of task state — does NOT check `tasks.state` | NAMED DEFERRAL: state gating on webhook writes out of scope for Phase 4 |
| Context | No MCP context — event content must be sufficient in the action JSON | Test: L1 action column |
| Artifact | Writes to audit_log + stream_events (append-only) — doc_type not applicable | Test: L1, L2 |

---

## Pass/Fail Results

| Test | Result | Notes |
|---|---|---|
| K1 Fastify installed | **PASS** | `fastify ^5.x` present in package.json + node_modules |
| K2 Server starts on port 3001 | **PASS** | Server running (EADDRINUSE on second launch confirms prior instance active) |
| K3 Unknown route returns 404 | **PASS** | Fastify default 404 handler |
| K4 actor value matches schema | **PASS** | `'webhook:github'` literal in webhook.ts INSERT matches schema.sql comment |
| K5 Shared db.ts import | **PASS** | `import db from './db.js'` — same singleton file as server.ts |
| L1 Push event → audit_log | **PASS** | `ok:true`; audit row: `actor='webhook:github'`, SHA correct |
| L2 Push event → stream_event | **PASS** | `"🔀 Push to task branch — sha: abc123d"` |
| L3 Branch extraction correctness | **PASS** | `task_id='task-07'` confirmed via L1 audit row |
| L4 Non-task branch → no write | **PASS** | `ok:true`; 0 new DB rows for `refs/heads/main` |
| L5 Missing ref → no crash | **PASS** | `ok:true`; optional chaining handles missing `ref` |
| M1 PR opened → audit_log | **PASS** | `tool_name='github:pull_request'`, `actor='webhook:github'`; action has sha + title |
| M2 PR review → audit_log | **PASS** | `tool_name='github:pull_request_review'` |
| N1 Invalid JSON → no crash | **PASS** | HTTP 400 (Fastify parse error); server alive after |
| N2 Missing event header | **PASS** | `ok:true`; 0 DB writes — N2 guard fires before any write |
| N3 Duplicate events → two rows | **PASS** | 3 total push rows after second send; append-only ledger confirmed |
| O1 GitHub MCP entry in mcp.json | **PASS** | `type: "http"`, `url` contains `githubcopilot.com` |
| O2 Nexus absolute-path unchanged | **PASS** | `v22.21.1` path preserved; `npx tsx` shorthand not introduced |
| P1 Live E2E: agent push → audit_log | **PENDING** | Requires ngrok + GitHub webhook registration — infrastructure only |

**OVERALL VERDICT: PASS — 17/17 automated tests pass. P1 (live E2E) pending ngrok + GitHub webhook registration — infrastructure only, not a code gap.**

---

## Deviations Confirmed

| # | Area | Deviation | Verdict |
|---|---|---|---|
| 1 | `formatStreamEvent` | Defined in `webhook-parser.ts` (not in phase doc) — signature: `(event, payload) → string`; plain English with emoji prefix | INTENDED ✅ — phase doc referenced it without defining it |
| 2 | HMAC secret | Signature verification omitted | INTENDED ✅ — named deferral documented in webhook.ts JSDoc with production hardening link |
| 3 | `any` type | `GitHubPayload` typed interface used instead of `req.body as any` | INTENDED ✅ — TypeScript strict mode compliance |
| 4 | mcp.json nexus entry | Absolute path pattern preserved; `npx tsx` shorthand from phase doc NOT used | INTENDED ✅ — O2 confirmed |
| 5 | Webhook process startup | `start:webhook` script added to package.json; launch documented in build report | INTENDED ✅ — phase doc was silent on this |
| 6 | Null-branch events | `task_id = null` → no DB writes; `ok:true` returned | INTENDED ✅ — L4 confirmed |
| 7 | PR branch extraction | `pull_request.head.ref` has no `refs/heads/` prefix — handled by `??` fallback path | INTENDED ✅ — M1 confirmed, sha + title in action JSON |

---

## Deviations to Watch For

| # | Area | Potential deviation |
|---|---|---|
| 1 | `formatStreamEvent` | Not defined in phase doc — implementation invents the signature; test records actual format |
| 2 | HMAC secret | Phase doc omits signature verification — intentional deferral; must record rationale |
| 3 | `any` type | `req.body as any` — TypeScript strict mode; implementation may use `unknown` cast or a typed interface |
| 4 | mcp.json nexus entry | Phase doc snippet uses `npx tsx` — must NOT regress to shorthand; integration team must preserve absolute paths |
| 5 | Webhook process startup | Phase doc doesn't define how webhook.ts is launched; implementation must supply a launch mechanism |
| 6 | task_id null writes | Phase doc only writes when `task_id` is truthy — verify null-branch events cleanly silenced |
| 7 | PR branch extraction | PR uses `payload.pull_request.head.ref` (not `refs/heads/...` prefixed) — strip logic may differ from push |
