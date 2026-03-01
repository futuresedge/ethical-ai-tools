# Skills Inventory
> Master reference for all framework skills.
> Skills load on demand — never at startup.
> Each skill has a SKILL.md (thin) and a references/ folder (substantive).
> Last updated: March 2026

---

## Loading Model

STARTUP: agent loads skill name + description only
ACTIVATION: full SKILL.md loads when trigger phrase matched
ON DEMAND: reference files load only when the skill explicitly calls for them

---

## Skill Registry

| Skill | Scope | Used by | Cache value |
|---|---|---|---|
| `feature-definition` | Zone 2 | Define Feature agent | HIGH |
| `acceptance-criteria` | Zones 2–3 | Write Feature AC, Write Task AC | HIGH |
| `feature-decomposition` | Zone 2 | Decompose to Tasks agent | HIGH |
| `task-definition` | Zone 3 | Define Task agent | HIGH |
| `context-compression` | Zone 3 | Curate Context agent | HIGH |
| `test-writing` | Zones 2–3 | Write Feature Tests, Write Task Tests | HIGH |
| `ui-design` | Zone 2 | Design UI agent | MEDIUM |
| `qa-review` | Zone 4 | QA Reviewer agent | HIGH |
| `uncertainty-protocol` | Zones 2–4 | Any executor agent | MEDIUM |
| `agent-design` | cross-zone (meta) | Agent Spec Reviewer agent | HIGH |
| `skill-writing` | cross-zone (meta) | Agent Creator, any skill-producing agent | MEDIUM |
| `framework-strategy` | Zone 0 (meta) | Framework Owner agent | HIGH |
| `retro-facilitation` | Zone 0 (meta) | Retro Facilitator agent | HIGH |
| `artefact-review` | Zones 2–3 | Feature Spec Reviewer, AC Reviewer, Decomposition Reviewer, Task Spec Reviewer | HIGH |
| `nexus-ontology` | cross-zone (Nexus build) | Nexus Server Builder, Nexus Tool Reviewer (post-adoption) | HIGH |
| `nexus-tool-grammar` | cross-zone (Nexus build) | Nexus Server Builder, Nexus Tool Reviewer (post-adoption) | HIGH |
| `nexus-server` | cross-zone (Nexus build) | Nexus Server Builder | HIGH |
| `nexus-qa-rules` | cross-zone (Nexus build) | QA Reviewer (Agent 2.2), Nexus Server Builder | MEDIUM |
| `nexus-context-card` | cross-zone (Nexus build) | Context Agent (Agent 2.3), Nexus Server Builder | MEDIUM |

---

## Skill Descriptions (startup-load only)

feature-definition
  Defines what a good feature spec contains, the required output template,
  and the conditions that make a feature definition complete.

acceptance-criteria
  Governs AC writing at feature and task scope. Covers the four AC conditions
  (unambiguous, atomic, verifiable, problem-space), Given/When/Then format,
  and the AC-vs-test distinction.

feature-decomposition
  Rules for decomposing a feature into independently testable tasks. Covers
  sizing limits, independence test, naming conventions, and the relationship
  between feature AC and task AC.

task-definition
  Governs single-task definition from a decomposition entry. Covers what a
  task spec must contain, what it must not contain, and the relationship
  to its parent feature.

context-compression
  The compression rubric for the Curate Context agent. Governs what to
  include, what to exclude, how to flag conflicts, and how to structure
  the output context-package.

test-writing
  Governs test derivation from AC. Covers Given/When/Then test format,
  one test per AC condition rule, explicit expected outputs, and the
  distinction between task tests and feature tests.

ui-design
  Governs UI artefact production. Covers required artefact sections,
  design system constraints, accessibility requirements, and how the
  UI artefact is structured for downstream consumption by context curation.

qa-review
  The review rubric for QA Reviewer. Covers how to assess proof-of-completion
  against task-ac and task-tests, pass/fail criteria, and review-result
  output format.

