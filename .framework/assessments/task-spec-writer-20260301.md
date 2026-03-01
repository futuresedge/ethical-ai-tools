ASSESSED:  .github/agents/task-spec-writer.agent.md
DATE:      2026-03-01
VERDICT:   PARTIALLY ALIGNED

---

OBSERVATIONS:
- Partitioning is correct: one task entry, one artefact, one output path ✓
- NEVER list is specific and covers the right upstream artefacts ✓
- FAILURE MODES are well-formed: all conditions are specific and actionable ✓
- SKILL pointer declared (task-definition) ✓
- The "DEPENDS ON NONE = always safe" exception is explicit — prevents incorrect blocking ✓
- Handoff to Artefact Reviewer is correctly wired ✓
- OPERATION steps are terse and imperative — no narrative prose ✓
- Token budget declared (8k) ✓

---

ISSUES:

ISSUE 1 — File is 65 lines — marginally over the 60-line target (Minor)
RULE: "TARGET: under 60 lines per agent file"
The OPERATION section (8 steps) and FAILURE MODES section push the file 5 lines over.
The OPERATION section in particular is substantive content that belongs in the task-definition
skill as a "procedure" reference, not in the agent body.
ZONE AFFECTED: low — 5 lines over is minor, but the pattern matters for discipline

ISSUE 2 — READS contains AGENTS.md but context-tree.md entry for [TASK SPEC WRITER]
needs verification (Moderate)
RULE: "READS must be sourced from: context-tree.md. NEVER add a READ without updating
context-tree.md first."
The context-tree.md [TASK SPEC WRITER] node lists AGENTS.md as a READ. This was updated.
However the node should be verified to confirm all three READS are registered there —
including `acceptance-criteria.md` scoped notation "FAC IDs in SATISFIES only."
This scoping is declared in the agent body but not reflected in the context-tree node.
Context-tree should carry the scoping note to keep it as the authoritative READS reference.

ISSUE 3 — NEVER entries are file names, not paths (Minor)
RULE: "NEVER: files explicitly forbidden" — convention is path-based
Entries like `feature-spec.md`, `idea.md`, `sibling task-spec.md` are file names without
path context. `sibling task-spec.md` is not even a real filename — it is a conceptual
exclusion. The intent is clear but it does not match the path-based pattern used by
well-formed agents (e.g. `.framework/features/[slug]/feature-spec.md`).

ISSUE 4 — tools list includes edit/createDirectory (Minor)
RULE: tool set must be minimum necessary
The agent declares it will create the task directory if absent (OPERATION step 7).
This is scope creep relative to the stated WRITES (task-spec.md only). If directory
creation is needed, it is setup work, not the agent's primary output. More importantly,
`edit/createDirectory` is a write tool that extends the agent's reach beyond its declared
WRITES path. Should be removed; directory creation should either be the human's
responsibility or a pre-condition check with a STOP if absent.

---

RECOMMENDATIONS:
- ISSUE 1: Delegate to Agent Creator to move OPERATION steps into task-definition skill
  as a `procedure.md` reference file. Body drops to ~55 lines.
- ISSUE 2: Update context-tree.md [TASK SPEC WRITER] node to include scoping notes
  for acceptance-criteria.md and decomposition.md reads. This is a context-tree edit —
  not a .github/agents/ edit.
- ISSUE 3: Replace conceptual NEVER entries with path-based exclusions:
    .framework/features/[slug]/feature-spec.md
    .framework/ideas/[slug]/idea.md
    .framework/features/[slug]/tasks/[other-slug]/task-spec.md  (sibling tasks)
- ISSUE 4: Remove edit/createDirectory from tools. Add FAILURE MODE:
    IF task directory does not exist — STOP. Ask human to create it, or create via
    pre-condition check before invoking this agent.

---

OPEN QUESTION:
NONE

---

FRAMEWORK NOTES:
- This agent was produced outside normal Agent Creator process (created directly by
  Framework Owner in violation of boundaries). The spec is functional and mostly correct,
  which suggests the task-definition skill and context-tree READS contracts are well enough
  specified that someone other than the Agent Creator can produce a workable spec.
  This is a positive signal about skill quality — but does not excuse the process violation.
- The directory-creation concern (Issue 4) reveals a gap: the pipeline has no explicit
  pre-condition stage for ensuring the task directory structure exists before Zone 3 agents
  run. This is a structural gap worth adding to open-questions.md — it will recur for every
  new feature that reaches Zone 3.
