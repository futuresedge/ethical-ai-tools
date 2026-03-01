# Downstream Consumption Rules
> How the UI artefact is consumed by downstream agents
> Enforced by: Curate Context agent
> Context: The UI artefact is designed for machine extraction, not just human review

---

## Core principle

The ui-artefact.md is written once by the Design UI agent, then sliced into
task-specific sections by the Curate Context agent.

Task Performer agents NEVER see the full ui-artefact.md — only the sections
relevant to their specific task, as extracted by Curate Context.

---

## Extraction strategy by task type

### For UI component tasks (Layer 1)

EXTRACT from ui-artefact.md:
  - Section 3: Component subsection matching task's component name (complete)
  - Section 6: Copy/microcopy entries for this component only
  - Section 7: Edge cases for this component only

DO NOT EXTRACT:
  - Other component subsections
  - Section 4 (Interaction Flows) unless the flow is contained within this component
  - Section 2 (Layout Structure) unless this task creates the layout container

LABEL in context-package:
  ```
  ## UI Specification
  ### From ui-artefact.md — Component: [ComponentName]
  [extracted Section 3 content]

  ### From ui-artefact.md — Copy for [ComponentName]
  [filtered Section 6 content]

  ### From ui-artefact.md — Edge Cases for [ComponentName]
  [filtered Section 7 content]
  ```

### For hook/logic tasks (Layer 2)

EXTRACT from ui-artefact.md:
  - Section 4: Interaction Flows if the hook implements one (optional)
  - Section 7: Edge cases that the hook must handle (error states, loading states)

DO NOT EXTRACT:
  - Section 3 (Components) — logic tasks do not need visual specification
  - Section 5 (Visual Specifications) — not relevant to logic
  - Section 6 (Copy) unless the hook produces user-facing messages

LABEL in context-package:
  ```
  ## UI Specification
  NOTE: This task implements logic. Only behaviour-relevant UI sections included.

  ### From ui-artefact.md — Interaction Flow: [FlowName]
  [extracted Section 4 content if applicable]

  ### From ui-artefact.md — Edge Cases
  [filtered Section 7 content — only states this logic must handle]
  ```

### For integration tasks (Layer 3)

EXTRACT from ui-artefact.md:
  - Section 4: Interaction Flows that this integration implements (complete)
  - References to involved components (brief — full specs were in Layer 1 tasks)

DO NOT EXTRACT:
  - Full component specifications (already implemented in Layer 1)
  - Visual details (styling is already done)

LABEL in context-package:
  ```
  ## UI Specification
  NOTE: This task connects existing components. Only integration behaviour included.

  ### From ui-artefact.md — Interaction Flow: [FlowName]
  [extracted Section 4 content]

  COMPONENTS INVOLVED:
    - [ComponentA]: implemented in task [task-slug-a]
    - [ComponentB]: implemented in task [task-slug-b]
  ```

---

## Section-by-section extraction rules

### Section 1 (Overview)
INCLUDE: only if task is building the top-level layout container
EXCLUDE: for all component and logic tasks

### Section 2 (Layout Structure)
INCLUDE: only if task is building the layout container
EXCLUDE: for leaf components and logic tasks

### Section 3 (Components)
EXTRACT STRATEGY: one component subsection per task
MATCHING: by component name (must match task-spec.md OUTPUT filename)
COMPLETE EXTRACTION: include entire component subsection — do not summarize

### Section 4 (Interaction Flows)
INCLUDE IF: the task implements or participates in the flow
EXCLUDE IF: the flow spans multiple tasks and this task doesn't touch it
PARTIAL EXTRACTION: acceptable — extract only the steps relevant to this task

### Section 5 (Visual Specifications)
INCLUDE: only if task produces UI (Layer 1)
EXCLUDE: for logic tasks (Layer 2) and integration tasks (Layer 3)

### Section 6 (Copy / Microcopy)
FILTER BY COMPONENT: include only strings used by this task's component
COMPLETE STRINGS: copy verbatim — do not summarize or paraphrase
ORGANIZE: group by string type (headings, labels, buttons, messages)

