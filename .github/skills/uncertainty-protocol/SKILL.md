# Skill: Uncertainty Protocol
TRIGGERS: "raise uncertainty", "blocked", "unclear", "cannot proceed",
          "insufficient context", "context conflict", "escalate"
ZONE: 2–4
USED BY: any executor agent
CONTEXT-TREE NODE: [UNCERTAINTY SUB-FLOW]

## What this skill does
Governs all uncertainty events across all zones. Defines when to stop,
what to write, and who resolves what.

## Load on activation
- references/uncertainty-log-format.md
- references/escalation-paths.md

## When to invoke this protocol
INVOKE IF: context-package is missing or stale
INVOKE IF: two context sources contradict each other
INVOKE IF: task cannot be completed within declared READS budget
INVOKE IF: an assumption required to proceed is not documented anywhere

## When NOT to invoke this protocol
NOT FOR: minor ambiguity resolvable from existing context
NOT FOR: implementation decisions within the task's scope
NOT FOR: preferences or style choices

## The three-field format (always)
WHAT: what is unclear, stated precisely
WHY: why this blocks progress — what decision depends on it
RESOLVE: what specific information would unblock this

## Escalation by zone
Zone 2: unresolved uncertainty → human (Product Owner)
Zone 3: context conflict → Advisor Agent, then human if unresolved
Zone 4: execution blocked → Advisor Agent, then human if unresolved
Zone 5: integration failure → Feature Orchestrator, then human

## Do not load
- Any domain-specific skill references
- Feature or task files (uncertainty-log already contains the relevant context)
