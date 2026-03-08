# Nexus Server Test Plan — Phase 3
**Date:** 2026-03-01  
**Covers:** Phase 3 §3.1–3.4 — Per-task agent spec generation + `deactivate_task`  
**Source:** `Nexus-exp-01-phase-03.md`  
**Method:** Live tool calls + filesystem checks + DB SQL  
**Executor:** Nexus Server Reviewer (acting as probe runner)

---

## Scope

Phase 3 adds two deliverables:

1. **Template + spec generation** — `activate_task` writes a scoped `.agent.md` file for VS Code hot-reload (§3.1, §3.2, §3.3)
2. **`deactivate_task` tool** — deletes the spec file, deregisters OCAP tools, records audit (§3.4)

ONE ontology dimensions must hold for both new behaviours.

---

## Pre-conditions

- Phase 1 + 2 fully passing (confirmed 2026-03-01)
- Nexus server running with Phase 3 implementation loaded
- `.github/agents/task-performer.template.md` exists (§3.1 deliverable)
- Fresh test task `task-31` does NOT exist in DB before Group H
- `task-91` exists in DB in DEFINED state (from Phase 2 test run) — reuse for deactivate tests

---

## Grammar Pre-check

Before running live tests, verify that `deactivate_task` satisfies NexusToolGrammar.

The Phase 2 grammar vocabulary is: `get_`, `read_`, `write_`, `append_`, `submit_`, `raise_`, `request_`, `search_`.  
`activate_` and `deactivate_` are management verbs used in Phase 2 and 3 respectively, not in this list.

**Grammar check question:** Is `deactivate_` in the permitted verb set? If not, this is a DEVIATION requiring rationale.  
Expected: Phase doc explicitly introduces `deactivate_task` — treat as an intentional management-verb extension. Record as deviation with rationale.

---

## Group H — Template file and spec generation (Phase 3 §3.1, §3.2)

### H1 — Template file exists with all placeholders
```sh
cat .github/agents/task-performer.template.md
```
PASS criteria:
- File exists at `.github/agents/task-performer.template.md`
- Contains `{{TASK_ID}}`, `{{TASK_SLUG}}`, `{{TASK_TITLE}}` — all three, each used at least once
- YAML frontmatter lists exactly 6 tools: `read_task_spec_{{TASK_SLUG}}`, `write_proof_template_{{TASK_SLUG}}`, `append_work_log_{{TASK_SLUG}}`, `submit_proof_{{TASK_SLUG}}`, `get_context_card`, `raise_uncertainty`
- `model:` key is present in frontmatter

### H2 — activate_task generates spec file
- Call: `activate_task { task_id: "task-31", title: "Phase 3 spec generation test" }`
- EXPECTED response: `"Task task-31 activated. Scoped tools registered."`
- Then check file exists:
  ```sh
  ls .github/agents/task-performer-task-31.agent.md
  ```
- PASS criterion: file present immediately after `activate_task` returns.

### H3 — Generated spec has no bare placeholders
```sh
grep -E '\{\{[A-Z_]+\}\}' .github/agents/task-performer-task-31.agent.md
```
- EXPECTED: no output (zero matches).
- PASS criterion: all `{{...}}` tokens replaced — `task-31`, `task_31`, and "Phase 3 spec generation test" substituted correctly.

### H4 — Generated spec content is structurally correct
```sh
cat .github/agents/task-performer-task-31.agent.md
```
PASS criteria:
- `name:` contains `task-31`
- `description:` contains `task-31` and `Phase 3 spec generation test`
- tools list has exactly 6 entries: 4 task-scoped (`*_task_31`) + `get_context_card` + `raise_uncertainty`
- `model:` key is present
- Body text refers to `task-31` explicitly
- Instruction: "Begin by calling get_context_card with task_id task-31"

### H5 — Idempotency: second activate_task call does not overwrite spec with wrong data
- Pre-condition: task-31 is now CLAIMED from H2; idempotency guard will return early.
- Call: `activate_task { task_id: "task-31", title: "SHOULD NOT APPEAR" }`
- EXPECTED: `"Task task-31 is already in state CLAIMED. Cannot re-activate."`
- Verify spec file still contains "Phase 3 spec generation test" (not "SHOULD NOT APPEAR"):
  ```sh
  grep "SHOULD NOT APPEAR" .github/agents/task-performer-task-31.agent.md
  ```
- PASS criterion: no match — original title preserved.

### H6 — DB state after activate_task (regression: Phases 1+2 side-effects still present)
```sql
SELECT state FROM tasks WHERE id = 'task-31';
-- EXPECTED: CLAIMED

SELECT action, actor FROM audit_log WHERE task_id = 'task-31' AND tool_name = 'activate_task';
-- EXPECTED: 1 row, action='Task activated — state → CLAIMED', actor='agent'

SELECT role, tools FROM tool_registry WHERE task_id = 'task-31';
-- EXPECTED: role='task-performer', tools JSON array with 4 scoped tool names
```
PASS criterion: all 3 queries return expected rows. Phase 3 must not break Phase 2 DB writes.

---

## Group I — deactivate_task tool (Phase 3 §3.4)

### I1 — deactivate_task: normal path (CLAIMED task)
- Pre-condition: task-31 is CLAIMED from Group H.
- Call: `deactivate_task { task_id: "task-31" }`
- EXPECTED response: `"Task task-31 deactivated. Agent spec removed."` (exact wording TBD — adjust after implementation)
- Verify spec file deleted:
  ```sh
  ls .github/agents/task-performer-task-31.agent.md
  # EXPECTED: No such file or directory
  ```
- Verify tool_registry:
  ```sql
  SELECT deregistered_at FROM tool_registry WHERE task_id = 'task-31';
  -- EXPECTED: non-null timestamp
  ```
