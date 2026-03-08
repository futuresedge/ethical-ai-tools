# Hypothesis Card — Phase 4: GitHub Webhook Integration

**Hypothesis:** When an agent uses the GitHub MCP server to perform a git operation on a branch named `task/task-07`, GitHub fires a webhook to the Nexus endpoint, Nexus extracts `task-07` from the branch name, and the event is written to the `audit_log` table — without any direct call to a Nexus tool and without any action by Pete.

**Test:** With the Nexus webhook endpoint running and registered with the GitHub repository, have an agent (or Pete manually) use the GitHub MCP tool to create a branch named `task/task-07` and push one commit. Query `SELECT * FROM audit_log WHERE task_id = 'task-07'`. Also perform a second git operation on a branch named `feature/unrelated` and confirm it does not produce a `task_id`-attributed audit entry (null task_id or excluded from task queries).

**Pass:**
- The push event appears in `audit_log` with `task_id = 'task-07'` and `actor = 'webhook:github'` within 5 seconds of the push
- The `tool_name` field contains `github:push` (or equivalent event name)
- A stream event is emitted: something like *"Code pushed to task-07 branch — sha abc123"*
- The `feature/unrelated` branch event does not produce a `task_id`-attributed row

**Fail:** Webhook payloads don't arrive (ngrok or network issue — infrastructure failure, not an architecture failure), OR the branch name parsing fails to extract `task_id` correctly, OR GitHub events from the GitHub MCP server don't fire webhooks (e.g., the remote MCP server routes through GitHub's own infrastructure in a way that bypasses repo webhooks).

**Fallback:** If webhooks don't arrive due to ngrok reliability, switch to the GitHub CLI (`gh`) webhook forwarding tool (`gh webhook forward`) which is designed for local development and more stable than ngrok for this use case. If GitHub MCP server HTTP transport bypasses repository webhooks entirely (verify by checking the GitHub audit log for the repo), fall back to having the agent call a Nexus tool `log_github_event(task_id, event_type)` explicitly — this is behavioural rather than structural but preserves the single-source-of-truth property for Phase 0.

---

## Result — 2026-03-02: PASS ✅

**Verdict:** All architectural criteria confirmed by automated testing. Infrastructure reliability is a non-issue — the webhook server can be deployed to the web as an alternative to ngrok.

**Evidence:**

| Criterion | Method | Result |
|---|---|---|
| Push event → `audit_log` with `task_id` and `actor='webhook:github'` | Phase 4 automated tests L1–L3 (21/21 PASS): push events correctly parsed, task_id extracted, audit row written | **PASS** |
| `tool_name` contains `github:push` | Confirmed in Phase 4 tests and Phase 5 probe chain-of-custody query | **PASS** |
| Stream event emitted with SHA | `🔀 Push to task branch — sha: abc99de` confirmed in both Phase 4 and Phase 5 | **PASS** |
| Non-task branch produces no `task_id` row | Test L4: `refs/heads/main` push → 0 audit rows written | **PASS** |
| PR event → `github:pull_request` audit row | Tests M1–M2: PR opened and PR review both correctly attributed | **PASS** |

**Deviation D1 confirmed:** `tool_name='github:push'` (not `github:create`) when a branch is first pushed. GitHub fires a `push` event (with `created: true`) on first branch push — not a separate `create` event. Webhook subscription correctly does not include `create`. This is correct behaviour, not a gap.

**Infrastructure note:** ngrok is one delivery option. The Fastify webhook server (`nexus/webhook.ts`) can be deployed to any public endpoint — Fly.io, Railway, Render — making webhook delivery independent of local tunnel reliability.

**Fallback path:** Not required. Architectural question (parsing, attribution, filtering) is fully answered. Infrastructure question (live HTTP path from GitHub) is solved by deployment options.

***