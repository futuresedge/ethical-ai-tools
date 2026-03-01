# Task Definition Checklist
> Applied by: Define Task agent before marking task-spec.md as complete
> Gate: task-spec.md must pass this checklist before handoff to Write Task AC

---

## Completeness checks

### What This Task Produces (Section 1)
- [ ] Single sentence output description — not multiple sentences
- [ ] OUTPUT path is exact and matches decomposition.md
- [ ] TYPE is stated and matches artefact type from AGENTS.md
- [ ] OUTPUT path is unique (not used by any other task in this feature)

### Scope (Section 2)
- [ ] IN SCOPE has at least 2 specific items
- [ ] OUT OF SCOPE has at least 2 specific items
- [ ] OUT OF SCOPE includes at least one integration concern deferred to Layer 3
- [ ] No overlap between IN SCOPE and OUT OF SCOPE
- [ ] Items match or refine BOUNDARIES from decomposition.md

### Parent Feature Context (Section 3)
- [ ] FEATURE AC SATISFIED list matches decomposition.md SATISFIES list
- [ ] Each AC has a one-line summary (not full Given/When/Then)
- [ ] DESCRIPTION copied verbatim from decomposition.md (not rewritten)
- [ ] ACCEPTANCE copied verbatim from decomposition.md (not rewritten)

### Dependencies (Section 4)
- [ ] DEPENDS ON TASKS explicitly stated (or NONE)
- [ ] Each dependency explains what it provides to this task
- [ ] EXTERNAL DEPENDENCIES explicitly stated (or NONE)
- [ ] Environment variables listed if task reads them
- [ ] No circular dependencies (this task does not depend on a task that depends on this task)

### Interface Specification (Section 5)
- [ ] Structure matches artefact type (props for component, params/returns for hook, etc.)
- [ ] All interface items have types specified
- [ ] All interface items have descriptions
- [ ] TypeScript syntax used where applicable
- [ ] For components: event handler signatures included if applicable
- [ ] For hooks: return value structure is complete
- [ ] For utilities: full function signature provided

### Constraints (Section 6)
- [ ] STACK constraints are filtered from AGENTS.md (not full copy)
- [ ] Only constraints relevant to this task's artefact type are included
- [ ] PERFORMANCE section is present (or marked NONE)
- [ ] ACCESSIBILITY section is present (or marked NONE / standard WCAG 2.1 AA)
- [ ] No constraints that contradict parent feature constraints

### Success Criteria (Section 7)
- [ ] 3–5 observable outcomes listed
- [ ] Each outcome is written as present-tense assertion
- [ ] Outcomes describe WHAT is true, not HOW it is implemented
- [ ] Outcomes are specific enough to be testable
- [ ] No duplicate outcomes

### Open Questions (Section 8)
- [ ] Section is present
- [ ] Each question is specific enough to be answerable
- [ ] No question that could be resolved by reading decomposition.md or AGENTS.md
- [ ] If questions exist: marked for resolution before STATUS: ACCEPTED

---

## Quality checks

### Traceability
- [ ] Task connects to at least one feature AC (Section 3)
- [ ] Task scope does not exceed what decomposition.md allocated to it
- [ ] Task interface matches what dependent tasks expect (if dependencies exist)

### Clarity
- [ ] No vague language: "properly", "correctly", "appropriately", "as needed"
- [ ] No implementation suggestions beyond what constraints require
- [ ] No assumptions about sibling tasks' implementations
- [ ] Output path is unambiguous (no "or" options)

### Sizing signals
- [ ] Interface complexity suggests 1–7 TAC conditions (not >7)
- [ ] Success criteria suggest 3–8 tests (not >12)
- [ ] Scope does not span multiple artefacts
- [ ] IF task seems too large: flag for potential decomposition revision

### Consistency with decomposition
- [ ] Task slug matches decomposition.md
- [ ] OUTPUT path matches ARTEFACT in decomposition.md
- [ ] DEPENDS ON matches decomposition.md
- [ ] SATISFIES list matches decomposition.md
- [ ] No scope expansion beyond decomposition boundaries

---

## Downstream readiness

BEFORE marking STATUS: ACCEPTED, confirm:
- [ ] Write Task AC agent could produce TAC from this spec without asking questions
- [ ] Curate Context agent could extract relevant sections without ambiguity
- [ ] Task Performer would know exactly what file to create and where

IF ANY of these are NO:
  Revise open questions or scope sections before marking accepted

---

## On failure

IF any check fails:
  DO NOT mark task-spec.md as STATUS: ACCEPTED
  DO NOT hand off to Write Task AC agent
  Add failed items to Section 8 (Open Questions) or fix them inline
  Re-run checklist

IF Section 8 contains questions requiring human input:
  Surface to Task Owner Agent or Product Owner
  Do not attempt to resolve by inference

---

## Special cases

### Task has no dependencies (Layer 1)
- [ ] DEPENDS ON TASKS marked NONE (not omitted)
- [ ] Task is independently testable with mocks if it consumes interfaces
- [ ] Interface specification defines what mocks should implement

### Task is an integration task (Layer 3)
- [ ] DEPENDS ON TASKS lists 2+ dependencies
- [ ] Scope clearly states what integration this task performs
- [ ] OUT OF SCOPE explicitly defers business logic to dependency tasks

### Task produces configuration or constants
- [ ] VALUES section specifies where values are sourced
- [ ] Environment variables listed in EXTERNAL DEPENDENCIES if applicable
- [ ] Interface section specifies export shape

### Task produces a test suite
- [ ] Scope specifies what is being tested (which component/hook/util)
- [ ] Interface section specifies test file structure
- [ ] Success criteria include coverage or test count targets
