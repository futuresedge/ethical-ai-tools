```skill
# Skill: Nexus Ontology
TRIGGERS: "ONE ontology", "six dimensions", "dimension check", "ontology checklist",
          "capability accountability", "design rubric", "nexus design check",
          "dimension coverage", "intentional deferral", "ontology coverage"
ZONE: cross-zone (Nexus build)
USED BY: Nexus Server Builder, Nexus Tool Reviewer (post-adoption)
CONTEXT-TREE NODE: meta (no context-tree entry required)

## What this skill does
Carries the 6-dimension ONE Ontology rubric (Capability, Accountability, Quality,
Temporality, Context, Artifact) as a design checklist for the Nexus experiment.
Applied before implementing any tool, schema table, or agent spec section to ensure
structural completeness and to explicitly name intentional deferrals vs. design gaps.

## Load on activation
- references/six-dimensions-checklist.md
- references/phase-coverage-map.md

## What nexus-ontology covers — and what it does not
COVERS: 6-dimension design checklist — one binary check per dimension, one remediation if failed
COVERS: Experiment coverage map — which dimensions are fully proved vs. intentionally deferred
COVERS: The distinction between a named deferral (acceptable) and an unnamed gap (design error)
COVERS: Pass criterion for the experiment adoption decision
DOES NOT COVER: Tool naming grammar — that is the nexus-tool-grammar skill
DOES NOT COVER: Runtime enforcement — no agent reviews live tool calls against these dimensions
DOES NOT COVER: Current pipeline agents or Zone 1–5 concerns — ontology applies to Nexus only

## Do not load
- nexus-tool-grammar — separate concern; load if also designing tool names
- framework-strategy — higher-level strategic assessment; this skill is implementation-scoped
```
