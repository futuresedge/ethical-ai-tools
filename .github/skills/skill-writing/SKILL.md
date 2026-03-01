```skill
# Skill: Skill Writing
TRIGGERS: "create a skill", "write a skill", "new skill", "add skill", "scaffold skill"
ZONE: cross-zone (meta)
USED BY: Agent Creator, Agent Spec Reviewer, any agent that needs to produce a new skill artefact
CONTEXT-TREE NODE: meta (no context-tree entry required)

## What this skill does
Governs the production of new skill artefacts — both the thin SKILL.md wrapper
and the substantive references/ files. Ensures skills are stable, reusable,
and correctly registered in SKILLS-INVENTORY.md.

## Load on activation
- references/skill-structure-rules.md
- references/skill-template.md

## What skill writing covers — and what it does not
COVERS: when to create a new skill vs reuse an existing one
COVERS: SKILL.md required sections and format
COVERS: references/ folder conventions — what belongs there vs in SKILL.md
COVERS: trigger phrase design — specific enough to activate, broad enough to reuse
COVERS: SKILLS-INVENTORY.md registration (table row + description block)
DOES NOT COVER: the content of the skill domain itself — that is domain knowledge
DOES NOT COVER: agent spec structure — that is the agent-design skill

## Do not load
- agent-design skill — separate concern, load only if also writing an agent spec
```
