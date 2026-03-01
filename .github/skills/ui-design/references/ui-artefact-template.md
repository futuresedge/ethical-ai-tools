# UI Artefact Template
> Produced by: Design UI agent
> Consumed by: Curate Context agent (sections extracted per task)
> Stored at: .framework/features/[slug]/ui-artefact.md

---

## Template

```markdown
# UI Artefact
FEATURE:  [feature-slug]
DESIGNED: [date]
STATUS:   DRAFT | ACCEPTED

DESIGN SYSTEM: .github/instructions/design-system.instructions.md
BRAND GUIDE:   .github/instructions/brand-guidelines.instructions.md

---

## 1. Overview
> High-level UI approach for this feature. 1–2 paragraphs maximum.

[Describe the overall UI strategy, layout approach, and key interaction patterns.
Reference design system components where applicable.]

---

## 2. Layout Structure
> Page-level or section-level layout. Describes the container hierarchy.

CONTAINER: [name]
  TYPE:   [page | modal | sidebar | section]
  LAYOUT: [flex-col | grid | stack | etc. — design system terminology]

  SECTIONS:
    - [section-name]: [brief description]
    - [section-name]: [brief description]

RESPONSIVE BEHAVIOUR:
  - Mobile (<768px): [layout changes]
  - Tablet (768–1024px): [layout changes]
  - Desktop (>1024px): [layout changes]

---

## 3. Components
> One subsection per component. These sections map to task boundaries.

### Component: [ComponentName]
TASK MAPPING: Maps to task [task-slug] (if decomposition exists)
TYPE:         [form | card | modal | list | button | input | etc.]
LOCATION:     [where in the layout structure this appears]

STRUCTURE:
  [Describe the component's internal structure using design system primitives]

STATES:
  - Default: [appearance]
  - Hover: [appearance changes]
  - Active/Focus: [appearance changes]
  - Disabled: [appearance changes]
  - Error: [appearance changes, if applicable]
  - Success: [appearance changes, if applicable]

TYPOGRAPHY:
  - Heading: [font-display, text-3xl, etc. — design system classes]
  - Body: [font-content, text-base, etc.]
  - Labels: [text-sm, etc.]

SPACING:
  - Internal: [padding values from design system]
  - External: [margin values from design system]

COLORS:
  - Background: [design system color token]
  - Text: [design system color token]
  - Border: [design system color token]
  - Accent: [design system color token]

ACCESSIBILITY:
  - ARIA roles: [role values]
  - Labels: [aria-label or aria-labelledby requirements]
  - Keyboard: [Tab order, Enter/Space behaviour]
  - Focus: [focus indicator requirements]
  - Screen reader: [any specific announcements needed]

INTERACTIONS:
  - [User action]: [system response]
  - [User action]: [system response]

---

### Component: [NextComponentName]
[Repeat structure for each component]

---

## 4. Interaction Flows
> Multi-step interactions that span components. One subsection per flow.

### Flow: [FlowName]
COMPONENTS INVOLVED: [ComponentA], [ComponentB], [ComponentC]

STEPS:
  1. [User action] → [system response, which component(s) change]
  2. [User action] → [system response]
  3. [User action] → [system response]

ERROR PATHS:
  - IF [error condition]: [what the user sees, which component displays it]
  - IF [error condition]: [what the user sees]

SUCCESS PATH:
  - [Final state after successful completion]

---

## 5. Visual Specifications
> Non-component-specific visual details.

ICONS:
  - [icon-name]: [source — Lucide, Heroicons, etc.] — [usage context]
  - [icon-name]: [source] — [usage context]

ANIMATIONS / TRANSITIONS:
  - [element]: [animation type] — [duration] — [easing]
  - [element]: [animation type] — [duration] — [easing]

SHADOWS / ELEVATION:
  - [element]: [shadow-sm, shadow-md, etc. from design system]

---

## 6. Copy / Microcopy
> All user-facing text strings. Centralized for easy extraction.

HEADINGS:
  - [context]: "[exact copy]"

LABELS:
  - [field-name]: "[exact label text]"

BUTTONS:
  - [button-context]: "[exact button text]"

MESSAGES:
  - Success: "[exact message text]"
  - Error (generic): "[exact message text]"
  - Error ([specific condition]): "[exact message text]"

PLACEHOLDERS:
  - [field-name]: "[exact placeholder text]"

TOOLTIPS / HELP TEXT:
  - [context]: "[exact text]"

---

## 7. Edge Cases and States
> How the UI handles unusual or boundary conditions.

LOADING STATES:
  - [component/section]: [loading indicator type, skeleton, spinner, etc.]

EMPTY STATES:
  - [component/section]: [what displays when no data]

ERROR STATES:
  - [component/section]: [error display pattern]

LONG CONTENT:
  - [component]: [truncation, scrolling, pagination strategy]

DISABLED STATES:
  - [component]: [appearance and tooltip/message explaining why disabled]

---

## 8. Design System Compliance
> Explicit verification that this UI follows the design system.

COMPONENTS USED:
  - [DesignSystemComponent]: [how it's used in this feature]
  - [DesignSystemComponent]: [how it's used in this feature]

DEVIATIONS (if any):
  - [Component/pattern]: [why deviation is necessary]
  - [Approval reference if deviation was pre-approved]

IF NO DEVIATIONS: "This UI fully complies with the design system. No deviations."

---

## 9. Implementation Notes
> Guidance for Context Curation and Task Performer. Not design specification.

SECTION-TO-TASK MAPPING:
  - Component: [ComponentName] → Task [task-slug]
  - Component: [ComponentName] → Task [task-slug]
  - Interaction Flow: [FlowName] → spans tasks [task-slug-a], [task-slug-b]

EXTRACTION GUIDANCE:
  When curating context for task [task-slug], include:
    - Section 3: Component [ComponentName] (complete)
    - Section 6: Copy entries for [ComponentName]
    - Section 7: Edge cases for [ComponentName]

  Do NOT include:
    - Other component sections
    - Interaction flows that span tasks this task doesn't participate in

---

## 10. Open Questions
> Unresolved UI decisions. Must be empty before STATUS: ACCEPTED.

[If none:]
No open UI questions. Design is complete and ready for implementation.

[If any:]
- [Question 1 — what needs design decision]
- [Question 2 — what needs design decision]

```

