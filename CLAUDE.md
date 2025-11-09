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
- **Tailwind config**: `tailwind.config.cjs` - Custom theme with CSS variable-based "skin" tokens for theming

### Styling Approach

The site uses a custom theming system via Tailwind CSS with CSS variables. Colors are abstracted using the `withOpacity` helper function and applied via classes like `text-skin-base`, `bg-skin-fill`, etc. This enables easy theme switching while maintaining a single color definition source.

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

## Git Workflow

- Uses Husky for git hooks
- Lint-staged runs Prettier on staged files before commit
- Commitizen configured for conventional commits (use `npm run cz`)
- Main branch: `main`
- **Production deployment**: Deploys to statichost.eu via Github webhooks on push/merge to main (hosting in Europe)
- **Preview deployments**: Netlify is still used for PR preview deployments
