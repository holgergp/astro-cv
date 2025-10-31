# Cleanup Recommendations

**Generated:** 2025-10-26
**Project:** astro-paper-cv
**Status:** After 1+ year hiatus

## Executive Summary

Your CV website has significant blogging functionality inherited from the AstroPaper template that is completely unused. This cleanup will:
- Reduce bundle size
- Speed up builds
- Simplify maintenance
- Remove ~30+ unused files
- Remove 2 unused dependencies

## Critical Findings

### 1. Entire Blog System (UNUSED) 🔴

The project contains a complete blogging system that is not used anywhere in your CV site.

**Impact:**
- 22 blog posts (unused content)
- 8 utility functions
- 6 components
- 1 content collection schema
- Build processing overhead

#### Blog Content Files to Remove

```bash
# All markdown blog posts (22 files)
rm -rf src/content/blog/
```

**Files:**
- `src/content/blog/*.md` (all 22 markdown files)

#### Blog Utilities to Remove

```bash
# All blog-specific utility functions
rm src/utils/getSortedPosts.ts
rm src/utils/getUniqueTags.ts
rm src/utils/getPostsByTag.ts
rm src/utils/getPagination.ts
rm src/utils/getPageNumbers.ts
rm src/utils/postFilter.ts
rm src/utils/generateOgImages.tsx
rm -rf src/utils/og-templates/
```

**File paths:**
- `src/utils/getSortedPosts.ts:1` - Post sorting by date
- `src/utils/getUniqueTags.ts:1` - Tag extraction
- `src/utils/getPostsByTag.ts:1` - Tag filtering
- `src/utils/getPagination.ts:1` - Pagination logic
- `src/utils/getPageNumbers.ts:1` - Page number calculation
- `src/utils/postFilter.ts:1` - Draft/scheduled post filtering
- `src/utils/generateOgImages.tsx:1` - Dynamic OG image generation
- `src/utils/og-templates/post.tsx:1` - OG image template

#### Blog Components to Remove

```bash
# Unused blog UI components
rm src/components/Search.tsx
rm src/components/Card.tsx
rm src/components/Pagination.astro
rm src/components/Tag.astro
rm src/components/ShareLinks.astro
rm src/components/Datetime.tsx
```

**File paths:**
- `src/components/Search.tsx:1` - Full-text search with Fuse.js
- `src/components/Card.tsx:1` - Blog post card display
- `src/components/Pagination.astro:1` - Page navigation
- `src/components/Tag.astro:1` - Tag badges/links
- `src/components/ShareLinks.astro:1` - Social sharing
- `src/components/Datetime.tsx:1` - Date formatting

#### Content Collection Schema Update

**File:** `src/content/config.ts`

Remove the blog schema:

```diff
- const blog = defineCollection({
-   type: "content",
-   schema: ({ image }) =>
-     z.object({
-       author: z.string().default(SITE.author),
-       pubDatetime: z.date(),
-       modDatetime: z.date().optional().nullable(),
-       title: z.string(),
-       featured: z.boolean().optional(),
-       draft: z.boolean().optional(),
-       tags: z.array(z.string()).default(["others"]),
-       ogImage: image()
-         .refine(img => img.width >= 1200 && img.height >= 630, {
-           message: "OpenGraph image must be at least 1200 X 630 pixels!",
-         })
-         .or(z.string())
-         .optional(),
-       description: z.string(),
-       canonicalURL: z.string().optional(),
-     }),
- });

  export const collections = {
-   blog,
    frontpage,
    career,
    buzzwords,
    publications,
    certifications,
    projects,
  };
```

**File path:** `src/content/config.ts:4-24,105`

### 2. Unused Dependencies 🟡

#### Remove Completely

**@astrojs/rss** (4.0.13)
- Purpose: RSS feed generation for blogs
- Usage: Not used anywhere in codebase
- Impact: ~300KB in node_modules

```bash
npm uninstall @astrojs/rss
```

**fuse.js** (7.1.0)
- Purpose: Fuzzy search library
- Usage: Only used in unused Search.tsx component
- Impact: ~50KB in production bundle
- Note: Remove AFTER removing Search.tsx

