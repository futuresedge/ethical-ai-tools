# Feature Spec
FEATURE:  navbar
IDEA:     .framework/ideas/navbar/idea.md
CREATED:  2026-02-28
STATUS:   READY FOR AC

***

## 1. Problem Statement

Visitors arriving at the site — whether on the home page or via a search result landing on a blog post — have no visible way to move to any other section of the site. Every page is an island: there is no shared navigation, no path back to home, and no path forward to the blog or dashboard. Users who want to reach the dashboard must already know the URL.

***

## 2. Scope

IN SCOPE:
- A navigation bar rendered on all non-dashboard pages (`/`, `/blog`, `/blog/[slug]`)
- Navigation links to: Home (`/`), Blog (`/blog`), Dashboard (`/dashboard`)
- Mobile-responsive layout that remains usable at 375px viewport width without horizontal scrolling or content overlap

OUT OF SCOPE:
- Any changes to the dashboard and its existing navigation
- Authentication state or conditional link visibility based on user session
- Search functionality within the navigation
- Sub-navigation or dropdown menus

DEFERRED (Phase 2):
- Active/current-page link highlighting

***

## 3. Users and Contexts

PRIMARY USER: First-time visitor
CONTEXT:      Lands on the home page or a blog post; has no prior knowledge of the site's structure
GOAL:         Discover what the site offers and move to a section that interests them

SECONDARY USER: Blog reader arriving from search
CONTEXT:      Lands directly on a blog post page via a search engine result
GOAL:         Navigate to the rest of the site without using the browser back button

SECONDARY USER: Existing user
CONTEXT:      Reading a blog post and wants to switch to the dashboard, or vice versa
GOAL:         Move between the blog and dashboard without typing a URL

***

## 4. Success Conditions

- A visitor on the home page can reach the blog index and the dashboard via the navbar without typing a URL or using browser navigation controls
- A visitor on any blog page can reach the home page and the dashboard via the navbar without typing a URL or using browser navigation controls
- The navbar is visible and all navigation links are accessible on a 375px-wide viewport without horizontal scrolling or content overlap
- Activating a navbar link to an internal page does not trigger a full browser page reload

***

## 5. Constraints

TECHNICAL:
- Must use the `@/` import alias for all internal imports
- TypeScript strict mode applies; `interface Props` must be defined if props are used

DESIGN:
- Tailwind v4 — all styles via utility classes; no `tailwind.config.js`; theme tokens in `src/styles/global.css` only
- Dark mode: class-based (`.dark` on `<html>`); navbar must respect the existing dark mode implementation
- Icons: `lucide-react` only if icons are used
- shadcn/ui primitives may be used but must not be hand-edited

PERFORMANCE:
- The navbar component must not measurably increase page load time on a standard connection; shipping as a static `.astro` component with no client JS satisfies this constraint

***

## 6. Dependencies

DEPENDS ON: NONE — all target pages (`/`, `/blog`, `/dashboard`) already exist
BLOCKS:     NONE

***

## 7. Open Questions

No open questions. Feature is ready for AC.
