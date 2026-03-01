```skill
# Skill: Nexus Tool Grammar
TRIGGERS: "tool grammar", "name a tool", "add a tool", "new nexus tool",
          "verb vocabulary", "subject vocabulary", "tool matrix",
          "task-scoped tool", "universal tool", "role-scoped tool",
          "tool naming", "malformed tool name"
ZONE: cross-zone (Nexus build)
USED BY: Nexus Server Builder, Nexus Tool Reviewer (post-adoption)
CONTEXT-TREE NODE: meta (no context-tree entry required)

## What this skill does
Carries the authoritative tool naming grammar for the Nexus MCP server. Every tool
name is derived from a closed verb vocabulary (8 entries) × an open subject vocabulary
(document type taxonomy) × an optional task scope suffix. Ensures any new tool is
correctly named, correctly scoped, and consistent with the existing catalogue before
implementation begins.

## Load on activation
- references/verb-vocabulary.md
- references/subject-vocabulary.md
- references/tool-design-rules.md

## What nexus-tool-grammar covers — and what it does not
COVERS: closed verb vocabulary — 8 verbs, their semantics, side effects, and rules
COVERS: open subject vocabulary — document types, write modes, valid verb combinations
COVERS: the Tool Matrix — valid verb × subject intersections (✓ = exists, blank = invalid)
COVERS: task slug formation rule — `task-07` → `task_07`
COVERS: three scoping levels — universal, role-scoped, task-scoped
COVERS: well-formed and malformed name examples with reasons
DOES NOT COVER: tool implementation code — only naming and structural design
DOES NOT COVER: ontology dimension checks — that is the nexus-ontology skill
DOES NOT COVER: MCP SDK patterns — that is the nexus-server skill

## Do not load
- nexus-ontology — load separately if also running a 6-dimension check
- nexus-server — load separately if also writing implementation code
```
