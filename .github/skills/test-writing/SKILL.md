# Skill: Test Writing
TRIGGERS: "write tests", "test suite", "derive tests", "task tests", "feature tests"
ZONE: 2–3
USED BY: Write Feature Tests agent, Write Task Tests agent
CONTEXT-TREE NODES: [WRITE FEATURE TESTS], [WRITE TASK TESTS]

## What this skill does
Governs test derivation from AC. One test per AC condition. Each test
must specify an explicit expected output — not a description of a
passing state.

## Load on activation
- references/given-when-then-format.md
- references/test-output-spec.md
- references/test-vs-ac.md

## Load only for task-scope tests
- references/task-test-constraints.md

## The non-negotiable rule
A test without an explicit expected output is not a test.
"The form submits successfully" is not an expected output.
"The response status is 200 and the confirmation message reads X" is.

## Do not load
- AC writing references (AC is input — do not rewrite it)
- qa-review references (separate skill, separate agent)