```bash
npm uninstall fuse.js
```

#### Consider Removing

**@percy/cli** + **@percy/playwright** (1.31.4 + 1.0.9)
- Purpose: Visual regression testing
- Current usage: GitHub Actions runs Percy snapshots
- Question: Do you actively review Percy diffs? If not, remove these.
- Impact: ~100MB in node_modules, adds 30-60s to CI builds

If unused:
```bash
npm uninstall @percy/cli @percy/playwright
```

Then update `.github/workflows/playwright.yml:23` from:
```yaml
- name: Run Playwright tests
  run: npm run test:e2e:percy
```
to:
```yaml
- name: Run Playwright tests
  run: npm run test:e2e
```

### 3. Configuration Cleanup

#### src/config.ts

Remove blog-specific config:

```diff
  export const SITE: Site = {
    website: "https://cv.grosse-plankermann.com",
    author: "Holger Grosse-Plankermann",
    desc: "The CV of Holger Grosse-Plankermann",
    title: "Holger's CV",
    ogImage: "/assets/holger-og.jpg",
    lightAndDarkMode: true,
-   postPerPage: 3,
-   scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  };
```

**File path:** `src/config.ts:10-11`

#### astro.config.ts

**Consider removing** markdown plugins if you don't use markdown content (check if any of your CV data files use .md):

```diff
  markdown: {
    remarkPlugins: [
-     remarkToc,
-     [
-       remarkCollapse,
-       {
-         test: "Table of contents",
-       },
-     ],
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
```

Also remove the imports:
```diff
- import remarkToc from "remark-toc";
- import remarkCollapse from "remark-collapse";
```

**Only if** you're not using markdown. If you plan to add blog posts later, keep these.

If removed, also uninstall:
```bash
npm uninstall remark-toc remark-collapse
```

**File path:** `astro.config.ts:4-5,19-28`

### 4. Component Cleanup

#### Breadcrumbs Component

**File:** `src/components/Breadcrumbs.astro`

This component has logic for blog routes (`/posts`, `/tags`) that don't exist. Options:
1. **Remove entirely** if not used in CV pages
2. **Simplify** by removing blog-specific logic

Check usage first:
```bash
grep -r "Breadcrumbs" src/pages/
```

If unused, remove:
```bash
rm src/components/Breadcrumbs.astro
```

### 5. Public Folder Cleanup 🟡

**File:** `public/astropaper-og.jpg` (149KB)
- This is the template's default OG image
- You're using `/assets/holger-og.jpg` in config
- **Safe to remove**

```bash
rm public/astropaper-og.jpg
```

**File:** `public/.DS_Store`
- macOS system file
- Should be gitignored

```bash
rm public/.DS_Store
echo ".DS_Store" >> .gitignore
```

### 6. Script Cleanup

#### package.json

Consider removing unused scripts:

```diff
  "scripts": {
    "dev": "astro dev",
-   "start": "astro dev",  // Duplicate of "dev"
    "build": "astro check && astro build && jampack ./dist",
    "preview": "astro preview",
    "sync": "astro sync",
    "astro": "astro",
    "format:check": "prettier --check . --plugin=prettier-plugin-astro",
    "format": "prettier --write . --plugin=prettier-plugin-astro",
    "cz": "cz",
    "prepare": "husky install",
    "lint": "eslint .",
    "test:e2e": "playwright test",
-   "test:e2e:percy": "percy exec -- playwright test"  // If removing Percy
  }
```

**File path:** `package.json:6,17`

## Cleanup Checklist

Use this checklist to track your cleanup:

- [ ] **Backup** - Create a git branch for this cleanup
- [ ] Remove `src/content/blog/` directory (22 files)
- [ ] Remove 8 blog utility files in `src/utils/`
- [ ] Remove 6 blog components in `src/components/`
- [ ] Update `src/content/config.ts` - remove blog schema
- [ ] Update `src/config.ts` - remove blog config
- [ ] Uninstall `@astrojs/rss`
- [ ] Uninstall `fuse.js`
- [ ] Remove `public/astropaper-og.jpg`
- [ ] Remove `public/.DS_Store` and update `.gitignore`
- [ ] **If removing Percy**: Uninstall Percy packages
- [ ] **If removing Percy**: Update GitHub Actions workflow
- [ ] **If not using markdown**: Remove remark plugins and uninstall packages
- [ ] Run `npm run build` to verify everything still works
- [ ] Run `npm run test:e2e` to verify tests pass
- [ ] Commit changes with descriptive message

