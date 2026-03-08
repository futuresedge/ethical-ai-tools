# Exp-02 Test Plan — H3: QA Agent Instantiation and Scoping
**Date:** 2026-03-02  
**Hypothesis card:** `Exp-02-Hypothesis-cards.md` § Phase 3  
**Method:** Code build (new tools + QA template) + automated DB verification + manual VS Code observation  
**Executor:** Builder + Nexus Reviewer

---

## Scope

H3 tests whether a QA Execution agent can be instantiated for a task already in `PROOFSUBMITTED` state, with a tool set that is structurally disjoint from the Task Performer's tool set for the same task. Disjoint means: write tools don't overlap. The QA agent can read what the Task Performer wrote; the Task Performer cannot call QA write tools; the QA agent cannot call Task Performer write tools.

**This hypothesis requires new code to be built before tests can run.**

---

## Pre-build Review Findings (Code Required)

H3 cannot run until the following are implemented:

| # | Deliverable | What it is |
|---|---|---|
| B1 | `activate_qa(task_id)` MCP tool in `server.ts` | Transition state PROOFSUBMITTED → QAACTIVE. Generate QA agent spec. Register 3 scoped QA tools. Record in `tool_registry`. |
| B2 | `qa-execution.template.md` in `.github/agents/` | Agent spec template with `{{TASK_ID}}`, `{{TASK_SLUG}}`, `{{TASK_TITLE}}` placeholders. Tools: `read_proof_task_XX`, `read_task_spec_task_XX`, `submit_qa_review_task_XX`. |
| B3 | `read_proof_task_XX` scoped tool | Reads `documents WHERE doc_type='proof'`. Read-only. No audit obligation (read_ grammar rule). |
| B4 | `submit_qa_review_task_XX` scoped tool | Writes `documents` (doc_type='qa_review'), transitions state to `APPROVED` or `RETURNED`, writes audit_log, emits stream event. Zod schema: `{ outcome: 'APPROVED' \| 'RETURNED', findings: string }`. |
| B5 | New task states added | `QAACTIVE`, `APPROVED`, `RETURNED` — must be valid states in the state machine. `activate_qa` must reject if state is not `PROOFSUBMITTED`. |
| B6 | `deactivate_qa(task_id)` MCP tool | Mirrors `deactivate_task` — removes QA tool handles, deletes QA spec file, sets `deregistered_at`, transitions state to `APPROVED`/`RETURNED` (already set by `submit_qa_review`). |

**Grammar pre-check for new tools:**
- `activate_qa` — management verb extension (parallel to `activate_task`) ✅
- `read_proof_task_XX` — verb=read, subject=proof, scope=task ✅
- `submit_qa_review_task_XX` — verb=submit, subject=qa_review, scope=task ✅
- `deactivate_qa` — management verb extension ✅

**TSC must pass before any tests run.**

---

## Pre-conditions

- H1 complete: task-XX is in `PROOFSUBMITTED` state
- B1–B6 implemented and `pnpm astro check` + `tsc --noEmit` both pass
- `qa-execution.template.md` written to `.github/agents/`
- Nexus MCP server restarted to load new tools

---

## Group G — activate_qa and spec generation

### G1 — activate_qa rejects non-PROOFSUBMITTED tasks
```
activate_qa  task_id: "task-XX"
```
Called while task is still DEFINED or CLAIMED — must reject.

PASS criterion: returns error containing 'PROOFSUBMITTED'. No spec file written. No DB change.

### G2 — activate_qa succeeds on PROOFSUBMITTED task
```
activate_qa  task_id: "task-XX"
```
Called after H1 has completed and task is PROOFSUBMITTED.

PASS criterion: returns success. State → `QAACTIVE`.

### G3 — QA spec file written to .github/agents/
```sh
cat .github/agents/qa-execution-task-XX.agent.md
```
PASS criteria:
- File exists
- `name: QA Execution (task-XX)` in frontmatter
- No `{{TASK_ID}}` placeholders remaining
- Tool list contains exactly: `read_proof_task_XX`, `read_task_spec_task_XX`, `submit_qa_review_task_XX`, plus universals

### G4 — QA tools in tool_registry
```sql
SELECT task_id, tools, deregistered_at 
FROM tool_registry 
WHERE task_id = 'task-XX'
ORDER BY registered_at;
-- EXPECTED: 2 rows (Task Performer row deregistered, QA row active)
```
PASS criterion: QA row has `deregistered_at IS NULL`, tools JSON contains 3 QA tool names.

