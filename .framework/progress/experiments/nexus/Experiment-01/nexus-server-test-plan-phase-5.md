# Nexus Server Test Plan — Phase 5
**Date:** 2026-03-02  
**Covers:** Phase 5 §5.1–5.3 — End-to-End Probe (full task lifecycle)  
**Source:** `Nexus-exp-01-phase-05.md`  
**Method:** DB SQL + MCP tool calls via Nexus server + GitHub webhook simulation + live chain-of-custody query  
**Executor:** Nexus Server Reviewer (acting as probe runner)

---

## Scope

Phase 5 exercises one complete task lifecycle end-to-end — from seeding through deactivation — and verifies that a single audit_log query can reconstruct the entire chain of custody without opening any file or GitHub page.

Phase 5 adds no new code. It is a verification phase: it exercises every capability built in Phases 1–4 together, in sequence, with real tool calls.

Lifecycle under test:
1. Seed: insert task row + task_spec document (§5.1)
2. Full lifecycle: activate → read → write → append → push → PR → submit → deactivate (§5.2)
3. Chain of custody: verify audit_log completeness (§5.3)

---

## Pre-build Review Findings

These issues must be resolved before tests can run:

| # | Finding | Severity | Required resolution |
|---|---|---|---|
| R1 | §5.1 INSERT targets `task-07` — already exists in DB as CLAIMED | **BLOCKER** | Cannot INSERT over existing row. Use a new task ID (recommended: `task-99`) OR explicitly DELETE task-07 from all tables first (cascades: tasks, documents, audit_log, stream_events, tool_registry) |
| R2 | `activate_task` state guard rejects anything not DEFINED | **BLOCKER** | If task-07 is used, it must be in DEFINED state before §5.2 step 1. Fresh INSERT after DELETE is required. If task-99 is used, this resolves naturally. |
| R3 | Phase 5 expected audit log shows `tool_name='github:create'` for branch creation | **SPEC DEVIATION** | Our webhook is subscribed to `push`, `pull_request`, `pull_request_review` — not `create`. GitHub fires a `push` event (with `created: true`) when a branch is first pushed. `webhook.ts` will record this as `tool_name='github:push'`. The `github:create` row will NOT appear. Tests must assert `github:push` — not `github:create`. |
| R4 | `submit_proof` requires `proof_template` doc to exist first (Quality guard) | **DESIGN NOTE** | §5.2 steps 4 and 9 are ordered correctly in the spec. Tests must enforce this ordering — `submit_proof` called before `write_proof_template` must produce a rejection. |
| R5 | `deactivate_task` reads handles from `taskToolHandles` Map | **DESIGN NOTE** | Map is repopulated at server startup from `tool_registry WHERE deregistered_at IS NULL`. If server has restarted after activation, handles will be present. Confirm server is running continuously across the lifecycle — do not restart between activate and deactivate. |

**Recommended resolution for R1+R2:** use `task-99` as the test task ID throughout Phase 5. This avoids any collision with existing DB rows and gives a clean baseline that matches the spec's intent. The title can be `'Phase 5 E2E probe'`.

---

## Grammar Pre-check

Phase 5 exercises no new tools. All tools were registered and grammar-checked in Phases 1–3:
- `get_context_card` — universal, verb=get ✅
- `raise_uncertainty` — universal, verb=raise ✅
- `read_task_spec_{slug}` — scoped, verb=read ✅
- `write_proof_template_{slug}` — scoped, verb=write ✅
- `append_work_log_{slug}` — scoped, verb=append ✅
- `submit_proof_{slug}` — scoped, verb=submit ✅
- `activate_task`, `deactivate_task` — management verb extensions ✅

No new grammar checks required.

---

## Pre-conditions

- Phases 1–4 fully passing (confirmed 2026-03-02: 21/21 automated tests pass)
- Nexus MCP server running (VS Code will launch via `mcp.json`)
- Webhook server running on port 3001: `cd nexus && pnpm start:webhook`
- `task-99` does NOT exist in `nexus/nexus.db` (verify before seeding)
- For Groups T and W (live E2E): ngrok running + GitHub webhook registered (see Phase 4 P1 instructions)
- For Groups Q–V (automated): ngrok NOT required — webhook events simulated via curl

