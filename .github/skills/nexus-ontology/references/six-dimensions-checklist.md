# Nexus 6-Dimension Design Checklist

> Rubric for evaluating any Nexus tool, schema table, or agent spec section before it is built.
> Source: ONE-Ontology.md + Nexus-agent-plan.md Part 5 + NexusModelOverview.md
> Each check is binary PASS / FAIL. No partial credit.
> A named deferral is acceptable. An unnamed gap is a design error.

---

## Dimension 1 — Capability
*Who is permitted to do this, right now?*

| # | Check | Pass condition |
|---|---|---|
| C1 | Tool possession alone enforces the boundary | Agent without the tool cannot call it — no ACL table, no runtime identity check, no bypass path |
| C2 | Task-scoped tools carry the task slug suffix | `write_proof_template_task_07` not `write_proof_template` |
| C3 | No tool in an agent spec exceeds the agent's declared role | Task Performer: no feature-level write tools. Feature Owner: no task-scoped write tools |
| C4 | Dynamic tool registration uses `tools/list_changed` to signal VS Code | VS Code refreshes its tool list without a server restart |

**If any check FAILS:** the access model is wrong. Redesign before building. Do not patch with an instruction to the agent.

---

## Dimension 2 — Accountability
*Who did this, under what conditions, and can that ever be disputed?*

| # | Check | Pass condition |
|---|---|---|
| A1 | Every mutation writes an `audit_log` entry | The write is inside the tool implementation — not in agent instructions |
| A2 | `audit_log` entry contains all required fields | `tool_name`, `task_id`, `action`, `content_hash`, `actor`, `timestamp` — no nulls |
| A3 | GitHub webhook events land in the same `audit_log` | `actor = 'webhook:github'`; branch → task_id extraction produces a valid join key |
| A4 | `audit_log` is append-only — no row is ever updated or deleted | No `UPDATE` or `DELETE` statements touch `audit_log` |

**If any check FAILS:** move the audit write inside the tool. Never instruct the agent to log separately.

---

## Dimension 3 — Quality
*Does this output actually meet the standard?*

| # | Check | Pass condition |
|---|---|---|
| Q1 | Tool enforces state precondition before executing | Rejects with a typed error if `tasks.state` is not the expected pre-condition value |
| Q2 | Tool parameter schema uses Zod; `reason` is always required | `reason: z.string()` present and non-optional on all `write_` and `submit_` tools |
| Q3 | Proof template must exist before implementation begins | `write_proof_template_{slug}` is in the Task Performer's tool set; no path bypasses it |

**EXPERIMENT NOTE:** Structured QA rules table (rows per rule, per task type) is an intentional deferral.
Q1–Q3 are the minimum for the experiment pass criterion. Do not gold-plate with structured rules rows during Phase 1–5.

---

## Dimension 4 — Temporality
*Is this the right moment for this operation?*

| # | Check | Pass condition |
|---|---|---|
| T1 | Every task-mutating tool checks current state before executing | `SELECT state FROM tasks WHERE id = ?` runs before any document write or state change |
| T2 | Document write and state transition are atomic | Both succeed or neither does — no partial state possible |
| T3 | Only `submit_` tools trigger state transitions | `write_` and `append_` tools never update `tasks.state` |

**EXPERIMENT NOTE:** A `state_transitions` table evaluated by a Policy Engine is an intentional deferral.
Inline precondition checks in each tool satisfy T1–T3 for the experiment. Flag as technical debt in comments.

---

## Dimension 5 — Context
*Does the agent have what it needs to do this work well?*

| # | Check | Pass condition |
|---|---|---|
| X1 | `get_context_card` appears in every Task Performer spec | Present as universal tool in the generated `.agent.md` |
| X2 | Template instructs: call `get_context_card` as the first action | Baked into the template text — enforced by structure, not agent compliance |
| X3 | `raise_uncertainty` is available when context is insufficient | Universal tool; no path exists that skips it when context is unclear |

**EXPERIMENT NOTE:** Context card returning a raw task row is accepted for Phase 1–5.
Knowledge base + generated briefing is Assumption B3, deferred to a later probe. X1–X3 are the minimum.

---

## Dimension 6 — Artifact
*What exactly was produced, and how does it relate to everything else?*

| # | Check | Pass condition |
|---|---|---|
| F1 | Every document has a declared type in `documents.doc_type` | Valid values from the Subject Vocabulary; no null `doc_type` values |
| F2 | Every write increments `documents.version` | Version history is preserved; current pointer is updated |
| F3 | `documents` row exists before any tool reads or writes it | Seed script or tool creates the row before operations begin |

**EXPERIMENT NOTE:** Document lineage graph (`document_lineage` table, parent_doc_id) is an intentional deferral.
F1–F3 are the minimum. Full provenance chain (spec → AC → proof → QA review) is post-adoption.

---

## Overall Verdict

**Experiment pass criterion:**
- Dimensions 1 (Capability) and 2 (Accountability): ALL checks must pass
- Dimensions 3–6: minimum checks (as noted) must pass; named deferrals are acceptable

**An unnamed gap is a design error, not a deferral.**
If a gap is discovered during build: name it here, note it as deferred, continue.
If it cannot be named or deferred: stop and raise uncertainty before building further.
