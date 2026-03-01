<!-- @format -->

# Your Roadmap

## This Week — Complete the Foundation

1. **Photograph and digitise the board** — get it into Miro or FigJam while it's fresh. The spatial relationships matter.

2. **Update the Task Aggregate Spec** — incorporate H11 (two QA agents, updated write authority table) and H12 (human review gate on return to queue, new `CLOSED` terminal state).

3. **Resolve H8** — one decision needed: does the Test Writer Agent write task-level tests autonomously from acceptance criteria, or does a human seed the first test? This unblocks Zone 3 entirely.

---

## Next Two Weeks — Write the Remaining Specs

Work in this order — each one builds on the last:

| Document                       | Why this order                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------ |
| **Feature Aggregate Spec**     | Task is a child of Feature — Feature boundaries define Task creation authority |
| **QA Agent (Definition) Spec** | Highest context load, most complex read model — hardest to get right           |
| **QA Agent (Execution) Spec**  | Narrower scope, derives from Task Aggregate Spec already written               |
| **Context Agent Spec**         | Context curation is the most load-bearing process in Zone 3                    |
| **Uncertainty Sub-flow Spec**  | Complete mini-system — deserves its own document                               |
| **Policy Registry**            | Collect all 30+ purple stickies into one authoritative document                |

---

## First Probe — Minimum Viable Coordination

Before building anything else, run this end-to-end manually with you playing every agent role:

> **One story. One feature. One task. Full Zone 3 → Zone 4 flow.**

Specifically: Feature Owner spawns one Task Owner → Task Owner defines one task → Context Agent curates → QA Agent (Definition) reviews → Product Owner approves → Task Performer claims → Environment verified → Task performed → QA Agent (Execution) reviews → Unit tests pass → Task completed.

Keep a **friction journal** — every moment where context felt wrong, where a decision was unclear, where you had to invent something not in the spec. Those friction points become your next set of red stickies.

**Success criteria for the probe:** You can hand a task from Task Owner to Task Performer with zero ambiguity about what done looks like.

---

## Following Month — Resolve H13 and Build Zone 5

Once the Zone 3→4 probe is stable, resolve H13 (CI/CD boundary ownership) and write:

- **Staging Environment Contract Spec** — mirrors the environment contract in Zone 4
- **Feature Delivery Policy Spec** — the full Zone 5 policy chain from integration tests to production
- **Integration + User Testing Protocol** — who conducts, what constitutes pass, what constitutes fail

---

## The Principle Underneath All of This

Every spec you write should answer the same four questions:

1. **What does it own?** — artefacts and write authority
2. **What are its valid states?** — lifecycle and transitions
3. **What does it need to read?** — its Read Model at each decision point
4. **What does it produce?** — events emitted to the Observable Stream

If a spec can't answer all four, it isn't ready to implement.
