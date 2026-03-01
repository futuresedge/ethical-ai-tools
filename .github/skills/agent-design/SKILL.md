```skill
# Skill: Agent Design
TRIGGERS: "review agent spec", "evaluate agent", "agent compliance", "assess agent file",
          "write agent spec", "create agent", "new agent", "write a spec for",
          "agent creator", "spec for zone", "how do I write an agent"
ZONE: cross-zone (meta)
USED BY: Agent Spec Reviewer, Agent Creator
CONTEXT-TREE NODE: [AGENT SPEC REVIEWER], [AGENT CREATOR]

## What this skill does
Carries both the writing procedure and the review rubric for agent spec files.
The Agent Creator uses spec-writing-guide.md to produce compliant specs.
The Agent Spec Reviewer uses agent-design-checklist.md + review-result-template.md
to assess them. The same structural rules govern both operations.

## Load on activation
- references/spec-writing-guide.md       ← Agent Creator: load this
- references/agent-design-checklist.md   ← Agent Spec Reviewer: load this
- references/review-result-template.md   ← Agent Spec Reviewer: load this

## What this skill covers
COVERS (writing): REQUIRED INPUTS, agent name derivation, OPERATION procedure,
  PRE-WRITE CHECKLIST, zone-specific notes (Zone N, Zone 0, Zones 2–3)
COVERS (reviewing): YAML frontmatter validity, READS/WRITES/NEVER declarations,
  instruction format, file size, SKILL pointer, FAILURE MODES, critical rule placement
DOES NOT COVER: whether the agent's task is a good idea
DOES NOT COVER: skill content — only that a valid pointer exists
DOES NOT COVER: content of files listed in READS — only that they are named

## Do not load
- The agent spec's listed READS files — they are not in scope for review
- nexus-ontology — separate concern; load only when designing Nexus tools
```
