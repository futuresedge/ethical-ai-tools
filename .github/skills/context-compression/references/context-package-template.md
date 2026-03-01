# Context Package Template
> The required structure for context-package.md.
> Produced by: Curate Context agent
> Consumed by: Task Performer agent — and only the Task Performer agent

---

## Template

```
# Context Package
TASK:    [task-slug]
FEATURE: [feature-slug]
CURATED: [date]
STATUS:  [READY | BLOCKED — see conflicts section]

***

## 1. What You Must Produce
> One sentence. The single output of this task.

[e.g. "A validated CommissionsForm React component that submits via Formspree."]

***

## 2. Acceptance Criteria
> Verbatim from task-ac.md. Do not modify.

[paste complete task-ac.md]

***

## 3. Tests
> Verbatim from task-tests.md. Do not modify.
> Your output must pass all of these exactly.

[paste complete task-tests.md]

***

## 4. UI Specification
> Extracted sections of ui-artefact.md that apply to this task.
> Sections not listed here are out of scope for this task.

[extracted sections, labelled with source section name]

IF NONE: "UI artefact: no sections apply to this task's scope."

***

## 5. Stack Constraints
> Only constraints relevant to this task's output type.

[filtered list from AGENTS.md]

***

## 6. Output Location
OUTPUT: [exact file path]
PROOF:  .framework/features/[slug]/tasks/[task-slug]/proof-of-completion.md

***

## 7. Boundaries
> What is explicitly out of scope for this task.

EXCLUDE:
- [list anything the task-ac or task-spec explicitly defers]
- [sibling tasks that handle adjacent behaviour]
- [integration concerns handled in Zone 5]

***

## 8. Conflicts and Flags
> Only present if conflicts were detected. Empty section = clean package.

[If clean:]
No conflicts detected. All source artefacts are consistent.

[If conflicts exist:]
⚠ This package has unresolved conflicts. See uncertainty-log.md.
Task Performer must not proceed until conflicts are marked RESOLVED.

CONFLICT-1
TYPE:    [type]
SOURCES: [file-a] vs [file-b]
WHAT:    [description]
STATUS:  OPEN

```

---

## Rules for filling the template

SECTION 1 (What You Must Produce):
  One sentence. Derived from task-spec, not task-ac.
  If you cannot write it in one sentence — the task is too large.

SECTIONS 2 and 3 (AC and Tests):
  Verbatim. No summarising. No reformatting.
  If too long for the token budget — the AC or tests need to be revised, not the package.

SECTION 4 (UI Specification):
  Extract only. Never include full ui-artefact.md.
  Label each extraction with its source section.

SECTION 5 (Stack Constraints):
  Filtered list only. No prose.
  Maximum 10 lines. If more are needed — the task spans too many technologies.

SECTION 7 (Boundaries):
  At least 2 items. Every task has things it explicitly does not do.
  If you cannot name any — the task boundaries are not well-defined.

SECTION 8 (Conflicts):
  Never leave empty when conflicts exist.
  Never mark STATUS: RESOLVED unless the conflict has been explicitly resolved
  by an authoritative source, not by the curation agent's judgement.