### Section 7 (Edge Cases and States)
FILTER BY COMPONENT/LOGIC: include only states this task must handle
EXAMPLES:
  - UI task building a form: include loading, error, disabled states
  - Logic task submitting form: include error states, not visual disabled state
  - Integration task: include flow-level error handling, not component-level states

### Section 8 (Design System Compliance)
INCLUDE: only if task produces UI (Layer 1)
EXCLUDE: for logic and integration tasks

### Section 9 (Implementation Notes)
CURATION AGENT READS THIS: but does not include it in context-package
This section is metadata for the Curate Context agent itself

### Section 10 (Open Questions)
NEVER INCLUDE: in context-package
If questions exist: ui-artefact.md is not ready for consumption — block curation

---

## When ui-artefact.md does not exist

IF Design UI agent has not run (feature has no UI):
  Curate Context agent writes in context-package:
  ```
  ## UI Specification
  NOT APPLICABLE: This task produces non-UI artefacts (logic, config, test, etc.).
  No ui-artefact.md exists for this feature.
  ```

IF Design UI agent is still in progress:
  DO NOT curate context-package yet
  WAIT for ui-artefact.md to reach STATUS: ACCEPTED

---

## When ui-artefact.md has no matching section

IF a task-spec.md declares it produces a component, but ui-artefact.md has no
matching component subsection:
  WRITE to uncertainty-log:
    WHAT:    task-spec.md declares component [ComponentName] but ui-artefact.md
             Section 3 has no subsection for this component
    WHY:     Cannot curate context without UI specification for this component
    RESOLVE: Either add component to ui-artefact.md, or revise task-spec.md if
             component name is wrong

  DO NOT proceed with context curation until resolved

---

## Copy fidelity requirement

When Section 6 (Copy / Microcopy) is extracted into context-package:
  - Copy strings EXACTLY as written in ui-artefact.md
  - Do NOT paraphrase, summarize, or "improve" the copy
  - Do NOT add quotes around strings unless they were quoted in the source
  - Preserve capitalization, punctuation, and whitespace exactly

WRONG extraction:
  ```
  Button text: something like "Submit your enquiry"
  ```

RIGHT extraction:
  ```
  BUTTON:
    - Submit button: "Submit Enquiry"
  ```

The Task Performer will use these strings verbatim in code. Any deviation creates
a mismatch between design intent and implementation.

---

## Accessibility requirement propagation

Every component's ACCESSIBILITY subsection in Section 3 must be included in
the context-package for that component's task.

CRITICAL: ARIA roles, labels, keyboard behaviour, and focus management are
non-negotiable requirements — not suggestions.

If a component's ACCESSIBILITY subsection is missing or incomplete in ui-artefact.md:
  WRITE to uncertainty-log before curating context-package
  DO NOT substitute with generic accessibility notes
  DO NOT assume "standard accessibility" without specification

---

## Token budget impact

The UI artefact is typically the largest input to context curation.
A full ui-artefact.md for a complex feature can be 5k–10k tokens.

EXTRACTION reduces this:
  - One component subsection: ~500–1500 tokens
  - Filtered copy: ~100–300 tokens
  - Filtered edge cases: ~100–200 tokens
  - TOTAL per task: ~700–2000 tokens

This is why Section 3 must be organized with one subsection per component —
to enable clean extraction at task granularity.

IF a component subsection alone exceeds 2000 tokens:
  The component is too complex for one task
  Return to decomposition — split the component across multiple tasks

---

## Version consistency

IF ui-artefact.md is updated after context-package.md has been created:
  ALL context-packages that extracted from the updated sections must be regenerated
  The Curate Context agent must re-run for affected tasks

This is why ui-artefact.md must reach STATUS: ACCEPTED before any context curation begins.

---

## Quality gate

Before Curate Context agent uses ui-artefact.md:
- [ ] ui-artefact.md STATUS is ACCEPTED (not DRAFT)
- [ ] Section 9 (Implementation Notes) contains section-to-task mapping
- [ ] Section 10 (Open Questions) is empty
- [ ] Every component in Section 3 has STATES, ACCESSIBILITY, and COPY references
- [ ] Section 6 contains exact strings (no placeholders like "[helpful message]")

IF any check fails: block context curation, surface to Design UI agent for revision
