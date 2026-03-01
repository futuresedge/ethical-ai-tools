# Inclusion Criteria
> Specific rules for what belongs in context-package.md.
> Use alongside compression-rubric.md.

---

## Task AC — always included, never modified

INCLUDE: complete task-ac.md
FORMAT:  verbatim — do not summarise, paraphrase, or reorder conditions
REASON:  Task Performer is accountable to these conditions exactly as written
         QA Reviewer will compare output against these conditions exactly as written

---

## Task Tests — always included, never modified

INCLUDE: complete task-tests.md
FORMAT:  verbatim
REASON:  Task Performer must produce output that passes these exact tests
         Modifying tests in context-package creates a version mismatch with QA

---

## UI Artefact — included in part

INCLUDE: sections of ui-artefact.md that apply to this task's scope only
EXCLUDE: sections that apply to other tasks or the feature as a whole
FORMAT:  extract relevant sections — do not include full document
LABEL:   extracted sections clearly: "From ui-artefact.md — [section name]"

IF no section of ui-artefact applies to this task:
  Include one line: "UI artefact: no sections apply to this task's scope."
  Do not include the full document to be safe.

---

## Stack constraints — selectively included

SOURCE: AGENTS.md
INCLUDE: constraints that directly affect this task's output type
  e.g. if task produces a React component: include React version, Tailwind version,
       component conventions, import patterns
EXCLUDE: constraints for technologies not used in this task
  e.g. if task has no database interaction: exclude ORM, migration, query conventions

FORMAT: list only — no prose
  React: 18.x, functional components, strict TypeScript
  Tailwind: 3.x, utility-first, cn() via clsx+tailwind-merge, no inline styles
  Forms: React Hook Form 7 + Zod + @hookform/resolvers/zod

---

## Output path — always included

INCLUDE: exact output path for this task's artefact
FORMAT:
  OUTPUT: src/components/CommissionsForm.tsx
  WRITES TO: .framework/features/commissions/tasks/build-form/proof-of-completion.md

---

## Environment constraints — selectively included

INCLUDE: constraints that affect what the performer can do in this environment
  e.g. available env vars, build tool limitations, test runner requirements
EXCLUDE: environment constraints for other zones or deployment contexts

---

## What is never included

- Feature-level AC or feature-level tests
- feature-spec.md content
- Sibling task files or context packages
- Agent instructions, skill content, or framework rules
- Design rationale or decision history
- Stakeholder context or project background
- Content duplicated from task-ac.md (do not restate AC in prose above the AC)
