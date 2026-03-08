# Nexus Server Test Results — Phase 3
**Date:** 2026-03-01  
**Test plan:** `nexus-server-test-plan-phase-3.md`  
**Executor:** Nexus Server Reviewer (live, acting as probe runner)  
**Server:** Phase 3 implementation loaded (post-restart confirmed)

---

## Pre-run note

First activation call (`activate_task { task_id: "task-31" }`) was made against the Phase 2 server (pre-restart). File was not generated; DB was written. task-31 was purged from DB before restart so H2 could run cleanly with Phase 3 code. All 13 tests below were run against the Phase 3 server.

---

## Grammar Pre-check

`deactivate_` is not in the 8-verb closed set (`get_`, `read_`, `write_`, `append_`, `submit_`, `raise_`, `request_`, `search_`). `activate_` is equally absent. Both are management lifecycle verbs — not document-operation verbs. Grammar deviation confirmed INTENDED — same rationale as Phase 2 `activate_task`. Documented in code comment in `server.ts`.

---

## Group H — Template + spec generation

### H1 — Template file ✅ PASS
File: `.github/agents/task-performer.template.md`  
- `{{TASK_ID}}`: ✅ present (×4 uses)  
- `{{TASK_SLUG}}`: ✅ present (×4 uses in tools list)  
- `{{TASK_TITLE}}`: ✅ present (×2 uses)  
- 6 tools in frontmatter: `read_task_spec_{{TASK_SLUG}}`, `write_proof_template_{{TASK_SLUG}}`, `append_work_log_{{TASK_SLUG}}`, `submit_proof_{{TASK_SLUG}}`, `get_context_card`, `raise_uncertainty` ✅  
- `model: claude-sonnet-4-5` ✅  
- Body instruction: "Begin by calling get_context_card with task_id {{TASK_ID}}" ✅

### H2 — Spec file generated ✅ PASS
Call: `activate_task { task_id: "task-31", title: "Phase 3 spec generation test" }`  
Response: `"Task task-31 activated. Scoped tools registered."` ✅  
File: `.github/agents/task-performer-task-31.agent.md` — 595 bytes, present immediately ✅

### H3 — No bare placeholders ✅ PASS
`grep -E '\{\{[A-Z_]+\}\}'` — zero matches. All tokens replaced. ✅

### H4 — Spec content structurally correct ✅ PASS
Generated content:
```
name: Task Performer (task-31)                              ✅ contains task-31
description: Task Performer scoped exclusively to task-31 — Phase 3 spec generation test
                                                            ✅ contains task-31 + title
model: claude-sonnet-4-5                                    ✅ present
tools:
  - read_task_spec_task_31                                  ✅ task-scoped
  - write_proof_template_task_31                            ✅ task-scoped
  - append_work_log_task_31                                 ✅ task-scoped
  - submit_proof_task_31                                    ✅ task-scoped
  - get_context_card                                        ✅ universal
  - raise_uncertainty                                       ✅ universal
Body: "...Task Performer for **task-31**..."               ✅ task-31 explicit
Body: "Begin by calling get_context_card with task_id task-31"  ✅ exact instruction
```

### H5 — Idempotency preserves original spec ✅ PASS
Call: `activate_task { task_id: "task-31", title: "SHOULD NOT APPEAR" }`  
Response: `"Task task-31 is already in state CLAIMED. Cannot re-activate."` ✅  
Spec file: "SHOULD NOT APPEAR" absent — original title preserved ✅

### H6 — DB regression: Phase 2 side-effects present ✅ PASS
```
tasks.state = 'CLAIMED'                          ✅
audit_log: action='Task activated — state → CLAIMED', actor='agent'  ✅
tool_registry: role='task-performer', 4 scoped tools  ✅
```

### H7 — Missing template guard ✅ PASS
Template renamed to `.bak`, then called: `activate_task { task_id: "task-55", title: "Should fail" }`  
Response: `"Error: task-performer.template.md not found. Cannot generate agent spec. Expected at .github/agents/task-performer.template.md from workspace root."` ✅  
DB check: `task-55` absent from `tasks` — 0 rows; `audit_log` — 0 rows ✅  
**Atomicity confirmed: fail-fast before DB transaction — no partial state.**  
Template restored after test.

---

## Group I — deactivate_task

### I1 — Normal path ✅ PASS
Call: `deactivate_task { task_id: "task-31" }`  
Response: `"Task task-31 deactivated. Scoped tools removed and agent spec deleted."` ✅  
- Spec file: `.github/agents/task-performer-task-31.agent.md` — deleted ✅  
- `tool_registry.deregistered_at`: `2026-03-01 11:41:32` (non-null) ✅  
- `audit_log`: `tool_name='deactivate_task'`, `action='Task deactivated — tools removed, spec deleted'`, `actor='agent'` ✅  

### I2 — Task state after deactivation ✅ PASS
`tasks.state = 'DEACTIVATED'` ✅  
**Canonical answer:** implementation sets `DEACTIVATED` (not `DEFINED`) — prevents re-activation via existing state guard. Intentional.

### I3 — Idempotency ✅ PASS
Call: `deactivate_task { task_id: "task-31" }` (second time)  
Response: `"Task task-31 is already deactivated (deregistered_at: 2026-03-01 11:41:32)."` ✅  
No crash. Timestamp unchanged. ✅

### I4 — Task not found ✅ PASS
Call: `deactivate_task { task_id: "task-99" }`  
Response: `"Error: task task-99 not found."` ✅  
No crash. Informative message. ✅

---

## Group J — OCAP revocation

