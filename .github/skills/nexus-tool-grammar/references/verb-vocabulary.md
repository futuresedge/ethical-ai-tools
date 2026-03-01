# Nexus Verb Vocabulary

> Closed set — 8 verbs only. Never extended without a framework-level decision.
> Source: NexusToolGrammar.md
> If a proposed tool does not fit any verb, it likely crosses a concern boundary and must be split.

---

## The 8 Verbs

### `read_`
Fetch the current content of a document. Returns content only.
- **Side effects:** None. No audit entry. No state change. No stream event.
- **Rules:** Must be idempotent. Must never mutate any row. If document absent, return typed empty response.
- **Examples:** `read_task_spec`, `read_proof_template`, `read_qa_review_task_07`
- **Counter-example:** `get_task_spec` ❌ — task_spec is a document, not system metadata; must be `read_`

---

### `write_`
Create or fully replace a document. Prior version is preserved in history; current pointer updates.
- **Side effects:** One `audit_log` entry (doc type, task_id, content hash, session, reason, timestamp). No state transition. No stream event.
- **Rules:** `reason` parameter is mandatory (Zod-enforced; never optional). Validates that task state permits writes for this doc type. Never used for append-only documents. Never used when a state transition must follow.
- **Examples:** `write_task_spec`, `write_feature_spec`, `write_proof_template_task_07`
- **Counter-example:** `write_proof_task_07` ❌ — proof submission requires a state transition; must be `submit_`

---

### `append_`
Add content to a document without replacing prior content. Document is an ordered log.
- **Side effects:** One `audit_log` entry. No state transition. No stream event.
- **Rules:** Only for documents declared as append-only in the Subject Vocabulary. Never accepts `replace` or `overwrite` parameter. Timestamps are set by the server, not the caller.
- **Applicable subjects:** `work_log`, `uncertainty` log
- **Examples:** `append_work_log`, `append_work_log_task_07`
- **Counter-example:** `append_task_spec_task_07` ❌ — task_spec is Replace mode, not Append-only

---

### `submit_`
Write a document AND trigger a state transition AND emit a stream event. Atomic — all succeed or none.
- **Side effects:** (1) writes document with version history, (2) `audit_log` entry, (3) state transition, (4) `stream_events` entry in plain English, (5) triggers Policy Engine downstream evaluation.
- **Rules:** Only one state transition per call. Stream event text is hardcoded in the tool, not supplied by the caller. Must validate exact expected pre-transition state. `reason` mandatory. Only given to agents that are the designated actor for that transition.
- **Examples:** `submit_proof_task_07`, `submit_qa_review_task_07`, `submit_ac`
- **Counter-example:** `submit_context_card` ❌ — context cards are not submitted by agents

---

### `request_`
Signal intent or request action from another actor (human or system). Writes no documents. Does not advance state unilaterally.
- **Side effects:** `stream_events` entry. `audit_log` entry. May transition to `AWAITING_*` state — never to an active working state.
- **Rules:** Never writes a document. The requested action must be taken by a different actor. Stream event must identify who the request is directed at.
- **Examples:** `request_review`, `request_clarification`, `request_ac_approval`
- **Counter-example:** `request_write_task_spec` ❌ — verbs do not nest; the agent calls `write_task_spec` directly

---

### `search_`
Query the knowledge base or pattern library. Returns matching entries ranked by relevance.
- **Side effects:** None. Read-only against knowledge base tables only.
- **Rules:** Accepts `query` (free text) and optional `tags` parameters. Never returns content from the primary document store — only knowledge base entries. Results include `source_session`.
- **Examples:** `search_knowledge_base`, `search_patterns`
- **Counter-example:** `search_task_specs` ❌ — searching primary documents uses `read_` with a filter, not `search_`

---

### `get_`
Fetch metadata, configuration, pre-generated artefacts, or system state. Distinct from `read_`: operates on system-level resources, not task documents.
- **Side effects:** None. Read-only.
- **Rules:** Never operates on a task document (that is `read_`). Used for: context cards, capability declarations, current lifecycle state, tool registry metadata.
- **Examples:** `get_context_card`, `get_my_capabilities`, `get_current_state`
- **Counter-example:** `get_task_spec_task_07` ❌ — task_spec is a document, not system metadata; must be `read_`

---

### `raise_`
Surface an exceptional condition immediately to human attention. Bypasses normal flow.
- **Side effects:** Priority `stream_events` entry (visually distinct). `audit_log` entry. May transition state to `BLOCKED` or `AWAITING_HUMAN`.
- **Rules:** Reserved exclusively for `raise_uncertainty` — the only valid `raise_` tool. Never for normal workflow signalling (use `request_`). Description parameter is free text intentionally. Any agent may have this tool.
- **Example:** `raise_uncertainty`
- **Counter-example:** `raise_error` ❌ — errors are handled by tool return values, not by a `raise_` tool

---

## Determining the Right Verb (decision tree)

1. Does the operation have a state transition? → `submit_`
2. Does the operation emit a stream event but write no document? → `request_` or `raise_`
3. Does the operation write a document without a state transition?
   - Append-only document? → `append_`
   - Replace/create? → `write_`
4. Does the operation read a task document? → `read_`
5. Does the operation read system metadata or a pre-generated resource? → `get_`
6. Does the operation query the knowledge base only? → `search_`

If no verb fits: the tool likely crosses a concern boundary. Split it.
