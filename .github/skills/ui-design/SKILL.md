# Skill: UI Design
TRIGGERS: "design UI", "UI artefact", "wireframe", "interface design", "UI spec"
ZONE: 2
USED BY: Design UI agent
CONTEXT-TREE NODE: [DESIGN UI]

## What this skill does
Governs production of the UI artefact — the design output that becomes
context for downstream task execution. The artefact must be structured
for machine consumption, not just human review.

## Load on activation
- references/ui-artefact-template.md
- references/downstream-consumption-rules.md

## Load if brand/design system files are absent from context
- references/default-design-constraints.md

## Critical output requirement
The UI artefact must be structured so the Context Curation agent
can extract relevant sections per task without loading the full document.
Sections must map to task boundaries where possible.

## Do not load
- acceptance-criteria skill (parallel track — not a dependency)
- Any task-level files (none exist at this point)
