# Nexus Server Test Plan — Phases 1 & 2
**Date:** 2026-03-01  
**Covers:** nexus/server.ts · nexus/schema.sql · nexus/db.ts  
**Method:** Live tool calls via VS Code MCP connection  
**Executor:** Nexus Server Reviewer (acting as probe runner)

---

## Pre-conditions
- Nexus server running and connected (no warnings in MCP panel)
- nexus/nexus.db exists (created on first startup)
- task-07 state is unknown — tests must handle prior state from earlier sessions

---

## Group A — Infrastructure (Phase 1 §1.2, §1.4)

### A1 — WAL mode active
```sql
-- Run in nexus.db
PRAGMA journal_mode;
-- EXPECTED: wal
```
PASS criterion: returns `wal`, not `delete`.

### A2 — All 5 tables present
```sql
SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;
-- EXPECTED: audit_log, documents, stream_events, tasks, tool_registry
```
PASS criterion: exactly 5 rows matching schema.sql. (sqlite_sequence is an internal SQLite table created automatically by AUTOINCREMENT — exclude it from the count.)

### A3 — audit_log has actor column
```sql
PRAGMA table_info(audit_log);
-- EXPECTED: column named 'actor' present
```
PASS criterion: `actor` column exists with no NOT NULL constraint (nullable for tool_name-only writes).

---

## Group B — Universal tools (Phase 1 §1.3)

### B1 — get_context_card: task not found → typed empty
- Call: `get_context_card { task_id: "task-99" }`
- EXPECTED: `{"task_id":"task-99","found":false,"message":"Task not found in Nexus."}`
- PASS criterion: no raw SQL error, no schema column names leaked, `found: false` present.

### B2 — get_context_card: task found → returns row
- Pre-condition: `task-07` must exist (run B2 after Group C if needed)
- Call: `get_context_card { task_id: "task-07" }`
- EXPECTED: JSON object with `id`, `title`, `state` keys.
- PASS criterion: `state` is `CLAIMED`, no extra columns.

### B3 — raise_uncertainty: writes stream_events AND audit_log
- Call: `raise_uncertainty { task_id: "task-07", description: "Test uncertainty — probe run" }`
- EXPECTED response: `"Uncertainty raised. Visible in stream and recorded in audit log."`
- Verify stream_events:
  ```sql
  SELECT description FROM stream_events WHERE task_id = 'task-07' ORDER BY id DESC LIMIT 1;
  -- EXPECTED: '⚠️ UNCERTAINTY: Test uncertainty — probe run'
  ```
- Verify audit_log:
  ```sql
  SELECT tool_name, actor FROM audit_log WHERE task_id = 'task-07' AND tool_name = 'raise_uncertainty' ORDER BY id DESC LIMIT 1;
  -- EXPECTED: tool_name='raise_uncertainty', actor='agent'
  ```
- PASS criterion: both rows present. Phase doc omitted the audit write — implementation added it. Both must exist.

### B4 — raise_uncertainty: valid at any task state
- Call with a task that does not exist in DB: `raise_uncertainty { task_id: "task-00", description: "State-agnostic test" }`
- EXPECTED: success response (uncertainty writes are never blocked by lifecycle state).
- PASS criterion: no error returned.

---

## Group C — activate_task (Phase 2 §2.2)

### C1 — activate_task: normal path
- Pre-condition: task-07 must not be in CLAIMED state. If it is from prior session, use `task-77` for this test.
- Call: `activate_task { task_id: "task-77", title: "Probe task — OCAP test" }`
- EXPECTED response: `"Task task-77 activated. Scoped tools registered."`
- Verify tasks table:
  ```sql
  SELECT state FROM tasks WHERE id = 'task-77';
  -- EXPECTED: CLAIMED
  ```
- Verify audit_log:
  ```sql
  SELECT action, actor FROM audit_log WHERE task_id = 'task-77' AND tool_name = 'activate_task';
  -- EXPECTED: action='Task activated — state → CLAIMED', actor='agent'
  ```
- Verify tool_registry:
  ```sql
  SELECT role, tools FROM tool_registry WHERE task_id = 'task-77';
  -- EXPECTED: role='task-performer', tools is JSON array of 4 tool names
  ```
- PASS criterion: task CLAIMED, audit row present, 4 tools registered, VS Code tool list shows `read_task_spec_task_77` etc.

### C2 — activate_task: idempotency guard (state ≠ DEFINED)
- Pre-condition: task-77 is CLAIMED from C1.
- Call: `activate_task { task_id: "task-77", title: "Duplicate activation" }`
- EXPECTED: `"Task task-77 is already in state CLAIMED. Cannot re-activate."`
- PASS criterion: error message returned, state unchanged, no second audit row for this call.

### C3 — OCAP proof: task-78 tools do not exist
- Do NOT call activate_task for task-78.
- Verify VS Code tool list contains no `read_task_spec_task_78`, `write_proof_template_task_78`, etc.
- Verify tool_registry:
  ```sql
  SELECT * FROM tool_registry WHERE task_id = 'task-78';
  -- EXPECTED: 0 rows
  ```