uncertainty-protocol
  Governs all uncertainty events across all zones. Covers when to stop,
  what to write to uncertainty-log, the required format, and escalation paths
  by zone.

agent-design
  Review rubric for assessing agent spec files against agent-design.instructions.md.
  Covers YAML frontmatter validity, READS/WRITES/NEVER declarations, instruction
  format, file size, SKILL pointer correctness, and the review-result output format.

skill-writing
  Governs the production of new skill artefacts — SKILL.md and references/ files.
  Covers when to create vs reuse a skill, required SKILL.md sections, references/ folder
  conventions, trigger phrase design, and SKILLS-INVENTORY.md registration format.

framework-strategy
  Carries the authoritative strategic knowledge of the Agentic Development Framework.
  Covers the four primitives (Evidence Gate, Environment Contract, Context Card, Observable Stream),
  seven design principles, top 10 load-bearing assumptions, committed design decisions, strategic
  roadmap, open research questions, zone policy structure, and the artefact assessment rubric.
  Load for any strategic advisory question or artefact assessment in Zone 0.

retro-facilitation
  Governs extraction of meaningful signals from agent review artefacts and the production of a
  structured sprint retrospective report. Covers three signal classes (friction, confirmation,
  assumption evidence), pattern detection across signals, the eight-section report format,
  recommendation rules, and how to handle open questions surfaced during a sprint.
  Load when producing any sprint or feature retrospective report.

artefact-review
  Carries the verdict format, gate rules, and review procedure shared by all single-mode
  reviewer agents (Feature Spec Reviewer, AC Reviewer, Decomposition Reviewer, Task Spec Reviewer).
  Covers: ACCEPTED/ACCEPTED WITH NOTES/RETURNED criteria, output template, revision history
  convention, how to run the checklist without partial runs, and boundary rules (never invent,
  never pass ambiguity). Load for any artefact review operation in Zones 2–3.

nexus-ontology
  Carries the 6-dimension ONE Ontology design rubric (Capability, Accountability, Quality,
  Temporality, Context, Artifact) as a binary checklist for the Nexus experiment. Applied before
  implementing any tool, schema table, or agent spec section. Includes experiment coverage map
  (which dimensions are fully proved vs. intentionally deferred) and the pass criterion for the
  adoption decision. Load for any tool or schema design decision during the Nexus build.

nexus-tool-grammar
  Authoritative naming grammar for Nexus MCP server tools. Carries the closed verb vocabulary
  (8 verbs with semantics and side effect rules), the open subject vocabulary (document types,
  write modes, valid verb combinations), the Tool Matrix, task slug formation rules, and the
  three scoping levels (universal, role-scoped, task-scoped). Load before naming or designing
  any new Nexus tool.

nexus-server
  Implementation conventions for the Nexus MCP server. Covers MCP SDK STDIO transport setup,
  VS Code registration via mcp.json, better-sqlite3 synchronous patterns and WAL mode, the
  registerTaskTools() dynamic dispatch pattern, compound tool implementation (atomic write +
  state transition + stream event + audit), and agent spec template generation. Load when
  writing or extending nexus/server.ts.

nexus-qa-rules
  Governs proof validation for the Nexus QA Reviewer agent (Agent 2.2, future phase). Covers
  the proof validation rubric (command specificity, exit codes, required elements), the qa_rules
  database schema (structured rows per task type), and QA Reviewer state transition authority
  (PROOFSUBMITTED → QAAPPROVED or QAFAILED only). Load when building or invoking the QA
  Reviewer or when adding new validation rules from a retrospective.

nexus-context-card
  Governs context card generation for the Context Agent (Agent 2.3, future phase). Covers the
  context card format and 800-token budget, knowledge base schema (sprint_learnings, patterns),
  query patterns for filtering by task_type and domain, compression discipline (no full document
  dumps), and the progression from the Phase 1–5 minimum (raw task row) to the target generated
  briefing. Load when building or upgrading get_context_card.
