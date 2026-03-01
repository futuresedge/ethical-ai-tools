---
name: feature-decomposition
description: Instructs on the approved decomposition method
---

# Skill: Feature Decomposition
TRIGGERS: "decompose feature", "break into tasks", "task breakdown", "decomposition"
ZONE: 2
USED BY: Decompose to Tasks agent
CONTEXT-TREE NODE: [DECOMPOSE TO TASKS]

## What this skill does
Rules for breaking a feature into independently testable, independently
deployable tasks. Prevents tasks that are too large, too coupled, or
that duplicate each other.

## Load on activation
- references/decomposition-rules.md
- references/independence-test.md
- references/task-sizing-guide.md
- references/decomposition-output-format.md

## Do not load
- task-definition skill references (separate skill, separate agent)
- Any AC references (AC is input, not part of decomposition logic)
