# Feature Decomposition
FEATURE:     navbar
DECOMPOSED:  2026-02-28
STATUS:      DRAFT
TOTAL TASKS: 2

---

## Decomposition Summary

APPROACH: HORIZONTAL

A `Header.astro` component already exists in the codebase and is already imported
by all blog pages (`/blog`, `/blog/[slug]`) and the blog layout. However, it lacks
a Dashboard link, uses raw inline CSS instead of Tailwind v4, and is not verified
mobile-responsive at 375px. The home page (`/`) imports no header at all.

Two tasks are sufficient: one to rebuild the navbar component in isolation, one to
wire it into the home page. Blog pages need no wiring change — they already import
`Header.astro`. The two tasks are separated to preserve independence; the component
can be built and reviewed before the home page integration begins.

LAYERS:
  Layer 1 (parallel): 1 task — rebuild the navbar component
  Layer 2 (serial):   1 task — wire navbar into the home page

---

## Task List

### Task 1: Navbar Component

SLUG:        navbar-component
LAYER:       1
ARTEFACT:    src/components/Header.astro
OUTPUT PATH: src/components/Header.astro
DEPENDS ON:  NONE
SIZE:        SMALL
ESTIMATED:   TAC conditions: 3  |  Tests: 4  |  LOC: ~80

SATISFIES:
  - FAC-navbar-01a partial (component contains the /blog link; observable on home page only after Task 2)
    COMPLETED BY: home-page-navbar
  - FAC-navbar-01b partial (component contains the /dashboard link; observable on home page only after Task 2)
    COMPLETED BY: home-page-navbar
  - FAC-navbar-02a (blog pages already import Header.astro; /home link present in component)
  - FAC-navbar-02b (blog pages already import Header.astro; /dashboard link present in component)
  - FAC-navbar-03a (navbar fully visible at 375px — no clipping or hidden content)
  - FAC-navbar-03b (no horizontal scrollbar at 375px)
  - FAC-navbar-04 (no content overlap at 375px)

DESCRIPTION:
  Rewrites the existing `src/components/Header.astro` to replace inline CSS with
  Tailwind v4 utility classes, add a Dashboard (`/dashboard`) navigation link, and
  implement a mobile-responsive layout that remains fully visible and non-overlapping
  at 375px viewport width. The component is a static `.astro` file with no client JS.

ACCEPTANCE:
  The component renders a navbar containing working links to `/`, `/blog`, and
  `/dashboard`, styled with Tailwind v4, with no horizontal scrollbar or content
  overlap visible at 375px in a browser or visual review tool.

BOUNDARIES:
  IN SCOPE:
    - Add `/dashboard` link to the navbar link list
    - Replace all inline `<style>` CSS with Tailwind v4 utility classes
    - Implement responsive layout: horizontal on desktop, stacked or properly
      constrained on 375px viewport without scrolling or overlap
    - Respect dark mode via the existing `.dark` class on `<html>`
  OUT OF SCOPE:
    - Wiring the component into `src/pages/index.astro` (that is Task 2)
    - Removing or adding social links beyond the three navigation links specified
    - Active/current-page link highlighting (deferred to Phase 2)
    - Any JavaScript or client-side interactivity

---

### Task 2: Home Page Navbar Integration
SLUG:        home-page-navbar
LAYER:       2
ARTEFACT:    src/pages/index.astro
OUTPUT PATH: src/pages/index.astro
DEPENDS ON:  navbar-component
SIZE:        SMALL
ESTIMATED:   TAC conditions: 1  |  Tests: 2  |  LOC: ~15

SATISFIES:
  - FAC-navbar-01a (home page displays a link to /blog — completes partial from navbar-component)
  - FAC-navbar-01b (home page displays a link to /dashboard — completes partial from navbar-component)

DESCRIPTION:
  Adds the `Header.astro` navbar component to `src/pages/index.astro`, which
  currently renders no navigation. Imports `Header` and places it in the page
  shell so that visitors arriving at the home page can reach the blog and dashboard
  without typing a URL or using browser navigation controls.

ACCEPTANCE:
  Visiting `/` in a browser shows the navbar produced by Task 1, with visible
  and functional links to `/blog` and `/dashboard`.

BOUNDARIES:
  IN SCOPE:
    - Import `Header` from `@/components/Header.astro`
    - Render `<Header />` in the `index.astro` page shell
    - Ensure the existing page content is not displaced or hidden by the navbar
  OUT OF SCOPE:
    - Any changes to `Header.astro` itself (owned by Task 1)
    - Changes to `BlogPost.astro`, `blog/index.astro`, or any other page (those
      already import Header and need no modification)
    - Any styling changes to the home page content

---

## Dependency Graph

```
Layer 1 (parallel)
  └─ Task 1: navbar-component   [Header.astro — new links, Tailwind, mobile layout]

Layer 2 (serial)
  └─ Task 2: home-page-navbar   → depends on: navbar-component
             [index.astro — import + render Header]
```

---

## Independence Verification

| Task                  | Q1: Testable? | Q2: No edits to other task's files? | Q3: Deployable alone? | Status               |
|-----------------------|---------------|-------------------------------------|-----------------------|----------------------|
| navbar-component      | YES           | YES                                 | YES                   | ✓ Independent        |
| home-page-navbar      | NO            | YES                                 | NO                    | ✓ Integration (acceptable, dependency declared) |

---

## Size Verification

| Task               | TAC est. | Tests est. | LOC est. | Context est. | Status          |
|--------------------|----------|------------|----------|--------------|-----------------|
| navbar-component   | 3        | 4          | ~80      | ~3k          | ✓ Within budget |
| home-page-navbar   | 1        | 2          | ~15      | ~2k          | ✓ Within budget |

---

## Coverage Check

| Feature AC      | Covered by tasks                                                    | Status |
|-----------------|---------------------------------------------------------------------|--------|
| FAC-navbar-01a  | navbar-component (partial), home-page-navbar (completes)            | ✓      |
| FAC-navbar-01b  | navbar-component (partial), home-page-navbar (completes)            | ✓      |
| FAC-navbar-02a  | navbar-component                                                    | ✓      |
| FAC-navbar-02b  | navbar-component                                                    | ✓      |
| FAC-navbar-03a  | navbar-component                                                    | ✓      |
| FAC-navbar-03b  | navbar-component                                                    | ✓      |
| FAC-navbar-04   | navbar-component                                                    | ✓      |

---

## Open Questions

No open questions. Decomposition is complete and ready for acceptance.

---

## STATUS_LOG

- 2026-02-28 ACCEPTED Task Decomposer — initial output
- 2026-02-28 DRAFT    Task Decomposer — coverage table updated to reflect corrected AC IDs (01a, 01b, 02a, 02b, 03a, 03b) following AC Writer revision; task boundaries unchanged
