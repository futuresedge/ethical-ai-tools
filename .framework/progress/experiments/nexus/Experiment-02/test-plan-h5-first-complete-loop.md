# Exp-02 Test Plan — H5: First Complete Loop
**Date:** 2026-03-02  
**Hypothesis card:** `Exp-02-Hypothesis-cards.md` § Phase 5  
**Method:** Single SQL query + stream_events query + Pete timed reconstruction  
**Executor:** Pete (reconstruction timing) + Nexus Reviewer (completeness verification)

---

## Scope

H5 is the integration test for all of Experiment 02. It asks one question: can Pete answer "is this task done and trustworthy?" from the audit log alone, in under 2 minutes, without opening any file, any GitHub page, or any agent output?

This test runs AFTER H1–H4 are complete and the QA agent has called `submit_qa_review_task_XX`.

H5 does not test a specific piece of code. It tests the emergent property of the whole system.

---

## Pre-conditions

- H1 complete: real agent ran, proof submitted
- H2 complete: real GitHub push and PR events in audit_log with real SHA
- H3 complete: QA agent instantiated and scoped
- H4 complete: `request_review` fired, state transitioned to AWAITINGQAREVIEW → QAACTIVE
- QA agent has called `submit_qa_review_task_XX` with outcome `APPROVED` or `RETURNED`
- Final task state is `APPROVED` or `RETURNED`

---

## The Definitive Query (§5.3 equivalent for Exp-02)

```sql
SELECT tool_name, action, actor, timestamp
FROM audit_log
WHERE task_id = 'task-XX'
ORDER BY id;
```

Expected rows (minimum — exact order will vary by real execution timing):

| tool_name | actor | what it proves |
|---|---|---|
| `activate_task` | `agent` | Task started |
| `get_context_card` | `agent` | Agent was briefed (grammar v0.2) |
| `write_proof_template_task_XX` | `agent` | Proof structure declared before work |
| `append_work_log_task_XX` | `agent` (0 or more) | Work in progress recorded |
| `github:push` | `webhook:github` | Real code pushed (real SHA) |
| `github:pull_request` | `webhook:github` | PR created by agent |
| `submit_proof_task_XX` | `agent` | Proof submitted with literal output |
| `request_review_task_XX` | `agent` | Handoff to QA — named boundary |
| `activate_qa` | `agent` | QA agent instantiated |
| `get_context_card` | `agent` | QA agent was briefed |
| `submit_qa_review_task_XX` | `agent` | QA verdict recorded |
| `deactivate_task` (or `deactivate_qa`) | `agent` | Lifecycle closed |

---

## Group N — Audit log completeness

### N1 — All mandatory lifecycle moments present
```sql
SELECT tool_name FROM audit_log WHERE task_id = 'task-XX' ORDER BY id;
```

Required tool_names (minimum set):
```
activate_task
get_context_card
write_proof_template_task_XX
github:push
submit_proof_task_XX
request_review_task_XX
activate_qa
submit_qa_review_task_XX
```

PASS criterion: all 8 (or more) present. Any missing is a chain-of-custody gap.

### N2 — Both actors present
```sql
SELECT DISTINCT actor FROM audit_log WHERE task_id = 'task-XX';
-- EXPECTED: 'agent', 'webhook:github'
```
PASS criterion: exactly 2 distinct actors.

### N3 — No NULL tool_name, actor, or timestamp
```sql
SELECT COUNT(*) FROM audit_log 
WHERE task_id = 'task-XX' 
AND (tool_name IS NULL OR actor IS NULL OR timestamp IS NULL);
-- EXPECTED: 0
```
PASS criterion: zero nulls.

### N4 — Final state is unambiguous from audit_log alone
```sql
SELECT action FROM audit_log
WHERE task_id = 'task-XX' AND tool_name = 'submit_qa_review_task_XX'
ORDER BY id DESC LIMIT 1;
-- EXPECTED: action contains 'APPROVED' or 'RETURNED'
```
PASS criterion: outcome readable from `action` column without querying `tasks.state`.

### N5 — tasks.state matches audit_log outcome
```sql
SELECT state FROM tasks WHERE id = 'task-XX';
-- EXPECTED: 'APPROVED' or 'RETURNED' — matches N4
```
PASS criterion: consistent with N4.

---

## Group O — Stream events narrate the story

### O1 — At least one stream event per lifecycle phase
```sql
SELECT description FROM stream_events WHERE task_id = 'task-XX' ORDER BY id;
```

Expected events (minimum — one per phase):
- Push event: `"🔀 Push to task branch — sha: XXXXXXX"`
- PR event: `"📬 PR opened: <title>"`
- QA request: `"📋 Task Performer requested QA review for task-XX"`
- QA outcome: `"✅ QA review complete — APPROVED"` or `"🔁 QA review complete — RETURNED: <reason>"`

PASS criterion: at least these 4 stream events present (exact wording may vary — emoji prefix and plain English are the requirements).

