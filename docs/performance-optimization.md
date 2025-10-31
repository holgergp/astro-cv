# Performance & Deployment Optimization

**Generated:** 2025-10-26
**Project:** astro-paper-cv
**Focus:** Speed up builds, CI/CD, and deployments

## Executive Summary

Your CV site currently takes **30-40 seconds to build** and **~60-90 seconds in CI** (including tests). With targeted optimizations, you can reduce this to **~15-25 seconds locally** and **~40-60 seconds in CI**.

**Quick Wins:**
1. Cache node_modules in GitHub Actions (save ~20-30s)
2. Remove Percy visual testing (save ~30-60s) - if not actively used
3. Optimize Playwright config (save ~10-15s)
4. Consider removing jampack (save ~5-10s) - analyze tradeoff

**Current Performance:**
- Local build: ~30-40s
- CI build + test: ~60-90s
- node_modules: ~500MB
- Final bundle: 2.73MB (after jampack optimization)

## 1. GitHub Actions Optimization 🚀

### Current Workflow Analysis

**File:** `.github/workflows/playwright.yml`

**Current flow:**
1. Checkout code (~5s)
2. Setup Node (~5s)
3. Install dependencies (~20-30s) ⚠️
4. Install Playwright browsers (~10-15s) ⚠️
5. Build app (~30-40s)
6. Run tests with Percy (~20-40s) ⚠️
7. Upload artifacts (~5s)

**Total:** ~95-150 seconds

### Optimization 1: Cache Dependencies ⚡

**Impact:** Save ~20-30 seconds per run

Add caching for node_modules and Playwright browsers:

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
        cache: 'npm'  # ⚡ ADD THIS - caches node_modules

    - name: Get Playwright version
      id: playwright-version
      run: echo "version=$(npm list @playwright/test --json | jq -r '.dependencies["@playwright/test"].version')" >> $GITHUB_OUTPUT

    - name: Cache Playwright browsers
      id: playwright-cache
      uses: actions/cache@v4
      with:
        path: ~/.cache/ms-playwright
        key: playwright-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      if: steps.playwright-cache.outputs.cache-hit != 'true'
      run: npx playwright install --with-deps chromium  # Only install chromium

    - name: Build App
      run: npm run build

    - name: Run Playwright tests
      run: npm run test:e2e:percy
      env:
        PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}

    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

**Changes:**
- Added `cache: 'npm'` to setup-node (caches node_modules)
- Added Playwright browser caching
- Install only chromium browser (not all browsers + deps)

**Expected improvement:** 20-30s faster on cache hit

### Optimization 2: Remove Percy (If Unused) ⚡⚡

**Impact:** Save ~30-60 seconds per run

Percy visual regression testing adds significant time. **If you're not actively reviewing Percy diffs, remove it.**

```yaml
    - name: Run Playwright tests
      run: npm run test:e2e  # Changed from test:e2e:percy
      # Remove env section
```

Also in `package.json`:
```diff
  "scripts": {
-   "test:e2e:percy": "percy exec -- playwright test"
  }
```

And uninstall:
```bash
npm uninstall @percy/cli @percy/playwright
```

**Expected improvement:** 30-60s faster

### Optimization 3: Parallel Testing ⚡

**File:** `playwright.config.ts:17,23`

**Current:**
```typescript
fullyParallel: false,
workers: process.env.CI ? 1 : undefined,
```

You only have 7 simple navigation tests. Enable parallelism:

```typescript
fullyParallel: true,
workers: process.env.CI ? 2 : undefined,  // Use 2 workers in CI
```

**Expected improvement:** 10-15s faster (tests run in parallel)

### Optimization 4: Faster Test Timeouts

**File:** `playwright.config.ts:29`

**Current:**
```typescript
webServer: {
  command: 'npm run preview',
  url: 'http://localhost:4321/',
  timeout: 120 * 1000,  // 2 minutes
  reuseExistingServer: !process.env.CI,
},
```

Your CV site is static and starts quickly. Reduce timeout:

