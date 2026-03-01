# Skill Structure Rules

> Authoritative rules for how skills must be written and organised.
> Source: agent-design.instructions.md — Skills section.

---

## Partitioning — when to create a new skill

CREATE a new skill when:
- Two or more agents share the same domain knowledge
- A rubric, template, or checklist is too large to embed in an agent file
- Content is stable enough to be cached and reused across tasks

DO NOT CREATE a skill when:
- The content is task-specific (belongs in a context-package)
- The content is already covered by an existing skill (extend via a new reference file)
- The agent is the only consumer and the content fits within its 60-line budget

BEFORE creating: check SKILLS-INVENTORY.md — if a close match exists, extend it.

---

## SKILL.md — the thin wrapper

SKILL.md is a dispatch file only. It must not contain substantive content.

Required sections (in this order):
  1. File header — `# Skill: [Name]`
  2. `TRIGGERS:` — comma-separated phrases that activate the skill
  3. `ZONE:` — which zones use this skill (or "cross-zone" if meta)
  4. `USED BY:` — agent names or roles
  5. `CONTEXT-TREE NODE:` — node name, or "meta (no context-tree entry required)"
  6. `## What this skill does` — two to four sentences, no bullet lists
  7. `## Load on activation` — list of references/ file paths to load
  8. `## What [skill] covers — and what it does not` — explicit scope boundary
  9. `## Do not load` — other skills or files this skill must never pull in

Target: under 30 lines. No rubrics, templates, or checklists in SKILL.md.

---

## references/ folder — substantive content

Each file in references/ must be:
  - Independently loadable — agents load only what they need
  - Named for its content — `checklist.md`, `template.md`, `rules.md`, `format.md`
  - Stable — if content changes per task, it is not a reference file

Typical reference file types:
  - `[domain]-checklist.md` — binary PASS/FAIL checks used by reviewer agents
  - `[artefact]-template.md` — copy-paste format for a produced artefact
  - `[domain]-rules.md` — declarative rules governing a domain
  - `[format]-format.md` — output format specification

Do not put:
  - Task-specific data in reference files
  - Multiple unrelated topics in a single reference file
  - Instructions for how to use the skill in reference files (that lives in SKILL.md)

---

## Trigger phrases

TRIGGERS activate the full SKILL.md load from the SKILLS-INVENTORY.md description.
WRITE triggers as: common natural-language phrases an agent or user might emit.
MINIMUM: two triggers per skill.
AVOID: triggers so broad they activate the skill unintentionally.

Good: `"create a skill", "write a skill", "new skill", "scaffold skill"`
Bad: `"create"` (too broad), `"write skill-writing/SKILL.md"` (too specific)

---

## Naming conventions

Skill directory:   lowercase hyphenated  (`skill-writing`, `qa-review`)
SKILL.md:          always `SKILL.md` — no variation
Reference files:   lowercase hyphenated  (`skill-structure-rules.md`)
Skill name (inventory): same as directory name, wrapped in backticks

---

## SKILLS-INVENTORY.md registration

Every new skill requires TWO additions to SKILLS-INVENTORY.md:

1. A row in the Skill Registry table:
   | `skill-name` | Zone scope | Agent(s) that use it | Cache value |

2. A description block in the Descriptions section:
   ```
   skill-name
     Two to three sentences. What the skill covers. What it is used to produce.
     Enough detail for an agent to decide whether to trigger it at startup.
   ```

Cache value guidance:
  HIGH   — loaded by multiple agents, or on the critical path for every task
  MEDIUM — loaded occasionally or by a single non-critical agent
  LOW    — rarely loaded, narrow scope

DO NOT register a skill until SKILL.md and at least one references/ file exist.
