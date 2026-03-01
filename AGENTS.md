# AGENTS.md

> Bootstrap context for AI coding agents working on this repository.
> Read this before making any change. See `.github/copilot-instructions.md`
> for coding standards and framework invariants that apply to every request.

---

## What this project is

An Astro 5 site with two distinct surfaces:

1. **Public blog** — static `.astro` pages, Markdown/MDX content collections,
   zero client JS unless explicitly hydrated.
2. **React admin dashboard** — fully interactive, hydrated with `client:only="react"`,
   uses recharts, TanStack Table, and shadcn/ui primitives.

The two surfaces share a single codebase. Islands architecture means they can
coexist without shipping unnecessary JS to the blog.

**Stack:** Astro 5 · React 18 · TypeScript (strict) · Tailwind v4 · shadcn/ui
(new-york, neutral) · pnpm · Vite · lucide-react

---

## Commands — run these first

```sh
# Install
pnpm install

# Develop (localhost:4321, hot reload)
pnpm dev

# Type-check only (no emit)
pnpm astro check

# Production build → ./dist/
pnpm build

# Preview built site
pnpm preview

# Lint
pnpm lint

# Format
pnpm format
```

> **Before committing:** always run `pnpm astro check` and `pnpm lint`.
> Both must pass clean. Fix errors; do not suppress them.

---

## Testing

No test framework is configured in the starter yet — this is intentional.
Tests will be added incrementally as features are built.

When tests are added, the following conventions will apply:

- **Unit/component tests:** Vitest + Testing Library → `src/**/*.test.ts(x)`
- **Integration/e2e:** Playwright → `tests/`
- Run all: `pnpm test`
- Run single: `pnpm vitest run -t "test name"`
- Coverage: `pnpm test --coverage`

Until a test runner is configured: before submitting any change, run
`pnpm build` and confirm zero type errors from `pnpm astro check`.
That is the current definition of passing.

---

## Project structure

```
src/
  pages/          .astro files — file-based routing
  layouts/        BlogPost.astro wraps all blog content
  components/     .astro (static) and .tsx (React islands)
  components/ui/  shadcn/ui primitives — DO NOT edit directly
  content/blog/   Markdown / MDX blog posts
  content.config.ts  Zod schema for all content collections
  data/           JSON files imported directly into React components
  styles/
    global.css    All Tailwind theme tokens under @theme inline
  consts.ts       SITE_TITLE, SITE_DESCRIPTION
  hooks/          React hooks (e.g. use-mobile.ts)

public/           Static assets served at root
dist/             Build output — never edit
.github/
  copilot-instructions.md   Always-on instructions (framework + standards)
  agents/         Custom agent definitions (.agent.md)
  skills/         On-demand agent skill packs (SKILL.md)
  prompts/        Reusable slash-command workflows (.prompt.md)
  instructions/   File-scoped instruction overrides (.instructions.md)
AGENTS.md         This file
```

---

## Code style — non-negotiable rules

### TypeScript
- Strict mode is on. Every props interface must be typed. No `any`.
- Use `@/` path alias for all imports inside `src/`.
  ✅ `import { Button } from '@/components/ui/button'`
  ❌ `import { Button } from '../../components/ui/button'`
- React components: `.tsx`, named exports only.
- Astro components: `.astro`, define `interface Props` in the frontmatter script block.
- No need to `import React` — `jsxImportSource` is set to `react`.

### Styling
- Tailwind v4 — no `tailwind.config.js`. All theme customisation goes in
  `src/styles/global.css` under `@theme inline`.
- shadcn/ui components live in `src/components/ui/`. Add via:
  `pnpm dlx shadcn@latest add <component>`
  Never hand-edit generated shadcn files.
- Icons: `lucide-react` only. No other icon libraries.
- Dark mode: class-based (`.dark` on `<html>`). Use the existing inline script
  pattern — do not introduce `next-themes` toggle logic unless explicitly asked.

### Islands hydration — pick the right directive
- `client:only="react"` — full interactive pages with no static fallback
- `client:visible` — widgets that hydrate when scrolled into view (prefer this)
- `client:idle` — non-critical widgets that hydrate after page load
- No directive — pure `.astro` component, zero JS shipped

### Naming conventions
- Components: `PascalCase` (`BlogCard.tsx`, `DashboardHeader.astro`)
- Hooks: `camelCase` prefixed with `use` (`useMobile.ts`)
- Utilities: `camelCase` (`formatDate.ts`)
- Constants: `UPPER_SNAKE_CASE` in `consts.ts`
- Content collection slugs: `kebab-case`

