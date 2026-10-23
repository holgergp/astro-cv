# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal CV website built with Astro, based on the AstroPaper template. It's deployed to statichost.eu at https://cv.grosse-plankermann.com (backed by https://holgergp-cv.statichost.page/).

## Development Commands

```bash
# Development
npm run dev              # Start dev server at localhost:4321
npm run build            # Build production site (runs astro check, astro build, and jampack)
npm run preview          # Preview production build locally

# Code Quality
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run lint             # Run ESLint

# Testing
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:percy   # Run Playwright tests with Percy visual testing

# Other
npm run sync             # Generate TypeScript types for Astro modules
npm run cz               # Commit with commitizen (conventional commits)
```

## Architecture

### Content Collections

The site uses Astro Content Collections (defined in `src/content/config.ts`) for structured data:

- **blog**: Markdown blog posts with frontmatter (author, pubDatetime, tags, etc.)
- **frontpage**: JSON data for personal info (name, contact, address, etc.)
- **career**: JSON array of career items with date ranges, company, role, description
- **buzzwords**: JSON array of skill categories with buzzword lists
- **publications**: JSON array of publications with date, source, title, link
- **certifications**: JSON array of certifications
- **projects**: JSON array of project items with date ranges, roles, and buzzwords

All collection data lives in `src/content/[collection-name]/` directories as JSON or Markdown files.

### Pages Structure

Main pages are in `src/pages/`:
- `index.astro` - Homepage
- `career.astro` - Career history
- `projects.astro` - Project portfolio
- `publications.astro` - Publications list
- `certifications.astro` - Certifications list
- `buzzwords.astro` - Skills/technologies

### Layouts

Three main layouts in `src/layouts/`:
- `Layout.astro` - Base layout with HTML structure
- `Main.astro` - Main content wrapper
- `PageLayout.astro` - Page-specific layout wrapper

### Configuration

- **Site config**: `src/config.ts` - Site metadata, author info, social links
- **Astro config**: `astro.config.ts` - Integrations (Tailwind, React, Sitemap), markdown plugins (remark-toc, remark-collapse)
- **Tailwind config**: Tailwind CSS v4 via `@tailwindcss/vite`, configured CSS-first in `src/styles/base.css` (`@theme` block with CSS variable-based "skin" tokens)

### Styling Approach

The site uses a custom theming system via Tailwind CSS v4 with CSS variables. The light/dark RGB triplets live in `:root`/`html[data-theme]`, and the `@theme` block in `src/styles/base.css` maps them to per-utility tokens (`--text-color-skin-*`, `--background-color-skin-*`, ...), applied via classes like `text-skin-base`, `bg-skin-fill`, `bg-skin-inverted/50`. This enables easy theme switching while maintaining a single color definition source.

Component `<style>` blocks that use `@apply` must start with `@reference "@styles/base.css";`, declare `@layer theme, base, components, utilities;`, and wrap their rules in `@layer components { ... }`. Without the layer, unlayered component CSS overrides Tailwind utility classes (v4 utilities live in cascade layers); without the order statement, a component stylesheet loaded first would put `components` below `base`/preflight.

Note: v4 `space-x-*`/`space-y-*` use zero-specificity `:where()` selectors, so inside `.prose` the typography margins win; use the `!` suffix or explicit margins there.

### Build Process

The build command (`npm run build`) runs three steps:
1. `astro check` - TypeScript and Astro validation
2. `astro build` - Build to `./dist/`
3. `jampack ./dist` - Optimize the built site (images, HTML, etc.)

### Testing

E2E tests use Playwright with a single chromium browser configuration. Tests are in `tests/` directory and run against the preview server. Percy integration is available for visual regression testing.

## Key Dependencies

- **Astro 5.x** - Core framework
- **Tailwind CSS** - Styling with custom theme system
- **React** - For interactive components (via @astrojs/react)
- **Satori + sharp** - Dynamic OG image generation
- **Fuse.js** - Search functionality
- **Playwright** - E2E testing

## Dependency Versions

- **Always use pinned, exact versions** in `package.json` (e.g. `"tailwindcss": "4.3.3"`), never ranges like `^4.3.3` or `~4.3.3`.
- Install new packages with `npm install --save-exact` (or `-E`).
- Node.js is pinned in `.nvmrc` (currently 24.22.1); Netlify and the GitHub workflow read it.
- Some tools (e.g. `@tailwindcss/upgrade`, `astro add`) write caret ranges, so check `package.json` afterwards and pin them.
- `prettier-plugin-tailwindcss` 0.8.x (with prettier 3.6 + prettier-plugin-astro 0.14) **corrupts `.astro` files** (replaces them with `<object></object>`) and crashes on `.ts`. Stay on 0.7.x until verified; always dry-run prettier on a copy after bumping it, since the lint-staged hook runs `prettier --write`.

## Git Workflow

- Uses Husky for git hooks
- Lint-staged runs Prettier on staged files before commit
- Commitizen configured for conventional commits (use `npm run cz`)
- Main branch: `main`
- **Production deployment**: Deploys to statichost.eu via Github webhooks on push/merge to main (hosting in Europe)
- **Preview deployments**: Netlify is still used for PR preview deployments
