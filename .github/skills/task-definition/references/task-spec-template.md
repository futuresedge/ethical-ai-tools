# Task Spec Template
> Produced by: Define Task agent
> Consumed by: Write Task AC, Curate Context agents
> Stored at: .framework/features/[slug]/tasks/[task-slug]/task-spec.md

---

## Template

```markdown
# Task Spec
TASK:        [task-slug]
FEATURE:     [feature-slug]
CREATED:     [date]
STATUS:      DRAFT | ACCEPTED | BLOCKED

FROM:        .framework/features/[slug]/decomposition.md (Task [n])
DEPENDS ON:  [task-slug] | NONE

---

## 1. What This Task Produces
> One sentence. The single artefact this task creates.

[Example: "A validated CommissionsForm component that renders form fields and client-side validation."]

OUTPUT: [exact file path]
TYPE:   [React component | Hook | Utility | Config | Test suite | etc.]

---

## 2. Scope
> What this task does and explicitly does NOT do.

IN SCOPE:
- [specific thing this task delivers]
- [specific thing this task delivers]
- [specific thing this task delivers]

OUT OF SCOPE:
- [specific thing deferred to another task]
- [specific thing not part of this feature]
- [specific integration handled elsewhere]

---

## 3. Parent Feature Context
> Minimal context from the parent feature. Just enough to understand this task's place.

FEATURE AC SATISFIED:
  - FAC-[feature-slug]-[n]: [one-line summary of the AC condition]
  - FAC-[feature-slug]-[n]: [one-line summary of the AC condition]

FROM decomposition.md:
  [Copy the DESCRIPTION and ACCEPTANCE sections verbatim from decomposition entry]

---

## 4. Dependencies
> What must exist before this task can start. What this task will consume.

DEPENDS ON TASKS:
  [task-slug]: [what this task provides that the current task needs]
  OR: NONE

EXTERNAL DEPENDENCIES:
  - [library, API, service, or configuration that must be available]
  - [example: "Formspree account with form ID configured in VITE_FORMSPREE_FORM_ID"]
  OR: NONE

---

## 5. Interface Specification
> For components: props. For hooks: parameters and return value. For utils: function signature.

[If React component:]
PROPS:
  - `propName`: [type] — [description]
  - `onSubmit`: (data: FormData) => void — [description]

[If hook:]
PARAMETERS:
  - `param1`: [type] — [description]

RETURNS:
  - `returnValue`: [type] — [description]

[If utility/function:]
SIGNATURE:
  ```typescript
  function utilityName(param: Type): ReturnType
  ```

[If config/constant:]
VALUES:
  - `KEY_NAME`: [type] — [description and source]

---

## 6. Constraints
> Non-negotiable technical constraints from AGENTS.md relevant to this task.

STACK:
  - [constraint from AGENTS.md, filtered to what applies to this task]
  - [example: "React 18.x, functional components, TypeScript strict mode"]

PERFORMANCE:
  - [any performance requirements from feature AC]
  OR: NONE

ACCESSIBILITY:
  - [any a11y requirements from feature AC or design system]
  OR: Standard WCAG 2.1 AA compliance

---

## 7. Success Criteria (high-level)
> Not detailed AC — just what "done" looks like. Detailed AC comes from Write Task AC agent.

DONE WHEN:
- [observable outcome 1]
- [observable outcome 2]
- [observable outcome 3]

---

## 8. Open Questions
> Unresolved questions that will block task AC or execution. Must be resolved before AC writing.

[If none:]
No open questions. Task is ready for AC writing.

[If any:]
- [Question 1 with enough detail to be answerable]
- [Question 2 with enough detail to be answerable]
```

---

## Filling Rules

### Section 1: What This Task Produces

ONE sentence maximum. If you cannot describe the output in one sentence, the task is too large.

OUTPUT path must be exact and unique to this task.

TYPE must match one of the artefact types from AGENTS.md.

### Section 2: Scope

IN SCOPE:
  - At least 2 items
  - Each item is specific and testable
  - If from decomposition.md BOUNDARIES, copy verbatim

OUT OF SCOPE:
  - At least 2 items
  - Must include at least one thing deferred to another task
  - Must include at least one integration concern handled in Layer 3
  - If from decomposition.md BOUNDARIES, copy verbatim

### Section 3: Parent Feature Context

Copy the feature AC IDs this task satisfies from decomposition.md SATISFIES list.

Include one-line summary of each AC condition (not the full Given/When/Then).

Copy DESCRIPTION and ACCEPTANCE from decomposition.md verbatim — do not rewrite.

### Section 4: Dependencies

DEPENDS ON TASKS:
  - List task slugs and what they provide
  - If NONE: write NONE explicitly
  - Layer 1 tasks typically have NONE
  - Layer 3 tasks typically have 2+ dependencies

EXTERNAL DEPENDENCIES:
  - Libraries, APIs, services not provided by other tasks
  - Environment variables this task requires
  - Configuration files this task reads
  - If NONE: write NONE explicitly

### Section 5: Interface Specification

This section structure varies by artefact type.

For React components:
  - List all props with types and descriptions
  - Include event handlers with their signatures
  - Include children prop if applicable
  - Use TypeScript syntax

For hooks:
  - List parameters with types
  - List return value structure
  - Use TypeScript syntax

For utilities:
  - Full function signature in TypeScript
  - Include JSDoc if the function is complex

For configs:
  - List exported values
  - Specify where values are sourced (env vars, constants, etc.)

### Section 6: Constraints

STACK:
  - Filter AGENTS.md to only constraints relevant to this task's artefact type
  - If building a React component: include React version, TypeScript mode, component patterns
  - If building a hook: include hook rules, state management patterns
  - If building a utility: include pure function requirements, testing approach
  - Do NOT copy all of AGENTS.md — only relevant sections

### Section 7: Success Criteria

High-level only. 3–5 observable outcomes.
NOT detailed Given/When/Then (that comes in task-ac.md).

Write as present-tense assertions:
  - "The form renders with all required fields"
  - "Invalid input triggers field-level error messages"
  - "The component is accessible via keyboard navigation"

### Section 8: Open Questions

MUST be empty before task-spec.md is marked STATUS: ACCEPTED.

Questions here block the Write Task AC agent from proceeding.

Each question must be specific enough to be answerable by a human or Advisor Agent.

WRONG:  "What should the form look like?"
RIGHT:  "Should the email field use type='email' or type='text' with regex validation?"

---

## Pre-acceptance checklist

Before marking STATUS: ACCEPTED:
- [ ] Section 1: single-sentence output description
- [ ] Section 2: at least 2 items in each scope list
- [ ] Section 3: feature AC IDs listed match decomposition.md
- [ ] Section 4: dependencies explicitly stated (or NONE)
- [ ] Section 5: interface fully specified for artefact type
- [ ] Section 6: constraints filtered from AGENTS.md (not full copy)
- [ ] Section 7: 3–5 high-level success criteria
- [ ] Section 8: open questions is empty OR questions surfaced for resolution

IF any check fails: resolve before handoff to Write Task AC agent.
