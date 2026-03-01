# Nexus Tool Design Rules

> Apply in order before implementing any new tool.
> Source: NexusToolGrammar.md — Rules for Designing New Tools section.
> If any rule produces a rejection: stop and redesign. Do not proceed with a rule violation.

---

## The 6 Rules

Apply these in sequence for every proposed new tool:

### Rule 1 — Does it fit one verb?
Map the proposed operation to exactly one verb from the Verb Vocabulary.
- If it maps to **two verbs**: it is two tools. Split it.
- If it maps to **zero verbs**: the Verb Vocabulary may be missing an entry — escalate to a framework-level decision before proceeding. Do not invent a new verb unilaterally.

### Rule 2 — Does it operate on one subject?
A tool that reads a `task_spec` and writes a `proof_template` in one call violates the grammar.
- Each tool operates on **exactly one subject**. Split it.

### Rule 3 — Does the combination appear in the Tool Matrix?
Check the matrix (subject-vocabulary.md). If the cell is **blank**, the combination is not domain-valid.
- Before filling a blank cell, confirm with the domain model that this operation is genuinely required.
- Do not fill matrix cells to satisfy an edge case.

### Rule 4 — What is the task scope?
Determine whether the tool is **universal**, **role-scoped**, or **task-scoped**.
- Universal tools are rare — only tools that genuinely serve every role without task context.
- When in doubt: task-scope it.

### Rule 5 — What are the side effects?
List every side effect: audit log entry, state transition, stream event, Policy Engine trigger.

| Side effect profile | Correct verb |
|---|---|
| No side effects | `read_`, `search_`, or `get_` |
| Audit log only, no state transition | `write_` or `append_` |
| Audit log + state transition | `submit_` |
| Stream event only, no document write | `request_` or `raise_` |

### Rule 6 — Are mandatory side effects inside the tool?
If a state transition, stream event, or audit entry must follow this operation, it must be implemented **inside the tool**, not instructed to the agent.
- If an agent spec currently says "after calling X, emit a stream event" — this is a design error.
- The stream event belongs inside X's implementation.

---

## Adding a New Subject (when a new document type is needed)

Before building any tool for a new subject, complete these four steps:

1. **Confirm distinctness:** It must represent a document type no existing subject covers. Cannot be a rename.
2. **Declare the write mode:** Replace, Append-only, or Create-once — chosen before any tool is built.
3. **Designate the owner role:** The agent that has exclusive `write_` (or `submit_`) authority. No shared ownership.
4. **Add a row to the matrix:** Only after steps 1–3. Add only cells that make domain sense.

---

## Grammar Changes — How the Catalogue Evolves

| Change type | Frequency | What it requires |
|---|---|---|
| Adding a subject | Most common | New row in Subject Vocabulary + matrix row + agent spec updates for affected roles |
| Adding a tool to an existing subject | Occasional | Fill one matrix cell; implement tool; confirm Rules 5 and 6 |
| Adding a verb | Rare — framework-level decision only | Update verb vocabulary, full Tool Matrix, all agent spec templates, all `tools/list` logic in server |

**A new verb signals a genuinely new class of operation** — not a shortcut for a tool that didn't fit an existing verb cleanly. Raise uncertainty via `raise_uncertainty` before proposing a new verb.
