# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal CV website built with Astro, based on the AstroPaper template. It's deployed to statichost.eu at https://cv.grosse-plankermann.com (backed by https://holgergp-cv.statichost.page/).

## Development Commands

```bash
# Development
npm run dev              # Start dev server at localhost:4321
npm run build            # Build production site (runs typecheck and astro build)
npm run typecheck        # astro check + tsc --noEmit
npm run preview          # Preview production build locally

# Code Quality
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run lint             # Run ESLint

# Testing
npm run test:e2e                     # Run Playwright E2E tests (screenshot comparisons skipped locally)
npm run test:e2e:container           # Run them in the CI container, including screenshots (podman or docker)
npm run test:e2e:update-screenshots  # Regenerate screenshot baselines in the CI container

# Other
npm run sync             # Generate TypeScript types for Astro modules
npm run cz               # Commit with commitizen (conventional commits)
```

## Architecture

### Content Collections

The site uses Astro Content Collections (defined in `src/content.config.ts`, each with a `glob()` loader and a Zod 4 schema from `astro/zod`) for structured data:

- **frontpage**: JSON data for personal info (name, contact, address, etc.)
- **career**: JSON array of career items with date ranges, company, role, description
- **buzzwords**: JSON array of skill categories with buzzword lists
- **publications**: JSON array of publications with date, source, title, link
- **certifications**: JSON array of certifications
- **projects**: JSON array of project items with date ranges, roles, and buzzwords

All collection data lives in `src/content/[collection-name]/` directories, one JSON file per collection. Read it with `getCollection(...)` / `getEntry(...)`; the entry id is the file name without extension.

### Pages Structure

Main pages are in `src/pages/`:
- `index.astro` - Homepage
- `career.astro` - Career history
- `projects.astro` - Project portfolio
- `publications.astro` - Publications list
- `certifications.astro` - Certifications list
- `buzzwords.astro` - Skills/technologies

### Layouts

Two layouts in `src/layouts/`:
- `Layout.astro` - Base layout with HTML structure
- `PageLayout.astro` - Page layout with header, breadcrumbs and footer

### Configuration

- **Site config**: `src/config.ts` - Site metadata, author info, social links
- **Astro config**: `astro.config.ts` - Integrations (Sitemap), Tailwind Vite plugin, `@styles` alias, `compressHTML: true` (Astro 7's `"jsx"` default drops whitespace between inline elements, e.g. in the breadcrumbs)
- **Tailwind config**: Tailwind CSS v4 via `@tailwindcss/vite`, configured CSS-first in `src/styles/base.css` (`@theme` block with CSS variable-based "skin" tokens)

### Styling Approach

The site uses a custom theming system via Tailwind CSS v4 with CSS variables. The light/dark RGB triplets live in `:root`/`html[data-theme]`, and the `@theme` block in `src/styles/base.css` maps them to per-utility tokens (`--text-color-skin-*`, `--background-color-skin-*`, ...), applied via classes like `text-skin-base`, `bg-skin-fill`, `bg-skin-inverted/50`. This enables easy theme switching while maintaining a single color definition source.

Component `<style>` blocks that use `@apply` must start with `@reference "@styles/base.css";`, declare `@layer theme, base, components, utilities;`, and wrap their rules in `@layer components { ... }`. Tailwind resolves `@styles/...` through the explicit `resolve.alias` in `astro.config.ts` (it does not see Vite 8's tsconfig paths), so keep that alias when touching the config. Without the layer, unlayered component CSS overrides Tailwind utility classes (v4 utilities live in cascade layers); without the order statement, a component stylesheet loaded first would put `components` below `base`/preflight.

The JetBrains Mono font is self-hosted via `@fontsource-variable/jetbrains-mono` (imported in `Layout.astro`). Don't load anything from third-party hosts (fonts, scripts, embeds): the privacy policy (`src/pages/datenschutz.astro`) states that none are used, and `tests/legal.spec.ts` fails on any third-party request. Update both if that ever changes.

Note: v4 `space-x-*`/`space-y-*` use zero-specificity `:where()` selectors, so inside `.prose` the typography margins win; use the `!` suffix or explicit margins there.

### Build Process

The build command (`npm run build`) runs two steps:
1. `npm run typecheck` - `astro check` (Astro + TypeScript validation) and `tsc --noEmit` (also reports `tsconfig.json` errors such as deprecated options, which `astro check` does not)
2. `astro build` - Build to `./dist/` (HTML is compressed via `compressHTML`, CSS/JS minified by Vite)

Images shown on pages live in `src/assets/` and are rendered with `<Picture>`/`<Image>` from `astro:assets`, which generates resized AVIF/WebP variants at build time. Files in `public/` are served as-is (only use it for files that need a fixed URL, e.g. favicons, the OG image, the CV PDFs).

### Testing

E2E tests use Playwright with a single chromium browser configuration. Tests are in `tests/` directory and run against the preview server on `127.0.0.1` ("localhost" resolves to `::1` in the CI container).

Visual regression testing uses Playwright's `toHaveScreenshot()` in `tests/pages.spec.ts`: every page in light/dark at 1280px and 390px, with baselines in `tests/screenshots/`. Baselines must be rendered in the same `mcr.microsoft.com/playwright` container image CI uses (local browsers differ by a few anti-aliased pixels), so `ignoreSnapshots` skips the comparisons outside CI. After an intended visual change, update the baselines with `npm run test:e2e:update-screenshots` or run the **Update Screenshots** workflow on the PR branch (Actions → Run workflow). The workflow commits the new baselines and then starts the CI and Playwright workflows via `workflow_dispatch`, because pushes made with `GITHUB_TOKEN` don't trigger workflows.

## Key Dependencies

- **Astro 7.x** - Core framework (needs Node >= 22.23.4)
- **Tailwind CSS** - Styling with custom theme system
- **Playwright** - E2E testing

## Dependency Versions

- **Always use pinned, exact versions** in `package.json` (e.g. `"tailwindcss": "4.3.3"`), never ranges like `^4.3.3` or `~4.3.3`.
- Install new packages with `npm install --save-exact` (or `-E`).
- Node.js is pinned in `.nvmrc` (currently 24.22.1); Netlify and the GitHub workflow read it.
- Some tools (e.g. `@tailwindcss/upgrade`, `astro add`) write caret ranges, so check `package.json` afterwards and pin them.
- Prettier plugins are loaded only via `plugins` in `.prettierrc`. Don't pass `--plugin=...` on the command line: it replaces that list, which silently disabled `prettier-plugin-tailwindcss` (class sorting) until 2026-10.
- `prettier-plugin-tailwindcss` 0.8.x once corrupted `.astro` files (replaced them with `<object></object>`) with prettier 3.6; with prettier 3.9.10 it formats identically to 0.7.4. Still dry-run prettier on a copy after bumping prettier or its plugins, since the lint-staged hook runs `prettier --write`.

## Git Workflow

- Uses Husky for git hooks
- Lint-staged runs Prettier on staged files before commit
- Commitizen configured for conventional commits (use `npm run cz`)
- Main branch: `main`
- **Branch protection on `main`**: changes go through PRs; the `build`, `lint` and `format` jobs of `.github/workflows/ci.yml` are required status checks. Run `npm run build`, `npm run lint` and `npm run format:check` locally before pushing.
- ESLint uses the flat config in `eslint.config.mjs` (lints `.js`/`.mjs` and `.astro` files).
- **Production deployment**: Deploys to statichost.eu via Github webhooks on push/merge to main (hosting in Europe)
- **Preview deployments**: Netlify is still used for PR preview deployments
