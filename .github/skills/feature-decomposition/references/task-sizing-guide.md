# Task Sizing Guide
> Applied during decomposition to prevent tasks that are too large or too small.
> Used alongside decomposition-rules.md and independence-test.md.

---

## Why sizing matters

TOO LARGE:
  - Context package exceeds token budget (~4k target)
  - Task Performer cannot hold all constraints in working memory
  - QA review surface is too large — edge cases missed
  - Task takes multiple attempts to pass review

TOO SMALL:
  - Overhead of task creation exceeds value of the task
  - Creates artificial dependencies between tasks
  - Decomposition becomes micro-management

---

## Sizing heuristics

### Heuristic 1: Lines of code (human reference)

SMALL:     50–150 lines
MEDIUM:    150–400 lines
LARGE:     400–800 lines
TOO LARGE: >800 lines — split this task

Note: This is a reference heuristic for human developers. Agents do not directly
estimate LOC, but the complexity that produces 800+ lines of code also produces
a context package that exceeds the budget.

### Heuristic 2: Number of AC conditions

SMALL:     1–2 TAC conditions
MEDIUM:    3–5 TAC conditions
LARGE:     5–7 TAC conditions
TOO LARGE: >7 TAC conditions — split this task

If a proposed task would have more than 7 TAC conditions, it is doing too much.

### Heuristic 3: Number of imports/dependencies

SMALL:     1–3 imports from project code
MEDIUM:    4–8 imports from project code
LARGE:     8–15 imports from project code
TOO LARGE: >15 imports — task is too coupled, split or refactor boundaries

Count only imports from the project's own codebase, not external libraries.

### Heuristic 4: Component tree depth

For UI component tasks:
SMALL:     Leaf component (no children, or children are HTML only)
MEDIUM:    Parent with 1–3 child components
LARGE:     Parent with 4–6 child components, or 2 levels of nesting
TOO LARGE: >6 children or >2 levels — split into multiple component tasks

### Heuristic 5: API surface area

For hook/util/API tasks:
SMALL:     1–2 exported functions/hooks
MEDIUM:    3–4 exported functions/hooks
LARGE:     5–6 exported functions/hooks
TOO LARGE: >6 exports — this module is doing too much, split by concern

### Heuristic 6: Test count

SMALL:     1–3 tests
MEDIUM:    4–8 tests
LARGE:     8–12 tests
TOO LARGE: >12 tests — task has too many edge cases, split by scenario

---

## Splitting strategies when a task is too large

### Strategy 1: Split by layer (UI vs logic)

TOO LARGE: "Build and connect contact form with validation and submission"

SPLIT INTO:
  - Task 1: Build ContactForm component (UI only, no behaviour)
  - Task 2: Build useFormValidation hook
  - Task 3: Build useFormSubmission hook
  - Task 4: Connect ContactForm to hooks

### Strategy 2: Split by sub-component

TOO LARGE: "Build dashboard with header, sidebar, content area, and modals"

SPLIT INTO:
  - Task 1: Build DashboardLayout container
  - Task 2: Build DashboardHeader component
  - Task 3: Build DashboardSidebar component
  - Task 4: Build DashboardContent component
  - Task 5: Build DashboardModal component

### Strategy 3: Split by feature AC condition

TOO LARGE: Task satisfies 8 feature AC conditions

SPLIT INTO:
  - Task 1: satisfies AC-01, AC-02, AC-03
  - Task 2: satisfies AC-04, AC-05, AC-06
  - Task 3: satisfies AC-07, AC-08

### Strategy 4: Split by concern (read vs write, happy path vs error handling)

TOO LARGE: "Build form with validation, submission, error handling, and success state"

SPLIT INTO:
  - Task 1: Build form with validation (no submission)
  - Task 2: Build submission handler (no UI feedback)
  - Task 3: Build error display component
  - Task 4: Build success state component
  - Task 5: Connect all parts

---

## When a task is too small

MERGE IF:
  - Task produces <20 lines of code
  - Task has only 1 TAC condition that is trivial
  - Task exists only to pass data between two other tasks (glue task)
  - Task is "Add import" or "Update config" with no behaviour change

Example of too-small tasks:
  - "Add TypeScript interface for FormData"  ← merge with component that uses it
  - "Export CommissionsForm from index.ts"   ← merge with component creation task
  - "Add env var for Formspree ID"          ← merge with hook that uses it

---

## Context budget estimation

The Curate Context agent targets ~4k tokens for the context-package.

ESTIMATE per task:
  - task-ac.md:        ~500–1500 tokens (depends on number of conditions)
  - task-tests.md:     ~300–1000 tokens (depends on number of tests)
  - ui-artefact.md:    ~500–2000 tokens (depends on component complexity)
  - Stack constraints: ~200–500 tokens
  - Boundaries/notes:  ~200–500 tokens

IF estimated total >6k tokens before curation: task is too large, split it

---

## Sizing checklist

Before finalizing a task in decomposition.md:
- [ ] Estimated LOC: 50–800 (not >800)
- [ ] TAC conditions: 1–7 (not >7)
- [ ] Imports from project: <15
- [ ] Tests required: <12
- [ ] Estimated context package: <6k tokens
- [ ] Task produces exactly one artefact (not a glue task)
- [ ] Task is not trivially small (<20 LOC and 1 trivial condition)

IF any check fails: revise task boundaries using splitting or merging strategies above.