```typescript
webServer: {
  command: 'npm run preview',
  url: 'http://localhost:4321/',
  timeout: 30 * 1000,  // 30 seconds is plenty
  reuseExistingServer: !process.env.CI,
},
```

This won't save time on successful runs, but will fail faster if there's an issue.

### Complete Optimized Workflow

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# Cancel in-progress runs when a new run is triggered
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    timeout-minutes: 20  # Reduced from 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
        cache: 'npm'

    - name: Get Playwright version
      id: playwright-version
      run: echo "version=$(npm list @playwright/test --json | jq -r '.dependencies["@playwright/test"].version')" >> $GITHUB_OUTPUT

    - name: Cache Playwright browsers
      id: playwright-cache
      uses: actions/cache@v4
      with:
        path: ~/.cache/ms-playwright
        key: playwright-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      if: steps.playwright-cache.outputs.cache-hit != 'true'
      run: npx playwright install --with-deps chromium

    - name: Build App
      run: npm run build

    - name: Run Playwright tests
      run: npm run test:e2e

    - uses: actions/upload-artifact@v4
      if: failure()  # Only upload on failure
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 7  # Reduced from 30
```

**Additional improvements:**
- Added concurrency cancellation (cancel old runs when new push happens)
- Reduced timeout from 60 to 20 minutes
- Only upload artifacts on failure (saves upload time)
- Reduced artifact retention from 30 to 7 days

**Expected total time after all optimizations:** ~40-60s (down from ~95-150s)

## 2. Build Process Optimization 🏗️

### Current Build Command

**File:** `package.json:7`

```json
"build": "astro check && astro build && jampack ./dist"
```

**Breakdown:**
- `astro check`: ~5-10s (TypeScript + Astro validation)
- `astro build`: ~15-20s (build static site)
- `jampack ./dist`: ~10-15s (optimize images, HTML, CSS)

**Total:** ~30-45s

### Optimization 1: Consider Removing Jampack

**Impact:** Save ~10-15 seconds

Jampack's benefits:
- Image optimization (WebP conversion, compression)
- HTML minification
- CSS optimization
- Resource hints

**Analysis from your build:**
```
Total: 23/32 files optimized
Size reduction: 6.54MB → 2.73MB (-3.81MB)
```

Most savings are from images. But:
- Your CV site is already small
- Netlify provides CDN caching
- Modern browsers handle unoptimized images well

**Recommendation:**
1. **Keep jampack** if you frequently add large images
2. **Remove jampack** if images are stable and you want faster builds

To remove:
```bash
npm uninstall @divriots/jampack
```

Update `package.json`:
```json
"build": "astro check && astro build"
```

**Note:** If you remove jampack, consider optimizing images manually before committing them.

### Optimization 2: Skip Type Checking in CI (Optional)

If you run `npm run lint` locally or in pre-commit hooks, you can skip `astro check` in CI:

```json
"build": "astro build",
"build:check": "astro check && astro build && jampack ./dist",
"build:ci": "astro build && jampack ./dist"
```

Use `build:ci` in GitHub Actions. But this is **risky** - only do this if you have strong local linting.

### Optimization 3: Parallel Build Steps (Advanced)

If you want maximum speed, run check and build in parallel:

```json
"build": "npm-run-all --parallel check build:only --sequential optimize",
"check": "astro check",
"build:only": "astro build",
"optimize": "jampack ./dist"
```

Requires installing `npm-run-all`:
```bash
npm install --save-dev npm-run-all
```

**Expected savings:** ~5s (check and build run in parallel)

## 3. Dependency Optimization 📦

### Audit Current Dependencies

Your project has **38 total dependencies** (dependencies + devDependencies).

Several are unused or oversized:

| Package | Size | Status | Action |
|---------|------|--------|--------|
| @astrojs/rss | ~2MB | Unused | Remove |
| fuse.js | ~100KB | Unused | Remove |
| @percy/cli | ~50MB | Maybe unused | Consider removing |
| @percy/playwright | ~5MB | Maybe unused | Consider removing |
| remark-toc | ~500KB | Rarely used | Consider removing |
| remark-collapse | ~200KB | Rarely used | Consider removing |

See `cleanup-recommendations.md` for detailed removal instructions.

### Optimize Remaining Dependencies

#### Use Workspace-Aware Installation

In CI, use `npm ci` (already doing this ✓):
- Faster than `npm install`
- Uses package-lock.json for deterministic builds
- Cleaner cache invalidation

#### Production Dependencies Check

Ensure no dev dependencies in main bundle:
```bash
npm run build
npx vite-bundle-visualizer dist
```

Your Astro build is already optimized, but this helps identify bloat.

## 4. Deployment Optimization (Netlify) 🌐

### Current Netlify Configuration

You're deploying to Netlify but don't have a `netlify.toml` file. Create one for better control:

**File:** `netlify.toml` (create at project root)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

# Faster builds with caching
[build.processing]
  skip_processing = false

# Cache node_modules between builds
[[plugins]]
  package = "@netlify/plugin-cache"

  [plugins.inputs]
    paths = [
      "node_modules",
      ".npm"
    ]

# Headers for performance
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "interest-cohort=()"

# Cache static assets aggressively
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/android-chrome-*.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/apple-touch-icon.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Don't cache HTML (for updates)
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

# Redirect rules (if needed in future)
# [[redirects]]
#   from = "/old-page"
#   to = "/new-page"
#   status = 301
```

