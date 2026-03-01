# Nexus Experiment 1 — Ontology Coverage Map

> Records which dimensions are fully proved, which are intentionally skeletal, and which are deferred.
> Used by the Nexus Server Builder to calibrate build depth per phase.
> Source: ONE-Ontology.md, Nexus-exp-01-phase-01 through phase-05, NexusDecisionsRationale.md
> Update this map when phase scope changes or a deferral is resolved.

---

## Coverage Status

| Dimension | Phase coverage | Status | Intentional deferral |
|---|---|---|---|
| **Capability** | OCAP tool registration (Phase 2). Per-task instance isolation (Phase 3). | ✅ Full | None — core deliverable |
| **Accountability** | `audit_log` schema (Phase 1). Compound tools write entries atomically (Phase 2). GitHub webhooks (Phase 4). Single-query chain of custody (Phase 5). | ✅ Full | None — required for single source of truth |
| **Quality** | State preconditions in `submit_` tools (Phase 2). Zod `reason` required (Phase 2). Proof template as first action (Phase 3). | ⚠️ Skeleton | QA rules table + Agent 2.2 QA Reviewer: future phase |
| **Temporality** | Inline state check before each mutation (Phase 2). Atomic write + transition in `submit_` (Phase 2). | ⚠️ Hardcoded | `state_transitions` table + Policy Engine: post-adoption. Flag as technical debt in server code comments. |
| **Context** | `get_context_card` universal tool returns raw task row (Phase 1). `raise_uncertainty` universal tool (Phase 1). | ⚠️ Thin | Knowledge base + generated briefing: Assumption B3, separate probe |
| **Artifact** | `documents` table with `doc_type` + `version` (Phase 1). | ⚠️ Skeleton | `document_lineage` table (parent_doc_id, lineage traversal): post-adoption |

---

## What "Skeleton" and "Thin" Mean

**Skeleton:** The mechanism exists and works for the experiment scope. The gap to full coverage is known and deferred with a clear path. You can complete the task lifecycle and observe correct behaviour. The gap would become a problem at production scale or with multiple simultaneous tasks.

**Thin:** The mechanism exists but does the minimum. It will not mislead — agents get some useful context — but the quality of the context depends on what was seeded manually, not generated from a knowledge base.

**Full:** The dimension is fully implemented for the experiment scope. Adding more tasks, more agents, or more document types would not require changes to the mechanism.

---

## Proof Points per Dimension (what the Phase 5 audit log must show)

| Dimension | Proof point in Phase 5 audit log |
|---|---|
| Capability | `read_task_spec_task_08` does NOT appear in the tool list at any point |
| Accountability | All 9 lifecycle events appear in one `SELECT * FROM audit_log WHERE task_id = 'task-07'` query, ordered by timestamp, with correct `actor` values |
| Quality | `submit_proof_task_07` rejects a call made before the task is in `CLAIMED` state (typed error, not a crash) |
| Temporality | `submit_proof_task_07` transitions state from `CLAIMED` → `PROOFSUBMITTED` atomically; no row where state lags document content |
| Context | `get_context_card` returns a non-empty response before the agent calls any other tool |
| Artifact | SELECT on `documents WHERE task_id = 'task-07'` shows all expected doc_types with version ≥ 1 |

---

## Deferral Register

| Deferral | Deferred from | Required for | Trigger to resolve |
|---|---|---|---|
| QA rules table | Phase 1–5 | Agent 2.2 QA Reviewer (future phase) | When QA Reviewer agent spec is being written |
| `state_transitions` table + Policy Engine | Phase 1–5 | More than 5 states or 3+ concurrent workflows | When the experiment is adopted and state complexity grows |
| Knowledge base + context card generation | Phase 1–5 | Assumption B3 probe | When the Context Agent (Agent 2.3) build begins |
| `document_lineage` table | Phase 1–5 | Full provenance traversal (spec → AC → proof → review) | When post-adoption lineage reporting is required |
