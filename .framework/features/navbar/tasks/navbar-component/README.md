# Task Directory: navbar-component
TASK:    navbar-component
FEATURE: navbar
LAYER:   1
STATUS:  AWAITING TASK SPEC — Experiment 3

---

## Expected artefacts (pipeline order)

| Artefact | Agent | Status |
|---|---|---|
| task-spec.md | Task Spec Writer | PENDING — Experiment 3 target |
| task-ac.md | Write Task AC agent | NOT STARTED |
| task-tests.md | Write Task Tests agent | NOT STARTED |
| context-package.md | Curate Context agent | NOT STARTED |

---

## Input context for Task Spec Writer

PRIMARY:
  .framework/features/navbar/decomposition.md → Task 1: Navbar Component entry

SATISFIES (from decomposition):
  - FAC-navbar-01a (partial — /blog link present; observable on home page only after Task 2)
  - FAC-navbar-01b (partial — /dashboard link present; observable on home page only after Task 2)
  - FAC-navbar-02a (/home link present in component; blog pages already import Header.astro)
  - FAC-navbar-02b (/dashboard link present; blog pages already import Header.astro)
  - FAC-navbar-03a (navbar fully visible at 375px, no clipping)
  - FAC-navbar-03b (no horizontal scrollbar at 375px)
  - FAC-navbar-04 (no content overlap at 375px)

ARTEFACT TYPE: Astro component (static — no client: directive)
OUTPUT PATH: src/components/Header.astro
ESTIMATED: ~80 LOC | 3 TAC conditions | 4 tests

---

## Reviewer note (carried from decomposition-review.md)

The Task Spec Writer must verify — before writing Section 4 (Dependencies) — that
Blog pages already import Header.astro. Specifically:
  - src/layouts/BlogPost.astro
  - src/pages/blog/index.astro

IF either does not import Header.astro: document as open question in Section 8.
Do not assume the import exists. Search the codebase to confirm.
