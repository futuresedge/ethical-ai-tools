```skill
# Skill: Retro Facilitation
TRIGGERS: "retro", "retrospective", "sprint review", "learnings", "what worked",
          "what didn't work", "friction", "improvements", "sprint report"
ZONE: 0 (meta)
USED BY: Retro Facilitator agent
CONTEXT-TREE NODE: [RETRO FACILITATOR]

## What this skill does
Governs extraction of meaningful signals from agent review artefacts and the
production of a structured sprint retrospective report. Covers signal classification,
the report format, recommendation rules, and assumption evidence tracking.

## Load on activation
- references/signal-extraction.md
- references/report-format.md

## When to load this skill
LOAD FOR: any sprint retrospective
LOAD FOR: any single-feature retrospective where a full run has completed
LOAD FOR: any request for "what worked", "what didn't", or "how to improve the framework"

## When NOT to load this skill
NOT FOR: mid-sprint feedback on a single artefact (that is Framework Owner assessment mode)
NOT FOR: reviewing a single agent spec or skill file
NOT FOR: resolving an uncertainty event (that is uncertainty-protocol)

## The core principle
RETROS ARE ABOUT THE FRAMEWORK, NOT THE FEATURE.
  A RETURNED verdict is not a failure of the AC Writer — it is a signal about
  whether the rules, skills, or context preparation were sufficient.
  Always ask: what does this signal tell us about the process, not the person (or agent)?

## Input types and what they signal
  feature-spec-review.md   → is the feature-definition skill rubric working?
  ac-review.md             → is the acceptance-criteria skill rubric working?
  decomposition-review.md  → is the feature-decomposition skill rubric working?
  review-result.md         → is the context curation and task preparation working?
  uncertainty-log.md       → where did agents lack sufficient context to proceed?
  assessments/*.md         → Framework Owner strategic alignment findings

## Output
  .framework/progress/retros/retro-[sprint-slug]-[date].md
  STATUS: DRAFT — requires Product Owner acceptance
```
