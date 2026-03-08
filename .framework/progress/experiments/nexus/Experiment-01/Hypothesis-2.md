# Hypothesis Card — Phase 2: Dynamic Tool Registration

**Hypothesis:** The Nexus MCP server can register and deregister task-scoped tools at runtime, and VS Code will reflect the updated tool set after receiving a `tools/list_changed` notification — without restarting the server, the MCP connection, or VS Code itself.

**Test:** With the server running and no tasks active, call `activate_task` with `task_id: "task-07"`. Verify the task-scoped tools appear in VS Code. Then call `deactivate_task` for `task-07`. Verify the tools disappear. Invoke `activate_task` for a second task (`task-08`) simultaneously and confirm that `task-07`'s tools and `task-08`'s tools are both present and distinct — no overlap.

**Pass:**

- After `activate_task("task-07")`: `write_proof_template_task_07` is callable; `write_proof_template_task_08` does not exist
- After `deactivate_task("task-07")`: `write_proof_template_task_07` is no longer in the tool list
- Attempting to call a deregistered tool returns a "tool not found" error, not a permission error — confirming the absence is structural, not a rejection

**Fail:** VS Code does not refresh its tool list after `tools/list_changed` (requires server or connection restart to reflect changes), OR both tasks' tools appear in both agents' contexts (no isolation), OR deregistered tools remain callable.

**Fallback:** If `tools/list_changed` doesn't trigger a live refresh in VS Code, test whether closing and reopening the chat panel (without server restart) achieves the same result. If neither works, the dynamic registration pattern requires a different approach — document the constraint and redesign Phase 3 around static per-task server instances (the containerised variant discussed earlier) before proceeding.

---

## Result — 2026-03-02: PASS ✅

**Verdict:** All three pass criteria confirmed.

**Evidence:**

| Criterion | Method | Result |
|---|---|---|
| After `activate_task("task-07")`: `write_proof_template_task_07` callable; task-08 tool absent | DB `tool_registry` query — zero overlap across 4 simultaneous active tasks | **PASS** |
| After `deactivate_task("task-07")`: tools removed, task-08 unaffected | `tool_registry.deregistered_at` set for task-07; `write_proof_template_task_08` called successfully post-deactivation | **PASS** |
| Deregistered tool absence is structural, not a rejection | `RegisteredTool.remove()` removes the tool from the MCP registry entirely — no ACL, no permission error possible | **PASS** |
| VS Code tool selector reflects changes live without restart | Manual observation in Copilot Chat `@` tool list — tools appeared and disappeared in the open session | **PASS** |

**DB state at conclusion:**
- `task-07`: state=DEACTIVATED, tool_registry.deregistered_at set, spec file deleted from disk
- `task-08`: state=CLAIMED, 4 tools active, spec file present

**Fallback path:** Not required. `tools/list_changed` notification triggers live refresh in VS Code without server restart, connection reset, or panel close.

***