# Nexus Tool Grammar — Reference Specification

**Version:** 0.1 | **Status:** Draft | **Source session:** 2026-03-01

***

## Purpose

This grammar defines the naming, structure, and behavioural contract for every tool in the Nexus MCP server. It exists to prevent the tool catalogue from becoming an unmaintainable list of ad hoc names as the framework grows. Any developer or agent adding a new tool must derive it from this grammar — not invent independently.

The grammar enforces one principle above all others: **tool possession is capability**. The name of a tool must be sufficient to determine what it does, who should have it, and what scope it acts on — without consulting any other document.

***

## The Grammar

Every tool name is formed from two or three components:

```
{verb}_{subject}

or, for task-scoped tools:

{verb}_{subject}_{task_slug}
```

Where:
- `{verb}` is drawn from the closed Verb Vocabulary (8 entries, never extended)
- `{subject}` is drawn from the open Subject Vocabulary (document type taxonomy, extends as the framework grows)
- `{task_slug}` is the task identifier with hyphens replaced by underscores (`task-07` → `task_07`)

**No other components are permitted.** A tool name with an adjective, a preposition, a conjunction, or any component not in these vocabularies is malformed and must be redesigned.

***

## Verb Vocabulary

The verbs are a **closed set**. New verbs are never added without a framework-level decision and update to this document. If a proposed tool doesn't fit an existing verb, the answer is almost always that the tool is crossing a concern boundary and should be split.

### `read_`
**Semantics:** Fetch the current content of a document. Returns content only.

**Side effects:** None. No audit entry. No state change. No stream event.

**Rules:**
- Must be idempotent — calling it twice produces identical results and identical side effects (none)
- Must never mutate any database row
- Any agent may receive a `read_` tool for any document type relevant to its role
- If a document does not exist, return a typed empty response — never an error that leaks schema details

**Examples:** `read_task_spec`, `read_proof_template`, `read_qa_review_task_07`

***

### `write_`
**Semantics:** Create or fully replace a document. The previous version is preserved in document history; the current pointer updates.

**Side effects:** Writes one `audit_log` entry (document type, task_id, content hash, session, reason, timestamp). Does NOT trigger a state transition. Does NOT emit a stream event.

**Rules:**
- Requires a mandatory `reason` parameter — the tool schema must enforce this with Zod; it cannot be optional
- If the document already exists, creates a new version (never destructive)
- Must validate that the task is in a state that permits writes for this document type — reject with a typed error if not
- Never used for append-only documents (use `append_` instead)
- Never used when a state transition must follow (use `submit_` instead)

**Examples:** `write_task_spec`, `write_feature_spec`, `write_proof_template_task_07`

**Counter-example:** `write_proof` ❌ — proof submission requires a state transition; this must be `submit_proof`

***

### `append_`
**Semantics:** Add content to a document without replacing prior content. The document is treated as an ordered log.

**Side effects:** Writes one `audit_log` entry. Does NOT trigger a state transition. Does NOT emit a stream event.

**Rules:**
- Only applicable to document types explicitly designated as append-only in the Subject Vocabulary
- Must never accept a `replace` or `overwrite` parameter — appending is the only mode
- Entries are timestamped by the server, not the caller — the caller cannot specify a timestamp
- Content hash in `audit_log` covers the appended entry only, not the full document

**Applicable subjects:** `work_log`, `decomposition` (task additions only), `uncertainty` log

**Examples:** `append_work_log`, `append_work_log_task_07`

**Counter-example:** `append_task_spec` ❌ — task specs are replaced, not appended; this is a grammar violation

***

### `submit_`
**Semantics:** Write a document AND trigger a state transition AND emit a stream event. These three operations are atomic — all succeed or none do.

**Side effects:**
1. Writes the document (with version history)
2. Writes `audit_log` entry
3. Transitions the task/feature state (specific transition encoded in the tool implementation)
4. Emits a `stream_events` entry in plain English for Pete
5. Triggers the Policy Engine to evaluate downstream policies