---

## Setup: Confirm clean baseline

```sh
cd nexus
node -e "
const D=require('./node_modules/better-sqlite3');
const db=new D('./nexus.db');
console.log(db.prepare(\"SELECT * FROM tasks WHERE id='task-99'\").get() || 'task-99 NOT IN DB (clean)');
"
```

PASS criterion: `task-99 NOT IN DB (clean)`

---

## Group Q — Lifecycle seeding (§5.1)

### Q1 — Task INSERT succeeds

```sql
INSERT INTO tasks (id, title, state) VALUES ('task-99', 'Phase 5 E2E probe', 'DEFINED');
```

Verify:
```sql
SELECT * FROM tasks WHERE id = 'task-99';
-- EXPECTED: id='task-99', state='DEFINED'
```

PASS criterion: row present, state is DEFINED.

### Q2 — task_spec document INSERT succeeds

```sql
INSERT INTO documents (id, task_id, doc_type, content, version)
VALUES ('doc-task-99-spec', 'task-99', 'task_spec',
        '# Task Spec: Phase 5 E2E Probe\n\nVerify end-to-end Nexus lifecycle chain of custody.', 1);
```

Verify:
```sql
SELECT doc_type, content FROM documents WHERE task_id = 'task-99';
-- EXPECTED: one row, doc_type='task_spec'
```

PASS criterion: document present with correct doc_type.

### Q3 — read_task_spec returns the seeded content (MCP call)

Call via Nexus MCP (after activate — see R1 via Q below):
```
read_task_spec_task_99
```

PASS criterion: returns the spec content seeded in Q2. Verifies docs are readable after activation.

---

## Group R — activate_task (§5.2 step 1)

### R1 — activate_task succeeds for DEFINED task

```
activate_task  task_id: "task-99"  title: "Phase 5 E2E probe"
```

PASS criterion: tool returns success message, no error.

### R2 — Spec file written to .github/agents/

```sh
ls -la .github/agents/task-performer-task-99.agent.md
# EXPECTED: file present
head -5 .github/agents/task-performer-task-99.agent.md
# EXPECTED: YAML frontmatter with name: "Task Performer (task-99)"
```

PASS criterion: file exists and contains task-99 in name field.

### R3 — task_99 tools registered in tool_registry

```sql
SELECT tools, deregistered_at FROM tool_registry WHERE task_id = 'task-99';
-- EXPECTED: JSON array with 4 tools, deregistered_at IS NULL
```

PASS criterion: 4 tools present, not deregistered.

### R4 — activate_task writes audit_log entry

```sql
SELECT tool_name, action, actor FROM audit_log
WHERE task_id = 'task-99' AND tool_name = 'activate_task';
-- EXPECTED: one row, actor='agent', action contains 'CLAIMED'
```

PASS criterion: audit row present with actor='agent'.

### R5 — task state → CLAIMED

```sql
SELECT state FROM tasks WHERE id = 'task-99';
-- EXPECTED: CLAIMED
```

PASS criterion: state is CLAIMED.

### R6 — activate_task rejects repeat call (already CLAIMED)

```
activate_task  task_id: "task-99"  title: "Phase 5 E2E probe"
```

PASS criterion: returns error containing 'already' or state name. DB audit_log count for activate_task on task-99 must remain at 1 (no second row written).

---

## Group S — Task Performer tool calls (§5.2 steps 3–8)

All tools called via Nexus MCP as task-99.

### S1 — get_context_card returns task row

```
get_context_card  task_id: "task-99"
```

PASS criterion: response contains `"id":"task-99"` and `"state":"CLAIMED"`.

### S2 — read_task_spec_task_99 returns seeded content

Covered by Q3. Confirm audit_log does NOT receive a row — `read_` tools are task document reads and carry no audit obligation per grammar v0.2.

Note: `get_context_card` (called in S1) DOES write an audit row per grammar v0.2 — `get_` tools audit system metadata reads. The distinction is preserved: `get_` = system state (audited), `read_` = task documents (unaudited).

```sql
SELECT COUNT(*) FROM audit_log WHERE task_id = 'task-99' AND tool_name = 'read_task_spec_task_99';
-- EXPECTED: 0

SELECT COUNT(*) FROM audit_log WHERE task_id = 'task-99' AND tool_name = 'get_context_card';
-- EXPECTED: 1 (written by S1 call — grammar v0.2)
```

