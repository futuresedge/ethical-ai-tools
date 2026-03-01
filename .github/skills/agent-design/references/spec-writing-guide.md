# Agent Spec Writing Guide

> Procedure and pre-write validation for the Agent Creator.
> Source of truth: agent-design.instructions.md
> Apply in sequence for every new agent spec. Do not skip steps.

---

## REQUIRED INPUTS

Confirm all five are present before writing. ASK for any that are missing — one question at a time, surface the single most important ambiguity first.

| Input | What it must be |
|---|---|
| JOB | One sentence — what does this agent produce and for whom? |
| ZONE | Which zone does it operate in? (0–5, N, or cross-zone) |
| READS | Which named files does it need to act? (named paths, not categories) |
| WRITES | What is the exact output path? (one artefact, one path) |
| SKILL | Which skill from SKILLS-INVENTORY.md does it load? |

---

## OPERATION (7 steps — run in order)

1. **Confirm all five inputs present.** ASK for any that are missing.
2. **Derive the agent name from JOB** — lowercase hyphenated noun, not a verb phrase.
   - "Writes task specs for Zone 3" → `task-spec-writer`
   - NOT: `write-task-spec`, `task-spec-writing-agent`
3. **Check the context-tree.md node for this zone** — the node defines READS, WRITES, NEVER, BUDGET, and SKILL for compliant specs in that zone. Use it; do not invent.
4. **Determine handoffs from ZONE** — who receives this agent's output? The gate model means the next agent does not run without a passing handoff verdict from this agent's output.
5. **Write the spec body in imperative shorthand.** No prose. READS/WRITES/NEVER first. FAILURE MODES second. SKILL pointer last.
6. **Run the PRE-WRITE CHECKLIST below** before touching any file. Fix every failed check first.
7. **Write to `.github/agents/[agent-name].agent.md`.** Hand off to Agent Spec Reviewer. Never self-approve.

---

## PRE-WRITE CHECKLIST

Run every check. Fix failures before writing the file.

### YAML Frontmatter
- [ ] `description` is a single plain line — no block scalar (`|` or `>`)
- [ ] `tools` is an inline array — `['tool-a', 'tool-b']`
- [ ] `model` is an inline array
- [ ] Each `handoff.prompt` is a single line
- [ ] All four handoff keys present: `label`, `agent`, `prompt`, `send`

### Body
- [ ] READS declares named files only — no categories, no globs, no directory references
- [ ] Every file in READS exists NOW — not speculative ("will be created later" is a STOP condition)
- [ ] Every file in READS has a node in context-tree.md, OR raise it as an open question first
- [ ] WRITES declares exactly one artefact and one path
- [ ] NEVER lists at least two explicit file or artefact exclusions
- [ ] FAILURE MODES covers: missing required input, filesearch returning zero results
- [ ] TOKEN BUDGET declared (use the budget from the context-tree.md node)
- [ ] SKILL pointer matches a name in SKILLS-INVENTORY.md exactly — not invented

### Format
- [ ] Instructions are imperative shorthand — no prose, no "you should", no rationale
- [ ] Critical rules appear before the SKILL pointer
- [ ] NEVER section is at the bottom
- [ ] Body is under 60 lines (count non-empty lines, excluding frontmatter)

---

## Agent Name Derivation Rules

| Pattern | Correct name | Incorrect |
|---|---|---|
| "writes X" | `x-writer` | `write-x`, `x-writing-agent` |
| "reviews X" | `x-reviewer` | `review-x`, `x-review-agent` |
| "defines X" | `x-definer` | `define-x` |
| "decomposes X into Y" | `x-decomposer` | `decompose-x-to-y` |
| "curates context for X" | `context-curator` | `curate-context` |
| "orchestrates zone N" | `[zone-name]-orchestrator` | `orchestrate-zone-n` |

**Rule:** the name is a noun that describes the operation's output, not a verb that describes the action.

---

## Zone-Specific Notes

### Zone N (Nexus build agents)
- Build agents write code and config — WRITES paths point to `nexus/`, not `.framework/`
- Read the Zone N node in context-tree.md before writing any Nexus build agent spec
- Nexus Operational Agents (Task Performer, QA Reviewer, Context Agent) are NOT written by the Agent Creator — they are either dynamically generated or hand-written when their phase begins. See Zone N in context-tree.md.

### Zone 0 (meta agents)
- WRITES go to `.framework/assessments/` or `.github/agents/` — not to `.framework/features/`
- Budget is typically higher (~10–15k) because Zone 0 reads multiple meta files

### Zones 2–3 (pipeline agents)
- All READS must have a corresponding node in context-tree.md
- NEVER must exclude all upstream artefacts not needed at this stage
- Budget is typically 5–10k
