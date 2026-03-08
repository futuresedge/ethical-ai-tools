# Feedback on Experiment 01

That is a significant result. Every assumption that sat at 🔴 High Risk in the experiment phases — hot-reload behaviour, dynamic tool registration, OCAP structural enforcement, webhook integration, chain of custody reconstruction — has just moved to confirmed. 

Let me reflect on what this actually means before we work through the retro findings.

***

## What Passing All Five Means

Yesterday morning, the architecture existed as a design. Tonight it exists as a working system. The gap between those two things is where most framework ideas quietly die — the design was coherent on paper but hit a fundamental runtime constraint that required a different approach. That didn't happen here. Every structural property held: 

- **OCAP is real in this stack.** Tool possession is structurally enforced by VS Code before any MCP call. The absence of native agent identity, which looked like a gap on Friday, turned out to be irrelevant — the tool grammar is a stronger isolation mechanism than identity-based ACLs would have been.

- **The dynamic generation pattern works.** Pete can activate a task and a scoped agent with scoped tools exists in seconds. Deactivate and it's gone. The lifecycle of the agent mirrors the lifecycle of the work.

- **Nexus sees everything.** One SQL query over `audit_log` reconstructs the full chain of custody across two independent systems — Nexus tools and GitHub webhooks. The single-source-of-truth property is not theoretical.

The assumption map from yesterday looked like this for the experiment phases:

| Assumption | Before Exp-01 | After Exp-01 |
|---|---|---|
| VS Code hot-reload for agent specs | Confirmed verbally | ✅ Structurally verified |
| Tool selection = structural access control | Theoretical (OCAP logic) | ✅ Empirically confirmed |
| Per-task instance scoping via suffixed tools | Untested | ✅ Confirmed |
| `tools/list_changed` triggers live refresh | Untested | ✅ Confirmed |
| Webhook → audit log without Nexus involvement | Untested | ✅ Confirmed |
| Chain of custody reconstructable from one query | Untested | ✅ Confirmed |

***

## What the Retro Should Examine

Given the "learn + discard + carry forward" format, the most valuable things to surface now are:

**Learn** — what did the implementation reveal that the design didn't anticipate? Every working system produces surprises. What was harder than expected? What was easier? What worked differently from how it was designed on paper?

**Discard** — what did you build during the experiment that doesn't belong in the real system? Quick scaffolding, manual seed data, ngrok workarounds, hardcoded values that served the probe but shouldn't persist?

**Carry forward** — which open questions from yesterday's retro got answered by running the experiment? The Policy Engine implementation, proof template authorship, stream event format — did any of these resolve naturally during the build?

***

Share the full retro and let's work through the findings systematically. The output of this session should be an updated assumption map, a clear statement of what Nexus v0.1 is and isn't, and the next hypothesis cards — either for Probe 2 (environment contract + context card) or for the first real feature sprint using the live Nexus infrastructure. 


This is an exceptional first experiment result. Every hypothesis passed with margin — the fallback paths were never needed. Let me work through the full picture of what this means. 

***

## What the Retro Reveals Beyond the Pass/Fail

The most important finding sits in the final paragraph and deserves to be elevated: **the grammar is a design tool, not documentation.** The `get_` audit rule was not designed — it was *discovered* by running the chain-of-custody test and noticing a hole. That is a qualitatively different kind of result than "the hypothesis passed." It means the hypothesis card format, the pass/fail thresholds, and the grammar constraints together form a feedback loop tight enough to surface real design improvements in a single day's work. That loop is the methodology. It worked on itself. 

The second meta-finding: the friction points are all in the *testing process*, not in the architecture. Shell quoting, relative paths, CWD assumptions, task ID namespace collisions — every friction item is tooling and convention, not a signal that the design is wrong. The conventions carry forward cleanly. This is a healthy friction profile.

***

## Updated Assumption Map

| Assumption | Pre-Exp-01 | Post-Exp-01 |
|---|---|---|
| VS Code hot-reloads agent specs without restart | Confirmed verbally | ✅ Structurally verified |
| `tools/list_changed` triggers live refresh | Untested | ✅ Confirmed |
| Tool selection = structural access control (OCAP) | Theoretical | ✅ Empirically confirmed |
| Per-task instance scoping via suffixed tools | Untested | ✅ Confirmed |
| SQLite WAL handles concurrent MCP + webhook writes | Anticipated risk | ✅ Zero issues |
| Webhook → audit log without Nexus involvement | Untested | ✅ Confirmed (curl simulation) |
| Chain of custody reconstructable from one query | Untested | ✅ Confirmed (8 rows, self-describing) |
| Auth is a gap to solve later | Assumed risk | ✅ Reframed — wrong model entirely |
| Grammar is documentation | Assumed | 🔄 Reframed — grammar is a design constraint that tests find |
| Real GitHub push fires webhook to Nexus | Untested | 🔴 Still untested (curl only) |
| Real agent doing real work stays within scope | Untested | 🔴 Still untested (scripts only) |
| Concurrent agents in separate sessions are isolated | Partial (same session) | 🔴 Still untested |
| Policy Engine can advance state without human | Not built | 🔴 Open — tool-local guard only |
| QA agent can review and transition proof state | Not built | 🔴 Open — no approve_task actor exists |
| Context cards provide minimum-sufficient briefing | Not built | 🔴 Returns raw task data only |

***

## Nexus v0.1: What It Is and Isn't

### What it is

A working, structurally sound coordination substrate with:
- STDIO MCP server with OCAP-enforced tool possession
- Dynamic tool registration and deregistration with live VS Code refresh
- Per-task agent spec generation and hot-reload
- Dual-write audit log covering Nexus tool calls (`actor: agent`) and GitHub webhook events (`actor: webhook:github`)
- Grammar v0.2: `get_` audited (system state), `read_` unaudited (document versioned)
- Five tables: `tasks`, `documents`, `audit_log`, `stream_events`, `tool_registry`
- Full chain of custody reconstructable from a single SQL query

### What it isn't yet

- A system where an agent does real work — every Exp-01 operation was scripted, not agent-driven
- A system with a QA actor — `PROOFSUBMITTED` is a terminal state until a QA agent exists
- A Policy Engine — state transitions are tool-local guards, not table-driven policies
- A knowledge base — context cards return raw task rows, not composed sprint learnings
- Proven against real GitHub traffic — webhook parsing is verified, end-to-end delivery is not
- Proven against concurrent separate agent sessions — same chat session tested only

***