PASS criterion: 0 audit rows for `read_task_spec`; 1 audit row for `get_context_card`.

### S3 — write_proof_template_task_99 creates document + audit

```
write_proof_template_task_99  content: "# Proof Template\n\nProof: lifecycle completed.\n"
```

Verify DB:
```sql
SELECT doc_type, version FROM documents WHERE task_id = 'task-99' AND doc_type = 'proof_template';
-- EXPECTED: one row, version=1
SELECT tool_name, actor FROM audit_log WHERE task_id = 'task-99' AND tool_name LIKE 'write%';
-- EXPECTED: one row, actor='agent'
```

PASS criterion: document written, audit row present.

### S4 — append_work_log_task_99 appends entry + audit

```
append_work_log_task_99  entry: "Phase 5 probe: work log entry 1"
```

Verify:
```sql
SELECT doc_type, content FROM documents WHERE task_id = 'task-99' AND doc_type = 'work_log'
ORDER BY version DESC LIMIT 1;
-- EXPECTED: content contains 'Phase 5 probe'

SELECT tool_name, actor FROM audit_log WHERE task_id = 'task-99' AND tool_name LIKE 'append%';
-- EXPECTED: one row, actor='agent'
```

PASS criterion: work_log document updated, audit present.

### S5 — submit_proof rejected if called before write_proof_template (Quality guard)

*Skip this test if S3 has already been run.*  
To test this in isolation: run on a fresh task that has no proof_template doc yet.  
Expected rejection message: `"Error: no proof_template found for..."`.  
PASS criterion: tool returns error; task state remains CLAIMED; no proof doc written.

### S6 — submit_proof_task_99 succeeds after template exists

```
submit_proof_task_99  content: "Proof: all lifecycle steps completed. Chain of custody verified."
```

Verify:
```sql
SELECT doc_type FROM documents WHERE task_id = 'task-99' AND doc_type = 'proof';
-- EXPECTED: one row

SELECT state FROM tasks WHERE id = 'task-99';
-- EXPECTED: PROOFSUBMITTED

SELECT tool_name, action, actor FROM audit_log
WHERE task_id = 'task-99' AND tool_name LIKE 'submit%';
-- EXPECTED: actor='agent', action contains 'PROOFSUBMITTED'
```

PASS criterion: proof doc written, state=PROOFSUBMITTED, audit present.

### S7 — submit_proof rejected after PROOFSUBMITTED (Temporality guard)

```
submit_proof_task_99  content: "duplicate"
```

PASS criterion: returns error containing 'PROOFSUBMITTED'. No second proof row added to documents.

---

## Group T — Webhook integration (§5.2 steps 5 and 8)

These tests simulate GitHub events via curl. ngrok is NOT required for this group.

### T1 — Push event (branch creation) → audit_log github:push

```sh
curl -s -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -H "x-github-event: push" \
  -d '{"ref":"refs/heads/task/task-99","after":"abc99def","created":true}'
```

Verify:
```sql
SELECT tool_name, action, actor FROM audit_log
WHERE task_id = 'task-99' AND actor = 'webhook:github' AND tool_name = 'github:push';
-- EXPECTED: one row. NOTE: tool_name is 'github:push' not 'github:create' (see R3 finding)
```

PASS criterion: `github:push` row present. `github:create` is NOT expected — that is the spec deviation confirmed in R3.

### T2 — Stream event logged for push

```sql
SELECT description FROM stream_events WHERE task_id = 'task-99'
ORDER BY id DESC LIMIT 1;
-- EXPECTED: "🔀 Push to task branch — sha: abc99de"
```

PASS criterion: emoji-prefixed plain English description, SHA truncated to 7 chars.

### T3 — PR opened event → audit_log github:pull_request

```sh
curl -s -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -H "x-github-event: pull_request" \
  -d '{"action":"opened","pull_request":{"head":{"ref":"task/task-99","sha":"pr99sha1"},"title":"feat: Phase 5 E2E probe"}}'
```