## Estimated Impact

**Before cleanup:**
- node_modules: ~500MB
- Build time: ~30-40s (including jampack)
- Dist size: 11MB → 2.73MB (after jampack)
- Total files in src/: ~60+

**After cleanup:**
- node_modules: ~450MB (-50MB)
- Build time: ~25-35s (-5-10s due to fewer files to process)
- Dist size: Similar (2.73MB) - blog content wasn't deployed anyway
- Total files in src/: ~30 (-30+ files)

**CI Impact (if removing Percy):**
- GitHub Actions time: -30-60s per run
- Cleaner test output

## Safe Cleanup Commands

Run these commands in order:

```bash
# 1. Create cleanup branch
git checkout -b cleanup/remove-unused-blog-features

# 2. Remove blog content
rm -rf src/content/blog/

# 3. Remove blog utilities
rm src/utils/getSortedPosts.ts
rm src/utils/getUniqueTags.ts
rm src/utils/getPostsByTag.ts
rm src/utils/getPagination.ts
rm src/utils/getPageNumbers.ts
rm src/utils/postFilter.ts
rm src/utils/generateOgImages.tsx
rm -rf src/utils/og-templates/

# 4. Remove blog components
rm src/components/Search.tsx
rm src/components/Card.tsx
rm src/components/Pagination.astro
rm src/components/Tag.astro
rm src/components/ShareLinks.astro
rm src/components/Datetime.tsx

# 5. Remove unused public files
rm public/astropaper-og.jpg
rm public/.DS_Store

# 6. Uninstall dependencies
npm uninstall @astrojs/rss fuse.js

# 7. Add .DS_Store to .gitignore
echo ".DS_Store" >> .gitignore

# 8. Verify build works
npm run build

# 9. Verify tests pass
npm run test:e2e

# 10. Commit if successful
git add .
git commit -m "chore: remove unused blog functionality

- Remove 22 blog markdown files
- Remove 8 blog utility functions
- Remove 6 blog components (Search, Card, Pagination, Tag, ShareLinks, Datetime)
- Remove blog schema from content collections
- Remove blog config from SITE config
- Uninstall @astrojs/rss and fuse.js
- Remove unused public assets
- Add .DS_Store to .gitignore

This reduces codebase complexity and removes ~30+ unused files inherited from AstroPaper template."
```

## Manual Edits Required

After running the safe commands above, you'll need to manually edit these files:

1. **src/content/config.ts** - Remove blog collection (lines 4-24, 105)
2. **src/config.ts** - Remove `postPerPage` and `scheduledPostMargin` (lines 10-11)
3. **astro.config.ts** - (Optional) Remove remark plugins if not using markdown
4. **package.json** - (Optional) Remove duplicate/unused scripts

See the diff sections above for exact changes.

## Risks & Considerations

**Low Risk:**
- All identified files/features are unused in current deployment
- Content collections are properly separated (blog vs CV data)
- No imports found referencing blog utilities/components

**Medium Risk:**
- If you plan to add a blog in the future, you'll need to re-add these features
- Consider keeping the infrastructure if blogging is on your roadmap

**Recommendation:**
Proceed with cleanup. If you want to blog later, you can:
1. Reference the AstroPaper template again
2. Use your git history to restore features
3. Start fresh with simpler blog implementation

## Next Steps

After cleanup:
1. Review the other two assessment documents:
   - `performance-optimization.md` - Speed up builds and deployments
   - `architecture-security-assessment.md` - Architecture and security review
2. Run the cleanup commands
3. Test thoroughly
4. Deploy to preview environment first
5. Monitor for any issues

## Questions?

If you're unsure about any cleanup steps:
- Create a backup branch first
- Remove items incrementally
- Test after each major change
- Use `git log` to see when features were last used