**Rules:**
- Only one state transition is permitted per `submit_` call — if a tool needs to trigger two transitions, it must be split into two tools
- The stream event text is hardcoded in the tool implementation, not supplied by the caller — the caller cannot craft its own stream message
- Must validate that the current state is the exact expected pre-transition state; reject with a typed error if not
- The `reason` parameter is mandatory, as per `write_`
- No `submit_` tool is ever given to an agent that is not the designated actor for that transition

**Examples:** `submit_proof_task_07`, `submit_qa_review_task_07`, `submit_ac`

**Counter-example:** `submit_context_card` ❌ — context cards are not submitted by agents; they are generated by the system. This combination makes no domain sense.

***

### `request_`
**Semantics:** Signal intent or request action from another actor (human or system). Writes no documents. Does not advance state unilaterally.

**Side effects:** Emits a `stream_events` entry. Writes an `audit_log` entry. May transition state to an `AWAITING_*` state — but never to an active working state.

**Rules:**
- Never writes a document
- The requested action must be taken by a different actor — `request_` is never self-fulfilling
- The stream event must identify who the request is directed at (`Pete`, `QA Agent`, `Feature Owner`)
- Used when an agent needs human approval or a cross-role action before it can continue

**Examples:** `request_review`, `request_clarification`, `request_ac_approval`

**Counter-example:** `request_write_task_spec` ❌ — verbs do not nest. If the agent needs to write a task spec, it calls `write_task_spec`. This is a grammar violation.

***

### `search_`
**Semantics:** Query the knowledge base or pattern library. Returns matching entries ranked by relevance.

**Side effects:** None. Read-only operation against the knowledge base tables.

**Rules:**
- Must accept a `query` parameter (free text or structured)
- Must accept an optional `tags` parameter for filtering by relevance category
- Must never return document content from the primary document store — only knowledge base entries
- Results must include `source_session` so the caller knows when the pattern was recorded

**Examples:** `search_knowledge_base`, `search_patterns`

**Counter-example:** `search_task_specs` ❌ — searching primary documents is `read_` with a filter parameter, not a `search_` tool. `search_` is reserved for the knowledge base only.

***

### `get_`
**Semantics:** Fetch metadata, configuration, pre-generated artefacts, or system state. Distinct from `read_` in that it operates on system-level resources, not task documents.

**Side effects:** None. Read-only.

**Rules:**
- Never operates on a task document (that is `read_`)
- Used for: context cards (pre-generated, not task documents), capability declarations, current lifecycle state, tool registry metadata
- Returns structured data, not document content

**Examples:** `get_context_card`, `get_my_capabilities`, `get_current_state`

**Counter-example:** `get_task_spec` ❌ — task specs are documents, not system metadata. This must be `read_task_spec`.

***

### `raise_`
**Semantics:** Surface an exceptional condition immediately to human attention. Bypasses normal flow.

**Side effects:** Writes a priority `stream_events` entry (visually distinct from standard events). Writes `audit_log` entry. May transition state to `BLOCKED` or `AWAITING_HUMAN`.

**Rules:**
- Reserved exclusively for the `uncertainty` subject — `raise_uncertainty` is the only valid `raise_` tool
- Must never be used for normal workflow signalling (use `request_` for that)
- The description parameter is free text — this is intentional, as uncertainties are by definition unstructured
- Any agent may have this tool — it is a safety valve, not a privilege

**Example:** `raise_uncertainty`

**Counter-example:** `raise_error` ❌ — errors are handled by the tool's return value, not by a `raise_` tool. Only human-attention uncertainties use `raise_`.

***

## Subject Vocabulary

The subjects are an **open set** — new document types are added as the framework encounters them. Each entry defines the document type, its write mode, which verbs apply, and which agent roles interact with it.