- Verify audit_log:
  ```sql
  SELECT tool_name, action, actor FROM audit_log WHERE task_id = 'task-31' AND tool_name = 'deactivate_task';
  -- EXPECTED: 1 row, actor='agent'
  ```
- PASS criterion: file gone, `deregistered_at` set, audit row present.

### I2 — deactivate_task: task state after deactivation
- Immediately after I1:
  ```sql
  SELECT state FROM tasks WHERE id = 'task-31';
  ```
- PASS criterion: state is NOT CLAIMED (implementation must decide — DEFINED or DEACTIVATED; document actual value).
- NOTE: Phase doc does not specify target state. This test records actual behaviour as the canonical answer.

### I3 — deactivate_task: idempotency (already deactivated)
- Call again: `deactivate_task { task_id: "task-31" }`
- EXPECTED: graceful error, e.g. `"Task task-31 is already deactivated."` or similar.
- PASS criterion: no crash, no second deregistered_at update (timestamp unchanged from I1).

### I4 — deactivate_task: task not found
- Call: `deactivate_task { task_id: "task-99" }` (known non-existent)
- EXPECTED: graceful error, e.g. `"Task task-99 not found."`
- PASS criterion: no crash, informative message returned.

---

## Group J — OCAP revocation (Phase 3 §3.4)

### J1 — Deregistered tools no longer callable
- Pre-condition: task-31 deactivated in Group I.
- Verify that `write_proof_template_task_31` is not present in VS Code tool list (@ menu inspection).
- NOTE: This cannot be verified via direct tool call once unregistered — the tool no longer exists in the MCP server. Verify by absence: the tool was confirmed present after H2; after I1 it must be absent.
- PASS criterion: no `*_task_31` tools in the tool list after deactivation.

### J2 — tool_registry correctly marks deregistration
```sql
SELECT task_id, deregistered_at FROM tool_registry ORDER BY task_id;
-- Check task-31: deregistered_at non-null
-- Check task-07: deregistered_at null (still CLAIMED, should not be deregistered)
-- Check task-77: deregistered_at null (PROOFSUBMITTED — still in registry, tools still registered)
```
- PASS criterion: only task-31 has a non-null `deregistered_at`.

### J3 — Restart: deregistered task is NOT re-registered
- Pre-condition: task-31 deregistered (deregistered_at non-null).
- Restart Nexus server.
- Verify `read_task_spec_task_31` does NOT appear in VS Code tool list.
- PASS criterion: startup loop (`WHERE deregistered_at IS NULL`) excludes task-31.
  Also verify the spec file is NOT regenerated on startup.

---

## ONE Ontology Pre-checks for Phase 3 additions

### `activate_task` (extended — spec generation added)
| Dimension | Check | Expected |
|---|---|---|
| Capability | Management tool — Pete/Orchestrator only | ✅ (unchanged from Phase 2) |
| Accountability | Still writes audit_log on activation | ✅ (existing Phase 2 check H6) |
| Quality | Template must exist for spec generation to succeed; graceful error if absent | CHECK: what if template file missing? |
| Temporality | State guard unchanged (rejects non-DEFINED tasks) | ✅ (H5 idempotency guard) |
| Context | Management op — no context card required | ✅ |
| Artifact | Now additionally writes `.github/agents/task-performer-{task_id}.agent.md` | Test: H2, H3, H4 |

**Quality gap test (H7 — conditional on implementation):**
- IF the implementation gracefully handles a missing template: rename/remove `.github/agents/task-performer.template.md` temporarily and call `activate_task`.
- EXPECTED: error returned; task NOT activated (atomic — either both succeed or neither). OR: task activated but spec generation skipped with warning.
- PASS criterion: no crash; behaviour is deterministic and documented.
- NOTE: Run only if template removal is safe to test without breaking the server process.

### `deactivate_task` (new)
| Dimension | Check | Expected |
|---|---|---|
| Capability | Management scope — not task-scoped | CHECK: is it registered as a management tool? |
| Accountability | Writes audit_log entry on deactivation | Test: I1 audit row check |
| Quality | Handles missing task, already-deactivated gracefully | Test: I3, I4 |
| Temporality | Only valid for CLAIMED tasks (or broader?) | Test: I2 — document target state |
| Context | Management op — no context card required | ✅ |
| Artifact | Deletes spec file + sets tool_registry.deregistered_at | Test: I1 |

---

## Pass/Fail Results

| Test | Result | Notes |
|---|---|---|
| H1 Template file + placeholders | — | |
| H2 activate_task generates spec file | — | |
| H3 No bare placeholders in spec | — | |
| H4 Spec content structurally correct | — | |
| H5 Idempotency guard preserves original spec | — | |
| H6 DB side-effects regression check | — | |
| I1 deactivate_task normal path | — | |
| I2 Task state after deactivation | — | |
| I3 deactivate_task idempotency | — | |
| I4 deactivate_task task not found | — | |
| J1 Deregistered tools absent from tool list | — | |
| J2 tool_registry deregistered_at correct | — | |
| J3 Restart excludes deregistered tasks | — | |

**OVERALL VERDICT:** — (pending implementation)

---

## Deviations to Watch For

| # | Area | Potential deviation |
|---|---|---|
| 1 | Grammar | `deactivate_` not in Phase 2 verb vocabulary — expect intentional extension |
| 2 | Task state post-deactivation | Phase doc unspecified — implementation decides; document actual state |
| 3 | File write atomicity | If `generateAgentSpec` throws, does `activate_task` still write to DB? Must be all-or-nothing |
| 4 | Template missing | Phase doc doesn't specify error behaviour — implementation must handle gracefully |
| 5 | deactivate_task scope | Phase doc says "add a tool" — confirm it is a management tool, not task-scoped |
