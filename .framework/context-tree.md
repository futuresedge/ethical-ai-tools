# Framework Context Tree

> Authoritative reference for context scoping across all agent operations.
> Every agent spec must declare READS/WRITES/NEVER consistent with this document.
> Last updated: 2026-03-01

---

## How to Read This Tree

Each node = one agent invocation.
TYPE: ORCHESTRATOR | EXECUTOR | COMPRESSION | BATCH
READS: named files only — no categories
WRITES: one artefact, one path
NEVER: files this agent must not load even if reachable
CACHE: whether static context benefits from prompt caching
BUDGET: estimated input token ceiling (static + dynamic)

---

## Zone 0 — Meta (Framework Governance)

### [FRAMEWORK OWNER]
```
TYPE: EXECUTOR
READS (always):
  - .github/instructions/agent-design.instructions.md
  - .github/skills/SKILLS-INVENTORY.md
  - .framework/context-tree.md
  - .framework/meta/TopAssumptionsAfterEventStormingSession.md
  - .framework/meta/DecisionLog-20260228.md
  - .framework/progress/open-questions.md
  - .framework/progress/retros/README.md       (placeholder; most recent retro file when available)
  - .framework/progress/experiments/README.md  (placeholder; most recent probe result when available)
READS (per assessment — named at invocation):
  - [artefact path provided at invocation]
WRITES:
  - .framework/assessments/[slug]-[date].md
NEVER:
  - .github/agents/          (no write authority)
  - .github/skills/          (no write authority)
  - .github/instructions/    (no write authority)
  - .framework/features/     (no write authority over pipeline artefacts)
  - src/                     (no write authority over application code)
  - Any artefact being assessed (read only)
CACHE: YES — always-on READS are static; only the per-assessment artefact varies
BUDGET: ~15k tokens
SKILL: framework-strategy
```

### [RETRO FACILITATOR]
```
TYPE: EXECUTOR
READS (always):
  - .framework/progress/open-questions.md
  - .framework/meta/TopAssumptionsAfterEventStormingSession.md
READS (per sprint — caller provides the list of paths in scope):
  - .framework/features/[slug]/reviews/feature-spec-review.md  (each feature in scope)
  - .framework/features/[slug]/reviews/ac-review.md
  - .framework/features/[slug]/reviews/decomposition-review.md
  - .framework/features/[slug]/tasks/[task-slug]/review-result.md  (each task in scope)
  - .framework/features/[slug]/tasks/[task-slug]/uncertainty-log.md  (where file exists)
  - .framework/assessments/[slug]-[date].md  (where files exist)
WRITES:
  - .framework/progress/retros/retro-[sprint-slug]-[date].md
NEVER:
  - feature-spec.md        (implementation artefact — not a review signal)
  - acceptance-criteria.md (implementation artefact — not a review signal)
  - task-spec.md           (implementation artefact — not a review signal)
  - task-ac.md             (implementation artefact — not a review signal)
  - context-package.md     (implementation artefact — not a review signal)
  - proof-of-completion.md (implementation artefact — not a review signal)
  - src/                   (no write authority)
  - .github/agents/        (no write authority)
  - .github/skills/        (no write authority)
NOTE:
  - Never closes open-questions.md directly — surfaces findings and hands off to Framework Owner
  - Output requires Product Owner acceptance before STATUS: ACCEPTED
CACHE: YES — signal-extraction and report-format references are stable
BUDGET: ~20k tokens (higher than typical Zone 0 — reads multiple review artefacts per sprint)
SKILL: retro-facilitation
```
```
FILES IN .framework/meta/:
  Agentic-Development-Framework.md           ← white paper: primitives, principles, theory, validation
  TopAssumptionsAfterEventStormingSession.md ← 10 load-bearing assumptions (ordered by consequence)
  DecisionLog-20260228.md                    ← committed design decisions from event storming and sessions
  PolicyRegistry-v0.1.md                     ← zone-by-zone policy rules (H13 hotspot: Zone 5 pending)
  Roadmap-v1.md                              ← sequenced priorities and milestone criteria
  Context Engineering_ Our Approach.md       ← context engineering model and instruction format rules
  FEATUREAggregateSpecification-v0.md        ← Feature aggregate state machine
  TaskAggregateSpec-v0.2.md                  ← Task aggregate state machine
  Event Storming Domain Map.md               ← full domain map from event storming session
  ProjectContextRequirements.md              ← bootstrap template for agent team context
  ProjectContextExtraction.md                ← extraction patterns for project context
  PromptEngineeringLessons.md                ← multi-agent token economics and isolation lessons

NOTE: Framework Owner does not load all meta files directly. Content is distilled into
  framework-strategy skill references. The two short files (TopAssumptions, DecisionLog)
  are loaded as direct READS for freshness. All others are accessed via skill references.

FILES IN .framework/progress/:
  open-questions.md                  ← unresolved design questions (OQ-nnn format)
  retros/README.md                   ← placeholder; sprint retro files added here after each sprint
  experiments/README.md              ← placeholder; probe result files added here as probes complete
```

