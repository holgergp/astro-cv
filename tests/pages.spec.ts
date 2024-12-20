import { test, expect, } from '@playwright/test';
import percySnapshot from "@percy/playwright";

test.describe('navigation', () => {
  ['career', 'buzzwords', 'publications', 'certifications', 'projects'].forEach((pageName) => {
    test(`navigate to ${pageName}`, async ({ page, browserName }) => {
      await page.goto(`/${pageName}`);

      await expect(page).toHaveTitle(/Holger/);
      await percySnapshot(page, `navigate to ${pageName} with ${browserName}`);
    });
  });

  test(`navigate to homepage`, async ({ page, browserName }) => {
    await page.goto(`/`);

    await expect(page).toHaveTitle(/Holger/);
    await percySnapshot(page, `navigate to / with ${browserName}`);
  });

  test(`navigate to 404`, async ({ page, browserName }) => {
    await page.goto(`/notthere`);

    await expect(page).toHaveTitle(/Holger/);
    await percySnapshot(page, `navigate to /404 with ${browserName}`);
  });
});


