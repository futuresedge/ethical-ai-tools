# Agent Design Checklist

> Rubric for assessing an agent spec file against agent-design.instructions.md.
> Each item is a binary PASS / FAIL. No partial credit.
> Source of truth: `.github/instructions/agent-design.instructions.md`

---

## Section A — YAML Frontmatter

| # | Check | Pass condition |
|---|---|---|
| A1 | `name` present | Field exists and is a non-empty string |
| A2 | `description` is a single plain line | No block scalar (`\|` or `>`), no newlines embedded |
| A3 | `tools` is an inline array | Formatted as `['tool-a', 'tool-b']`, not a block list |
| A4 | `model` is an inline array | Formatted as `['Model Name']`, not a block list |
| A5 | Each `handoff.prompt` is a single line | No multi-line values in any handoff block |
| A6 | `handoffs` entries include `label`, `agent`, `prompt`, `send` | All four keys present per entry |

---

## Section B — Body Structure

| # | Check | Pass condition |
|---|---|---|
| B1 | READS declares named files only | No categories, globs, or directory references — only explicit file paths |
| B2 | WRITES declares exactly one artefact | One output file, one path — not a range or conditional |
| B3 | NEVER lists at least two explicit exclusions | Must name files or artefacts — "nothing" or vague phrases fail |
| B4 | FAILURE MODES covers missing input | At least one mode addresses absent or unavailable required input |
| B5 | FAILURE MODES covers zero-result search | At least one mode addresses a search or file lookup returning nothing |
| B6 | TOKEN BUDGET declared | A numeric budget appears in the body |
| B7 | SKILL pointer present | A SKILL: line appears pointing to a named skill |
| B8 | SKILL pointer matches SKILLS-INVENTORY.md | The skill name must exist in the inventory — not invented |

---

## Section C — Instruction Format

| # | Check | Pass condition |
|---|---|---|
| C1 | Instructions written as imperative shorthand | No prose, job descriptions, or narrative rationale |
| C2 | Critical rules appear before the SKILL pointer | Gate rules, verdict format, key constraints — not buried after |
| C3 | NEVER section appears at the bottom of the body | Boundaries are the last section before FAILURE MODES |
| C4 | No "you should" / "you must" prose phrasing | Imperative shorthand only — `READ:`, `STOP.`, `NEVER` etc. |

---

## Section D — File-Level Constraints

| # | Check | Pass condition |
|---|---|---|
| D1 | Body is under 60 lines | Count non-empty lines in the body (excluding frontmatter) |
| D2 | Agent name is operation-based, not role-based | Noun naming after the operation — not a job title |
| D3 | Single context window implied | Not multiple disjoint context needs in one agent |
| D4 | READS listed in context-tree.md OR new entry raised | Every READ has a declared source — no speculative files |

---

## Verdict Criteria

ACCEPTED
  All checks in A, B, C, D pass.

ACCEPTED WITH NOTES
  All blocking checks pass. One or more non-blocking checks fail or
  have improvement suggestions. Blocking checks: A1–A5, B1–B8, C1.

RETURNED
  One or more blocking checks fail. Pipeline is paused.
  List each failed check with a specific remediation note.
