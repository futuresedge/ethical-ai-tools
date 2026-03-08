# Exp-02 Test Plan — H2: Real GitHub Operations
**Date:** 2026-03-02  
**Hypothesis card:** `Exp-02-Hypothesis-cards.md` § Phase 2  
**Method:** `gh webhook forward` for local delivery + audit_log query for real SHA verification  
**Executor:** Nexus Reviewer (automated DB verification) + Pete (webhook delivery confirmation)

---

## Scope

H2 tests whether real GitHub push and PR events — produced by the Task Performer agent during H1 execution — arrive at the Nexus webhook endpoint and are correctly attributed in the audit log within 10 seconds of the agent's push.

**Difference from Exp-01:** Exp-01 used curl simulation. H2 requires real GitHub traffic on a real branch (`task/task-XX`), delivered via `gh webhook forward` rather than ngrok.

---

## Pre-build Review Findings

| # | Finding | Severity | Resolution |
|---|---|---|---|
| R1 | `gh webhook forward` requires GitHub CLI authenticated to `futuresedge/ethical-ai-tools` | **REQUIRED** | Run `gh auth status` before starting. Confirm authenticated user has webhook admin on the repo. |
| R2 | Webhook server must be running on port 3001 before forwarding starts | **REQUIRED** | `cd nexus && pnpm start:webhook` — confirm with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/nonexistent` → 404 |
| R3 | `gh webhook forward` only forwards events that match the subscribed event types | **VERIFY** | Our subscription is `push`, `pull_request`, `pull_request_review`. `gh webhook forward` supports per-event filtering. Command must include `--events push,pull_request` |
| R4 | Branch `task/task-XX` must not already exist in the remote repo | **CHECK** | Run `gh api repos/futuresedge/ethical-ai-tools/branches` before the H1 agent runs. Delete stale test branches. |
| R5 | Real SHA in audit_log action field | **KEY CRITERION** | The `action` JSON in `audit_log` must contain a SHA that matches the actual commit in GitHub. This is what distinguishes real from simulated. |
| R6 | Timing window: 10-second pass criterion | **VERIFY** | Timestamp of `github:push` audit row vs. timestamp of the agent's commit. WAL mode means webhook write is immediate on receipt. |

---

## Pre-conditions

- H1 execution is in progress or complete (agent has pushed to `task/task-XX`)
- `pnpm start:webhook` running (port 3001)
- `gh webhook forward` running in a separate terminal (see setup below)
- `gh auth status` confirms authentication to `futuresedge/ethical-ai-tools`
- `nexus/nexus.db` accessible for post-event queries

---

## Setup: Start webhook forwarding

```sh
# Terminal 2 — leave running throughout H1 execution
gh webhook forward \
  --repo=futuresedge/ethical-ai-tools \
  --events=push,pull_request,pull_request_review \
  --url=http://localhost:3001/webhook/github
```

PASS criterion for setup: `gh webhook forward` prints "Forwarding webhook events..." without error. Any error here is a pre-condition failure — resolve before proceeding.

---

## Group E — Webhook delivery

### E1 — At least one github:push row exists after agent push
Run after H1 Group B (agent has pushed a branch):
```sql
SELECT tool_name, action, actor, timestamp 
FROM audit_log 
WHERE task_id = 'task-XX' AND tool_name = 'github:push'
ORDER BY id DESC LIMIT 3;
-- EXPECTED: at least one row with actor = 'webhook:github'
```
PASS criterion: row present.

### E2 — Event arrived within 10 seconds of push
Compare `timestamp` in the `github:push` audit row against the timestamp of the actual commit visible in GitHub (`gh api repos/futuresedge/ethical-ai-tools/commits/task/task-XX`).

```sh
gh api repos/futuresedge/ethical-ai-tools/branches/task%2Ftask-XX \
  --jq '.commit.commit.committer.date'