- PASS criterion: no task-78 tools accessible. This is the OCAP proof point per Phase 2 §2.3.

---

## Group D — Task-scoped write tools (Phase 2 §2.1)

All D-group tests use `task-77` (activated in C1).

### D1 — write_proof_template_task_77: normal path
- Call: `write_proof_template_task_77 { content: "## Proof Template\n\nCommands run:\n\nOutput:\n\nVerdict:" }`
- EXPECTED: `"proof_template written (v1)."`
- Verify:
  ```sql
  SELECT doc_type, version FROM documents WHERE task_id = 'task-77' AND doc_type = 'proof_template';
  -- EXPECTED: doc_type='proof_template', version=1
  ```
  ```sql
  SELECT tool_name, content_hash, actor FROM audit_log WHERE task_id = 'task-77' AND tool_name = 'write_proof_template_task_77';
  -- EXPECTED: 1 row, actor='agent', content_hash non-null
  ```
- PASS criterion: document written, audit row present with content_hash.

### D2 — write_proof_template_task_77: second write increments version
- Call again with different content.
- EXPECTED: `"proof_template written (v2)."`
- Verify: version=2 row exists in documents.
- PASS criterion: v2 row written, v1 row preserved (no overwrite).

### D3 — append_work_log_task_77: first entry creates document
- Call: `append_work_log_task_77 { entry: "Started implementation. Reading context card." }`
- EXPECTED: `"Entry appended to work_log (v1)."`
- PASS criterion: work_log v1 document present, audit row present.

### D4 — append_work_log_task_77: second entry concatenates
- Call: `append_work_log_task_77 { entry: "Wrote proof template." }`
- EXPECTED: `"Entry appended to work_log (v2)."`
- Verify:
  ```sql
  SELECT content FROM documents WHERE task_id = 'task-77' AND doc_type = 'work_log' AND version = 2;
  -- EXPECTED: content contains both entries separated by \n\n
  ```
- PASS criterion: v2 content contains both entries.

### D5 — read_task_spec_task_77: typed empty when no spec exists
- Call: `read_task_spec_task_77`
- EXPECTED: `{"task_id":"task-77","doc_type":"task_spec","found":false,...}`
- PASS criterion: no error, `found: false` in response.

---

## Group E — Temporality guards

### E1 — write blocked when state ≠ CLAIMED
- Pre-condition: need a task in DEFINED state. Insert directly:
  ```sql
  INSERT OR REPLACE INTO tasks (id, title, state) VALUES ('task-defined', 'Defined only', 'DEFINED');
  ```
- Activate task-defined tools by calling `activate_task { task_id: "task-defined", title: "Defined only" }` — wait, this sets CLAIMED. Instead use the DB to force state back:
  ```sql
  UPDATE tasks SET state = 'DEFINED' WHERE id = 'task-defined';
  ```
- Call: `write_proof_template_task_defined { content: "test" }`
- EXPECTED: error containing `"Writes require CLAIMED state."`
- PASS criterion: error returned, no document written, no audit row.

### E2 — submit_proof blocked without proof_template
- Pre-condition: task-77 is CLAIMED, has no proof submitted yet.
- Temporarily use a fresh task with no proof_template: `task-88`
  ```sql
  INSERT OR REPLACE INTO tasks (id, title, state) VALUES ('task-88', 'No template task', 'CLAIMED');
  INSERT OR REPLACE INTO tool_registry (task_id, role, tools) VALUES ('task-88', 'task-performer', '[]');
  ```
- Restart or re-register task-88 tools, then call: `submit_proof_task_88 { content: "Early proof" }`
- EXPECTED: `"Error: no proof_template found for task-88. Write the proof template before submitting proof."`
- PASS criterion: error returned, state unchanged (still CLAIMED), no proof document written.

### E3 — submit_proof blocked when state = PROOFSUBMITTED
- This will be verifiable after Group F runs (run E3 after F1).

---

## Group F — submit_proof compound tool (Phase 2 §2.1)

### F1 — submit_proof: full happy path
- Pre-condition: task-77 is CLAIMED, proof_template exists (from D1/D2).
- Call: `submit_proof_task_77 { content: "All commands passed. Schema verified. OCAP proof: task-78 tools absent." }`
- EXPECTED: `"Proof submitted. Task state: PROOFSUBMITTED."`
- Verify all 4 compound side-effects atomically:
  ```sql
  -- 1. Document written
  SELECT doc_type, version FROM documents WHERE task_id = 'task-77' AND doc_type = 'proof';
  -- EXPECTED: proof v1

  -- 2. State transitioned
  SELECT state FROM tasks WHERE id = 'task-77';
  -- EXPECTED: PROOFSUBMITTED

  -- 3. Stream event written
  SELECT description FROM stream_events WHERE task_id = 'task-77' ORDER BY id DESC LIMIT 1;
  -- EXPECTED: '✅ Proof submitted for task-77 — awaiting QA'

  -- 4. Audit log entry written
  SELECT tool_name, action, actor FROM audit_log WHERE task_id = 'task-77' AND tool_name = 'submit_proof_task_77';
  -- EXPECTED: action='Proof submitted — state → PROOFSUBMITTED', actor='agent'
  ```
