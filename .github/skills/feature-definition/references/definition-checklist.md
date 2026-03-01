# Feature Definition Checklist
> Applied by: Define Feature agent before marking feature-spec.md as complete
> Gate: feature-spec.md must pass this checklist before handoff to Write Feature AC

---

## Completeness checks

### Problem Statement
- [ ] Written from user perspective — not system perspective
- [ ] Contains no implementation language
- [ ] Identifies a specific user, not "users" generically
- [ ] 2–4 sentences — no more

### Scope
- [ ] At least one IN SCOPE item
- [ ] At least one OUT OF SCOPE item
- [ ] DEFERRED section present (even if empty)
- [ ] No item appears in both IN and OUT SCOPE

### Users and Contexts
- [ ] PRIMARY USER is named specifically (not "the user")
- [ ] CONTEXT describes a real, specific situation
- [ ] GOAL is the user's goal — not the system's goal

### Success Conditions
- [ ] At least 2 success conditions
- [ ] Each is an observable outcome (not a metric, not an implementation detail)
- [ ] Each could become a Given/When/Then AC criterion
- [ ] None repeat the problem statement

### Constraints
- [ ] TECHNICAL section references at least one constraint from AGENTS.md
- [ ] DESIGN section references the design system if UI is involved
- [ ] PERFORMANCE targets are specific (not "fast", "responsive")

### Dependencies
- [ ] DEPENDS ON is explicitly stated (even if NONE)
- [ ] BLOCKS is explicitly stated (even if NONE)

### Open Questions
- [ ] Section is present
- [ ] Each question is specific enough to be answerable
- [ ] No question that could be resolved by reading AGENTS.md
  (those are not open questions — they are missing constraints)

---

## Quality checks

### Signal density
- [ ] No section contains prose that restates another section
- [ ] No rationale for why constraints exist (constraints are stated, not justified)
- [ ] No implementation suggestions or technology choices
  (unless mandated by AGENTS.md — in which case they belong in Constraints)

### Scope discipline
- [ ] The feature solves ONE problem for ONE primary user
- [ ] If two distinct problems are described — this should be two features
- [ ] Success conditions map to the problem statement (not to adjacent problems)

### Downstream readiness
- [ ] A Write Feature AC agent could write AC from this spec without asking questions
- [ ] A Design UI agent could begin UI work from this spec without asking questions
- [ ] IF EITHER IS NO: resolve open questions before marking complete

---

## On failure

IF any check fails:
  DO NOT mark feature-spec.md as complete
  DO NOT hand off to Write Feature AC
  Add failed items to Section 7 (Open Questions) or fix them inline
  Re-run checklist

IF Section 7 contains questions that require human input:
  Surface to Product Owner before proceeding
  Do not attempt to resolve by inference