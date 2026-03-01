# Review Result Template

> Copy this template exactly. Do not omit sections.
> File is written to .framework/agent-spec-reviews/[agent-name]-review-[YYYY-MM-DD].md

---

```
VERDICT: [ACCEPTED | ACCEPTED WITH NOTES | RETURNED]
AGENT FILE: .github/agents/[agent-name].agent.md
DATE: [ISO 8601]

CHECKS PASSED:
- [A1] name present
- [B3] NEVER lists two explicit exclusions
- ... (one line per passing check, citing the check ID)

CHECKS FAILED:
- [B8] SKILL pointer: skill 'foo' not found in SKILLS-INVENTORY.md — register the skill or correct the pointer
- [C1] Prose instruction found on line N: "You should read..." — rewrite as imperative shorthand
- ... (one line per failing check with a specific, actionable remediation)

NOTES: (ACCEPTED WITH NOTES only — omit if ACCEPTED or RETURNED)
- [D1] Body is 63 lines — marginally over the 60-line target; consider consolidating FAILURE MODES
- ...

SECTIONS REVIEWED:
  A — YAML Frontmatter: [PASS | FAIL]
  B — Body Structure:   [PASS | FAIL]
  C — Instruction Format: [PASS | FAIL]
  D — File-Level Constraints: [PASS | FAIL]
```
