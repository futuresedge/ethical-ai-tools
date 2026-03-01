```skill
# Skill: Nexus Context Card
TRIGGERS: "context card", "context agent", "knowledge base", "generate context",
          "sprint learnings", "pattern registry", "context compression",
          "get_context_card", "briefing", "assumption b3", "context quality"
ZONE: cross-zone (Nexus build — future phase)
USED BY: Context Agent (Agent 2.3), Nexus Server Builder (when upgrading get_context_card)
CONTEXT-TREE NODE: meta (no context-tree entry required)

## What this skill does
Governs the generation of context cards for Task Performers. A context card is a
compact, task-scoped briefing generated from the knowledge base at the moment of
agent instantiation — not a raw document dump. Covers context card format, which
knowledge base tables to query, compression constraints, and the token-budget
discipline that prevents context from growing as the knowledge base grows.

## Load on activation
- references/context-card-format.md
- references/knowledge-base-queries.md

## What nexus-context-card covers — and what it does not
COVERS: context card format — sections, token budget, what to include vs. exclude
COVERS: knowledge base schema — sprint_learnings, patterns, and how they are queried
COVERS: filtering rules — matching learnings to task_type and domain
COVERS: compression discipline — never full documents; only directly relevant facts
COVERS: the difference between the Phase 1–5 minimum (raw task row) and the target (generated briefing)
DOES NOT COVER: task spec content — that is the task-definition skill
DOES NOT COVER: MCP server implementation — that is nexus-server
DOES NOT COVER: context compression for the current pipeline — that is the context-compression skill

## Do not load
- context-compression — that skill governs Zone 3 context packaging; different scope and audience
- nexus-server — load separately if also implementing the get_context_card tool upgrade
```
