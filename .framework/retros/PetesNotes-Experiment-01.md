# Pete's notes on Experiment 1

Pete:
> I would like to add my thoughts to this.
> You were instrumental in reviewing the agents' outputs and finding problems. Perhaps each agent has a corresponding reviewer to check their work and suggest improvements.

> A note on the first paragraph in the Liked section - there are only 3 agents at the moment. The AC Update was me notifying the AC Writer about a spec change and to modify the ac spec appropriately.
> Are you able to quantify the token usage of the agents from the chat export?
> What are our next steps? Any changes to agent specs? Other changes to try?
> Remember, we should see this as experimentation and try out theories.

***
Response:

## Your Thoughts on Reviewer Agents
This is a strong instinct and worth making into an experiment. What you're describing maps directly to the **Evidence Gate** primitive from the design work  — currently the only gate is the human. A reviewer agent sitting *between* the primary agent and the human gate would: 

- Catch formatting violations before they reach you (wrong STATUS, missing traceability table, AND-clauses not split, etc.)
- Give the primary agent a chance to self-correct before requiring your attention
- Produce a review artefact that becomes part of the chain of custody

The key design question is whether the reviewer runs in the **same session** (a second prompt to the same agent) or as a **separate agent with its own spec**. A separate agent is more principled — it has a different role, different inputs (it reads the *output* artefact, not the source), and a different output (a review verdict). This mirrors QA separation in the domain map. The cheapest version to test: one reviewer spec that works across all three agents, taking any artefact + the relevant rules file and outputting `ACCEPTED`, `ACCEPTED WITH NOTES`, or `RETURNED` with a reason. 

***
## Token Usage
The pipeline consumed **~119,816 tokens** across all four runs, with a striking 99.3% prompt vs 0.7% completion split. 
| Agent | Prompt | Completion | Total |
|---|---|---|---|
| Feature Definer | 20,994 | 231 | 21,225 |
| AC Writer (Initial) | 26,482 | 243 | 26,725 |
| AC Writer (Update) | 27,665 | 77 | 27,742 |
| Task Decomposer | 43,840 | 284 | 44,124 |
| **Total** | **118,981** | **835** | **~120k** |

Three things stand out in the context breakdown: 
- **System Instructions overhead halved** across the run — from 42% of the Feature Definer's prompt down to 21% for the Decomposer. This is because the Decomposer loaded much more content (codebase + reference files), making the fixed agent overhead a smaller percentage of the total.
- **Tool Results grew to 39%** for both the AC Update and Decomposer — meaning those agents spent more of their context budget re-reading file contents than anything else. This is the primary cost driver.
- **The AC Update was the cheapest output** (77 tokens) for the second-highest prompt cost — a targeted, high-precision edit. This is what good human-gate instructions look like: precise scope, minimal ambiguity.

The Decomposer's high prompt cost (43,840) is entirely justified — it read the codebase to ground its decomposition in reality rather than assumption. That investment directly produced the scope reduction (4+ tasks → 2). 

***
## Next Steps & Experiments
Treating this as a series of experiments rather than a build plan:

**Experiment 2 — Reviewer Agent (your idea, highest priority)**
- Write a single `review-artefact.agent.md` spec with three modes: feature-spec review, AC review, decomposition review
- Run it against the existing navbar artefacts to calibrate what it catches vs misses
- Cost hypothesis: ~15–20k tokens per review run (reads the artefact + the relevant rules, writes a short verdict)
- Success signal: it catches at least one thing you or I would have caught, and flags nothing that's actually correct

**Experiment 3 — Task Spec Writer**
- Run `write-task-spec.agent.md` on Task 1 (`navbar-component`) using the existing `decomposition.md`
- This is the gateway to Zone 4 — a Task Performer Agent can't run without it
- Success signal: the output is a spec that a performer agent could pick up and execute without asking a question

**Experiment 4 — Test Writer (Evidence-First)**
- Run the Test Writer against the Task 1 spec before any implementation
- This is the hardest test of the framework's philosophy: can meaningful tests be written before code exists?
- Success signal: the test file is runnable (all failing) before a single line of `Header.astro` is changed

**Agent spec changes to make now:**

| Change | Why |
|---|---|
| Add zero-results fallback to all `filesearch` calls | Silent failure was identified as a fragility risk |
| Formalise `SATISFIES partial` in decomposition output format | The Decomposer invented it; it needs to be a first-class citizen before the next run |
| Add `StatusChanged` event protocol to artefact format | Status currently mutates without a named event |
| Add `ui-artefact.md` to the decomposition input list or mark as optional | The Decomposer referenced it as an expected input but it didn't exist |

**One structural question worth sitting with before Experiment 2:** Should reviewer agents gate the *next* agent (i.e., the Decomposer doesn't run until the AC Reviewer approves), or should they run in parallel and flag issues asynchronously? The gate model is safer; the parallel model is faster. That's worth deciding before wiring the reviewer in — it determines whether the reviewer is part of the pipeline or a quality monitor alongside it.