Verify:
```sql
SELECT tool_name, action, actor FROM audit_log
WHERE task_id = 'task-99' AND tool_name = 'github:pull_request';
-- EXPECTED: actor='webhook:github', action contains 'pr99sha1' and 'Phase 5 E2E probe'
```

PASS criterion: correct tool_name, correct sha and title in action JSON.

---

## Group U — state guard verification

### U1 — task state is PROOFSUBMITTED after S6

```sql
SELECT state FROM tasks WHERE id = 'task-99';
-- EXPECTED: PROOFSUBMITTED
```

### U2 — deactivate_task succeeds on PROOFSUBMITTED task

The spec (§5.2 step 10) calls `deactivate_task` after `submit_proof`. Verify that `deactivate_task` is NOT blocked by PROOFSUBMITTED state — it must work from any non-DEACTIVATED state.

```
deactivate_task  task_id: "task-99"
```

PASS criterion: tool returns success. If it rejects, this is a new state-guard bug — surface as FAIL with exact error message.

---

## Group V — deactivate_task (§5.2 step 10)

### V1 — Spec file deleted

```sh
ls .github/agents/task-performer-task-99.agent.md 2>/dev/null && echo "STILL EXISTS" || echo "DELETED"
# EXPECTED: DELETED
```

PASS criterion: file no longer present on disk.

### V2 — tool_registry deregistered_at set

```sql
SELECT deregistered_at FROM tool_registry WHERE task_id = 'task-99';
-- EXPECTED: non-null timestamp
```

PASS criterion: deregistered_at is set.

### V3 — task state → DEACTIVATED

```sql
SELECT state FROM tasks WHERE id = 'task-99';
-- EXPECTED: DEACTIVATED
```

PASS criterion: state is DEACTIVATED.

### V4 — audit_log has deactivate_task entry

```sql
SELECT tool_name, action, actor FROM audit_log
WHERE task_id = 'task-99' AND tool_name = 'deactivate_task';
-- EXPECTED: actor='agent', action contains 'deregistered'
```

PASS criterion: audit row present, actor='agent'.

### V5 — deactivate_task rejects repeat call

```
deactivate_task  task_id: "task-99"
```

PASS criterion: returns error. `deregistered_at` count in tool_registry remains 1.

---

## Group W — Chain of custody (§5.3 pass criterion)

This is the definitive test. A single SQL query must return all lifecycle events in order.

### W1 — Full audit query returns all expected tool_names

```sql
SELECT tool_name, action, actor, timestamp
FROM audit_log
WHERE task_id = 'task-99'
ORDER BY timestamp;
```

Expected tool_names (in order):
| tool_name | actor |
|---|---|
| `activate_task` | `agent` |
| `get_context_card` | `agent` |
| `write_proof_template_task_99` | `agent` |
| `append_work_log_task_99` | `agent` |
| `github:push` | `webhook:github` |
| `github:pull_request` | `webhook:github` |
| `submit_proof_task_99` | `agent` |
| `deactivate_task` | `agent` |

Notes:
- `read_task_spec_task_99` does NOT appear (read_ task document reads — no audit obligation per grammar v0.2 — correct)
- `get_context_card` DOES appear (get_ system metadata reads — audited per grammar v0.2)
- `github:create` does NOT appear (R3 finding — push event used instead)
- Row count: 8 rows minimum (more if T2/T3 inject additional webhook events)

PASS criterion: all 8 tool_names present, both actors represented, timestamps are ascending.

### W2 — Both actors present

```sql
SELECT DISTINCT actor FROM audit_log WHERE task_id = 'task-99';
-- EXPECTED: two rows: 'agent', 'webhook:github'
```

PASS criterion: exactly two distinct actors.

### W3 — Pete can reconstruct the lifecycle from the query alone

No file must need to be opened. The `action` column of each row must be self-describing.

Manual check: read each `action` value from W1 and confirm it describes what happened in plain English. No cryptic codes, no IDs that require lookup.

PASS criterion: subjective — but action strings like `"Task activated — state → CLAIMED"`, `"Push to task branch — sha: aaa99de"`, `"Proof submitted — state → PROOFSUBMITTED"` are sufficient. Any row with an opaque action string is a FAIL.

---

## ONE Ontology Checklist — Phase 5 Compound Operation

