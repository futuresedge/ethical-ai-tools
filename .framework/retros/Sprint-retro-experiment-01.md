# Sprint Retrospective: Navbar Feature 

Experiment 1: First Full Pipeline Run

Using the 4Ls format: **Liked, Learned, Lacked, Longed For**.

***

## Liked

**The pipeline held its shape end to end.** Four agents ran in sequence — Feature Definer → AC Writer → AC Update → Task Decomposer — and the artefact lineage was intact at every handoff. Each agent's output referenced its upstream input by path, not by assumption. 

**Human gates worked as designed.** You caught the FAC-navbar-05 ambiguity at the right boundary, fixed it upstream in the feature spec, and the AC agent cleanly removed the downstream criterion without needing to understand *why* — only what had changed. The chain of custody held: one edit, one consequence, no drift. 

**The file search tool fixed the discovery problem.** The AC Writer's first action after loading was `filesearch` for its reference files by partial name — it found them in two calls rather than the eight sequential reads the Feature Definer required. Adding the search tool was the right correction. 

**Agents documented their reasoning inside artefacts.** The AC agent's Notes section ("FAC-navbar-03 and 04 are split in accordance with the atomic rule") and the decomposer's Decomposition Summary ("Header.astro already exists...") are exactly what the Chain of Custody principle calls for. Future agents reading these artefacts will know *why*, not just *what*. 

**Two agents added structure that wasn't in the template.** The AC agent added the traceability table; the decomposer added Independence Verification, Size Verification, and Coverage Check tables. Both additions were correct, useful, and show the agents understanding the purpose of the artefact, not just filling a form. 

***

## Learned

**The 96-second context load time is a real constraint, not a footnote.** The Feature Definer read 8+ files before producing output. The AC Writer used file search and cut that significantly. The pattern that works: agents should search for references, not be told specific filenames. File search is the right primitive — explicit paths in agent specs are fragile. 

**Codebase-aware decomposition is qualitatively different from spec-only decomposition.** The decomposer discovering that `Header.astro` already exists, that blog pages already import it, and that the home page has nothing — reduced scope from an estimated 4+ tasks to 2. This happened because the agent read the codebase before splitting. This is the Environment Contract principle working: ground truth beats assumption. The framework should make codebase reading a mandatory first step for decomposition, not an optional one. 

**STATUS management is working correctly but informally.** The AC agent set `STATUS: DRAFT`, you reviewed and accepted it, and the decomposer received it as `ACCEPTED`. But the status change happened outside the framework — there's no documented gate or event for it. The domain map has `ContextApprovedByHuman` as a named domain event; the equivalent for AC approval doesn't yet have a corresponding artefact mutation protocol. 

**"SATISFIES partial" emerged spontaneously and is valuable.** The decomposer invented a notation the framework didn't define. It correctly identified that Task 1 partially satisfies FAC-navbar-01 (link presence) and Task 2 completes it (page presence). This is a real concept that needs formalising in the decomposition output format spec — otherwise the next run might omit it. 

***

## Lacked

**No task spec writer ran.** The pipeline stopped at decomposition. The Event Storming domain map shows Zone 3 continues: Task Owner Agent defines each task spec, Test Writer Agent writes tests, Context Agent curates context, QA Agent Definition reviews.  None of that ran. The decomposition produced task *descriptions*, not task *specs* — the ACCEPTANCE field in each task is a summary, not a full task spec with environment contract, proof requirements, and context package. This is the highest-priority gap: the pipeline got to the gate but didn't pass through it. 

**No human approval event for decomposition.** `STATUS: ACCEPTED` was set by the agent, not by you. The framework has a human gate between every zone, but this one was silent. The decomposer's Open Questions section was empty, so it promoted itself. That reasoning is defensible but needs to be a named event — `DecompositionAcceptedByHuman` — rather than an assumed default.

**The file search tool found things by partial name, which is fragile.** `filesearch(".githubskillsreferencesgiven-when-then")` worked because the file happened to contain that string in its path. A renamed file would silently return no results and the agent would proceed without the reference. Agents need a fallback behaviour when search returns zero results: halt and raise uncertainty, rather than continue with degraded context. 

**No observable stream.** You were watching the outputs but had no visibility into what was happening between agent invocations. The thinking logs in the JSON export are the closest thing, and they only exist because you exported them. In production use, agent reasoning is invisible unless you instrument it. The Observable Stream primitive from the design thinking work remains unbuilt. 

***

## Longed For

**A task spec that a performer agent could actually pick up and execute.** The decomposition is excellent preparation, but what's missing is the artefact a Task Performer Agent actually receives: the full context package, the environment contract, the proof template, and the explicit test files. That's the whole Zone 3 → Zone 4 handoff. Running that end-to-end — even for Task 1 only — would be the most valuable next experiment.

**A retrospective that writes itself.** This retro was conducted by you with external analysis. In the mature framework, the Observable Stream feeds a retrospective agent that surfaces patterns from run logs without human synthesis. That's Sprint 7+ territory, but worth naming as a north star.

***

## Process Health Assessment

| Dimension | Status | Notes |
|---|---|---|
| Artefact lineage | ✓ Strong | Each output referenced its upstream input |
| Human gates | ✓ Held | FAC-05 caught and fixed at the right boundary |
| Agent reasoning documented | ✓ Strong | Notes sections captured decisions in artefacts |
| Context load efficiency | ⚠ Improving | File search better than sequential reads; still no pre-staged cards |
| STATUS management | ⚠ Informal | Changes happen without named domain events |
| Pipeline completeness | ✗ Incomplete | Stopped at decomposition; Zone 3 task specs not written |
| Codebase grounding | ✓ Strong | Decomposer read codebase before splitting |
| New patterns captured | ⚠ Partially | "SATISFIES partial" emerged but not yet formalised |

***

## Recommended Next Experiments

In priority order:

1. **Run the Task Spec Writer** on Task 1 (`navbar-component`) — this produces the first artefact a performer agent would actually execute from
2. **Run the Test Writer** against that task spec — this is where the Evidence-First principle gets tested: can tests be written before implementation?
3. **Formalise the "SATISFIES partial" pattern** in the decomposition output format spec before the next feature runs and the pattern gets lost
4. **Add a zero-results fallback** to the file search pattern in all agent specs: if search returns nothing, halt and raise uncertainty rather than continue