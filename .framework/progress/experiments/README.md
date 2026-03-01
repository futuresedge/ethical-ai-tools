# Probe and Experiment Results
> Results from structured assumption tests and framework probes are stored here.
> Framework Owner reads these before any advisory or assessment response.
> Naming convention: probe-[name]-[date].md
> Example: probe-evidence-gate-20260307.md

---

## Experiment Log

| Experiment | Description | Status | Probe file |
|---|---|---|---|
| Experiment 1 | Build 3 Zone 2 agents (Feature Definer, AC Writer, Task Decomposer) and run navbar feature end-to-end | COMPLETE | no probe file — logged in ExperimentsSummary.md |
| Experiment 2 | Reviewer Agent — gate model, three modes | COMPLETE | probe-experiment-2-reviewer-agent-20260301.md |
| Experiment 3 | Task Spec Writer — Zone 3, first task spec artefact | IN PROGRESS | probe pending |
| Experiment 4 | Test Writer — evidence-first, tests before implementation | NOT STARTED | — |

## Experiment 2 — Reviewer Agent (your idea, highest priority)

Write a single review-artefact.agent.md spec with three modes: feature-spec review, AC review, decomposition review

Run it against the existing navbar artefacts to calibrate what it catches vs misses

Cost hypothesis: ~15–20k tokens per review run (reads the artefact + the relevant rules, writes a short verdict)

Success signal: it catches at least one thing you or I would have caught, and flags nothing that's actually correct

## Experiment 3 — Task Spec Writer

Run write-task-spec.agent.md on Task 1 (navbar-component) using the existing decomposition.md

This is the gateway to Zone 4 — a Task Performer Agent can't run without it

Success signal: the output is a spec that a performer agent could pick up and execute without asking a question

## Experiment 4 — Test Writer (Evidence-First)

Run the Test Writer against the Task 1 spec before any implementation

This is the hardest test of the framework's philosophy: can meaningful tests be written before code exists?

Success signal: the test file is runnable (all failing) before a single line of Header.astro is changed

