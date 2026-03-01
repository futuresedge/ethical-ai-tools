```skill
# Skill: Nexus QA Rules
TRIGGERS: "qa rules", "proof validation", "qa reviewer", "qa review",
          "proof rubric", "exit code", "qa rule row", "verify proof",
          "qaapproved", "qafailed", "proof criteria", "validate proof"
ZONE: cross-zone (Nexus build — future phase)
USED BY: QA Reviewer (Agent 2.2), Nexus Server Builder (when building qa_review tools)
CONTEXT-TREE NODE: meta (no context-tree entry required)

## What this skill does
Governs proof validation for the Nexus QA Reviewer agent. Covers the proof validation
rubric (what constitutes a valid proof), the QA rules database schema (structured rows,
not prose instructions), and the state transition authority of the QA Reviewer
(PROOFSUBMITTED → QAAPPROVED or QAFAILED only).

## Load on activation
- references/proof-validation-rubric.md
- references/qa-rules-schema.md

## What nexus-qa-rules covers — and what it does not
COVERS: proof validation rubric — command specificity, exit codes, output format requirements
COVERS: QA rules schema — structured database rows per task type, not prose in agent specs
COVERS: state transition authority — QA Reviewer's exact permitted transitions and no others
COVERS: how framework learnings become new QA rules (retrospective → database row)
DOES NOT COVER: tool naming for QA tools — that is nexus-tool-grammar
DOES NOT COVER: proof writing — that is the Task Performer's responsibility
DOES NOT COVER: acceptance criteria content — that is the acceptance-criteria skill

## Do not load
- nexus-tool-grammar — load separately if designing the qa_review tool names
- acceptance-criteria — different concern; AC governs what is correct, QA governs how to verify
```
