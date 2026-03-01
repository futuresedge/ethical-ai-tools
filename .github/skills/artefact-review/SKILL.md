```skill
# Skill: Artefact Review
TRIGGERS: "review artefact", "verdict", "ACCEPTED", "RETURNED", "CHECKS PASSED",
          "CHECKS FAILED", "gate", "review mode", "review output", "review format"
ZONE: 2–3
USED BY: Feature Spec Reviewer, AC Reviewer, Decomposition Reviewer, Task Spec Reviewer

## What this skill does
Carries the verdict format, gate rules, and review procedure shared by all
single-mode reviewer agents. Lets each reviewer stay under 60 lines by
extracting all substantive review content here.

## Load on activation
- references/verdict-format.md    ← output template + gate rules
- references/review-procedure.md  ← how to run the checklist; boundary rules

## When to load this skill
LOAD FOR: any artefact review operation (feature-spec, ac, decomposition, task-spec)
LOAD FOR: any verdict output

## When NOT to load this skill
NOT FOR: writing the artefact under review
NOT FOR: upstream pipeline operations (ideation, feature definition, decomposition)
```