### G5 — activate_qa writes audit_log
```sql
SELECT tool_name, action, actor FROM audit_log
WHERE task_id = 'task-XX' AND tool_name = 'activate_qa';
-- EXPECTED: actor='agent', action contains 'QAACTIVE'
```

---

## Group H — Tool set disjoint verification (the core H3 test)

### H1 — QA agent tool list does NOT contain Task Performer write tools
Read QA spec file:
```sh
grep -E "write_proof_template|append_work_log|submit_proof" \
  .github/agents/qa-execution-task-XX.agent.md
# EXPECTED: no matches
```
PASS criterion: zero matches. QA agent has no path to call Task Performer write tools.

### H2 — Task Performer spec (if still present) does NOT contain QA write tools
```sh
grep "submit_qa_review" \
  .github/agents/task-performer-task-XX.agent.md 2>/dev/null || echo "NOT IN SPEC"
# EXPECTED: NOT IN SPEC or file not found
```
PASS criterion: `submit_qa_review_task_XX` not in Task Performer spec.

### H3 — Cross-call attempt: Task Performer calling submit_qa_review returns "tool not found"
Via MCP STDIO client (or live in VS Code using Task Performer agent):
```
submit_qa_review_task_XX  outcome: "APPROVED"  findings: "cross-call test"
```
Called from Task Performer context (which does not have this tool registered).

PASS criterion: returns error. Error message must NOT say "permission denied" — must say "tool not found" or equivalent. This confirms structural absence, not ACL rejection.

### H4 — Cross-call attempt: QA agent calling write_proof_template returns "tool not found"
```
write_proof_template_task_XX  content: "cross-call test"
```
Called from QA agent context.

PASS criterion: same as H3 — structural absence confirmed by error type.

### H5 — tool_registry confirms disjoint sets
```sql
SELECT task_id, json_each.value as tool_name
FROM tool_registry, json_each(tool_registry.tools)
WHERE task_id = 'task-XX' AND deregistered_at IS NULL;
```
Compare the two sets manually: Task Performer tools vs QA tools. No tool should appear in both `registered_at` windows for the same `task_id`.

PASS criterion: write tools are disjoint across the two `tool_registry` rows for this task.

---

## Group I — VS Code hot-reload (manual observation)

### I1 — QA agent appears in selector within 5 seconds
Pete opens the `@` agent selector immediately after `activate_qa` returns.

PASS criterion: `QA Execution (task-XX)` visible without closing/reopening panel.

### I2 — QA agent tool list in VS Code matches spec exactly
Pete selects the QA agent and checks available tools.

PASS criterion: only `read_proof_task_XX`, `read_task_spec_task_XX`, `submit_qa_review_task_XX` shown (plus universals). No Task Performer tools visible.

### I3 — Task Performer agent no longer shows (if deactivated before QA)
If H1's agent was deactivated before `activate_qa`:

PASS criterion: `Task Performer (task-XX)` is not in the agent selector. Absence must be confirmed, not just the presence of the QA agent.

---

## Pass/Fail Summary

| Test | Result | Notes |
|---|---|---|
| B1–B6 code implemented + TSC clean | — | Pre-build gate |
| G1 activate_qa rejects wrong state | — | |
| G2 activate_qa succeeds on PROOFSUBMITTED | — | |
| G3 QA spec file written, no placeholders | — | |
| G4 QA tools in tool_registry | — | |
| G5 activate_qa audit row | — | |
| H1 QA spec lacks Task Performer write tools | — | |
| H2 Task Performer spec lacks QA write tools | — | |
| H3 cross-call submit_qa_review → tool not found | — | |
| H4 cross-call write_proof_template → tool not found | — | |
| H5 tool_registry disjoint sets | — | |
| I1 QA agent appears in selector within 5s | — | |
| I2 QA tool list matches spec | — | |
| I3 Task Performer absent (if deactivated) | — | |

**OVERALL VERDICT: — (pending build + execution)**

---

## Fallback (from hypothesis card)

If QA spec hot-reload fails as a regression (Exp-01 H3 confirmed it works):
1. Confirm the file was written to `.github/agents/` (not a subdirectory)
2. Confirm the filename matches VS Code's pattern: `qa-execution-task-XX.agent.md`
3. If hot-reload is genuinely broken: use static `qa-execution.agent.md` with universal tools only. Mark as QA-STATIC-FALLBACK. The tool-local state guard on `submit_qa_review` (rejects if state ≠ QAACTIVE) provides server-side enforcement. Less elegant but architecturally sound.
