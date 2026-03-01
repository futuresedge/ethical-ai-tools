Here’s a concise summary of where we are, what’s planned, and what to consider next.

***

## Chat summary

- You ran a **first end‑to‑end pipeline** on the navbar feature: Idea → Feature Spec (Feature Definer) → Acceptance Criteria (AC Writer) → Decomposition (Task Decomposer). 
- The artefact chain worked: each file referenced its source, STATUS fields were mostly respected, and human gates caught upstream issues (FAC‑navbar‑05) before they poisoned downstream artefacts. 
- The **AC Writer** produced strong Given‑When‑Then criteria, a traceability table, and Notes explaining the atomic split for mobile AC. 
- The **Task Decomposer** read the actual codebase, discovered `Header.astro` already exists, and reduced scope to 2 tasks with independence checks, coverage mapping back to FAC IDs, and the emergent `SATISFIES partial` notation. 
- You exported VS Code Copilot logs and analysed **token usage**: ~119,816 tokens across 3 agents + 1 AC update, with ~99.3% prompt vs 0.7% completion. Tool Results (file/code reads) dominated later runs, and the Decomposer’s heavy prompt was justified by codebase grounding. 
- A Sprint‑1 retro captured what worked (artefact lineage, human gates, codebase‑aware decomposition), what was missing (task specs, observable stream, status events), and proposed experiments and spec changes. 

***

## Experiments currently planned

These are the explicit experiments already defined or agreed:

1. **Experiment 2 – Reviewer Agent (gate model)**
   - Build `review-artefact.agent.md` with three modes: feature spec review, AC review, decomposition review. 
   - Inputs: target artefact + relevant rules/skills (e.g. feature-spec template, AC rules, decomposition rules).
   - Output: verdict `ACCEPTED`, `ACCEPTED WITH NOTES`, or `RETURNED` plus concise reasons.
   - Role: sits *between* primary agents and the next zone; the next agent does not run until the reviewer accepts.
   - Success criteria:
     - Catches at least one real issue humans caught (e.g. non‑observable success condition, constraint bleeding into implementation).
     - Does not flag obviously correct content as errors. 

2. **Experiment 3 – Task Spec Writer**
   - Run a Task Spec Writer on **Task 1: navbar-component** using `decomposition.md` as input. 
   - Goal: produce the first real task spec artefact for a Task Performer Agent — including context package references, environment contract, proof requirements, and local AC.
   - Success criteria:
     - A performer agent could execute it without asking clarifying questions.
     - It stays within stated context and complexity budgets from the decomposition rules. 

3. **Experiment 4 – Test Writer (Evidence‑First)**
   - Run a Test Writer agent against the Task 1 spec *before* any implementation. 
   - Goal: validate the “tests before code” principle at task level.
   - Success criteria:
     - It produces a runnable test file (expected all failing) that clearly traces back to task AC and FAC IDs.
     - No reliance on implementation details not present in the spec. 

4. **Token efficiency measurement experiments** (outlined but not yet executed)
   - Baseline vs framework:
     - Compare a single, monolithic agent with full context vs your multi‑agent pipeline, measuring total input tokens and output quality for the same feature. 
   - Context size vs output quality:
     - Vary context size per agent and observe when quality degrades, to test “lost in the middle” behaviour. 
   - Filesystem vs message‑passing handoffs:
     - Compare token cost of passing artefact contents in prompts vs passing filesystem paths. 

***

## Next experiments to consider

Building on what’s already planned, these are sensible next steps:

1. **Finish wiring Experiment 2 and actually run it**
   - Implement `review-artefact.agent.md` focused first on **feature spec review only** (narrow scope).
   - Run it on the existing navbar `feature-spec.md` and see:
     - Which issues it finds (e.g. constraint vs implementation bleed, ambiguous success conditions).
     - Whether its notes are useful to you as the human gate.

2. **Add the missing Zone‑3 step: Task Spec + Tests, then stop**
   - For the navbar feature, run:
     - Task Spec Writer on Task 1.
     - Test Writer on that spec.
   - Intentionally *don’t* implement the code yet — this isolates the quality of upstream artefacts and the viability of evidence‑first development.

3. **Formalise emergent patterns and gaps as small PRs to the framework**
   - Promote `SATISFIES partial` into the decomposition output spec: syntax, semantics, and how test coverage should treat it. 
   - Add a `StatusChanged` event protocol (e.g. `ACAcceptedByHuman`, `DecompositionAcceptedByHuman`) to artefact formats so STATUS changes are explicit domain events, not silent edits. 
   - Add a `UIDesignRequired: true/false` flag to the feature spec template plus a simple rule: when true, UI Design agent must run before decomposition. 
   - Add a **zero-results fallback** requirement for all `filesearch` patterns in agent specs: if no files found, agents must halt and raise uncertainty instead of proceeding. 

4. **Lightweight token‑usage analysis tool**
   - Use existing VS Code export JSON and txt logs to:
     - Summarise per‑agent prompt vs completion tokens per run.
     - Classify prompt tokens by category (system, files, tool results) to see where optimisation pays off most. 
   - Start with scripts/manual analysis on exported logs; only build a full Observable Stream later if needed.

5. **Quality rubrics per agent type**
   - Before optimising for token cost, define what “good” looks like for:
     - Feature Spec (problem, scope, users, constraints, success conditions).
     - AC Writer (4 AC conditions: unambiguous, atomic, verifiable, problem‑space). 
     - Decomposer (independent tasks, coverage of all FAC, no glue tasks).
   - Then you can evaluate experiments on “quality‑adjusted tokens”, not just raw cost. 

6. **Later: Retro agent powered by Observable Stream**
   - Once a basic event log exists, add a retrospective agent that ingests events + artefacts and drafts a retro like the one you and I produced manually. 

If you’d like, I can next draft the concrete `review-artefact.agent.md` spec so you can plug it into the repo and run Experiment 2.