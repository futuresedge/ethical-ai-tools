ASSESSED:  .github/agents/artefact-reviewer.agent.md
DATE:      2026-03-01
VERDICT:   PARTIALLY ALIGNED

---

OBSERVATIONS:
- Gate model is well-conceived: GATE RULES are explicit, RETURNED verdict blocks the pipeline cleanly
- All READS are named files (not directory paths) ✓
- Failure modes cover the key cases: missing artefact, missing rubric ✓
- Handoff prompts are single lines ✓
- NEVER list covers the most important write-protection: "Modify the artefact under review — read only"
- task-spec mode READS correctly adds decomposition.md scoped to "own task entry only" ✓

---

ISSUES:

ISSUE 1 — Multiple context windows in one agent (Critical)
RULE: "NEVER: assign multiple distinct context windows to one agent"
The reviewer handles four modes (feature-spec, ac, decomposition, task-spec), each with a
distinct READS set and a distinct WRITES target. This is four different context windows
in one agent file — exactly what the partitioning rule prohibits. The agent works at
small scale because the human operator selects the mode. At agent-to-agent scale,
mode ambiguity is a failure risk (the file already has a failure mode for it).
CORRECT APPROACH: four single-mode agents — Feature Spec Reviewer, AC Reviewer,
  Decomposition Reviewer, Task Spec Reviewer — each with one READS set, one WRITES target.
ZONE AFFECTED: Zone 2–3 pipeline integrity

ISSUE 2 — Four WRITES paths violate the one-artefact rule (Critical)
RULE: "WRITES: one artefact, one path"
The agent declares four separate WRITES entries (one per mode). The rule is singular.
An agent cannot write to four different locations depending on runtime mode — this is
four agents bundled into one identifier.
ZONE AFFECTED: same as Issue 1 — this and Issue 1 share the same root cause (multi-mode bundling)

ISSUE 3 — File size significantly exceeds target (Moderate)
RULE: "TARGET: under 60 lines per agent file. EVERYTHING ELSE: belongs in a skill file."
The file is 125 lines. The GATE RULES, VERDICT FORMAT, and substantive failure mode
descriptions are all body content that belongs in a skill reference file.
No SKILL pointer is declared — this is the mechanism for extracting body content.
ZONE AFFECTED: context window efficiency — larger agent body = less cache reuse

ISSUE 4 — No SKILL pointer declared (Moderate)
RULE: "SKILLS: carry the substantive content agent files must not"
The VERDICT FORMAT template, GATE RULES, and checklist application logic are all
substantive, reusable, stable content. They should live in a skill reference file.
The agent has no SKILL declaration at all.

ISSUE 5 — tools list includes write and execution tools beyond what WRITES requires (Moderate)
RULE: tool set must match the minimum needed to execute the declared WRITES
`edit/editFiles` enables modifying any existing file — inconsistent with NEVER "Modify the
artefact under review." `agent`, `search/changes`, `search/codebase`, `search/usages` are
not needed to read named review files and write a named output file. Same class of risk
that caused the Framework Owner boundary violation.
MINIMUM REQUIRED: read/readFile, search/fileSearch, search/textSearch, edit/createFile

ISSUE 6 — NEVER entry references "three modes" after four modes were added (Minor)
"Load all three modes at once — only load the READS for the active mode" — stale after
task-spec mode was added. Should read "Load all modes at once" or "Load more than one mode."

---

RECOMMENDATIONS:
- ISSUE 1+2: Delegate to Agent Creator to split into four single-mode reviewer agents.
  Each agent: one READS set, one WRITES path, one skill pointer, one handoff pair.
  The current multi-mode agent can be retired once all four exist.
- ISSUE 3+4: Create an `artefact-review` skill. Move VERDICT FORMAT, GATE RULES, and
  mode-specific checklist references into skill references/. Add SKILL pointer to agent body.
- ISSUE 5: Strip tools to: read/readFile, search/fileSearch, search/textSearch, edit/createFile.
  Remove edit/editFiles, agent, search/changes, search/codebase, search/usages.
- ISSUE 6: Update NEVER entry to "Load more than one mode's READS at once."

---

OPEN QUESTION:
Should the multi-mode split (one reviewer per artefact type) happen now before Experiment 3
runs, or after — to avoid disrupting the pipeline mid-experiment?
This requires a Product Owner decision on sequencing.

---

FRAMEWORK NOTES:
- The multi-mode bundling pattern is likely to recur as the pipeline grows. The agent-design
  rules should add an explicit check: "IF agent has more than one WRITES target → split."
  This would have caught this issue at creation time.
- The absence of a SKILL pointer in a 125-line agent file is a gap in the Agent Creator
  checklist (or in the agent-design-checklist.md rubric). Worth adding as an explicit check.
- Tool minimisation discipline (strip tools to WRITES requirements) should be added to the
  Agent Spec Reviewer checklist — the Framework Owner fix showed this matters.
