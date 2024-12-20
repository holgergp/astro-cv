import { test, expect, } from '@playwright/test';
import percySnapshot from "@percy/playwright";

test.describe('navigation', () => {
  ['homepage', 'career', 'buzzwords', 'publications', 'certifications', 'projects'].forEach((page) => {
    test(`navigate to ${page}`, async ({ page, browserName }) => {
      await page.goto(`/${page}`);

      await expect(page).toHaveTitle(/Holger/);
      await percySnapshot(page, `navigate to ${page} ${browserName}`);
    });
  });
});