---

## Zone 1 — Idea

### [IDEA CAPTURE] — human-operated, no agent

---

## Zone 2 — Feature Definition

### [FEATURE ORCHESTRATOR]
```
TYPE: ORCHESTRATOR
READS:
  - .framework/ideas/[slug]/idea.md (path reference only)
WRITES: nothing — routes and gates only
NEVER:
  - feature-spec.md content
  - acceptance-criteria.md content
  - ui-artefact.md content
  - any artefact content from child nodes
CACHE: YES — instructions never change
BUDGET: ~2k tokens (paths + gate conditions only)
SPAWNS:
  - Define Feature
  - Write Feature AC (after feature accepted)
  - Design UI (parallel, after feature accepted)
  - Write Feature Tests (after AC accepted)
  - Decompose to Tasks (after AC + UI accepted)
GATES:
  - feature-spec.md accepted by human before spawning AC Writer
  - acceptance-criteria.md accepted before spawning Decompose
  - ui-artefact.md accepted before spawning Decompose
```

### [DEFINE FEATURE]
```
TYPE: EXECUTOR
READS:
  - .framework/ideas/[slug]/idea.md
  - .framework/ideas/[slug]/success-criteria.md
WRITES:
  - .framework/features/[slug]/feature-spec.md
NEVER:
  - acceptance-criteria.md
  - ui-artefact.md
  - any task-level files
  - AGENTS.md (stack details not needed at definition stage)
CACHE: YES — instructions + feature-definition skill
BUDGET: ~8k tokens
SKILL: feature-definition
```

### [FEATURE SPEC REVIEWER]
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/feature-spec.md
  - .github/skills/feature-definition/references/definition-checklist.md
WRITES:
  - .framework/features/[slug]/reviews/feature-spec-review.md
NEVER:
  - .framework/features/[slug]/acceptance-criteria.md
  - .framework/features/[slug]/decomposition.md
  - .framework/features/[slug]/tasks/
CACHE: YES
BUDGET: ~4k tokens
SKILL: artefact-review
```

### [WRITE FEATURE AC]
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/feature-spec.md
WRITES:
  - .framework/features/[slug]/acceptance-criteria.md
NEVER:
  - idea.md (already distilled into feature-spec)
  - ui-artefact.md (UI not yet accepted)
  - any task-level files
CACHE: YES — instructions + acceptance-criteria skill
BUDGET: ~6k tokens
SKILL: acceptance-criteria
```

### [AC REVIEWER]
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/acceptance-criteria.md
  - .github/skills/acceptance-criteria/references/four-ac-conditions.md
  - .github/skills/acceptance-criteria/references/given-when-then-format.md
  - .github/skills/acceptance-criteria/references/ac-vs-tests.md
WRITES:
  - .framework/features/[slug]/reviews/ac-review.md
NEVER:
  - .framework/features/[slug]/feature-spec.md
  - .framework/features/[slug]/decomposition.md
  - .framework/features/[slug]/tasks/
CACHE: YES
BUDGET: ~6k tokens
SKILL: artefact-review
```

### [DESIGN UI]
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/feature-spec.md
  - .github/instructions/brand-guidelines.instructions.md
  - .github/instructions/design-system.instructions.md
WRITES:
  - .framework/features/[slug]/ui-artefact.md
NEVER:
  - acceptance-criteria.md (parallel track — not a dependency)
  - any task-level files
CACHE: YES — instructions + brand/design-system files are stable
BUDGET: ~10k tokens
SKILL: ui-design
```