---

## Filling Rules

### Section 1: Overview
High-level only. Does not repeat information from later sections.
References design system by name if components are reused.

### Section 2: Layout Structure
Describes the container and section hierarchy — not individual components.
Responsive behaviour must specify breakpoints matching design system.

### Section 3: Components
ONE subsection per component.
Each subsection should be independently extractable by Curate Context agent.

TASK MAPPING field:
  - If decomposition exists: reference the task slug that will build this component
  - If decomposition does not exist yet: write "TBD — to be mapped during decomposition"

STATES section is mandatory. Every component has at least Default state.

TYPOGRAPHY, SPACING, COLORS:
  - Use design system tokens/classes/variables
  - Do NOT specify arbitrary values (no `#3b82f6`, use `color-primary` or equivalent)
  - If design system does not provide a needed value: note in Section 8 (Deviations)

ACCESSIBILITY:
  - Minimum WCAG 2.1 AA compliance required for every component
  - Keyboard navigation must be specified
  - Screen reader behaviour must be specified for non-standard interactions

### Section 4: Interaction Flows
Only for flows that span multiple components or multiple steps.
Single-action interactions (button click → form submit) belong in component INTERACTIONS.

### Section 5: Visual Specifications
Icons must specify source (Lucide, Heroicons, custom) for implementation clarity.
Animations should reference design system motion tokens if available.

### Section 6: Copy / Microcopy
Every user-facing string must be listed here.
Strings should be exact — not "[something helpful]" placeholders.
Copy must match tone/voice from brand guidelines.

This section is the source of truth for Task Performer — they copy these strings verbatim.

### Section 7: Edge Cases
Every component must have at least:
  - A loading state (or explicit note that loading is not applicable)
  - An empty state (or explicit note that empty is not applicable)
  - An error state (or explicit note that error is not applicable)

### Section 8: Design System Compliance
Lists design system components used and any deviations.
Deviations require justification.
If a deviation was pre-approved by Design Owner, include approval reference.

### Section 9: Implementation Notes
SECTION-TO-TASK MAPPING is mandatory if decomposition exists.
EXTRACTION GUIDANCE tells Curate Context agent which sections to include per task.

This section is for agent coordination — not for human review.

### Section 10: Open Questions
Must be empty before ui-artefact.md is marked STATUS: ACCEPTED.
Questions block downstream AC writing and context curation.

---

## Pre-acceptance checklist

Before marking STATUS: ACCEPTED:
- [ ] Section 2: responsive behaviour specified for at least 2 breakpoints
- [ ] Section 3: every component has STATES, TYPOGRAPHY, SPACING, COLORS, ACCESSIBILITY
- [ ] Section 3: every component references design system tokens (no arbitrary values)
- [ ] Section 6: all user-facing strings are exact copy (not placeholders)
- [ ] Section 7: every component has loading, empty, error states specified (or explicit N/A)
- [ ] Section 8: deviations justified or none present
- [ ] Section 9: section-to-task mapping present if decomposition exists
- [ ] Section 10: open questions is empty

IF any check fails: resolve before handoff to Curate Context agent.
