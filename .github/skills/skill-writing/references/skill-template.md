# Skill Template

> Copy these templates exactly. Adapt only the bracketed placeholders.
> Do not add sections not shown here — place extra content in references/ files.

---

## SKILL.md template

```skill
# Skill: [Name]
TRIGGERS: "[phrase one]", "[phrase two]", "[phrase three]"
ZONE: [Zone N | cross-zone (meta)]
USED BY: [Agent Name], [Agent Name]
CONTEXT-TREE NODE: [[NODE NAME] | meta (no context-tree entry required)]

## What this skill does
[Two to four sentences. What domain this covers. What artefact or decision it supports.
No bullet lists here.]

## Load on activation
- references/[file-one].md
- references/[file-two].md

## What [skill name] covers — and what it does not
COVERS: [specific domain area]
COVERS: [specific domain area]
DOES NOT COVER: [explicit exclusion]
DOES NOT COVER: [explicit exclusion]

## Do not load
- [other-skill] — [one-line reason]
```

---

## Checklist reference file template

```markdown
# [Domain] Checklist

> Rubric for [purpose].
> Each item is a binary PASS / FAIL. No partial credit.
> Source of truth: [governing document path]

---

## Section A — [First concern]

| # | Check | Pass condition |
|---|---|---|
| A1 | [Check name] | [Exact condition that constitutes a pass] |
| A2 | [Check name] | [Exact condition that constitutes a pass] |

## Section B — [Second concern]

| # | Check | Pass condition |
|---|---|---|
| B1 | [Check name] | [Exact condition that constitutes a pass] |

---

## Verdict Criteria

ACCEPTED
  All checks pass.

ACCEPTED WITH NOTES
  All blocking checks pass. Non-blocking checks have improvement suggestions.

RETURNED
  One or more blocking checks fail. List each with a specific remediation note.
```

---

## Artefact template file template

```markdown
# [Artefact Name] Template

> Produced by: [Agent name]
> Consumed by: [Agent name(s)]
> Stored at: [.framework/path/to/artefact.md]

---

## Template

[Copy-paste ready content with bracketed placeholders.
Include all required sections.
Add comments (using >) to guide the author where decisions are needed.]
```

---

## SKILLS-INVENTORY.md additions (copy both blocks)

Table row — add to Skill Registry:
```
| `[skill-name]` | [Zone scope] | [Used by agents] | [HIGH|MEDIUM|LOW] |
```

Description block — add to Skill Descriptions section:
```
[skill-name]
  [Sentence one: what domain this covers.]
  [Sentence two: what it is used to produce or decide.]
  [Optional sentence three: key reference files or scope boundary.]
```
