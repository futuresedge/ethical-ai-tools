# Independence Test
> Applied during decomposition to verify task boundaries are correct.
> Every proposed task must pass this test before being written to decomposition.md.

---

## The test

Ask three questions in order. All three must answer YES for the task to be independent.

---

## Question 1: Can this task be tested in isolation?

Can you write and run tests for this task's output without any other task being complete?

YES: The task produces a testable artefact on its own
  Example: "Build CommissionsForm component" — component can be mounted and
           interacted with in a test environment, even if it doesn't submit anywhere yet

NO:  The task's output cannot be verified without another task's output
  Example: "Connect form to backend" — cannot test connection if backend doesn't exist
  FIX: Either make the backend a dependency and use a mock, or split this task

---

## Question 2: Can this task be completed without modifying another task's output?

Does this task only write to its own files, or does it edit files created by other tasks?

YES: The task writes to a new file or a file it owns exclusively
  Example: "Build useFormSubmission hook" — writes to src/hooks/useFormSubmission.ts

NO:  The task modifies a file another task created
  Example: "Add validation to CommissionsForm" — edits CommissionsForm.tsx
  FIX: Either merge with the task that created the file, or extract validation
       into its own hook/module that the form imports

---

## Question 3: Can this task be deployed independently?

Can the output of this task be merged to main and deployed without breaking anything?

YES: The task adds new code that nothing depends on yet, or it completes a feature
  Example: "Build CommissionsForm component (unconnected)" — component exists but
           isn't imported anywhere yet. Safe to deploy.

NO:  Deploying this task alone would break existing functionality
  Example: "Rename prop in CommissionsForm" — breaks any component that uses the old prop
  FIX: This is not an independent task — it's a refactor that must be atomic with
       all callsites. Either bundle with all callsites, or make the change backwards-compatible.

---

## Special case: Integration tasks

Integration tasks often fail Question 1 and 3 by design.

Example: "Connect CommissionsForm to useFormSubmission hook"
  Q1: NO — cannot test the connection without both the form and the hook existing
  Q2: YES — writes to a new integration file, or updates only the form's imports
  Q3: NO — deploying just the connection without the hook would break

HANDLING:
  This is acceptable IF:
  - The task explicitly declares DEPENDS ON: [form task], [hook task]
  - Both dependencies exist and are complete before this task starts
  - The task writes to exactly one file (the integration point)

Integration tasks are serial by nature. They should be the last layer in decomposition.

---

## Failure modes and fixes

FAILURE: Task depends on another task but dependency is not declared
FIX:     Add DEPENDS ON field and mark this task as Layer 2 or Layer 3

FAILURE: Task modifies a file from another task
FIX:     Either merge the tasks, or extract the modification into a separate concern
         that the first task imports (dependency inversion)

FAILURE: Task is too large to test in isolation (too many test cases, too much setup)
FIX:     Apply task-sizing-guide.md — task is probably too large, split it

FAILURE: Task cannot be deployed alone because it breaks existing code
FIX:     Either bundle with the code it would break, or redesign to be backwards-compatible

---

## Independence matrix

Use this to categorize tasks during decomposition:

| Q1: Testable? | Q2: No edits? | Q3: Deployable? | Classification | Layer |
|---|---|---|---|---|
| YES | YES | YES | Fully independent | 1 or 2 (parallel) |
| YES | YES | NO  | Independent but serial | 2 (after dependencies) |
| NO  | YES | NO  | Integration task | 3 (serial) |
| NO  | NO  | NO  | Incorrectly scoped | REVISE |

---

## When to accept dependencies

Dependencies are acceptable when:
1. They are explicitly declared in the task definition
2. The dependency task produces a stable interface that can be mocked
3. The dependent task does not modify the dependency's output
4. Removing the dependency would make the dependent task too large (violates sizing guide)

Dependencies are not acceptable when:
1. They create circular relationships (A depends on B, B depends on A)
2. They hide coupling that should be made explicit in the architecture
3. They make parallel work impossible when it should be possible

---

## Checklist for each proposed task

Before adding a task to decomposition.md:
- [ ] Q1 answered: can be tested in isolation (YES or acceptable NO)
- [ ] Q2 answered: does not edit other tasks' files (YES)
- [ ] Q3 answered: can be deployed independently (YES or acceptable NO)
- [ ] If any NO: dependency declared explicitly and is justifiable
- [ ] Task produces exactly one artefact (Rule 1 from decomposition-rules.md)
- [ ] Task name is a noun, not a verb
