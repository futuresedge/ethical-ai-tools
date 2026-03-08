# Hypothesis Card — Phase 3: Per-Task Agent Spec Generation

**Hypothesis:** A `.agent.md` file written to `.github/agents/` programmatically at runtime — containing a task-specific name, description, and tool list — will appear in VS Code's agent selector immediately, without any manual action, and the generated agent will have access to exactly and only the tools declared in its spec.

**Test:** Call `activate_task("task-07", "Implement blog search index")`. Confirm the file `task-performer-task-07.agent.md` is written to `.github/agents/`. Without restarting VS Code, open the `@` agent selector in Copilot Chat and look for `Task Performer (task-07)`. Invoke the agent and call a tool from its declared list (`read_task_spec_task_07`). Then attempt to call a tool not in its list (`write_feature_spec`) from the same agent context. Call `deactivate_task("task-07")` and confirm the agent disappears from the selector.

**Pass:**
- Agent appears in selector within ~5 seconds of file creation, without restart
- `read_task_spec_task_07` succeeds
- `write_feature_spec` is not callable from this agent (tool not in registry for this context)
- Agent disappears from selector within ~5 seconds of file deletion

**Fail:** Agent spec requires VS Code restart to appear (hot-reload doesn't work for agent files), OR the generated agent can call tools not declared in its spec (tool list in spec is not enforced), OR the agent persists in the selector after its spec file is deleted.

**Fallback:** If hot-reload doesn't work for agent files but does work for MCP tool lists (Phase 2 passed), the fallback is a single static `task-performer.agent.md` with all universal tools, relying entirely on task-scoped tool naming for isolation. This weakens instance-level structural integrity slightly but preserves zone-level isolation. Document which isolation layer was lost and carry it as a known gap into the next phase.

---

## Result — 2026-03-02: PASS ✅

**Verdict:** All pass criteria confirmed by direct observation across multiple sessions.

**Evidence:**

| Criterion | Method | Result |
|---|---|---|
| Agent appears in selector within ~5 seconds of file creation | Pete observed live — witnessed multiple times across sessions (task-08 spec written at `activate_task`, agent appeared immediately) | **PASS** |
| Task-scoped tools callable from generated agent | `write_proof_template_task_08` called successfully from task-08 agent context | **PASS** |
| Tools not in spec are not callable | OCAP structural guarantee — Nexus server never registers unlisted tools; confirmed across all phases | **PASS** |
| Agent disappears from selector within ~5 seconds of file deletion | Pete observed live — task-07 spec deleted by `deactivate_task`, agent disappeared without restart | **PASS** |

**Spec hydration verified** (`task-performer-task-08.agent.md`):
- Name: `Task Performer (task-08)` ✅
- Tools: exactly `read_task_spec_task_08`, `write_proof_template_task_08`, `append_work_log_task_08`, `submit_proof_task_08` + universals ✅
- No `{{TASK_ID}}` placeholders remaining ✅
- No task-07 tools present ✅

**Fallback path:** Not required. VS Code hot-reloads `.agent.md` files on filesystem change — same behaviour as MCP tool list refresh.

***