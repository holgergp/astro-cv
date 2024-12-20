import { test, expect } from '@playwright/test';
import percySnapshot from "@percy/playwright";

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Holger/);
  await percySnapshot(page, 'homepage');
});