| Subject | Write mode | Valid verbs | Notes |
|---|---|---|---|
| `task_spec` | Replace | `read`, `write` | Written by Task Owner; read by Task Performer, QA |
| `proof_template` | Replace | `read`, `write` | Written by Task Performer as first action; defines what proof must contain |
| `proof` | Create-once | `read`, `submit` | Written once at submission; immutable after `submit_` |
| `work_log` | Append-only | `read`, `append` | Running log of agent actions during a task |
| `feature_spec` | Replace | `read`, `write` | Written by Feature Owner |
| `ac` | Replace | `read`, `write`, `request` | Acceptance criteria; `request_` used to request PO approval |
| `qa_review` | Create-once | `read`, `submit` | Written once per QA cycle; immutable after `submit_` |
| `context_card` | Replace | `read`, `write`, `get` | Pre-generated by system; `get_context_card` is the agent-facing tool |
| `environment_contract` | Replace | `read`, `write` | Snapshot of environment state at task claim time |
| `uncertainty` | Append-only | `read`, `append`, `raise` | Log of all uncertainties; `raise_uncertainty` is the priority surface tool |
| `decomposition` | Append + Replace | `read`, `write`, `append` | Feature → task decomposition; tasks appended, never removed |
| `ui_brief` | Replace | `read`, `write` | UI artefact brief for UI Design Agent |

**Rules for adding a new subject:**
1. It must represent a distinct document type that no existing subject covers
2. It must have a designated owner role — the agent that has exclusive `write_` authority
3. Its write mode must be declared (Replace, Append-only, or Create-once) before any tool is built
4. Adding a new subject does not automatically create tools — only cells in the matrix that make domain sense become real tools

***

## The Tool Matrix

The intersection of verbs × subjects. A ✓ means the tool exists (or will exist). A blank means the combination is not domain-valid and must never be created.

| | `read_` | `write_` | `append_` | `submit_` | `request_` | `search_` | `get_` | `raise_` |
|---|---|---|---|---|---|---|---|---|
| `task_spec` | ✓ | ✓ | | | | | | |
| `proof_template` | ✓ | ✓ | | | | | | |
| `proof` | ✓ | | | ✓ | | | | |
| `work_log` | ✓ | | ✓ | | | | | |
| `feature_spec` | ✓ | ✓ | | | | | | |
| `ac` | ✓ | ✓ | | | ✓ | | | |
| `qa_review` | ✓ | | | ✓ | | | | |
| `context_card` | ✓ | ✓ | | | | | ✓ | |
| `environment_contract` | ✓ | ✓ | | | | | | |
| `uncertainty` | ✓ | | ✓ | | | | | ✓ |
| `decomposition` | ✓ | ✓ | ✓ | | | | | |
| `ui_brief` | ✓ | ✓ | | | | | | |
| `knowledge_base` | | | | | | ✓ | | |
| `patterns` | | | | | | ✓ | | |
| `capabilities` | | | | | | | ✓ | |
| `current_state` | | | | | | | ✓ | |

***

## Scoping Rules

### Universal tools (no task suffix)
These tools exist once on the server and are available to every agent. They never carry a task suffix because they are not scoped to any single task.

```
get_context_card          search_knowledge_base
get_my_capabilities       raise_uncertainty
get_current_state
```

### Role-scoped tools (no task suffix)
These tools are available to an agent role across all tasks — typically read operations where a Feature Owner needs to read any task spec, not just one specific task. The tool validates permitted access against the calling agent's role from its context card.

```
read_feature_spec         write_feature_spec
read_ac                   write_ac
read_decomposition        write_decomposition
```

### Task-scoped tools (with task suffix)
These tools are dynamically generated per active task. The suffix is the task identifier with hyphens replaced by underscores.

**Formation rule:**
```
task-07  →  task_07   (replace hyphens with underscores)
task-07a →  task_07a  (alphanumeric suffixes preserved)
```

**Examples:**
```
read_task_spec_task_07
write_proof_template_task_07
append_work_log_task_07
submit_proof_task_07
read_environment_contract_task_07
```

**Why underscores, not hyphens:** MCP tool names must be valid identifiers in the tool call JSON schema. Hyphens are valid in JSON keys but create parsing ambiguity when extracting `task_id` from the tool name by splitting on `_`. Underscores produce unambiguous splits: the last component after the final `_verb_subject_` segment is always the task slug.

***

## The Agent Spec Declaration Standard

Every agent spec declares tools in three groups, which directly maps to the three scoping levels above:

