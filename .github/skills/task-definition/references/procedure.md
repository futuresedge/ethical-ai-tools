# Task Spec Writer Procedure
> Load when: executing the task-spec-writer agent
> Replaces the OPERATION section previously in the agent body

---

## Pre-conditions (verify before starting)

- Task slug has been provided at invocation — if not, STOP and ask
- The task directory exists: `.framework/features/[slug]/tasks/[task-slug]/`
  IF absent — STOP. Do not create the directory. Ask the human to initialise it first.
  Rationale: directory creation is setup work, not spec-writing work.
- DEPENDS ON check: if this task declares DEPENDS ON [other-slug], confirm that
  `.framework/features/[slug]/tasks/[other-slug]/task-spec.md` exists before proceeding.
  Exception: DEPENDS ON NONE — always safe to proceed.

---

## Execution steps

1. Load own task entry from decomposition.md — the entry matching the invocation slug only.
   Do not read any sibling task entries.

2. From acceptance-criteria.md — extract only the FAC IDs listed in SATISFIES for this task.
   Do not load other criteria.

3. From AGENTS.md — extract only the constraints relevant to this task's artefact type.
   (e.g. Astro component constraints for Header.astro; do not load React-specific constraints
   for a static Astro file.)

4. Search the codebase as needed to verify dependency assumptions declared in the
   decomposition entry (e.g. confirm an import exists before stating it as a dependency in Section 4).
   Document what you found and where.

5. Apply task-spec-template.md — fill all 8 sections.
   Sections 2 (Description) and 3 (Acceptance) must be copied verbatim from decomposition.md.
   Do not rewrite or summarise them.

6. Apply task-definition-checklist.md — all items must pass before writing.
   If any item fails, STOP. Do not write a partial spec. Surface the gap.

7. Write task-spec.md to: `.framework/features/[slug]/tasks/[task-slug]/task-spec.md`
   STATUS: DRAFT

---

## Traps to avoid

- Adding scope items not in decomposition.md BOUNDARIES — do not expand scope
- Guessing an interface when it cannot be determined from the artefact type — STOP and raise uncertainty
- Marking STATUS: ACCEPTED — that is the Task Spec Reviewer's role
- Omitting Section 5 (Interface) — even if interface is NONE, state it explicitly
