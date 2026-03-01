# Decomposition Rules
> Applied by: Decompose to Tasks agent
> Input: feature-spec.md + acceptance-criteria.md + ui-artefact.md + AGENTS.md
> Output: decomposition.md

---

## The decomposition goal

Break a feature into tasks where:
- Each task is independently testable
- Each task is independently deployable
- Each task produces exactly one artefact
- Tasks can be worked on in parallel where dependencies allow
- The sum of all tasks equals the feature — no gaps, no overlaps

---

## Rule 1: One artefact per task

Every task produces exactly one:
- React component
- API endpoint
- Database migration
- Configuration file
- Style module
- Test suite
- Documentation file

NOT: "Build form and hook and validation logic" — that is 3 tasks
NOT: "Add endpoint and update database" — that is 2 tasks

---

## Rule 2: Independence by default, explicit dependencies when required

PREFER: tasks with no dependencies
  → "Build CommissionsForm component (unconnected)"
  → "Build useFormSubmission hook (standalone)"
  → "Add Formspree configuration"

WHEN DEPENDENCIES ARE REQUIRED: declare them explicitly
  → "Connect CommissionsForm to useFormSubmission"
  → DEPENDS ON: [task-slug-1], [task-slug-2]

TEST: can this task be completed without waiting for another task?
IF NO: either remove the dependency (preferred) or declare it explicitly

---

## Rule 3: UI before logic, logic before integration

LAYER 1 (parallel): UI components (display only, no behaviour)
LAYER 2 (parallel): Logic modules (hooks, utils, API calls — tested with mocks)
LAYER 3 (serial):   Integration (connect UI to logic, remove mocks)

Example:
  LAYER 1:
    - Task: Build CommissionsForm component (static)
    - Task: Build ConfirmationMessage component (static)
  LAYER 2:
    - Task: Build useFormspreeSubmit hook
    - Task: Add analytics event emitter
  LAYER 3:
    - Task: Connect form to submission hook
    - Task: Connect form to analytics

REASONING: Layer 1 and 2 can proceed in parallel. Layer 3 awaits both.

---

## Rule 4: Vertical slice where possible, horizontal otherwise

VERTICAL (preferred): one task delivers one complete user flow
  Example: "Build and connect enquiry form end-to-end"
  WHEN: feature is small, AC is simple, no shared logic

HORIZONTAL (when vertical is too large): split by layer
  Example: "Build form UI", "Build submission logic", "Connect form to logic"
  WHEN: feature is large, multiple AC conditions, shared dependencies

---

## Rule 5: Maximum complexity budget per task

A task should be completable in:
- 1–3 hours for a human developer (experienced with the stack)
- 2000–8000 tokens of context for an agent

IF a proposed task would exceed this:
  Split further using one of:
  - Extract shared logic into its own task
  - Split by AC condition (one task per condition)
  - Split by component sub-tree (one task per branch)

SEE: task-sizing-guide.md for specific sizing heuristics

---

## Rule 6: Avoid "glue tasks" — they signal incorrect boundaries

A "glue task" is a task whose only purpose is to make two other tasks work together.

WRONG:
  - Task A: Build component X
  - Task B: Build component Y
  - Task C: Make X and Y work together  ← glue task

RIGHT:
  - Task A: Build component X (standalone)
  - Task B: Build component Y (standalone)
  - Task C: Build parent component Z that imports X and Y

Glue tasks usually mean the boundary between A and B was drawn incorrectly.
Re-examine whether A and B should have been one task, or whether the
integration belongs in a parent/container component.

---

## Rule 7: Feature AC drives task boundaries

Each feature AC condition should map to at least one task.
No feature AC condition should be satisfied by only part of a task.

PROCESS:
1. List all feature AC conditions
2. For each condition, ask: "What artefact(s) satisfy this?"
3. Each artefact = one task candidate
4. Apply independence test (see independence-test.md)
5. Merge or split task candidates based on independence result

---

## Rule 8: UI artefact sections map to tasks

If the ui-artefact.md has been written in parallel:
  Each UI section (component, layout, interaction) should map to one or more tasks

WRONG: "Build all UI" as one task
RIGHT: One task per component or per layout section

---

## Rule 9: Tasks never share output paths

Each task writes to a unique file or directory.
No two tasks produce overlapping output.

IF two tasks would write to the same file:
  Either: merge them into one task
  Or:     split the file's concerns so each task writes to its own file

---

## Rule 10: Name tasks by what they produce, not how

WRONG:
  - "Implement form submission"
  - "Add form validation"
  - "Handle form errors"

RIGHT:
  - "Build CommissionsForm component"
  - "Build useFormValidation hook"
  - "Build FormError display component"

Task names are nouns (artefacts), not verbs (actions).

---

## Pre-decomposition checklist

Before writing decomposition.md, verify:
- [ ] Every feature AC condition is covered by at least one task
- [ ] No task spans more than one artefact
- [ ] No task has implicit dependencies (all dependencies declared or removed)
- [ ] No glue tasks exist
- [ ] Task names follow the noun convention
- [ ] Each task is independently testable (apply independence-test.md)
- [ ] Sizing heuristic applied (see task-sizing-guide.md)

IF any check fails: revise task boundaries before writing decomposition.md
