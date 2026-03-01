# Skill: Context Compression
TRIGGERS: "curate context", "context package", "compress context", "prepare context"
ZONE: 3
USED BY: Curate Context agent
CONTEXT-TREE NODE: [CURATE CONTEXT] ★ COMPRESSION NODE

## What this skill does
The compression rubric for building a context-package from source artefacts.
This is the only operation in the framework where input is intentionally
larger than output. The goal is the minimum sufficient tokens for the
Task Performer to act correctly — nothing more.

## Load on activation
- references/compression-rubric.md
- references/inclusion-criteria.md
- references/conflict-detection.md
- references/context-package-template.md

## Core compression principle
INCLUDE: information the Task Performer needs to act
EXCLUDE: information the Task Performer only needs to understand
EXCLUDE: upstream reasoning that is already distilled in downstream artefacts
ALWAYS: flag conflicts — never silently resolve them

## Do not load
- Any agent instructions (compression is content-agnostic)
- Feature-scope files unless a task-scope file is absent or insufficient
