# Uncertainty Log Format
> Produced by: any executor agent that cannot proceed
> Stored at: .framework/features/[slug]/tasks/[task-slug]/uncertainty-log.md
> Append-only — never overwrite or delete existing entries

---

## When to write an uncertainty entry

WRITE IF:
- Context-package is missing, stale, or structurally incomplete
- Two source artefacts contradict each other (see conflict-detection.md)
- A required piece of information is absent from all available sources
- An assumption required to proceed is not documented anywhere
- The task cannot be completed within the declared READS scope

DO NOT WRITE IF:
- The question is answerable from existing context (read more carefully first)
- The decision is within the task's declared scope (make the decision)
- It is a style or implementation preference with no AC constraint

---

## Required format

Every uncertainty entry must contain all five fields. Partial entries are rejected.

```
***
UNCERTAINTY-[n]
DATE:    [ISO 8601 — e.g. 2026-02-28]
AGENT:   [agent name / node from context-tree.md]
ZONE:    [2 | 3 | 4]
STATUS:  OPEN

WHAT:
[What is unclear — stated as a specific, precise question.
Not "I'm not sure about the form" — yes "The task-ac requires the form to submit
to VITE_FORMSPREE_FORM_ID but this env var is not declared in AGENTS.md.
Is it available in the development environment?"]

WHY:
[Why this blocks progress — what specific action or decision depends on it.
"I cannot implement the Formspree submission without knowing whether
VITE_FORMSPREE_FORM_ID is defined in .env.local or must be added.
Proceeding without this would produce a form that silently fails."]

RESOLVE:
[What specific information, decision, or artefact would unblock this.
Be precise — vague resolution requests produce vague responses.
"Confirm whether VITE_FORMSPREE_FORM_ID exists in .env.local,
or provide the value to be added."]

RESOLUTION:
[Leave blank when STATUS: OPEN]
[Complete when STATUS: RESOLVED — include who resolved it, what the answer was,
and which artefact was updated as a result]
***
```

---

## Numbering

UNCERTAINTY-1, UNCERTAINTY-2, etc. — sequential per task.
Do not reset numbering. Do not reuse numbers.
If uncertainty-log.md does not exist — create it, begin at UNCERTAINTY-1.

---

## Status values

OPEN:         raised, not yet resolved
IN PROGRESS:  Advisor Agent is researching
RESOLVED:     answer provided, artefact updated, agent may proceed
ESCALATED:    Advisor Agent could not resolve — awaits human decision
CLOSED-VOID:  raised in error — entry kept for audit trail, marked void with reason

---

## Multiple uncertainties

If multiple blockers exist — write one entry per blocker.
Do not combine multiple questions into one entry.
Each blocker has its own UNCERTAINTY-[n].

---

## After writing

STOP execution immediately.
Do not attempt to proceed with partial context.
Do not make assumptions to fill the gap.
Yield to Advisor Agent (Zone 3–4) or Product Owner (Zone 2).
