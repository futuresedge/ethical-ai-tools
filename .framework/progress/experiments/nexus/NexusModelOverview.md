# The Nexus Model

### One-Sentence Summary

A task-centric, structurally enforced, audit-complete agentic development framework where **tool possession is capability**, **every artefact is typed and scoped**, and **Nexus is the single source of truth** that observes everything — including events it didn't execute. 

***

## The Three Structural Properties

The entire design is derived from three properties that must hold unconditionally:

**1. Violations are absent, not prevented**
The Object Capability Model (OCAP) principle: an agent cannot call a tool it does not possess. There is no permission check to bypass — the tool simply does not exist in that agent's registry. A Task Performer for task-07 has no tool named `write_task_spec_task_08`. The write is architecturally impossible.

**2. Mandatory side effects are inside tools, not instructions to agents**
A compound tool like `submit_proof_task_07` writes the proof document, updates task state, emits a stream event, and writes an audit entry — all in one atomic operation. The agent cannot forget to emit the stream event. There is nothing to forget. The behaviour is structural, not instructed. 

**3. Nexus sees everything, controls nothing it doesn't own**
Framework artefacts (specs, proofs, AC) flow through Nexus tools directly. Code artefacts flow through the GitHub MCP server independently. GitHub webhooks fire to Nexus on every git event. Nexus never intercepts GitHub operations — it observes them after the fact. The audit log is complete without Nexus being a chokepoint. 

***

## Architecture at a Glance

```
PETE
  │ activates task, approves gates, reads stream
  ▼
ORCHESTRATION LAYER
  activate_task(task-07)
  │
  ├─ Generates .github/agents/task-performer-task-07.agent.md  (from template)
  ├─ Registers tools: write_proof_template_task_07, etc.       (in Nexus)
  ├─ Sends tools/list_changed → VS Code refreshes registry
  └─ Generates context card for task-07

VS CODE (Agent Mode)
  @Task Performer (task-07) — the only agent that can see task-07's tools
  │
  ├─ Nexus tools:  read_task_spec_task_07
  │                write_proof_template_task_07
  │                append_work_log_task_07
  │                submit_proof_task_07          ← compound: write+transition+stream
  │                get_context_card
  │                raise_uncertainty
  │
  └─ GitHub tools: create_branch, push_files,    ← toolset: pull_requests only
                   create_pull_request            ← scoped to task/task-07 branch

NEXUS (single source of truth)
  ├─ Receives all Nexus tool calls → audit_log  (actor: 'agent')
  ├─ Receives GitHub webhooks     → audit_log  (actor: 'webhook:github')
  └─ Emits stream_events for Pete in plain English

GITHUB
  └─ Fires webhooks on: push, PR open, PR review, merge, branch events
     → parsed by branch name: task/task-07 → task_id: task-07
```
***

### Conceptual Foundations

- **Object Capability Model (OCAP)** — search `"object capability model mark miller"` — the 30-year-old security principle that *possession of the reference is the permission*. Understanding why this is stronger than ACL is the theoretical foundation for the entire access control design in this framework
- **GitHub Webhooks documentation** — `docs.github.com/en/webhooks` — covers event types, payload structure, branch ref format (`refs/heads/task/task-07`), and webhook registration; directly relevant to the Nexus audit integration