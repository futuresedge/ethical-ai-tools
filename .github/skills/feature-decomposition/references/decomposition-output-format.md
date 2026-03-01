# Decomposition Output Format

> The required structure for decomposition.md
> Produced by: Decompose to Tasks agent
> Stored at: .framework/features/[slug]/decomposition.md


---


## Template


```markdown
# Feature Decomposition
FEATURE:     [feature-slug]
DECOMPOSED:  [date]
STATUS:      DRAFT
TOTAL TASKS: [n]

STATUS_LOG:
  - [ISO date] DRAFT Task Decomposer — initial output
```
> STATUS_LOG is append-only. One entry per status change.
> Valid transitions: DRAFT → ACCEPTED | RETURNED
>                   RETURNED → DRAFT (on revision)
> ACCEPTED is written by the human (Product Owner), not by this agent.


---

## Decomposition Summary


APPROACH: [VERTICAL | HORIZONTAL | LAYERED]
  [One paragraph explaining the decomposition strategy chosen and why]

UI ARTEFACT: [PRESENT | ABSENT — decomposition based on feature-spec and AC only]


LAYERS:
  Layer 1 (parallel): [n] tasks — [brief description]
  Layer 2 (parallel): [n] tasks — [brief description]
  Layer 3 (serial):   [n] tasks — [brief description]


---


## Task List


### Task 1: [task-name]
SLUG:        [task-slug]
LAYER:       [1 | 2 | 3]
ARTEFACT:    [what this task produces — file path]
OUTPUT PATH: [exact file path where output will be written]
DEPENDS ON:  [task-slug] | NONE
SIZE:        SMALL | MEDIUM | LARGE
ESTIMATED:   [TAC conditions: n] [Tests: n] [LOC: n]


SATISFIES:
  - FAC-[feature-slug]-01
  - FAC-[feature-slug]-03 partial
    COMPLETED BY: [sibling-task-slug]


DESCRIPTION:
  [2-3 sentences describing what this task does and what it produces]


ACCEPTANCE:
  [1-2 sentences describing what "done" looks like for this task]


BOUNDARIES:
  IN SCOPE:
    - [specific thing this task does]
    - [specific thing this task does]
  OUT OF SCOPE:
    - [specific thing this task does NOT do]
    - [specific thing deferred to another task]


---


### Task 2: [task-name]
[repeat structure]


---


## Dependency Graph


```
Layer 1 (parallel)
  ├─ Task 1: [name]
  ├─ Task 2: [name]
  └─ Task 3: [name]


Layer 2 (parallel)
  ├─ Task 4: [name] → depends on: Task 1
  └─ Task 5: [name] → depends on: Task 2


Layer 3 (serial)
  └─ Task 6: [name] → depends on: Task 4, Task 5
```


---


## Independence Verification


| Task | Q1: Testable? | Q2: No edits? | Q3: Deployable? | Status |
|---|---|---|---|---|
| Task 1 | YES | YES | YES | ✓ Independent |
| Task 2 | YES | YES | YES | ✓ Independent |
| Task 3 | YES | YES | NO  | ✓ Serial (acceptable) |
| Task 4 | NO  | YES | NO  | ✓ Integration (acceptable) |


---


## Size Verification


| Task | TAC est. | Tests est. | LOC est. | Context est. | Status |
|---|---|---|---|---|---|
| Task 1 | 3 | 4 | 200 | ~3k | ✓ Within budget |
| Task 2 | 5 | 6 | 350 | ~4k | ✓ Within budget |
| Task 3 | 2 | 3 | 150 | ~2.5k | ✓ Within budget |


---


## Coverage Check


Every feature AC condition must appear in at least one task's SATISFIES list.
A `partial` entry counts as covered only if its `COMPLETED BY` task also lists
the same FAC condition (without `partial`).


| Feature AC | Covered by | Coverage type | Status |
|---|---|---|---|
| FAC-[slug]-01 | Task 1 | full | ✓ |
| FAC-[slug]-02 | Task 2 | full | ✓ |
| FAC-[slug]-03 | Task 1 (partial), Task 3 (completes) | partial → full | ✓ |
| FAC-[slug]-04 | Task 5 | full | ✓ |

---

## Open Questions
> Unresolved decomposition issues. Must be empty before STATUS: ACCEPTED.

```
[If none:]
No open questions. Decomposition is complete and ready for acceptance.


[If any exist:]
- [Question 1 — what needs clarification]
- [Question 2 — what needs clarification]
```

***

## Filling rules


### Header fields

STATUS:
  - Always `DRAFT` on initial output.
  - `ACCEPTED` is written by the Product Owner after human review.
  - This agent never self-promotes STATUS to ACCEPTED.

STATUS_LOG:
  - Append one entry per status change.
  - Format: `- [ISO date] [STATUS] [actor] — [optional note]`
  - Never delete or overwrite a prior entry.
  - First entry is always written by this agent at initial output.
  - Subsequent entries are written by whoever changes the status.


