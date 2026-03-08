```
VERDICT: RETURNED
AGENT FILE: .github/agents/nexus-server-builder.agent.md
DATE: 2026-03-01

CHECKS PASSED:
- [A1] name present: "Nexus Server Builder"
- [A2] description is a single plain line
- [A3] tools is an inline array
- [A4] model is an inline array
- [A5] handoff prompt is a single line
- [A6] all four handoff keys present (label, agent, prompt, send)
- [B1] READS declares named files only — no globs or directory references
- [B3] NEVER lists five explicit exclusions
- [B4] FAILURE MODES covers missing input: "IF phase doc not provided — STOP"
- [B6] TOKEN BUDGET declared: 25k
- [B7] SKILL pointer present: nexus-ontology
- [B8] SKILL pointer matches SKILLS-INVENTORY.md: nexus-ontology confirmed
- [C1] Instructions written as imperative shorthand throughout
- [C4] No "you should" / "you must" prose phrasing
- [D1] Body is approximately 50 non-empty lines — within the 60-line target
- [D2] Agent name is operation-based noun: nexus-server-builder
- [D3] Single context window per phase invocation — each call scopes to one phase doc
- [D4] All READS present in context-tree.md Zone N node

CHECKS FAILED:
- [B2] WRITES declares multiple artefacts across three conditional phase blocks — not one artefact,
  one path. Remediation: designate one primary output per phase invocation as the WRITES target
  (Phase 1 → nexus/server.ts, Phase 2 → nexus/server.ts, Phase 3 → .github/agents/task-performer.template.md).
  Document secondary outputs in an OUTPUTS BY PHASE note block, separate from the formal WRITES line.
- [B5] FAILURE MODES has no mode covering a file lookup or search returning zero results.
  Remediation: add a mode for file not found on any of the conditional READS — e.g.
  "IF NexusToolGrammar.md or NexusDecisionsRationale.md not found — STOP. Raise uncertainty."
- [C2] FAILURE MODES and BOUNDARIES appear after the SKILL pointer. Critical rules must precede
  the SKILL line. Remediation: move FAILURE MODES and BOUNDARIES above SKILL: nexus-ontology.
- [C3] NEVER section appears mid-body (before TOKEN BUDGET), not at the bottom. A separate
  BOUNDARIES block at the end duplicates and extends it, creating two NEVER sections.
  Remediation: merge NEVER and BOUNDARIES into a single NEVER section and place it as the
  last section before end-of-file.

SECTIONS REVIEWED:
  A — YAML Frontmatter:   PASS
  B — Body Structure:     FAIL (B2, B5)
  C — Instruction Format: FAIL (C2, C3)
  D — File-Level Constraints: PASS
```