**Benefits:**
1. Explicit Node version (no surprises)
2. Caches node_modules between Netlify builds (~30s savings)
3. Optimized caching headers (faster for users)
4. Security headers

### Alternative: Build Locally & Deploy

For absolute fastest deployments, build locally and deploy only dist:

```bash
# Local script
npm run build
netlify deploy --prod --dir=dist
```

This skips Netlify's build process entirely (~1-2 minute savings).

**Tradeoffs:**
- Manual process (not automated on git push)
- Requires local build (must be on your machine)
- Harder to collaborate

**Recommendation:** Stick with automatic Netlify builds, but add the `netlify.toml` for caching.

## 5. Local Development Optimization 💻

### Astro Dev Server

**Current:** Already optimal for Astro

Astro 5 has excellent dev server performance with HMR (Hot Module Replacement).

### Build Script Alias

Add faster build script for development:

```json
"build:fast": "astro build",
"build:full": "astro check && astro build && jampack ./dist"
```

Use `build:fast` when iterating locally, `build:full` for production.

## 6. Testing Optimization 🧪

### Playwright Configuration

**File:** `playwright.config.ts`

Current setup runs only chromium ✓ (good!)

**Further optimizations:**

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,  // Change from false
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,  // Change from 1
  reporter: process.env.CI ? [['github'], ['html']] : 'html',  // Better CI output

  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321/',
    timeout: 30 * 1000,  // Reduce from 120s
    reuseExistingServer: !process.env.CI,
  },

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',  // Add this
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

**Changes:**
- Parallel test execution
- 2 workers in CI (safe for 7 tests)
- Reduced webServer timeout
- Better CI reporter output
- Screenshots only on failure

## 7. Bundle Size Optimization 📊

### Current Bundle

After jampack: **2.73MB**

**Breakdown (from build output):**
- Images: ~1.5MB (jpg, png, webp)
- JavaScript: ~205KB
- CSS: ~38KB
- HTML: ~160KB
- Other: ~815KB

### Optimizations

#### 1. Image Optimization

Check your images:
```bash
ls -lh public/assets/images/
ls -lh src/assets/images/
```

**Tools to optimize:**
- Use `sharp-cli` to compress images before commit
- Convert large JPEGs to WebP
- Resize images to actual display size

```bash
# Install sharp-cli
npm install -g sharp-cli

# Optimize images
sharp -i public/assets/images/*.jpg -o public/assets/images/ \
  -f webp -q 85 -s
```

#### 2. Font Optimization

**File:** `tailwind.config.cjs:58`

You specify JetBrains Mono font:
```javascript
fontFamily: {
  mono: ["JetBrains Mono", "monospace"],
},
```

If you're loading this via Google Fonts or similar, consider:
- Self-host the font (1 fewer HTTP request)
- Load only used font weights
- Use `font-display: swap`

