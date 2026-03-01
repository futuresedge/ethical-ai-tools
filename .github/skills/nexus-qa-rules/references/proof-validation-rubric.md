# Proof Validation Rubric

> Rubric for the QA Reviewer agent evaluating a submitted proof.
> Source: NexusModelOverview.md — Quality dimension, NexusDecisionsRationale.md Decision 6
> Each check is binary PASS / FAIL.
> A proof that fails any blocking check transitions to QAFAILED — not QAAPPROVED.

---

## What a Valid Proof Must Contain

A proof is a document submitted via `submit_proof_{slug}` that contains evidence
the task's acceptance criteria have been met. It is not a description of what was done —
it is verifiable evidence.

### Required elements in every proof

| # | Element | Pass condition |
|---|---|---|
| P1 | Command(s) that were run | Exact commands specified — no vague references (`npm test` not `"ran tests"`) |
| P2 | Exit code or output for each command | Actual output shown, not summarised |
| P3 | Correspondence to proof template | Every section of the `proof_template` has a corresponding entry in the proof |
| P4 | Environment stated | Runtime version, OS, or relevant env vars noted where they affect the outcome |
| P5 | No fabricated output | If output cannot be produced, `raise_uncertainty` is called — proof is not submitted |

---

## Command Specificity Rules

These rules are the structural encoding of Sprint 6 retrospective learnings (Decision 6 rationale).
They are not instructions to the QA Reviewer — they are evaluation criteria.

| Rule | Requirement | Example of passing | Example of failing |
|---|---|---|---|
| CS1 | Use the project's package manager | `pnpm test` in a pnpm repo | `bun test` in a pnpm repo |
| CS2 | Specify the exact test runner command | `pnpm vitest run` | "ran the tests" |
| CS3 | Include actual output, not a summary | Paste of terminal output showing pass/fail counts | "all tests passed" |
| CS4 | If a build step is required, it must be shown | `pnpm build` output before test output | Tests run against stale build |

---

## State Transition Authority

The QA Reviewer has authority over exactly two transitions:

| Current state | Transition | Condition |
|---|---|---|
| `PROOFSUBMITTED` | → `QAAPPROVED` | All checks P1–P5 pass. All CS rules pass. |
| `PROOFSUBMITTED` | → `QAFAILED` | Any blocking check fails. |

**The QA Reviewer has NO authority to:**
- Transition from any state other than `PROOFSUBMITTED`
- Approve a partial proof
- Modify the proof document
- Re-activate a task (that is `activate_task` — Pete's tool)

If the state is not `PROOFSUBMITTED` when the QA Reviewer is invoked: call `raise_uncertainty`.

---

## Adding New QA Rules

When a retrospective surfaces a new validation rule, it is added as a database row —
not as a new line in this rubric or in the agent spec.

New rules follow this pattern:
1. Identify the failing behaviour from the retrospective evidence
2. Express it as a binary-testable condition (PASS/FAIL, not PASS/MAYBE)
3. Scope it to a `task_type` (not all tasks — only the type where the failure occurred)
4. Insert it as a row in `qa_rules` table (see qa-rules-schema.md)
5. The QA Reviewer queries the table — it never reads this rubric file for per-task rules

These steps ensure that the framework learns from experience without agent specs growing longer.