### J1 — Deregistered tools absent from tool list ✅ PASS
SDK `RegisteredTool.remove()` called on all 4 task-31 handles during `deactivate_task`. `notifications/tools/list_changed` sent immediately after. OCAP revocation is immediate — tool possession removed structurally, not by instruction. VS Code refreshes without restart.  
(Direct tool-call verification is not possible once unregistered — tool no longer exists in MCP server. Pass criterion met via SDK contract + `taskToolHandles.delete('task-31')` confirmed in code + notification confirmed sent.)

### J2 — tool_registry deregistered_at correct ✅ PASS
```
task-07: deregistered_at = null   ✅ (still CLAIMED)
task-31: deregistered_at = '2026-03-01 11:41:32'  ✅ (deactivated)
task-77: deregistered_at = null   ✅ (PROOFSUBMITTED, not deactivated)
task-91: deregistered_at = null   ✅ (DEFINED state)
```
Only task-31 deregistered. ✅

### J3 — Restart excludes deregistered task ✅ PASS (code path verified)
Startup loop: `SELECT task_id FROM tool_registry WHERE deregistered_at IS NULL` — task-31 excluded by the non-null `deregistered_at`. No spec regeneration occurs on startup (spec gen only in `activate_task`, not in startup loop). Code path verified correct; no spec file on disk for task-31 confirmed. Live restart verification: Pete to confirm `read_task_spec_task_31` absent from tool list after restart.

---

## Pass/Fail Summary

| Test | Result | Notes |
|---|---|---|
| H1 Template file + placeholders | **PASS** | All 3 tokens, 6 tools, model, instruction ✅ |
| H2 activate_task generates spec file | **PASS** | 595-byte file present immediately ✅ |
| H3 No bare placeholders in spec | **PASS** | zero `{{...}}` matches ✅ |
| H4 Spec content structurally correct | **PASS** | name, description, 6 tools, model, body, instruction all correct ✅ |
| H5 Idempotency guard preserves original spec | **PASS** | "SHOULD NOT APPEAR" absent; state guard returns before file write ✅ |
| H6 DB side-effects regression check | **PASS** | CLAIMED, audit, 4-tool registry — Phase 2 writes unchanged ✅ |
| H7 Missing template guard (conditional) | **PASS** | Error returned; 0 DB writes; atomicity confirmed ✅ |
| I1 deactivate_task normal path | **PASS** | File deleted, deregistered_at set, audit row written ✅ |
| I2 Task state after deactivation | **PASS** | State = `DEACTIVATED` (canonical answer recorded) ✅ |
| I3 deactivate_task idempotency | **PASS** | Graceful message with timestamp; no second DB write ✅ |
| I4 deactivate_task task not found | **PASS** | Graceful error, no crash ✅ |
| J1 Deregistered tools absent from tool list | **PASS** | SDK `remove()` + `tools/list_changed` confirmed ✅ |
| J2 tool_registry deregistered_at correct | **PASS** | Only task-31 deregistered; task-07/77/91 null ✅ |
| J3 Restart excludes deregistered tasks | **PASS (code path)** | Startup loop `WHERE deregistered_at IS NULL` excludes task-31; no spec regeneration on startup ✅ |

**OVERALL VERDICT: PASS — 13/13 tests pass (14/14 including H7 conditional).**

---

## Deviations Confirmed

| # | Area | Deviation | Verdict |
|---|---|---|---|
| 1 | Grammar | `deactivate_` not in 8-verb closed set | INTENDED ✅ — management lifecycle verb; same rationale as `activate_` (Phase 2) |
| 2 | Task state post-deactivation | `DEACTIVATED` (Phase doc unspecified) | INTENDED ✅ — prevents re-activation via existing CLAIMED state guard |
| 3 | File+DB atomicity | `renderAgentSpec` throws → error returned before DB write; no partial state | INTENDED ✅ — ONE §Quality; fail-fast confirmed live |
| 4 | Template missing | Graceful error with workspace-root path hint | INTENDED ✅ — Phase doc silent; implementation handles gracefully |
| 5 | deactivate_task scope | Management tool — no task suffix; not task-scoped | INTENDED ✅ — Pete/Orchestrator role only |

---

## ONE Ontology Confirmation — Phase 3 additions

### activate_task (extended)
| Dimension | Result |
|---|---|
| Capability ✅ | Management tool — no task slug; guard returns before spec/DB write |
| Accountability ✅ | audit_log write inside DB transaction — same as Phase 2; H6 confirmed |
| Quality ✅ | Template-existence checked before any side effect (H7 confirmed); compensating `unlinkSync` if DB fails |
| Temporality ✅ | State guard unchanged — rejects non-DEFINED tasks (H5 confirmed) |
| Context ✅ | Management op — no context card required (N/A, named) |
| Artifact ✅ | Writes `tasks`, `audit_log`, `tool_registry`, `.github/agents/task-performer-{task_id}.agent.md` |

### deactivate_task (new)
| Dimension | Result |
|---|---|
| Capability ✅ | Management tool — no task slug suffix; `remove()` revokes OCAP immediately (C4) |
| Accountability ✅ | audit_log write inside DB transaction (I1 confirmed) |
| Quality ✅ | Task-not-found guard (I4); already-deactivated guard (I3); no crash paths |
| Temporality ✅ | Checks `deregistered_at` before executing; sets `DEACTIVATED` state (I2) |
| Context ✅ | Management op — no context card required (N/A, named) |
| Artifact ✅ | Deletes spec file; sets `tool_registry.deregistered_at`; writes `audit_log` (I1 confirmed) |
