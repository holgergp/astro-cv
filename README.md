# My CV 📄

This is my personal CV website built with Astro and deployed on Netlify.

[![Netlify Status](https://api.netlify.com/api/v1/badges/3b71d2ba-25f4-4dbc-bfff-68389c239307/deploy-status)](https://app.netlify.com/sites/holgergp-cv/deploys)

**[View live site →](https://cv.grosse-plankermann.com)**

## About

I chose Astro for this project because:

- It's the ideal use case for a static CV site
- I wanted to explore the framework
- The layout is based on the [Astro Paper](https://github.com/satnaing/astro-paper) template, which provides a clean, professional design

The site includes:

- **Career history** - Professional experience timeline
- **Projects** - Portfolio of significant projects
- **Publications** - Articles and blog posts
- **Certifications** - Professional certifications
- **Skills/Buzzwords** - Technical skills organized by category

All content is managed through Astro's Content Collections system, stored as JSON files in `src/content/`.

## Tech Stack

- **Framework**: Astro 5.x
- **Styling**: Tailwind CSS with custom theming
- **Deployment**: Netlify (auto-deploys from `main` branch)
- **Content**: Astro Content Collections (JSON-based)
- **Testing**: Playwright E2E tests

## Quick Start

```bash
# Install dependencies
npm install

# Start development server at localhost:4321
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

For detailed development information including:

- Full command reference
- Architecture overview
- Content collections schema
- Testing setup
- Git workflow

See **[CLAUDE.md](./CLAUDE.md)** for comprehensive documentation.

For Astro Paper template documentation including Docker setup, Google Site Verification, and platform-specific notes, see **[astro-cv-docs.md](./astro-cv-docs.md)**.

## Configuration

Site configuration is in `src/config.ts` - update personal info, social links, and site metadata there.

