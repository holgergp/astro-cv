import { test, expect } from '@playwright/test';

const widths = [320, 390, 640, 768, 900, 1023, 1024, 1280, 1440];

test.describe('layout', () => {
  widths.forEach((width) => {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/career/');

      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    });

    test(`header title and nav don't overlap at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/career/');

      const menu = page.locator('#menu-items');
      // Below the desktop breakpoint the nav sits in the collapsed hamburger menu
      test.skip(!(await menu.isVisible()), 'nav collapsed');

      const logo = await page.locator('header .logo').boundingBox();
      const firstLink = await menu.getByRole('link').first().boundingBox();
      const container = await page.locator('header .nav-container').boundingBox();
      const lastItem = await menu.locator('li').last().boundingBox();

      expect(logo!.x + logo!.width).toBeLessThanOrEqual(firstLink!.x);
      expect(lastItem!.x + lastItem!.width).toBeLessThanOrEqual(container!.x + container!.width);
    });
  });
});