```yaml
---
name: Task Performer (task-07)
description: Task Performer scoped exclusively to task-07
model: claude-sonnet-4-5
tools:
  # Group 1 — Universal (always present, never varies)
  - get_context_card
  - get_my_capabilities
  - get_current_state
  - raise_uncertainty
  - search_knowledge_base

  # Group 2 — Role-scoped reads (this role, any task)
  # (none for Task Performer — it only reads its own task)

  # Group 3 — Task-scoped (this instance only)
  - read_task_spec_task_07
  - read_environment_contract_task_07
  - write_proof_template_task_07
  - append_work_log_task_07
  - submit_proof_task_07
---
```

The three-group structure is mandatory even if Group 2 is empty. It signals the reader exactly what scope each tool operates at.

***

## Rules for Designing New Tools

Apply these in order. If any rule produces a rejection, stop and redesign.

**Rule 1 — Does it fit one verb?**
Map the proposed operation to exactly one verb from the Verb Vocabulary. If it maps to two verbs, it is two tools. If it maps to zero verbs, the Verb Vocabulary may be missing an entry — escalate to a framework-level decision before proceeding.

**Rule 2 — Does it operate on one subject?**
A tool that reads a `task_spec` and writes a `proof_template` in one call violates the grammar. Each tool operates on exactly one subject. Split it.

**Rule 3 — Does the combination appear in the Tool Matrix?**
Check the matrix. If the cell is blank, the combination is not domain-valid. Before filling it in, confirm with the domain model that this operation is required. Don't fill matrix cells to satisfy an edge case.

**Rule 4 — What is the task scope?**
Determine whether the tool is universal, role-scoped, or task-scoped. Universal tools are rare — only tools that genuinely serve every role without task context. When in doubt, task-scope it.

**Rule 5 — What are the side effects?**
List every side effect: audit log, state transition, stream event, downstream policy trigger. If there are zero side effects, the verb is `read_`, `search_`, or `get_`. If there are side effects but no state transition, the verb is `write_` or `append_`. If there is a state transition, the verb is `submit_`. If the only side effect is a stream event with no document write, the verb is `request_` or `raise_`.

**Rule 6 — Are mandatory side effects inside the tool?**
If a state transition, stream event, or audit entry must follow this operation, it must be implemented *inside* the tool, not *instructed to the agent*. If an agent spec currently says "after calling X, emit a stream event", this is a design error — the stream event belongs inside X.

***

## Well-Formed and Malformed Examples

```
✅  read_task_spec_task_07          verb=read, subject=task_spec, scope=task_07
✅  submit_proof_task_07            verb=submit, subject=proof, scope=task_07
✅  append_work_log_task_07         verb=append, subject=work_log, scope=task_07
✅  get_context_card                verb=get, subject=context_card, scope=universal
✅  raise_uncertainty               verb=raise, subject=uncertainty, scope=universal
✅  search_knowledge_base           verb=search, subject=knowledge_base, scope=universal
✅  request_ac_approval             verb=request, subject=ac, scope=role

❌  finalize_feature                malformed — 'finalize' is not in the Verb Vocabulary
❌  write_and_submit_proof_task_07  malformed — two verbs, must be split
❌  get_task_spec_task_07           malformed — task_spec is a document, not metadata; must be read_
❌  submit_context_card             malformed — context cards are not submitted by agents
❌  append_task_spec_task_07        malformed — task_spec is Replace mode, not Append-only
❌  write_proof_task_07             malformed — proof is Create-once; submission requires state transition; must be submit_
❌  read_everything                 malformed — no subject, violates one-subject rule
❌  task_07_write_proof             malformed — components in wrong order; verb must come first
```

***

## Versioning This Document

When the framework evolves, the grammar changes in one of three ways:

- **Adding a subject** (most common): add a row to the Subject Vocabulary table, add a row to the Tool Matrix, update the agent spec declarations for affected roles. No verb changes needed.
- **Adding a tool to an existing subject** (occasional): fill a blank cell in the Tool Matrix, implement the tool. Confirm Rule 5 and Rule 6 before building.
- **Adding a verb** (rare, framework-level decision only): requires updating this document, the Tool Matrix, all agent spec templates, and all `tools/list` logic in the Nexus server. This signals a genuinely new class of operation not covered by existing semantics — not a shortcut for a tool that didn't fit an existing verb cleanly. 