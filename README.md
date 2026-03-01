# Ethical Edge Tools

An Astro 5 site and a laboratory for the **Agentic Development Framework** — a trust-based,
structurally-enforced system for coordinating AI agents across a real software project.

The site itself (blog + React admin dashboard) is the test subject. Every feature built here
is built through the framework. Every friction point is discovery data.

---

## The Problem This Solves

When multiple AI agents work simultaneously — one defining requirements, one writing code, one
verifying quality — there is no structural guarantee they stay within their lane. Most frameworks
respond with longer instructions: more `NEVER` clauses, more rules in system prompts. Agent
instructions are conventions. Conventions fail.

This project takes a different position. **Make violations structurally impossible** — not
instructionally discouraged.

---

## Nexus

Nexus is the coordination layer being built and tested here. It is an MCP server that mediates
everything agents do, enforces task-level access control, and maintains a single audit log
covering both framework artefacts and GitHub code events.

Three structural properties hold unconditionally:

### 1. Violations are absent, not prevented

Nexus implements the [Object Capability Model](https://en.wikipedia.org/wiki/Object-capability_model):
a capability is not a permission you check — it is a reference you either possess or don't.

Every tool is named `{verb}_{subject}_{task_slug}`. A Task Performer assigned to task-07 receives
`write_proof_template_task_07` — and only that task's tools. The tool for task-08 does not appear
in its registry. VS Code enforces this at the client layer before any call reaches the server.
There is nothing to bypass.

### 2. Mandatory side effects are inside tools, not instructions to agents

A compound tool like `submit_proof_task_07` writes the proof document, transitions task state from
`CLAIMED` to `PROOFSUBMITTED`, emits a plain-English stream event, and writes an audit entry — all
in one atomic operation. The agent cannot forget to update the state. There is nothing to forget.
Behaviour is structural, not instructed.

### 3. Nexus sees everything, controls nothing it doesn't own

Framework artefacts (specs, proofs, AC) flow through Nexus tools. Code artefacts flow through the
GitHub MCP server independently. GitHub webhooks fire to Nexus on every git event. Nexus never
intercepts GitHub operations — it observes them. The branch naming convention (`task/task-07`)
gives Nexus the join key to attribute every git event to the right task. The audit log is complete
without Nexus being a chokepoint.

---

## Architecture

The following shows how Pete, agents, Nexus, and GitHub interact for a single active task:

```
PETE (Product Owner)
  │  activates tasks · approves gates · reads plain-English event stream
  ▼
activate_task(task-07)
  ├── generates .github/agents/task-performer-task-07.agent.md  (from template)
  ├── registers task-scoped tools in Nexus
  ├── sends tools/list_changed → VS Code refreshes registry
  └── generates context card for task-07

VS CODE (Agent Mode)
  @Task Performer (task-07) — sees only task-07's tools
  ├── Nexus:   read_task_spec_task_07
  │            write_proof_template_task_07
  │            append_work_log_task_07
  │            submit_proof_task_07          ← compound: write + state + stream + audit
  │            get_context_card
  │            raise_uncertainty
  └── GitHub:  create_branch · push_files · create_pull_request

NEXUS MCP SERVER (STDIO transport · SQLite)
  ├── Receives Nexus tool calls  → audit_log  (actor: 'agent')
  ├── Receives GitHub webhooks   → audit_log  (actor: 'webhook:github')
  └── Emits stream_events in plain English

GITHUB
  └── Fires webhooks on: push · PR open · PR review · merge
      Parsed by branch name: task/task-07 → task_id: task-07
```

---

## Experiment 1 — Dynamic Agent Specs + OCAP Tooling + GitHub Webhooks

The first experiment tests the most load-bearing assumptions in one run, structured as five
sequential phases with a discrete pass criterion at each step.

| Phase | What it builds | Pass criterion |
|---|---|---|
| **1 — Foundation** | MCP server (STDIO) · SQLite schema · VS Code registration | Server connects; tables created |
| **2 — OCAP Tooling** | Task-scoped tools · compound `submit_proof` · audit log | `submit_proof` writes proof + transitions state + emits event atomically |
| **3 — Dynamic Specs** | Per-task agent spec generation on `activate_task` · VS Code hot-reload | `task-performer-task-07.agent.md` appears in agent selector without restart |
| **4 — GitHub Webhooks** | Fastify webhook server on port 3001 · branch→task_id parser · webhook registration | Real push event lands in `audit_log` with `actor = 'webhook:github'` |
| **5 — End-to-End Probe** | Seed task-07 · run full lifecycle · verify audit trail | `audit_log` shows all 9 lifecycle events in order across both actors |

**Assumptions the experiment confirms or refutes:**

- `A1` — Dynamic agent spec generation + VS Code hot-reload
- `A2` — Tool possession as structural access control (OCAP property)
- `A3` — Per-task instance isolation via suffixed tool names
- `A4` — Single source of truth across Nexus + GitHub via webhook join
- `A5` — Compound tools enforce mandatory side effects unconditionally

**Not tested here:** context card quality for novel tasks (Assumption B3) — a later probe,
once this foundation is solid.

Experiment docs: [`.framework/progress/experiments/nexus/`](.framework/progress/experiments/nexus/)

---

## Framework Structure

The Agentic Development Framework governs how features are defined, decomposed, and implemented.
Agents operate in five zones:

| Zone | What happens |
|---|---|
| 1 | Idea capture |
| 2 | Feature definition · UI design · acceptance criteria · task decomposition |
| 3 | Task preparation — spec · AC · context curation · tests |
| 4 | Task execution — implement · verify · submit proof |
| 5 | Feature delivery — integration · staging · production |

Each zone has agents with explicit `READS / WRITES / NEVER` declarations and a token budget.

- Agent specs: [`.github/agents/`](.github/agents/)
- Framework artefacts: [`.framework/`](.framework/)
- Governance: [`AGENTS.md`](AGENTS.md)

---

## Dev Commands

| Command | Action |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Dev server at `localhost:4321` |
| `pnpm build` | Production build → `./dist/` |
| `pnpm preview` | Preview built site |
| `pnpm astro check` | Type-check (must pass before any commit) |
| `pnpm lint` | Lint (must pass before any commit) |

**Stack:** Astro 5 · React 18 · TypeScript (strict) · Tailwind v4 · shadcn/ui · pnpm

---

## Project Structure

```
src/
  pages/            .astro files — file-based routing
  layouts/          BlogPost.astro wraps all blog content
  components/       .astro (static) and .tsx (React islands)
  components/ui/    shadcn/ui primitives — DO NOT edit directly
  content/blog/     Markdown / MDX blog posts
  content.config.ts Zod schema for content collections
  data/             JSON files imported into React components
  styles/
    global.css      Tailwind theme tokens under @theme inline
  consts.ts         SITE_TITLE, SITE_DESCRIPTION

nexus/              Nexus MCP server — built during Experiment 1
.framework/         Framework governance artefacts (ideas, features, tasks, progress)
.github/agents/     Agent spec files (.agent.md)
.github/skills/     On-demand agent skill packs
```
