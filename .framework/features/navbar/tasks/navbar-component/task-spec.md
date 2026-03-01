# Task Spec
TASK:        navbar-component
FEATURE:     navbar
CREATED:     2026-03-01
STATUS:      ACCEPTED

FROM:        .framework/features/navbar/decomposition.md (Task 1)
DEPENDS ON:  NONE

---

## 1. What This Task Produces

A rewritten `Header.astro` static navbar component that replaces inline CSS with Tailwind
v4 utilities, adds a `/dashboard` navigation link, and remains fully visible and non-overlapping
at a 375px viewport width.

OUTPUT: src/components/Header.astro
TYPE:   Astro component (static — no `client:` directive on the component itself)

---

## 2. Scope

IN SCOPE:
- Add a `/dashboard` link to the navbar link list (alongside existing `/`, `/blog`)
- Replace all `<style>` block inline CSS with Tailwind v4 utility classes
- Implement a responsive layout: horizontal on desktop; on 375px viewport, all navbar content
  fits within the viewport width with no horizontal scrollbar and no vertical overlap
  with page content below the navbar
- Respect dark mode via the existing `.dark` class on `<html>` (use `dark:` Tailwind variants)

OUT OF SCOPE:
- Wiring the component into `src/pages/index.astro` (Task 2: home-page-navbar)
- Removing or adding social links beyond the three navigation links specified (`/`, `/blog`, `/dashboard`)
- Active/current-page link highlighting (deferred to Phase 2)
- Any JavaScript or client-side interactivity added to the navbar itself
- Changes to `BlogPost.astro`, `src/pages/blog/index.astro`, or any other page that already
  imports `Header.astro` — those imports need no modification

---

## 3. Parent Feature Context

FEATURE AC SATISFIED:
  - FAC-navbar-01a: (partial) Component contains a `/blog` link; fully observable on home page only after Task 2
  - FAC-navbar-01b: (partial) Component contains a `/dashboard` link; fully observable on home page only after Task 2
  - FAC-navbar-02a: `/` link present in component; blog pages already import `Header.astro`
  - FAC-navbar-02b: `/dashboard` link present in component; blog pages already import `Header.astro`
  - FAC-navbar-03a: Navbar fully visible at 375px with no part clipped or hidden
  - FAC-navbar-03b: No horizontal scrollbar present at 375px
  - FAC-navbar-04: Navbar does not overlap page content at 375px

FROM decomposition.md:

  DESCRIPTION:
    Rewrites the existing `src/components/Header.astro` to replace inline CSS with
    Tailwind v4 utility classes, add a Dashboard (`/dashboard`) navigation link, and
    implement a mobile-responsive layout that remains fully visible and non-overlapping
    at 375px viewport width. The component is a static `.astro` file with no client JS.

  ACCEPTANCE:
    The component renders a navbar containing working links to `/`, `/blog`, and
    `/dashboard`, styled with Tailwind v4, with no horizontal scrollbar or content
    overlap visible at 375px in a browser or visual review tool.

---

## 4. Dependencies

DEPENDS ON TASKS:
  NONE

EXTERNAL DEPENDENCIES:
  - Tailwind v4 via `@tailwindcss/vite` — already configured; no `tailwind.config.js`; theme tokens in `src/styles/global.css`
  - `SITE_TITLE` constant from `@/consts` — already imported by the existing component
  - `HeaderLink.astro` — already exists at `src/components/HeaderLink.astro`; reused without modification
  - `ModeToggle` React component (`src/components/ModeToggle.tsx`) — already in place; retains its `client:load` directive

---

## 5. Interface Specification

ARTEFACT TYPE: Astro component

PROPS: None — `Header.astro` accepts no external props. It is self-contained.

SLOTS: None

INTERNAL REFERENCES:
  - `SITE_TITLE`: string — imported from `@/consts`; rendered as site logo/wordmark
  - `HeaderLink`: Astro component — imported from `@/components/HeaderLink.astro`;
    renders each navigation anchor with active-state awareness
  - `ModeToggle`: React component — imported from `@/components/ModeToggle`;
    rendered with `client:load`; placed in the trailing section of the navbar

NAV LINKS (ordered):
  - `href="/"` label `Home`
  - `href="/blog"` label `Blog`
  - `href="/dashboard"` label `Dashboard`

SOCIAL LINKS (retained — removal is out of scope per decomposition BOUNDARIES):
  - Mastodon icon anchor — `href="https://m.webtoo.ls/@astro"`, `target="_blank"`, SVG preserved verbatim
  - Twitter icon anchor — `href="https://twitter.com/astrodotbuild"`, `target="_blank"`, SVG preserved verbatim
  - GitHub icon anchor — `href="https://github.com/withastro/astro"`, `target="_blank"`, SVG preserved verbatim
  NOTE: All wrapper (`<div class="social-links">`) and anchor CSS must be migrated to Tailwind v4
  utility classes as part of the full `<style>` block replacement (IN SCOPE item 2).

---

## 6. Constraints

STACK:
  - Astro 5 `.astro` component — static render, no `client:` directive on this component
  - TypeScript strict mode — `interface Props {}` must be declared in frontmatter even if empty
  - Tailwind v4 — no `tailwind.config.js`; utilities applied via class attributes only;
    dark mode via `dark:` variant (`.dark` class on `<html>` set by inline script)
  - `@/` path alias for all internal imports
  - No custom `<style>` blocks — all styling via Tailwind utility classes
  - `lucide-react` is the only allowed icon library if any icons are added
  - Do not edit files in `src/components/ui/` directly

PERFORMANCE:
  - Zero additional client JS introduced by this component
  - Existing `ModeToggle` with `client:load` is retained as-is

ACCESSIBILITY:
  - Standard WCAG 2.1 AA: nav landmark (`<nav>`), descriptive link text, `sr-only` for
    any icon-only elements

---

## 7. Success Criteria (high-level)

DONE WHEN:
- `Header.astro` renders three navigation links: `/` (Home), `/blog` (Blog), `/dashboard` (Dashboard)
- The component contains no `<style>` block — all visual styling is expressed as Tailwind v4 utility classes
- At 375px viewport width, the navbar is fully visible with no horizontal scrollbar and no overlap with page content below it
- Dark mode renders correctly when `.dark` is present on `<html>` (text and background colours invert as expected)
- Blog pages (`/blog`, `/blog/[slug]`) continue to render the navbar without any changes to their import statements

---

## 8. Open Questions

VERIFIED:
  1. Both `src/layouts/BlogPost.astro` and `src/pages/blog/index.astro` already import
     `Header.astro`. No rewiring required. Confirmed by codebase inspection 2026-03-01.
  2. Social icon links (Mastodon, Twitter, GitHub) must be retained — decomposition
     BOUNDARIES explicitly places removal OUT OF SCOPE. Their wrapper CSS must be
     migrated to Tailwind as part of the full `<style>` block replacement.
     Both dispositions documented in Section 5.

No open questions. Task is ready for AC writing.