# Compare this to the audit_log timestamp for github:push
```
PASS criterion: audit row timestamp within 10 seconds of commit date.

### E3 — SHA in audit_log matches real commit SHA
```sql
SELECT json_extract(action, '$.sha') as sha 
FROM audit_log 
WHERE task_id = 'task-XX' AND tool_name = 'github:push'
ORDER BY id DESC LIMIT 1;
```
```sh
gh api repos/futuresedge/ethical-ai-tools/branches/task%2Ftask-XX \
  --jq '.commit.sha[:7]'
# Compare first 7 chars
```
PASS criterion: SHA prefix in audit_log action matches real commit SHA. This is the definitive "not simulated" proof.

### E4 — PR creation event appears after agent creates PR
If the agent creates a PR via GitHub MCP during H1 execution:
```sql
SELECT tool_name, action, actor FROM audit_log
WHERE task_id = 'task-XX' AND tool_name = 'github:pull_request'
ORDER BY id DESC LIMIT 1;
-- EXPECTED: action contains PR title, actor = 'webhook:github'
```
PASS criterion: row present with real PR title from the agent's PR creation.

### E5 — Non-task branches (if any) produce no rows
If the agent or any other process pushes to a non-task branch during the session:
```sql
SELECT COUNT(*) FROM audit_log 
WHERE task_id IS NULL AND tool_name = 'github:push';
-- EXPECTED: 0 (non-task pushes are silently discarded)
```
PASS criterion: zero NULL task_id rows.

---

## Group F — Content and attribution verification

### F1 — actor is 'webhook:github' for all GitHub events
```sql
SELECT DISTINCT actor FROM audit_log 
WHERE task_id = 'task-XX' AND tool_name LIKE 'github:%';
-- EXPECTED: exactly 'webhook:github', no 'agent' rows
```
PASS criterion: only `webhook:github` attributed to `github:*` tool names.

### F2 — action JSON is parseable and self-describing
```sql
SELECT tool_name, action FROM audit_log
WHERE task_id = 'task-XX' AND actor = 'webhook:github';
```
Manual check: each `action` field must contain a real SHA or PR title — not placeholder values.

PASS criterion: no `action` values are null, empty, or contain "abc123" (simulated SHA).

### F3 — Stream events contain real SHA
```sql
SELECT description FROM stream_events 
WHERE task_id = 'task-XX' AND description LIKE '🔀%'
ORDER BY id DESC LIMIT 1;
-- EXPECTED: '🔀 Push to task branch — sha: <real 7-char SHA>'
```
PASS criterion: SHA in stream event matches the real commit (compare with E3).

---

## Failure Classification

| Failure | Severity | Action |
|---|---|---|
| No `github:push` rows (webhook not delivered) | **BLOCKER** | Check `gh webhook forward` terminal for errors. If still failing, fall back: agent calls `log_github_event(task_id, 'push', sha)` explicitly. Mark as P2-INFRASTRUCTURE-FALLBACK. |
| SHA in action is placeholder/null | **CRITICAL** | Bug in `webhook-parser.ts` SHA extraction. Check `extractTaskId()` and `formatStreamEvent()`. |
| Event arrived > 10 seconds late | **MODERATE** | Note delay. If consistently > 30s, `gh webhook forward` may be adding overhead — try ngrok as alternative. Not a blocker for the hypothesis. |
| Branch name not parsed to task_id | **CRITICAL** | Parser bug — `extractTaskId()` not handling the branch name format. Check `refs/heads/task/task-XX` stripping logic. |

---

## Pass/Fail Summary

| Test | Result | Notes |
|---|---|---|
| Setup: gh webhook forward running | — | |
| E1 github:push row present | — | |
| E2 event within 10 seconds | — | |
| E3 SHA matches real commit | — | |
| E4 PR event present (if agent created PR) | — | |
| E5 no NULL task_id rows | — | |
| F1 actor=webhook:github for all github: events | — | |
| F2 action JSON parseable and real | — | |
| F3 stream event contains real SHA | — | |

**OVERALL VERDICT: — (pending execution)**

**The definitive pass signal:** `json_extract(action, '$.sha')` in audit_log matches `gh api ... | .commit.sha[:7]`. Any other test can pass on simulation. This one cannot.