### [WRITE FEATURE TESTS]
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/acceptance-criteria.md
WRITES:
  - .framework/features/[slug]/tests/feature-tests.md
NEVER:
  - feature-spec.md (AC is the distilled source — do not go upstream)
  - ui-artefact.md
  - any task-level files
CACHE: YES — instructions + test-writing skill
BUDGET: ~5k tokens
SKILL: test-writing
```

### [DECOMPOSE TO TASKS]
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/feature-spec.md
  - .framework/features/[slug]/acceptance-criteria.md
  - .framework/features/[slug]/ui-artefact.md
  - AGENTS.md (stack constraints — needed for decomposition sizing)
WRITES:
  - .framework/features/[slug]/decomposition.md
NEVER:
  - feature-tests.md (tests inform task AC, not decomposition)
  - any task-level files (none exist yet)
CACHE: YES — instructions + decomposition skill
BUDGET: ~15k tokens (highest in Zone 2 — justified by multi-source read)
SKILL: feature-decomposition
```

### [DECOMPOSITION REVIEWER]
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/decomposition.md
  - .github/skills/feature-decomposition/references/decomposition-rules.md
  - .github/skills/feature-decomposition/references/independence-test.md
WRITES:
  - .framework/features/[slug]/reviews/decomposition-review.md
NEVER:
  - .framework/features/[slug]/feature-spec.md
  - .framework/features/[slug]/acceptance-criteria.md
  - .framework/features/[slug]/tasks/
CACHE: YES
BUDGET: ~6k tokens
SKILL: artefact-review
```

---

## Zone 3 — Task Preparation (BATCH PHASE)

> All Zone 3 operations run as sequential batches across all tasks in the feature.
> One agent invocation per task, sequentially. Cache warms on task 1, hits on tasks 2–n.

### [TASK ORCHESTRATOR] × per task
```
TYPE: ORCHESTRATOR
READS:
  - .framework/features/[slug]/decomposition.md (one task entry only)
WRITES: nothing — routes and gates only
NEVER:
  - feature-spec.md content
  - any sibling task files
  - context-package.md content
CACHE: YES — instructions never change
BUDGET: ~2k tokens
SPAWNS:
  - Define Task
  - Write Task AC (after task defined)
  - [BATCH] Context Curation (after task AC accepted)
  - [BATCH] Write Task Tests (after task AC accepted, parallel with Context Curation)
GATES:
  - task-spec.md present before spawning Write Task AC
  - task-ac.md accepted before spawning Context Curation + Write Task Tests
  - context-package.md present before task published
```

### [TASK SPEC WRITER] — BATCH
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/decomposition.md (own task entry only)
  - .framework/features/[slug]/acceptance-criteria.md (FAC IDs in SATISFIES only)
  - AGENTS.md (constraints relevant to artefact type only)
WRITES:
  - .framework/features/[slug]/tasks/[task-slug]/task-spec.md
NEVER:
  - .framework/features/[slug]/feature-spec.md
  - .framework/features/[slug]/ui-artefact.md
  - .framework/features/[slug]/tasks/[other-slug]/task-spec.md
  - .framework/features/[slug]/tasks/[task-slug]/task-ac.md
  - .framework/features/[slug]/tasks/[task-slug]/context-package.md
NOTE: task directory must exist before invocation — agent does not create directories
CACHE: YES
BUDGET: ~8k tokens
SKILL: task-definition
```

### [TASK SPEC REVIEWER] — BATCH
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/tasks/[task-slug]/task-spec.md
  - .framework/features/[slug]/decomposition.md (own task entry only — scope verification)
  - .github/skills/task-definition/references/task-definition-checklist.md
WRITES:
  - .framework/features/[slug]/tasks/[task-slug]/reviews/task-spec-review.md
NEVER:
  - .framework/features/[slug]/feature-spec.md
  - .framework/features/[slug]/tasks/[other-slug]/task-spec.md
  - .framework/features/[slug]/tasks/[task-slug]/task-ac.md