### Decomposition Summary

APPROACH field must be one of:
  - VERTICAL: one task per complete user flow (small features)
  - HORIZONTAL: tasks split by layer (UI, logic, integration)
  - LAYERED: tasks organized in layers with explicit dependencies

UI ARTEFACT field:
  - PRESENT if ui-artefact.md was loaded and used as a decomposition input.
  - ABSENT if ui-artefact.md did not exist; state what was used instead.
  - Never omit this field — the absence of a UI artefact is a named condition,
    not a silent gap.

LAYERS description:
  - Specify which tasks are in which layer
  - Layer 1 and 2 can run in parallel
  - Layer 3 runs after its dependencies complete


### Per-task sections


SLUG:
  - Lowercase, hyphenated
  - Example: `build-commissions-form`, `connect-form-submission`


ARTEFACT:
  - What file this task creates
  - Example: `src/components/CommissionsForm.tsx`


OUTPUT PATH:
  - Where the Task Performer writes the output
  - Must be unique per task — no two tasks share an output path


DEPENDS ON:
  - List task slugs this task depends on
  - If none: write `NONE` explicitly
  - Integration tasks (Layer 3) typically have 2+ dependencies


SIZE:
  - SMALL, MEDIUM, or LARGE
  - Derived from task-sizing-guide.md heuristics


ESTIMATED:
  - TAC conditions: how many acceptance criteria this task will have
  - Tests: how many tests will be written
  - LOC: estimated lines of code (for reference only)


SATISFIES:
  - Which feature AC conditions (FAC-[slug]-[n]) this task addresses.
  - Two forms:

    Full:
      `- FAC-[slug]-01`
      This task alone is sufficient for the condition to be verified.

    Partial:
      `- FAC-[slug]-03 partial`
      `  COMPLETED BY: [sibling-task-slug]`
      This task is a prerequisite; the named sibling task completes the
      condition. The sibling must list the same FAC without `partial`.

  - NEVER omit a partial relationship. Undeclared partial coverage is
    invisible to the Coverage Check and produces a false COVERED result.
  - Every feature AC must appear in at least one task's SATISFIES list
    (full or partial).
  - A task can satisfy multiple AC conditions.


DESCRIPTION:
  - What the task does and produces
  - Written in present tense
  - 2-3 sentences maximum


ACCEPTANCE:
  - What "done" looks like for this task
  - Not detailed AC (that comes later in Zone 3)
  - High-level completion criteria
  - 1-2 sentences


BOUNDARIES:
  - IN SCOPE: at least 2 specific things this task does
  - OUT OF SCOPE: at least 2 specific things this task does NOT do
  - Prevents scope creep during task execution


### Dependency Graph

ASCII diagram showing:
  - Which tasks are in which layer
  - Which tasks depend on which other tasks
  - Visual representation of parallel vs serial work


### Independence Verification table

One row per task.
Apply independence-test.md three questions.
Mark status as:
  - ✓ Independent (all YES)
  - ✓ Serial (Q3 is NO but acceptable)
  - ✓ Integration (Q1 and Q3 NO but acceptable, dependencies declared)
  - ✗ Incorrectly scoped (needs revision)

IF any task is marked ✗: revise task boundaries before finalizing decomposition.md


### Size Verification table

One row per task.
Estimate based on task-sizing-guide.md heuristics.
Context est. should be <6k tokens before curation.
IF any task exceeds budget: split the task.


### Coverage Check table

Four columns: Feature AC | Covered by | Coverage type | Status

Coverage type values:
  - `full` — at least one task lists this FAC without `partial`
  - `partial → full` — one task lists it as partial, another completes it
  - `uncovered` — no task lists this FAC in any form → STOP, revise before accepting

Every FAC from acceptance-criteria.md must have a row.
A partial entry without a COMPLETED BY task = uncovered. Treat as a gap.


### Open Questions section

MUST be empty before decomposition.md is marked STATUS: ACCEPTED.
Questions here indicate the feature definition is incomplete or ambiguous.
Surface to Feature Orchestrator → Product Owner for resolution.


***


## Pre-acceptance checklist


Before marking STATUS: ACCEPTED:
- [ ] All tasks have unique SLUGs
- [ ] All tasks have unique OUTPUT PATHs
- [ ] All tasks pass independence verification (no ✗ status)
- [ ] All tasks pass size verification (<6k context estimate)
- [ ] All feature AC conditions are covered in Coverage Check (full or partial→full)
- [ ] No FAC condition has a `partial` entry without a `COMPLETED BY` reference
- [ ] No FAC condition's `COMPLETED BY` task is missing from the task list
- [ ] Dependency graph is acyclic (no circular dependencies)
- [ ] Open Questions section is empty
- [ ] Every task's BOUNDARIES section has at least 2 items in each list
- [ ] STATUS_LOG has at least one entry
- [ ] UI ARTEFACT field in Decomposition Summary is explicitly stated

IF any check fails: revise before submitting for acceptance.