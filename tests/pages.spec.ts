import { test, expect } from '@playwright/test';

const pages = [
  { name: 'home', path: '/' },
  { name: 'career', path: '/career/' },
  { name: 'buzzwords', path: '/buzzwords/' },
  { name: 'publications', path: '/publications/' },
  { name: 'certifications', path: '/certifications/' },
  { name: 'projects', path: '/projects/' },
  { name: 'impressum', path: '/impressum/' },
  { name: 'datenschutz', path: '/datenschutz/' },
  { name: '404', path: '/notthere' },
];

const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
};

// Baselines are rendered in the Playwright container that CI uses; update them
// with `npm run test:e2e:update-screenshots` or the Update Screenshots workflow
for (const [device, viewport] of Object.entries(viewports)) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test.describe(`${device} ${colorScheme}`, () => {
      test.use({ viewport, colorScheme, reducedMotion: 'reduce' });

      pages.forEach(({ name, path }) => {
        test(name, async ({ page }) => {
          await page.goto(path);

          await expect(page).toHaveTitle(/Holger/);
          await expect(page).toHaveScreenshot(`${name}-${device}-${colorScheme}.png`, {
            fullPage: true,
            // The copyright year comes from the build date
            mask: [page.getByText(/Copyright ©/)],
          });
        });
      });
    });
  }
}