- PASS criterion: all 4 rows present. If any are missing, the transaction failed partially — record which are absent.

### F2 — submit_proof blocked after F1 (state guard — E3)
- Call immediately after F1: `submit_proof_task_77 { content: "Duplicate submission" }`
- EXPECTED: `"Error: task task-77 is in state PROOFSUBMITTED. Proof submission requires CLAIMED state."`
- PASS criterion: error returned, no second proof document written, state still PROOFSUBMITTED.

---

## Group G — Startup re-registration

### G1 — CLAIMED tasks re-register on restart
- Pre-condition: task-77 is PROOFSUBMITTED from Group F. Create a fresh CLAIMED task:
  ```sql
  INSERT OR REPLACE INTO tasks (id, title, state) VALUES ('task-restart', 'Restart test', 'CLAIMED');
  INSERT OR REPLACE INTO tool_registry (task_id, role, tools) VALUES ('task-restart', 'task-performer', '["read_task_spec_task_restart"]');
  ```
- Restart the Nexus server.
- Verify: `read_task_spec_task_restart` appears in VS Code tool list without calling `activate_task`.
- PASS criterion: tool present after restart. This proves the startup re-registration loop works.

---

## Pass/Fail Results — 2026-03-01

| Test | Result | Notes |
|---|---|---|
| A1 WAL mode | PASS | `journal_mode = wal` confirmed |
| A2 All 5 tables | PASS | 5 user tables present (sqlite_sequence excluded — see test fix above) |
| A3 actor column | PASS | nullable TEXT, present in audit_log |
| B1 get_context_card not found | PASS | `{"task_id":"task-99","found":false,...}` — no schema leak |
| B2 get_context_card found | PASS | task-07 CLAIMED — returns id, title, state |
| B3 raise_uncertainty both writes | PASS | stream_events + audit_log both written in transaction |
| B4 raise_uncertainty any state | PASS | task-00 (non-existent) — no error |
| C1 activate_task normal | PASS | Verified post-restart with task-91: `"Task task-91 activated. Scoped tools registered."` — state CLAIMED, audit row, 4 tools in registry. Notification fix confirmed. |
| C2 activate_task idempotency guard | PASS | Returns "already in state CLAIMED" — returns before notification call |
| C3 OCAP proof task-78 absent | PASS | `read_task_spec_task_78` absent from tool list; 0 rows in tool_registry |
| D1 write_proof_template v1 | PASS | `proof_template written (v1).` — doc and audit written |
| D2 write_proof_template v2 | PASS | `proof_template written (v2).` — v1 preserved, v2 added |
| D3 append_work_log v1 | PASS | `Entry appended to work_log (v1).` |
| D4 append_work_log concatenation | PASS | v2 content contains both entries separated by `\n\n` |
| D5 read_task_spec typed empty | PASS | `found: false` — no error, no schema leak |
| E1 write blocked on DEFINED | PASS | Activated task-91 (→CLAIMED), forced state→DEFINED via SQL, called `write_proof_template_task_91` → `"Task task-91 is in state DEFINED. Writes require CLAIMED state."`. 0 docs written, 0 spurious audit entries. |
| E2 submit_proof blocked no template | PASS | Used task-91 (CLAIMED, no template written). Called `submit_proof_task_91` → `"Error: no proof_template found for task-91. Write the proof template before submitting proof."`. State and docs unchanged. |
| F1 submit_proof happy path (4 side-effects) | PASS | All 4 confirmed: proof doc v1, state→PROOFSUBMITTED, stream event, audit entry |
| F2 submit_proof blocked on PROOFSUBMITTED | PASS | Returns correct error immediately |
| G1 startup re-registration | PASS | After server restart: called `read_task_spec_task_07` (never manually registered this session) → `{"found":false}` ✅. Tool existed because startup loop re-registered task-07 from tool_registry. |

**OVERALL VERDICT:** PASS — 20/20 tests pass. All 4 previously-deferred tests executed 2026-03-01 post-restart: C1 (notification fix confirmed), E1 (write guard), E2 (submit guard), G1 (startup re-registration).

**One test plan fix applied:** A2 query updated to exclude `sqlite_sequence` (internal SQLite table).

---

## Deviations from Phase Docs — Verification

| # | Phase doc said | Implementation did | Verdict |
|---|---|---|---|
| 1 | `raise_uncertainty` writes stream_events only | Also writes audit_log | INTENDED ✅ — ONE §Accountability requires it |
| 2 | `activate_task` has no audit write | Audit write added | INTENDED ✅ |
| 3 | `submit_proof` has no audit write | Audit write added inside transaction | INTENDED ✅ |
| 4 | `submit_proof` has no state precondition check | Rejects if state ≠ CLAIMED | INTENDED ✅ — ONE §Temporality |
| 5 | `submit_proof` has no proof_template check | Rejects if no template found | INTENDED ✅ — ONE §Quality |
| 6 | `server.notification()` | `server.server.notification().catch()` | INTENDED ✅ — SDK API difference + async error guard |
