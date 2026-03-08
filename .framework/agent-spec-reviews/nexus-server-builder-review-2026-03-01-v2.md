```
VERDICT: ACCEPTED
AGENT FILE: .github/agents/nexus-server-builder.agent.md
DATE: 2026-03-01

CHECKS PASSED:
- [A1] name present: "Nexus Server Builder"
- [A2] description is a single plain line
- [A3] tools is an inline array
- [A4] model is an inline array
- [A5] handoff prompt is a single line
- [A6] all four handoff keys present (label, agent, prompt, send)
- [B1] READS declares named files only — all three READS blocks list explicit paths
- [B2] WRITES declares exactly one artefact: nexus/server.ts — secondary outputs documented in OUTPUTS BY PHASE block
- [B3] NEVER lists seven explicit exclusions
- [B4] FAILURE MODES covers missing input: "IF phase doc not provided — STOP" and "IF nexus/ files absent on Phase 2+ invocation — STOP"
- [B5] FAILURE MODES covers file lookup returning nothing: "IF NexusToolGrammar.md, ONE-Ontology.md, or NexusDecisionsRationale.md not found — STOP"
- [B6] TOKEN BUDGET declared: 25k
- [B7] SKILL pointer present: nexus-ontology
- [B8] SKILL pointer matches SKILLS-INVENTORY.md: nexus-ontology confirmed
- [C1] Instructions written as imperative shorthand throughout
- [C2] FAILURE MODES appears before SKILL pointer
- [C3] NEVER section is the last section in the body — single block, no duplication
- [C4] No "you should" / "you must" prose phrasing
- [D1] Body is approximately 48 non-empty lines — within the 60-line target
- [D2] Agent name is operation-based noun: nexus-server-builder
- [D3] Single context window per phase invocation
- [D4] All READS present in context-tree.md Zone N node (Nexus Server Builder entry)

CHECKS FAILED: none

SECTIONS REVIEWED:
  A — YAML Frontmatter:   PASS
  B — Body Structure:     PASS
  C — Instruction Format: PASS
  D — File-Level Constraints: PASS
```
