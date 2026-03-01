ASSESSED:  .github/agents/feature-spec-reviewer.agent.md
           .github/agents/ac-reviewer.agent.md
           .github/agents/decomposition-reviewer.agent.md
           .github/agents/task-spec-reviewer.agent.md
           .github/agents/task-spec-writer.agent.md
DATE:      2026-03-01
NOTE:      Four reviewer agents share an identical structural pattern — assessed together
           to avoid repeating the same finding four times.

---

## Task Spec Writer

VERDICT: ACCEPTED

CHECKS PASSED:
- One READS set, one WRITES path, one SKILL pointer ✓
- READS all path-based with scoping annotations ✓
- NEVER entries corrected to full paths (issue 3 from previous assessment) ✓
- edit/createDirectory removed from tools ✓
- FAILURE MODE added for absent task directory ✓
- OPERATION section removed from body; moved to task-definition/references/procedure.md ✓
- Body: 53 lines — within 60-line target ✓
- Handoff target updated to Task Spec Reviewer (not Artefact Reviewer) ✓
- BOUNDARIES: gate delegation, verbatim copy rule, scope freeze, Status guard, interface rule ✓
- Token budget declared (8k) ✓

CHECKS FAILED: NONE

---

## Four Single-Mode Reviewer Agents (Feature Spec, AC, Decomposition, Task Spec)

VERDICT: ACCEPTED WITH NOTES (shared across all four)

CHECKS PASSED (all four):
- One READS set per agent, one WRITES path per agent ✓
- One SKILL pointer (artefact-review) per agent ✓
- SKILL pointer registered in SKILLS-INVENTORY.md ✓
- No multi-mode bundling — each agent handles exactly one artefact type ✓
- Tools stripped to minimum: read/readFile, search/fileSearch, search/textSearch, edit/createFile ✓
- File size: 47–52 lines each — all within 60-line target ✓
- Token budget declared on each ✓
- FAILURE MODES cover: missing artefact, missing rubric, zero filesearch results ✓
- Gate rule present in BOUNDARIES on each ✓
- Handoff wiring: both accept and return handoffs present on each ✓
- Handoff prompts are single lines ✓
- YAML: description single plain line, tools and model inline arrays ✓

SHARED NOTE 1 — "Modify the artefact under review" is prose in NEVER, not a path
RULE: "NEVER: files explicitly forbidden — written as paths, not categories"
A prose instruction in the NEVER block breaks the convention and may cause the model
to treat it as a file path pattern. The intent is correct; the location is wrong.
CORRECT LOCATION: BOUNDARIES section ("NEVER modify the artefact under review — read only")
AFFECTS: all four agents

SHARED NOTE 2 — ".framework/features/[slug]/tasks/" is a directory path in NEVER
RULE: same as above
A path ending in "/" is a directory, not a file. The prohibition is meaningful for
feature-spec-reviewer, ac-reviewer, and decomposition-reviewer (which run before
task files exist) but is stated as a NEVER file entry rather than a BOUNDARIES rule.
CORRECT LOCATION: BOUNDARIES section
AFFECTS: feature-spec-reviewer, ac-reviewer, decomposition-reviewer
NOTE: task-spec-reviewer correctly used specific file paths in NEVER — no issue there.

OPEN QUESTION: NONE

FRAMEWORK NOTES:
- The four-agent split reduces each agent to under 52 lines with clean context partition.
  This is the artefact-review skill paying off — it absorbed VERDICT FORMAT and GATE RULES
  that would otherwise have inflated each body to ~80 lines.
- The direct-READS pattern for rubric files (vs loading via skill) is correct for always-on
  content. The SKILL pointer handles procedure/format; READS handles the rubric. This is
  a valid and efficient split.
