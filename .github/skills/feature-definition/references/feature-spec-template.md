# Feature Spec Template
> Produced by: Define Feature agent
> Consumed by: Write Feature AC, Design UI, Decompose to Tasks agents
> Stored at: .framework/features/[slug]/feature-spec.md

---

## Template

```
# Feature Spec
FEATURE:  [feature-slug]
IDEA:     .framework/ideas/[slug]/idea.md
CREATED:  [date]
STATUS:   DRAFT | ACCEPTED | REJECTED | ICED

***

## 1. Problem Statement
> One paragraph. What user problem does this solve?
> Written in user language — no implementation, no solution.

[2–4 sentences maximum]

***

## 2. Scope
> What this feature does and does not do. Both are required.

IN SCOPE:
- [concrete deliverable]
- [concrete deliverable]

OUT OF SCOPE:
- [explicit exclusion]
- [explicit exclusion]

DEFERRED (Phase n):
- [deferred item with phase reference if known]

***

## 3. Users and Contexts
> Who uses this feature, in what context, with what goal.

PRIMARY USER: [actor name]
CONTEXT:      [when/where they encounter this]
GOAL:         [what they are trying to achieve]

SECONDARY USER (if any):
CONTEXT:
GOAL:

***

## 4. Success Conditions
> Observable outcomes that indicate this feature is working.
> Written as present-tense assertions. Not metrics — those are in success-criteria.md.

- [observable outcome]
- [observable outcome]
- [observable outcome]

***

## 5. Constraints
> Non-negotiable constraints the solution must operate within.

TECHNICAL:
- [stack constraint from AGENTS.md relevant to this feature]

DESIGN:
- [design system constraint]

LEGAL / COMPLIANCE (if any):
- [constraint]

PERFORMANCE (if any):
- [specific target, e.g. LCP < 2.5s]

***

## 6. Dependencies
> What must exist or be complete before this feature can be built.

DEPENDS ON: [feature-slug or external dependency, or NONE]
BLOCKS:     [feature-slug that cannot start until this is done, or NONE]

***

## 7. Open Questions
> Unresolved questions that must be answered before AC can be written.
> Each question maps to a potential hotspot in implementation.

- [question]
- [question]

IF NONE: "No open questions. Feature is ready for AC."

```

---

## Filling Rules

SECTION 1 (Problem Statement):
  Start with the user, not the system.
  WRONG: "This feature adds a commissions enquiry form to the site."
  RIGHT: "Venue managers have no direct way to enquire about commissioning artwork
          from the ArtsiX collective. They leave the site without a conversion path."

SECTION 2 (Scope):
  OUT OF SCOPE is mandatory — not optional.
  If you cannot name at least one explicit exclusion, the scope is not defined.
  DEFERRED items prevent scope creep from entering this build.

SECTION 4 (Success Conditions):
  These become the source material for feature AC.
  If a success condition cannot be written as a Given/When/Then — rewrite it.
  They are not metrics. Metrics live in success-criteria.md.

SECTION 5 (Constraints):
  Copy only constraints relevant to this feature from AGENTS.md.
  Do not include the full stack — filter to what affects this feature.

SECTION 7 (Open Questions):
  If questions exist at spec time — they will become AC ambiguities.
  Better to surface them now than discover them during AC writing.
  Questions here trigger early human review before AC is attempted.

STATUS_LOG
  - [ISO date] DRAFT          [agent-name] — initial output
  - [ISO date] ACCEPTED       Product Owner — [optional note]
   Format: - [date] [NEW_STATUS] [actor] — [optional reason]
   Append only. Never delete or overwrite a prior entry.
   Valid transitions: DRAFT → ACCEPTED | RETURNED | REJECTED
                     RETURNED → DRAFT (on revision)