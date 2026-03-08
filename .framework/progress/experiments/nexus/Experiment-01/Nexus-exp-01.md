# Nexus Experiment 1: Dynamic Agent Specs + OCAP Tooling + GitHub Webhooks

This is the experiment that tests the most load-bearing assumptions in one run. I'll structure it as phases with discrete, verifiable steps — each one a proof point before the next begins. 

***

## What This Experiment Proves

By the end you will have confirmed or refuted:
- Dynamic agent spec generation + VS Code hot-reload (A1 resolved)
- Tool selection as structural access control (OCAP property)
- Per-task tool scoping via suffixed tool names
- GitHub webhook → Nexus audit log (single source of truth)
- A complete task lifecycle with unified chain of custody

***


## What You'll Have After This Experiment

| Assumption | Status after experiment |
|---|---|
| Hot-reload confirmed | ✅ Already confirmed by Pete; step 3.3 formalises it |
| Tool selection = structural access control | ✅ Proved in step 2.3 |
| Per-task instance scoping | ✅ Proved in phase 3 |
| Single source of truth across two systems | ✅ Proved in phase 4 + 5 |
| Compound tools enforce mandatory side effects | ✅ Proved by `submit_proof` in phase 5 |

The only assumption not tested here is context card quality for novel tasks (B3) — that's Probe 3 and comes after this foundation is solid. The entire experiment is approximately **3.5 hours of focused build time**. 


## Phases

1. Nexus Foundation: MCP server + VS Code connection + database schema: ./Nexus-exp-01-phase-01.md
2. OCAP Tooling: tools with side effects + audit log + unified chain of custody: ./Nexus-exp-01-phase-02.md
3. Dynamic Agent Specs: generate per-task agent specs on activation, hot-reloaded by VS Code: ./Nexus-exp-01-phase-03.md
4. GitHub Webhooks: Nexus MCP server listens to GitHub events, logs them in the audit log, proving single source of truth: ./Nexus-exp-01-phase-04.md
5. End-to-End Probe: one complete task lifecycle with unified chain of custody visible in the audit log: ./Nexus-exp-01-phase-05.md