CACHE: YES
BUDGET: ~6k tokens
SKILL: artefact-review
```

### [WRITE TASK AC] — BATCH
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/tasks/[task-slug]/task-spec.md
  - .framework/features/[slug]/acceptance-criteria.md (parent AC only — reference, not copy)
WRITES:
  - .framework/features/[slug]/tasks/[task-slug]/task-ac.md
NEVER:
  - feature-spec.md
  - ui-artefact.md
  - sibling task files
CACHE: YES
BUDGET: ~6k tokens
SKILL: acceptance-criteria
```

### [CURATE CONTEXT] — BATCH ★ COMPRESSION NODE
```
TYPE: COMPRESSION
READS:
  - .framework/features/[slug]/tasks/[task-slug]/task-spec.md
  - .framework/features/[slug]/tasks/[task-slug]/task-ac.md
  - .framework/features/[slug]/tasks/[task-slug]/task-tests.md
  - .framework/features/[slug]/ui-artefact.md
  - AGENTS.md (stack + environment)
WRITES:
  - .framework/features/[slug]/tasks/[task-slug]/context-package.md
NEVER:
  - feature-spec.md (already distilled into task-spec)
  - feature-level acceptance-criteria.md (already distilled into task-ac)
  - sibling task context packages
NOTE:
  - Input is intentionally larger than output
  - Goal: minimum sufficient tokens for Task Performer to act correctly
  - Flag context conflicts before writing — do not silently resolve
CACHE: YES — compression rubric is stable, only input package varies
BUDGET: ~20k tokens input / target ~4k output
SKILL: context-compression
```

### [WRITE TASK TESTS] — BATCH
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/tasks/[task-slug]/task-ac.md
WRITES:
  - .framework/features/[slug]/tasks/[task-slug]/task-tests.md
NEVER:
  - task-spec.md (AC is the distilled source — do not go upstream)
  - feature-spec.md
  - context-package.md (not yet written)
CACHE: YES
BUDGET: ~5k tokens
SKILL: test-writing
```

---

## Zone 4 — Task Execution

### [TASK PERFORMER]
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/tasks/[task-slug]/context-package.md ONLY
WRITES:
  - code / output in declared locations
  - .framework/features/[slug]/tasks/[task-slug]/proof-of-completion.md
NEVER:
  - task-spec.md (already in context-package)
  - task-ac.md (already in context-package)
  - feature-spec.md
  - ui-artefact.md
  - sibling task files
  - AGENTS.md directly (stack info is in context-package if needed)
NOTE:
  - If context-package is missing or stale: STOP. Raise uncertainty. Do not self-curate.
CACHE: NO — context-package changes per task
BUDGET: ~8k tokens (context-package + task output)
```

### [ADVISOR AGENT] — uncertainty sub-flow only
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/tasks/[task-slug]/context-package.md
  - .framework/features/[slug]/tasks/[task-slug]/uncertainty-log.md
  - AGENTS.md
WRITES:
  - .framework/features/[slug]/tasks/[task-slug]/uncertainty-log.md (appended)
  - mitigation recommendation (appended to uncertainty-log)
NEVER:
  - feature-spec.md
  - sibling task files
NOTE:
  - Elevated context is bounded — not unlimited
  - If mitigation requires reading outside this budget: escalate to human
CACHE: YES
BUDGET: ~12k tokens (highest in Zone 4 — justified by uncertainty resolution scope)
SKILL: uncertainty-protocol
```

### [QA REVIEWER] — BATCH
```
TYPE: EXECUTOR
READS:
  - .framework/features/[slug]/tasks/[task-slug]/task-ac.md
  - .framework/features/[slug]/tasks/[task-slug]/task-tests.md
  - .framework/features/[slug]/tasks/[task-slug]/proof-of-completion.md
WRITES:
  - .framework/features/[slug]/tasks/[task-slug]/review-result.md
NEVER:
  - context-package.md (reviewer assesses against AC, not the context given to performer)
  - feature-spec.md
  - sibling task reviews
CACHE: YES — review rubric is stable, only artefacts vary
BUDGET: ~10k tokens
SKILL: qa-review
```

---

## Zone 5 — Feature Delivery

> Zone 5 operates at feature scope, not task scope.
> Agents in this zone read task-level review results but never task-level source files.

### [INTEGRATION TRIGGER] — automated policy, no agent
```
POLICY: Whenever all tasks in feature have review-result.md with status PASS
         → trigger integration test run
