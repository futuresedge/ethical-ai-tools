---
applyTo: "**/*.agent.md"
---

# Agent Design Rules

## Partitioning

PARTITION: by context need, not organisational role
ASK: what is the minimum information this operation requires?
NEVER: assign multiple distinct context windows to one agent
NEVER: name agents after job titles — name them after their operation

## Context Boundaries

EVERY AGENT MUST DECLARE:
  READS: named files only
  WRITES: one artefact, one path
  NEVER: files explicitly forbidden

READS must be sourced from: context-tree.md
NEVER add a READ without updating context-tree.md first

## Orchestrators

ORCHESTRATORS: receive file paths and gate conditions only
ORCHESTRATORS: never accumulate artefact content
ORCHESTRATORS: never read what their child agents write
PASS: paths between agents — not content

## Compression Node

CONTEXT CURATION: is the only node where input > output is correct
GOAL: minimum sufficient tokens for the next executor to act correctly
NEVER: let an executor agent self-curate — it must receive a pre-built context-package
IF context-package is missing: STOP, raise uncertainty

## Failure Behaviour

IF context is insufficient: STOP — do not guess
IF two context sources contradict: STOP — do not average
IN both cases: write to uncertainty-log.md, yield to Advisor Agent
NEVER: silently resolve ambiguity

## Instruction Format

WRITE agent instructions as: imperative shorthand
NOT as: prose, job descriptions, or documentation
EXAMPLE CORRECT: `READS: task-ac.md only`
EXAMPLE WRONG: `You should read the task acceptance criteria file carefully`

PLACE: critical rules at top of file
PLACE: boundaries (NEVER) at bottom of file
NEVER: put critical rules in the middle of an agent file

## File Size

AGENT FILES: persona + tools + READS/WRITES/NEVER + skill pointers only
TARGET: under 60 lines per agent file
EVERYTHING ELSE: belongs in a skill file or instructions file

## Skills

SKILLS: carry the substantive content agent files must not
SKILL FILES: must be stable and reusable — not task-specific
LOAD: skills on demand via trigger phrases — not at startup
SKILLS: are the correct location for rubrics, templates, checklists, format specs

## Caching

STATIC CONTENT (instructions, skills): place at top of context window
DYNAMIC CONTENT (task-specific input): place at bottom
BATCH: high-value curation agents across all tasks in a feature — do not reinvoke cold
HIGH-VALUE CACHE TARGETS: Context Agent, Test Writer, QA Reviewer

## Token Budgets

EVERY AGENT: has a token budget defined in context-tree.md
NEVER: exceed the budget defined for your node
IF budget would be exceeded: the context is wrong — fix the curation, not the budget

## Justifying Agent Boundaries

EVERY agent-to-agent handoff: multiplies token cost ~15×
BEFORE adding an agent boundary: confirm it either reduces context or enables parallelisation
IF neither: remove the boundary — collapse into the parent agent

## Scaling

1 agent: simple, single-context operations
2–4 agents: operations requiring parallel tracks or sequential isolation
n agents: batch operations across multiple items of the same type
NEVER: use more agents than the task complexity justifies