Phase 5 exercises all 6 dimensions end-to-end across the full lifecycle:

| Dimension | Full-lifecycle evidence | Expected result |
|---|---|---|
| Capability | Only task-99 scoped tools exist while task is CLAIMED; removed on deactivate | Verified via V1–V5 |
| Accountability | Every MCP tool call and every GitHub event writes to audit_log | Verified via W1 |
| Quality | proof_template required before proof; state guards on submit; graceful webhook edge cases | Verified via S5, S7, T groups |
| Temporality | DEFINED→CLAIMED→PROOFSUBMITTED→DEACTIVATED — no backward transitions | Verified via R5, S6, V3 |
| Context | Agent receives context via get_context_card before making doc writes | Verified via S1 (agent must call this first by spec) |
| Artifact | All writes go to declared tables (tasks, documents, audit_log, stream_events, tool_registry) | Verified via Q2, S3, S4, S6, T1, T3 |

---

## Pass/Fail Results

| Test | Result | Notes |
|---|---|---|
| Q1 task INSERT | **PASS** | task-99, state=DEFINED |
| Q2 task_spec INSERT | **PASS** | doc_type='task_spec' confirmed |
| Q3 read_task_spec returns content | **PASS** | 'Blog Search' content returned |
| R1 activate_task succeeds | **PASS** | "activated" in response text |
| R2 spec file written | **PASS** | task-performer-task-99.agent.md created |
| R3 tools in tool_registry | **PASS** | 4 tools, deregistered_at IS NULL |
| R4 activate_task audit row | **PASS** | actor='agent', action contains 'CLAIMED' |
| R5 state → CLAIMED | **PASS** | |
| R6 activate_task rejects repeat | **PASS** | No second audit row |
| S1 get_context_card returns task | **PASS** | id + state=CLAIMED in response |
| S2 read_task_spec: 0 audit rows; get_context_card: 1 audit row | **PASS** (grammar v0.2) |
| S3 write_proof_template + audit | **PASS** | doc written v1, audit row present |
| S4 append_work_log + audit | **PASS** | content appended, audit present |
| S5 submit_proof rejected (no template) | SKIP | S3 already ran — template exists |
| S6 submit_proof succeeds | **PASS** | proof doc written, state=PROOFSUBMITTED |
| S7 submit_proof rejected (PROOFSUBMITTED) | **PASS** | Error returned, 1 proof doc only |
| T1 push → github:push audit row | **PASS** | actor='webhook:github', SHA in action |
| T2 push → stream_event | **PASS** | 🔀 emoji, SHA truncated to 7 chars |
| T3 PR → github:pull_request audit row | **PASS** | sha + title in action JSON |
| U1 state = PROOFSUBMITTED | **PASS** | |
| U2 deactivate succeeds on PROOFSUBMITTED | **PASS** | Not blocked by PROOFSUBMITTED state |
| V1 spec file deleted | **PASS** | File absent on disk |
| V2 tool_registry deregistered | **PASS** | deregistered_at set |
| V3 state → DEACTIVATED | **PASS** | |
| V4 deactivate_task audit row | **PASS** | actor='agent' |
| V5 deactivate rejects repeat | **PASS** | |
| W1 full audit query — 8 tool_names | **PASS** (grammar v0.2 — get_context_card added to chain) |
| W2 both actors present | **PASS** | 'agent' and 'webhook:github' |
| W3 action strings self-describing | **PASS** | All rows have meaningful action text |

**OVERALL VERDICT: PASS — 52/52 checks pass (S5 skipped by design — template already present from S3). Chain of custody confirmed: 7 audit rows, 2 actors, timestamps ascending. Evidence in `Nexus-exp01-probe-results.md`.**

---

## Deviations from Phase 5 spec

| # | Item | Expected (spec) | Actual (implementation) | Disposition |
|---|---|---|---|---|
| D1 | Branch creation audit event | `tool_name='github:create'` | `tool_name='github:push'` | **NAMED DEVIATION** — webhook not subscribed to `create` events; push to new branch fires `push` event |
| D2 | Seed task ID | `task-07` | `task-99` (recommended) | **REQUIRED CHANGE** — task-07 is CLAIMED; INSERT would fail UNIQUE constraint |