```

### [FEATURE DELIVERY ORCHESTRATOR]
```
TYPE: ORCHESTRATOR
READS:
  - .framework/features/[slug]/tasks/*/review-result.md (status fields only)
  - integration test results (summary only)
  - staging verification result
WRITES: nothing — routes and gates only
NEVER:
  - any task-spec, task-ac, context-package files
  - feature-spec.md content
CACHE: YES
BUDGET: ~3k tokens
```

---

## Zone N — Nexus Experiment Build

> Parallel track to the main pipeline. Runs while Zones 1–5 continue operating.
> No adoption decision until Phase 5 pass criterion is met and verified.
> Build agents here write code and config, not .framework/ pipeline artefacts.

> ⚠️ AGENT CREATOR NOTE: Build agents in this zone follow normal spec format.
> Nexus Operational Agents (Task Performer, QA Reviewer, Context Agent) are
> NOT written by the Agent Creator — see the GENERATED BY / STATUS fields below.
> Do not attempt to write operational agent specs from this tree.

---

### [NEXUS SERVER BUILDER] — Phases 1, 2, 3
```
TYPE: EXECUTOR
READS:
  - .framework/progress/experiments/nexus/Nexus-exp-01-phase-01.md
  - .framework/progress/experiments/nexus/Nexus-exp-01-phase-02.md
  - .framework/progress/experiments/nexus/Nexus-exp-01-phase-03.md
  - .framework/progress/experiments/nexus/NexusToolGrammar.md
  - .framework/progress/experiments/nexus/NexusModelOverview.md
  - .framework/progress/experiments/nexus/NexusDecisionsRationale.md
  - .framework/progress/experiments/nexus/ONE-Ontology.md
  - AGENTS.md (workspace structure constraints — nexus/ at root, not src/)
WRITES:
  - nexus/package.json
  - nexus/tsconfig.json
  - nexus/schema.sql
  - nexus/db.ts
  - nexus/server.ts
  - .vscode/mcp.json
  - .github/agents/task-performer.template.md
NEVER:
  - src/                              (application code — separate surface)
  - .framework/features/             (pipeline artefacts — not in scope)
  - .github/agents/*.agent.md        (do not overwrite existing agent specs)
  - .framework/progress/experiments/ (read only — do not modify experiment docs)
NOTE:
  - nexus/ directory is created at workspace root — not inside src/
  - Use better-sqlite3 (synchronous API) — not better-sqlite3-multiple-ciphers or async variants
  - All tool names must comply with NexusToolGrammar.md before implementation
  - Run nexus-ontology 6-dimension checklist before implementing any tool
  - Flag any hardcoded state transitions as technical debt in code comments
CACHE: NO — reads multiple source docs that evolve across phases
BUDGET: ~25k tokens (highest in Zone N — justified by multi-phase, multi-source read)
SKILL: nexus-server, nexus-tool-grammar, nexus-ontology
```

### [NEXUS WEBHOOK BUILDER] — Phase 4
```
TYPE: EXECUTOR
READS:
  - .framework/progress/experiments/nexus/Nexus-exp-01-phase-04.md
  - .framework/progress/experiments/nexus/NexusDecisionsRationale.md  (Decision 4 + 5)
  - nexus/db.ts                                                         (shared db instance)
  - nexus/schema.sql                                                    (audit_log table shape)
WRITES:
  - nexus/webhook.ts
  - nexus/webhook-parser.ts
NEVER:
  - nexus/server.ts                  (do not modify the MCP server — separate process)
  - src/                             (application code — not in scope)
  - .framework/                      (experiment docs are read only)
  - .github/agents/                  (no agent spec authority)
NOTE:
  - Fastify HTTP server runs on port 3001 — separate process from the MCP STDIO server
  - Branch extraction rule: refs/heads/task/task-07 → task_id: task-07
  - Writes to audit_log with actor = 'webhook:github' — never 'agent'
  - ngrok setup instructions are in phase-04 doc — do not invent alternatives
CACHE: NO — reads live nexus/ files that may not exist yet
BUDGET: ~10k tokens
SKILL: nexus-server
```

### [NEXUS PROBE RUNNER] — Phase 5
```
TYPE: EXECUTOR
READS:
  - .framework/progress/experiments/nexus/Nexus-exp-01-phase-05.md
  - nexus/schema.sql                                                    (expected table shapes)
  - .framework/progress/experiments/nexus/Nexus-agent-plan.md          (pass criteria)
WRITES:
  - nexus/seed-task-07.sql
  - .framework/progress/experiments/nexus/Nexus-exp01-probe-results.md
NEVER:
  - nexus/server.ts                  (probe runner does not modify the server)
  - nexus/webhook.ts                 (probe runner does not modify the webhook server)
  - src/                             (application code — not in scope)
  - .framework/features/             (not relevant to experiment)
NOTE:
  - Pass criterion: SELECT on audit_log WHERE task_id = 'task-07' must return all 9
    lifecycle events in order, spanning both 'agent' and 'webhook:github' actors
  - If audit log is incomplete: document exactly which events are missing; do not
    declare a partial pass
  - Probe results file must record actual SQL output, not a description of output
CACHE: YES — phase-05 doc and schema are stable during the probe
BUDGET: ~8k tokens
SKILL: nexus-ontology  (phase-coverage-map.md — pass criterion reference)
```

---

### Nexus Operational Agents — NOT created by Agent Creator

> The following roles are produced by the Nexus server itself, not by the Agent Creator.
> They appear here so the Agent Creator knows to NEVER write specs for these roles
> and so the Framework Owner can track what is dynamically managed vs. hand-crafted.

**[TASK PERFORMER (task-{id})]**
```
GENERATED BY: activate_task tool in nexus/server.ts (Phase 3)
TEMPLATE:     .github/agents/task-performer.template.md
FILE PATTERN: .github/agents/task-performer-{task-id}.agent.md
LIFECYCLE:    Created on task activation — deleted on deactivate_task
STATUS:       DYNAMIC — Agent Creator must never write this spec manually
TOOL SET (injected at generation time):
  - get_context_card              (universal)
  - raise_uncertainty             (universal)
  - read_task_spec_{slug}         (task-scoped)
  - write_proof_template_{slug}   (task-scoped)
  - append_work_log_{slug}        (task-scoped)
  - submit_proof_{slug}           (task-scoped, compound)
```

**[NEXUS QA REVIEWER]**
```
STATUS:       NOT YET BUILT — future experiment phase
GENERATED BY: Agent Creator (when Phase 6 begins — hand-write the spec then)
READS (anticipated):
  - nexus tool calls only — no .framework/ files
  - qa_rules table (via read_qa_rules tool)
  - submitted proof (via read_proof_{slug} tool)
WRITES (anticipated):
  - qa_review document (via submit_qa_review_{slug} tool)
SKILL (anticipated): nexus-qa-rules
NOTE: Do not write this spec until nexus-qa-rules skill and QA Reviewer tool set
  are finalized. Premature spec risks lock-in before the tool design is stable.
```

**[NEXUS CONTEXT AGENT]**
```
STATUS:       NOT YET BUILT — future experiment phase (Assumption B3 probe)
GENERATED BY: Agent Creator (when B3 probe begins — hand-write the spec then)
READS (anticipated):
  - sprint_learnings table (via get_sprint_learnings tool)
  - patterns table (via search_pattern_registry tool)
  - task_spec (via read_task_spec_{slug} tool)
WRITES (anticipated):
  - context_card (via write_context_card_{slug} tool)
SKILL (anticipated): nexus-context-card
NOTE: Do not write this spec until the knowledge base schema is stable and
  at least one sprint's worth of learnings have been accumulated.
```

---

## Uncertainty Sub-flow (cross-zone)

```
TRIGGER: Any executor agent that cannot proceed with available context
CONDITION: Agent reads context-package and finds it insufficient or contradictory
ACTION:
  1. STOP — do not attempt to resolve silently
  2. WRITE uncertainty to: .framework/features/[slug]/tasks/[task-slug]/uncertainty-log.md
  3. FORMAT: WHAT is unclear | WHY it blocks progress | WHAT information would resolve it
  4. YIELD to Advisor Agent
```

---

## Context Conflict Rule (all nodes)

```
IF any two files in READS contradict each other:
  DO NOT average between them
  DO NOT choose one silently
  WRITE conflict to uncertainty-log.md
  STOP and yield
```

---
