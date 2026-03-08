# Exp-02 Test Plan — H4: `request_` Verb and Cross-Agent Handoff
**Date:** 2026-03-02  
**Hypothesis card:** `Exp-02-Hypothesis-cards.md` § Phase 4  
**Method:** MCP tool call + audit_log query + stream_events query + state verification  
**Executor:** Nexus Reviewer (automated) + Pete (stream event readability check)

---

## Scope

H4 tests the `request_` verb for the first time in the entire framework. `request_review_task_XX` must: transition state `PROOFSUBMITTED → AWAITINGQAREVIEW`, emit a plain-English stream event, write an audit entry, and leave no write capability in the Task Performer for the QA lifecycle. The Task Performer fires the request and is then done.

This is the first test of a cross-agent handoff boundary. The audit log must show the handoff as a discrete named event between the Task Performer's last action and the QA agent's first action.

**This hypothesis requires new code to be built before tests can run.**

---

## Pre-build Review Findings (Code Required)

| # | Deliverable | What it is |
|---|---|---|
| B1 | `request_review_task_XX` scoped tool registered at `activate_task` time | 5th tool in the Task Performer's set. Verb=request, subject=review, scope=task. No document write. State transition only. |
| B2 | New state: `AWAITINGQAREVIEW` | Added to the valid state sequence: `PROOFSUBMITTED → AWAITINGQAREVIEW → QAACTIVE → APPROVED/RETURNED` |
| B3 | State guard on `activate_qa` | Must accept both `PROOFSUBMITTED` and `AWAITINGQAREVIEW` as valid preconditions — either Pete calls `activate_qa` immediately, or the agent requests review first. |
| B4 | Stream event format for `request_review` | Must be self-describing without context. Recommended: `"📋 Task Performer requested QA review for task-XX"` |
| B5 | Audit entry format | `tool_name='request_review_task_XX'`, `action='Review requested — state → AWAITINGQAREVIEW'`, `actor='agent'` |
| B6 | `task-performer.template.md` updated | Add `request_review_{{TASK_SLUG}}` to the tools list so newly generated specs include it. Also add brief instruction: "After submitting proof, call request_review to signal readiness for QA." |

**Grammar check for `request_`:**

Per NexusToolGrammar: `request_` signals the need for another agent's action. No document is written. The event is the entire output. Side effect: state transition + audit entry + stream event.

- Subject: `review` (the thing being requested)
- Scope: `task_XX` (which task this review is for)
- Actor who receives: QA agent (not specified in the tool — decoupled by design)
- Full tool name: `request_review_task_XX` ✅

**TSC must pass before any tests run.**

---

## Pre-conditions

- H1 complete: task-XX in `PROOFSUBMITTED` state, proof document written
- `request_review_task_XX` built and registered (B1)
- `AWAITINGQAREVIEW` state valid in schema/guards (B2)
- Template updated to include the new tool (B6)
- Nexus MCP server restarted

Note: If H1 ran before B6 (template update), the existing Task Performer spec for task-XX will NOT contain `request_review_task_XX`. Either: (a) re-run `activate_task` on a fresh task, or (b) manually edit the existing spec to add the tool for this test only.

---

## Group J — Tool call and state transition

### J1 — request_review_task_XX returns success
```
request_review_task_XX
```
(No arguments required — the tool is scoped to task-XX already.)

PASS criterion: returns success message containing 'AWAITINGQAREVIEW'. No error.

### J2 — State is AWAITINGQAREVIEW immediately after call
```sql
SELECT state FROM tasks WHERE id = 'task-XX';
-- EXPECTED: AWAITINGQAREVIEW
```
PASS criterion: state transitioned in the same DB transaction as the tool call. No lag.

### J3 — State guard: request_review rejects if state is not PROOFSUBMITTED
Call `request_review_task_XX` again immediately after J1 (state is now AWAITINGQAREVIEW):

PASS criterion: returns error. State remains `AWAITINGQAREVIEW`. No second audit row.

### J4 — State guard: request_review rejects if proof not yet submitted
Test on a CLAIMED task (no proof submitted):

PASS criterion: returns error containing "PROOFSUBMITTED" or "no proof". Task Performer cannot request review before submitting proof.

---

## Group K — Audit entry

