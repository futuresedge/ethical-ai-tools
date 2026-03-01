# Task Test Constraints
> Additional constraints for task-scope tests.
> Read in addition to test-output-spec.md and test-vs-ac.md.

---

## Task tests are narrower than feature tests

Feature tests:  verify end-to-end user outcomes across the full feature
Task tests:     verify that this specific unit of work produces its specific output

A task test must be passable in isolation — before integration with other tasks.

---

## Scope constraint

Task tests must:
- Pass without any sibling task being implemented
- Verify only the output declared in the task-spec
- Reference only elements, endpoints, or state produced by this task

Task tests must not:
- Require a complete feature build to run
- Assert outcomes that depend on another task's output
- Reference components, endpoints, or state not created by this task

---

## Mock boundary rule

If a task test requires data or behaviour from a not-yet-built sibling task:
  USE: a mock, stub, or fixture that represents the expected interface
  DO NOT: skip the test
  DO NOT: mark the dependency as in-scope for this task
  DOCUMENT: in the NOTES field — "Mock used for [dependency]. 
             Replace with real implementation when [sibling-task-slug] is complete."

---

## Sizing constraint

Each task should produce between 1 and 8 tests.
FEWER THAN 1:  the task is not verifiable — return to task-ac
MORE THAN 8:   the task is too large, or tests are not atomic — review scope

---

## Traceability constraint

Every task test must TRACE TO a task AC condition (TAC-[slug]-[n]).
A test without a TRACES TO reference is incomplete.
A TAC condition with no corresponding test is incomplete — both must be resolved
before the context package can be curated.

---

## Format compliance

All task tests must use the format in test-output-spec.md.
No exceptions. Informal test descriptions are not acceptable as task tests.

---

## Pre-curation gate

The Curate Context agent will not include task-tests.md in the context-package
unless every test in the file:
- Has a TEST ID
- Has a TRACES TO reference
- Has at least one explicit THEN expected output (not vague)
- Passes the test-vs-ac derivation check

If any test fails this gate — flag in uncertainty-log before proceeding.