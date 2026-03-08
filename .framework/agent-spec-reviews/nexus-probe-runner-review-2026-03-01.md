```
VERDICT: RETURNED
AGENT FILE: .github/agents/nexus-probe-runner.agent.md
DATE: 2026-03-01

CHECKS PASSED:
- [A1] name present: "Nexus Probe Runner"
- [A2] description is a single plain line
- [A3] tools is an inline array
- [A4] model is an inline array
- [A5] handoff prompt is a single line
- [A6] all four handoff keys present (label, agent, prompt, send)
- [B1] READS declares named files only — no globs or directory references
- [B3] NEVER lists five explicit exclusions
- [B4] FAILURE MODES covers missing input: "IF nexus/schema.sql absent — STOP"
- [B5] FAILURE MODES covers file lookup returning nothing: "IF phase-05 doc absent — STOP"
- [B6] TOKEN BUDGET declared: 8k
- [B7] SKILL pointer present: nexus-ontology
- [B8] SKILL pointer matches SKILLS-INVENTORY.md: nexus-ontology confirmed
- [C1] Instructions written as imperative shorthand throughout
- [C4] No "you should" / "you must" prose phrasing
- [D1] Body is approximately 40 non-empty lines — within the 60-line target
- [D2] Agent name is operation-based noun: nexus-probe-runner
- [D3] Single context window implied — one probe run, one call
- [D4] All READS present in context-tree.md Zone N node (Nexus Probe Runner entry)

CHECKS FAILED:
- [B2] WRITES declares two artefacts (nexus/seed-task-07.sql and
  .framework/progress/experiments/nexus/Nexus-exp01-probe-results.md) — not one artefact,
  one path. Remediation: designate the probe results file as the primary WRITES target —
  it is the verifiable evidence artefact that the Framework Owner reads. Document
  nexus/seed-task-07.sql as a prerequisite output in NOTES or OUTPUTS block.
- [C2] FAILURE MODES and BOUNDARIES appear after the SKILL pointer. Critical rules must precede
  the SKILL line. Remediation: move FAILURE MODES and BOUNDARIES above SKILL: nexus-ontology.
- [C3] NEVER section appears mid-body (between WRITES and TOKEN BUDGET), not at the bottom.
  BOUNDARIES at the end is a separate block extending the NEVER rules.
  Remediation: merge both into a single NEVER section placed at the bottom of the body.

SECTIONS REVIEWED:
  A — YAML Frontmatter:   PASS
  B — Body Structure:     FAIL (B2)
  C — Instruction Format: FAIL (C2, C3)
  D — File-Level Constraints: PASS
```