### O2 — No stream event requires technical context to understand
Pete reads each stream event in the `stream_events` result without looking at any other table.

PASS criterion: Pete can describe what happened in plain English from each event. No event requires knowing what a "tool_name" or "doc_type" is. Any event that reads like a log line (e.g., `"state transition: PROOFSUBMITTED -> APPROVED"`) is a FAIL.

### O3 — If RETURNED: stream event identifies what failed
```sql
SELECT description FROM stream_events 
WHERE task_id = 'task-XX' AND description LIKE '%RETURNED%'
ORDER BY id DESC LIMIT 1;
```
PASS criterion (if outcome is RETURNED): description states specifically what failed — not just "returned". Example: `"🔁 RETURNED: proof contains assertions not literal output"`. If the description just says "review submitted" or "returned", this is a FAIL — enrich `submit_qa_review` stream event text.

---

## Group P — Pete's 2-minute reconstruction

This is the definitive H5 test. Pete runs both queries, reads the output, and attempts to reconstruct the full task story.

### P1 — Timed reconstruction
Pete runs:
```sql
SELECT tool_name, action, actor, timestamp FROM audit_log WHERE task_id = 'task-XX' ORDER BY id;
SELECT description FROM stream_events WHERE task_id = 'task-XX' ORDER BY id;
```
Pete then reconstructs: what was built, what proof was submitted, what QA found, and what the outcome was.

Timer starts when Pete begins reading the output. Timer stops when Pete says "I'm confident in the outcome."

PASS criterion: under 2 minutes.

### P2 — No external resources consulted during reconstruction
Pete must not open: GitHub, any agent output window, any file on disk, the `documents` table directly.

PASS criterion: Pete does not feel the need to open anything else. If Pete reaches for GitHub or a file — note what was missing from the audit log that triggered that action. That is a gap finding.

### P3 — Outcome is unambiguous
Pete must be able to state: "this task is APPROVED and I trust the proof" or "this task is RETURNED and I know specifically why."

PASS criterion: no ambiguity about outcome. "I think it passed" is a FAIL. "It passed — QA confirmed all AC met and build output shows zero errors" is a PASS.

---

## Group Q — If RETURNED: findings are actionable

If the QA outcome is `RETURNED`, verify the return findings are sufficient for the Task Performer to know exactly what to fix.

### Q1 — QA review findings in audit_log action
```sql
SELECT action FROM audit_log
WHERE task_id = 'task-XX' AND tool_name = 'submit_qa_review_task_XX';
```
PASS criterion: `action` contains specific findings — not just "RETURNED". Must be actionable: what failed, what the correct behaviour should be.

### Q2 — Task Performer could re-activate and fix without asking Pete
Manual assessment: could a fresh Task Performer agent, reading only the context card and the QA audit entry, know what to fix?

PASS criterion: yes. If the findings require Pete to interpret or add context — the QA review findings template needs enriching.

---

## Pass/Fail Summary

| Test | Result | Notes |
|---|---|---|
| N1 all mandatory tool_names present (8 minimum) | — | |
| N2 both actors present | — | |
| N3 no null columns | — | |
| N4 outcome readable from audit action alone | — | |
| N5 tasks.state consistent with audit | — | |
| O1 stream events for all lifecycle phases | — | |
| O2 no event requires technical knowledge | — | |
| O3 RETURNED event identifies what failed | — | N/A if APPROVED |
| P1 reconstruction under 2 minutes | — | Record actual time |
| P2 no external resources consulted | — | Note any gaps |
| P3 outcome unambiguous | — | |
| Q1 RETURNED findings actionable | — | N/A if APPROVED |
| Q2 Task Performer could self-serve the fix | — | N/A if APPROVED |

**OVERALL VERDICT: — (pending H1–H4 completion)**

---

## What a PASS here proves

H5 PASS is the proof that the Nexus framework is doing its job. It means:

1. **Chain of custody is real** — not a design claim. Pete can reconstruct a task's history without opening a single file.
2. **Two actors are visible** — agent decisions and GitHub events are interleaved in one timeline, each attributed correctly.
3. **The handoff boundary is named** — Pete can see exactly where Task Performer work ended and QA work began.
4. **Trust is operationalised** — "trustworthy" is no longer a judgement call. It is "the audit log is complete, both actors are present, and QA confirmed all AC met."

---

## Exp-02 overall completion criterion

All five hypotheses PASS. Specifically:
- H1: real agent, no scope violations, literal proof
- H2: real SHA in audit_log from real GitHub push
- H3: QA tool set structurally disjoint from Task Performer
- H4: `request_review` visible as named handoff boundary in audit log
- H5: Pete reconstructs full lifecycle from audit log alone in < 2 minutes

If any hypothesis FAILS: document the failure classification, implement the fallback, and re-test that hypothesis before closing Exp-02. Do not proceed to Exp-03 with open critical failures.
