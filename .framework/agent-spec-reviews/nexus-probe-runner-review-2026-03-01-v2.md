```
VERDICT: ACCEPTED
AGENT FILE: .github/agents/nexus-probe-runner.agent.md
DATE: 2026-03-01

CHECKS PASSED:
- [A1] name present: "Nexus Probe Runner"
- [A2] description is a single plain line
- [A3] tools is an inline array
- [A4] model is an inline array
- [A5] handoff prompt is a single line
- [A6] all four handoff keys present (label, agent, prompt, send)
- [B1] READS declares named files only — three explicit paths, no globs
- [B2] WRITES declares exactly one artefact: Nexus-exp01-probe-results.md — nexus/seed-task-07.sql documented in OUTPUTS block
- [B3] NEVER lists eight explicit exclusions
- [B4] FAILURE MODES covers missing input: "IF nexus/schema.sql absent — STOP"
- [B5] FAILURE MODES covers file lookup returning nothing: "IF phase-05 doc absent — STOP"
- [B6] TOKEN BUDGET declared: 8k
- [B7] SKILL pointer present: nexus-ontology
- [B8] SKILL pointer matches SKILLS-INVENTORY.md: nexus-ontology confirmed
- [C1] Instructions written as imperative shorthand throughout
- [C2] FAILURE MODES appears before SKILL pointer
- [C3] NEVER section is the last section in the body — single block, no duplication
- [C4] No "you should" / "you must" prose phrasing
- [D1] Body is approximately 37 non-empty lines — within the 60-line target
- [D2] Agent name is operation-based noun: nexus-probe-runner
- [D3] Single context window implied — one probe run, one call
- [D4] All READS present in context-tree.md Zone N node (Nexus Probe Runner entry)

CHECKS FAILED: none

SECTIONS REVIEWED:
  A — YAML Frontmatter:   PASS
  B — Body Structure:     PASS
  C — Instruction Format: PASS
  D — File-Level Constraints: PASS
```
