# Nexus Subject Vocabulary & Tool Matrix

> Open set — new subjects are added as the framework encounters new document types.
> Source: NexusToolGrammar.md
> Adding a new subject requires: declared write mode, designated owner role, and a matrix row.
> Adding a subject does NOT automatically create tools — only valid matrix cells become real tools.

---

## Subject Vocabulary

| Subject | Write mode | Valid verbs | Owner role | Notes |
|---|---|---|---|---|
| `task_spec` | Replace | `read`, `write` | Task Owner (Zone 3) | Read by Task Performer, QA |
| `proof_template` | Replace | `read`, `write` | Task Performer | First action before any implementation |
| `proof` | Create-once | `read`, `submit` | Task Performer | Immutable after `submit_`; requires state transition |
| `work_log` | Append-only | `read`, `append` | Task Performer | Running log of agent actions |
| `feature_spec` | Replace | `read`, `write` | Feature Owner (Zone 2) | |
| `ac` | Replace | `read`, `write`, `request` | AC Writer (Zone 2/3) | `request_` used for PO approval |
| `qa_review` | Create-once | `read`, `submit` | QA Reviewer | Immutable after `submit_` |
| `context_card` | Replace | `read`, `write`, `get` | System (Context Agent) | `get_context_card` is the agent-facing tool |
| `environment_contract` | Replace | `read`, `write` | Task Owner | Snapshot of environment state at claim time |
| `uncertainty` | Append-only | `read`, `append`, `raise` | Any agent | `raise_uncertainty` is the priority surface tool |
| `decomposition` | Append + Replace | `read`, `write`, `append` | Feature Owner | Tasks appended; decomposition record replaced |
| `ui_brief` | Replace | `read`, `write` | UI Design Agent | |
| `knowledge_base` | (system-managed) | `search` | System | Knowledge base entries only — not task documents |
| `patterns` | (system-managed) | `search` | System | Pattern library |
| `capabilities` | (system-managed) | `get` | System | Agent capability declarations |
| `current_state` | (system-managed) | `get` | System | Current lifecycle state of a task or feature |

---

## Write Mode Definitions

**Replace** — Each write creates a new version. Current pointer updates. Prior versions preserved in history. Both `write_` verb tools and task-scoped variants applicable.

**Append-only** — Content is added chronologically. No replacement. Server sets the timestamp — caller cannot specify one. Only `append_` and `raise_` verbs apply.

**Create-once** — Document exists only once per task lifecycle at this type. Written via `submit_` (compound). Immutable immediately after submission. A second `submit_` call against the same task_id and doc_type is rejected.

---

## Tool Matrix

✓ = tool exists (or will exist). Blank = combination is not domain-valid and must never be created.

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

**Before filling a blank cell:** confirm with the domain model that the operation is genuinely required. Do not fill cells to satisfy an edge case.

---

## Scoping Levels

### Universal tools (no task suffix)
Available to every agent. Never carry a task suffix — they are not scoped to any single task.
```
get_context_card          search_knowledge_base
get_my_capabilities       raise_uncertainty
get_current_state         search_patterns
```

### Role-scoped tools (no task suffix)
Available to an agent role across all tasks — typically read operations where a role needs to access any task. Tool validates permitted access from the calling agent's context card.
```
read_feature_spec         write_feature_spec
read_ac                   write_ac
read_decomposition        write_decomposition
```

### Task-scoped tools (with task suffix)
Dynamically generated per active task. Suffix = task identifier with hyphens → underscores.

**Slug formation rule:**
```
task-07   →  task_07     (hyphens → underscores)
task-07a  →  task_07a    (alphanumeric suffix preserved)
```

**Why underscores not hyphens:** Splitting on `_` unambiguously extracts the task slug from the tool name. Hyphens in JSON keys create extraction ambiguity.

**Examples of task-scoped tools:**
```
read_task_spec_task_07
write_proof_template_task_07
append_work_log_task_07
submit_proof_task_07
read_environment_contract_task_07
```

---

## Agent Spec Tool Declaration Standard

Declare tools in three groups (mandatory, even if Group 2 is empty):

```yaml
tools:
  # Group 1 — Universal (always present, never varies)
  - get_context_card
  - get_my_capabilities
  - raise_uncertainty
  - search_knowledge_base

  # Group 2 — Role-scoped reads (this role, any task)
  # (none for Task Performer — it reads only its own task)

  # Group 3 — Task-scoped (this instance only)
  - read_task_spec_task_07
  - read_environment_contract_task_07
  - write_proof_template_task_07
  - append_work_log_task_07
  - submit_proof_task_07
```

---

## Well-Formed vs. Malformed Examples

```
✅  read_task_spec_task_07          verb=read, subject=task_spec, scope=task_07
✅  submit_proof_task_07            verb=submit, subject=proof, scope=task_07
✅  append_work_log_task_07         verb=append, subject=work_log, scope=task_07
✅  get_context_card                verb=get, subject=context_card, scope=universal
✅  raise_uncertainty               verb=raise, subject=uncertainty, scope=universal
✅  search_knowledge_base           verb=search, subject=knowledge_base, scope=universal
✅  request_ac_approval             verb=request, subject=ac, scope=role

❌  finalize_feature                'finalize' is not in the Verb Vocabulary
❌  write_and_submit_proof_task_07  two verbs — split into two tools
❌  get_task_spec_task_07           task_spec is a document, not metadata — use read_
❌  submit_context_card             context cards are system-generated, not submitted by agents
❌  append_task_spec_task_07        task_spec is Replace mode — use write_
❌  write_proof_task_07             proof requires state transition — use submit_
❌  task_07_write_proof             wrong component order — verb must come first
```