---

## Working with content collections

```typescript
// Query all blog posts
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');

// Query single post
import { getEntry } from 'astro:content';
const post = await getEntry('blog', 'my-post-slug');
```

The blog collection schema (in `src/content.config.ts`) requires:
`title`, `description`, `pubDate`

Optional: `updatedDate`, `heroImage`

Adding a new collection: add it to `content.config.ts` and export it
from the `collections` object. Do not use `import.meta.glob` directly.

---

## Adding shadcn components

```sh
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add dialog
```

Generated files land in `src/components/ui/`. Do not edit them.
Override behaviour by wrapping, not modifying.

---

## Git workflow

- Branch from `main`. Branch name: `[type]/brief-description`
  Examples: `feat/blog-search`, `fix/dark-mode-flash`, `chore/upgrade-astro`
- Commit message: `[scope] Brief description` (imperative mood)
  Examples: `[blog] Add tag filtering`, `[dashboard] Fix table pagination`
- PR title must match commit format: `[scope] Brief description`
- Required before opening a PR:
  1. `pnpm astro check` — zero errors
  2. `pnpm lint` — zero warnings
  3. `pnpm build` — builds successfully
- Never commit `.env` files, API keys, or secrets.
- Never force-push to `main`.

---

## Boundaries — three-tier rules

### ✅ Always do
- Type all interfaces; never use `any`
- Use `@/` alias for every internal import
- Use `pnpm`, not `npm` or `yarn`
- Run `pnpm astro check` before flagging work as complete
- Use existing shadcn/ui primitives before building new UI from scratch
- Add or update tests for every change once a test runner is configured
- Surface uncertainty early — raise it rather than guessing

### ⚠️ Ask first (confirm before proceeding)
- Adding new dependencies to `package.json`
- Changing `src/content.config.ts` schema (may break existing content)
- Modifying `src/styles/global.css` theme tokens (affects the whole site)
- Changing `astro.config.mjs` integrations or output settings
- Introducing a new top-level directory in `src/`
- Changing dark mode implementation strategy

### 🚫 Never do
- Edit files in `src/components/ui/` directly
- Edit files in `dist/` (build output)
- Commit secrets, `.env` files, or API keys
- Remove a failing test to make the suite pass — raise uncertainty instead
- Use `npm` or `yarn` commands in this repo
- Import React explicitly (it's configured globally)
- Use `tailwind.config.js` — Tailwind v4 config lives in `global.css`

---

## Agentic framework context

This project is a play environment for the **Agentic Development Framework** —
a trust-based multi-agent coordination system. Agents operate in defined zones:

| Zone | What happens here |
|---|---|
| 1 | Idea capture and prioritisation |
| 2 | Feature definition, UI design, acceptance criteria |
| 3 | Task preparation — decomposition, tests, context, publish |
| 4 | Task execution — claim, implement, verify, review |
| 5 | Feature delivery — integration, staging, production |

Each feature implemented in this repo is a test case for the framework itself.
Pay attention to where the process works smoothly and where friction emerges —
that friction is discovery data, not failure.

Framework invariants are in `.github/copilot-instructions.md`.
Agent definitions are in `.github/agents/`.

---

## Common gotchas

- **`pnpm build` fails with type errors** — run `pnpm astro check` first to
  pinpoint the issue. Astro's build output can be verbose; the check output
  is easier to read.
- **Dark mode flash on page load** — the inline `<script is:inline>` in each
  page shell reads `localStorage` and sets `.dark` before paint. If you add a
  new page layout, copy this script block from an existing page layout.
- **shadcn component not found** — run `pnpm dlx shadcn@latest add <name>`.
  The component will appear in `src/components/ui/`.
- **`@/` import not resolving** — check `tsconfig.json` for the path alias.
  It should map `@/*` to `./src/*`.
- **Content collection query returns nothing** — confirm the frontmatter matches
  the Zod schema in `content.config.ts`. Missing required fields cause silent
  omission, not an error.
- **React component not hydrating** — confirm the correct `client:*` directive
  is set on the component in the `.astro` file that imports it.

---

*Last updated: 2026-02-27 · Update this file when commands, structure, or
conventions change. Stale AGENTS.md is worse than no AGENTS.md.*