#### 3. React Bundle Size

You're using React for interactive components. Check if all 4 components need React:

```bash
ls -lh src/components/*.tsx
```

**Files:**
- Search.tsx (UNUSED - remove per cleanup doc)
- Datetime.tsx (UNUSED - remove per cleanup doc)
- Card.tsx (UNUSED - remove per cleanup doc)
- Collapsible.tsx (IN USE)

After cleanup, you'll only have `Collapsible.tsx` using React. Consider:
1. Keep React (if Collapsible needs it)
2. Rewrite Collapsible in vanilla JS/Astro (save ~40KB)

## 8. Monitoring & Metrics 📈

### Add Build Time Tracking

Add timestamps to see where time is spent:

**package.json:**
```json
"scripts": {
  "build": "echo '🔧 Starting build...' && npm run build:time",
  "build:time": "time (astro check && astro build && jampack ./dist)"
}
```

Or use a build timer script:

**scripts/build-with-timing.js:**
```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');

console.time('Total build time');

console.time('astro check');
execSync('astro check', { stdio: 'inherit' });
console.timeEnd('astro check');

console.time('astro build');
execSync('astro build', { stdio: 'inherit' });
console.timeEnd('astro build');

console.time('jampack');
execSync('jampack ./dist', { stdio: 'inherit' });
console.timeEnd('jampack');

console.timeEnd('Total build time');
```

Then:
```json
"build": "node scripts/build-with-timing.js"
```

### Lighthouse CI

Add automated performance monitoring:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  pull_request:
    branches: [ main ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Create `.lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 1
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

This will comment on PRs with performance scores.

## Performance Checklist

- [ ] Add `cache: 'npm'` to GitHub Actions
- [ ] Add Playwright browser caching to GitHub Actions
- [ ] Install only chromium in Playwright setup
- [ ] Enable `fullyParallel: true` in Playwright config
- [ ] Set `workers: 2` for CI in Playwright config
- [ ] Reduce `webServer.timeout` to 30s
- [ ] Add concurrency cancellation to workflow
- [ ] Reduce workflow timeout to 20 minutes
- [ ] Only upload artifacts on failure
- [ ] Reduce artifact retention to 7 days
- [ ] **If removing Percy:** Remove Percy from workflow
- [ ] **If removing Percy:** Uninstall Percy packages
- [ ] Create `netlify.toml` with caching configuration
- [ ] Consider removing jampack (test build time tradeoff)
- [ ] Add build timing script
- [ ] Optimize images in public/assets/
- [ ] **Optional:** Add Lighthouse CI

## Expected Results

### Before Optimizations
- **Local build:** 30-40s
- **GitHub Actions:** 95-150s
- **Netlify deploy:** 60-90s

### After Optimizations
- **Local build:** 20-30s (-10s if removing jampack)
- **GitHub Actions:** 40-60s (with caching, no Percy, parallel tests)
- **Netlify deploy:** 30-50s (with node_modules caching)

**Total time savings per deploy:** ~50-100 seconds

With 5-10 deploys per week, that's **~40-80 minutes saved per month**.

## Trade-offs to Consider

1. **Removing Percy:**
   - Pro: 30-60s faster builds
   - Con: No visual regression testing
   - Recommendation: Remove if you don't review Percy diffs

2. **Removing jampack:**
   - Pro: 10-15s faster builds
   - Con: Larger images, less optimization
   - Recommendation: Keep if you frequently add images

3. **Parallel testing:**
   - Pro: 10-15s faster tests
   - Con: Slightly less deterministic (rare failures)
   - Recommendation: Enable (your tests are simple navigation tests)

4. **Caching in CI:**
   - Pro: 20-30s faster builds
   - Con: Cache invalidation issues (rare)
   - Recommendation: Definitely enable

## Next Steps

1. Implement GitHub Actions optimizations (biggest impact)
2. Create `netlify.toml`
3. Test builds and verify timing improvements
4. Consider removing Percy if unused
5. Monitor build times over next few weeks
6. Fine-tune based on results