### K1 — audit_log row written for request_review
```sql
SELECT tool_name, action, actor, timestamp
FROM audit_log
WHERE task_id = 'task-XX' AND tool_name = 'request_review_task_XX';
-- EXPECTED: one row
```
PASS criterion: row present.

### K2 — actor is 'agent'
PASS criterion: `actor = 'agent'`.

### K3 — action describes the handoff in plain English
PASS criterion: `action` contains 'AWAITINGQAREVIEW'. Must not be a JSON blob or opaque code.

### K4 — Handoff is visible as discrete event in full audit query
```sql
SELECT tool_name, actor FROM audit_log
WHERE task_id = 'task-XX'
ORDER BY id;
```
Read the output. The `request_review_task_XX` row must appear between `submit_proof_task_XX` and any QA agent entries.

PASS criterion: handoff row exists between Task Performer's last action and QA's first action. The boundary is named. Pete can see exactly where one agent's work ends and the next begins.

---

## Group L — Stream event

### L1 — Stream event emitted for request_review
```sql
SELECT description FROM stream_events
WHERE task_id = 'task-XX' AND description LIKE '📋%'
ORDER BY id DESC LIMIT 1;
-- EXPECTED: "📋 Task Performer requested QA review for task-XX"
```
PASS criterion: event present with 📋 emoji (or equivalent — must be visually distinct from push/PR events).

### L2 — Stream event is self-describing (manual check)
Pete reads the stream event description without any other context.

PASS criterion: Pete can determine what happened, for which task, and what needs to happen next — from the description alone. No technical knowledge required.

---

## Group M — Task Performer boundary enforcement

### M1 — Task Performer has no QA-lifecycle tools
```sh
grep "submit_qa_review\|activate_qa\|read_proof" \
  .github/agents/task-performer-task-XX.agent.md
# EXPECTED: no matches
```
PASS criterion: Task Performer spec is clean. The request fired; the agent's involvement ends there.

### M2 — Calling submit_qa_review from Task Performer context returns "tool not found"
If Task Performer agent is still open in Copilot Chat:
```
submit_qa_review_task_XX  outcome: "APPROVED"  findings: "test"
```
PASS criterion: "tool not found" error. Not a permission error.

### M3 — activate_qa accepts AWAITINGQAREVIEW state
```
activate_qa  task_id: "task-XX"
```
Called after J1 (state is AWAITINGQAREVIEW).

PASS criterion: succeeds. State → `QAACTIVE`. QA spec written. (This confirms B3 from the pre-build findings.)

---

## Fallback assessment (from hypothesis card)

**If auto-transition doesn't work without a Policy Engine:**

Pete manually calls a hypothetical `advance_state(task_id, "AWAITINGQAREVIEW")`. Mark each such call as `P02-MANUAL-GATE` in the audit log (use `raise_uncertainty` to record it, or add a one-off `manual_advance` tool for the experiment). This is the data point that motivates building the Policy Engine in Exp-03. Record: how many manual gates were required, what the trigger was, and what the Policy Engine condition would need to be.

---

## Pass/Fail Summary

| Test | Result | Notes |
|---|---|---|
| B1–B6 code built + TSC clean | — | Pre-build gate |
| J1 request_review returns success | — | |
| J2 state → AWAITINGQAREVIEW | — | |
| J3 repeat call rejected | — | |
| J4 rejects if no proof submitted | — | |
| K1 audit_log row present | — | |
| K2 actor=agent | — | |
| K3 action contains AWAITINGQAREVIEW | — | |
| K4 handoff visible as discrete event between agents | — | |
| L1 stream event present with 📋 emoji | — | |
| L2 stream event self-describing (manual) | — | |
| M1 Task Performer spec has no QA tools | — | |
| M2 submit_qa_review → tool not found from Task Performer | — | |
| M3 activate_qa accepts AWAITINGQAREVIEW | — | |

**OVERALL VERDICT: — (pending build + execution)**

---

## What a PASS here proves

The `request_` verb is architecturally load-bearing. H4 PASS means:
1. Cross-agent handoff is a named event in the audit trail — not an invisible state change
2. The requesting agent is structurally cut off from the receiving agent's lifecycle
3. The handoff boundary is visible without opening any file or document
4. The QA agent can be activated immediately after the request, with no manual DB surgery
