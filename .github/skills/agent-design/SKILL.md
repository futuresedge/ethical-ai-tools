```skill
# Skill: Agent Design
TRIGGERS: "review agent spec", "evaluate agent", "agent compliance", "assess agent file"
ZONE: cross-zone (meta)
USED BY: Agent Spec Reviewer agent
CONTEXT-TREE NODE: [AGENT SPEC REVIEWER]

## What this skill does
The review rubric for assessing an agent spec file against the rules in
agent-design.instructions.md. Produces a structured review-result with
explicit pass/fail per checklist item and a final verdict.

## Load on activation
- references/agent-design-checklist.md
- references/review-result-template.md

## What this skill reviews — and what it does not
REVIEWS: YAML frontmatter validity (description, tools, model, handoff format)
REVIEWS: READS/WRITES/NEVER declarations — naming, count, explicitness
REVIEWS: instruction format — imperative shorthand, not prose
REVIEWS: file size — target under 60 lines
REVIEWS: SKILL pointer — must match a name in SKILLS-INVENTORY.md
REVIEWS: FAILURE MODES — must cover missing input and zero-result cases
REVIEWS: critical rule placement — must appear before SKILL pointer
REVIEWS: NEVER — must list at least two explicit exclusions
DOES NOT REVIEW: whether the agent's task is a good idea
DOES NOT REVIEW: skill content, only that a valid pointer exists
DOES NOT REVIEW: content of files listed in READS — only that they are named

## Do not load
- Any other skill at startup — this skill is sufficient
- The agent spec's listed READS files — they are not in scope for this review
```
