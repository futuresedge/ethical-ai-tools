# Skill: Acceptance Criteria
TRIGGERS: "write AC", "acceptance criteria", "write TAC", "task acceptance criteria"
ZONE: 2–3
USED BY: Write Feature AC agent, Write Task AC agent
CONTEXT-TREE NODES: [WRITE FEATURE AC], [WRITE TASK AC]

## What this skill does
Governs how AC is written at both feature and task scope. Enforces the
four conditions and the AC-vs-test distinction that is the most
load-bearing rule in the entire framework.

## Load on activation
- references/four-ac-conditions.md
- references/given-when-then-format.md
- references/ac-vs-tests.md

## Load only for task-scope AC
- references/task-ac-constraints.md

## Do not load
- test-writing skill references (separate skill)
- feature-spec-template (separate skill)

## The non-negotiable distinction
AC describes a condition the system must satisfy.
A test describes how to verify that condition is satisfied.
These are never the same thing. Never conflate them.
