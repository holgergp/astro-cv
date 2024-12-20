import { test, expect } from '@playwright/test';
import percySnapshot from "@percy/playwright";

test.describe('navigation', () => {
  test('homepage', async ({ page, browserName }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Holger/);
    await percySnapshot(page, `homepage ${browserName}`);
  });

  test('career', async ({ page, browserName }) => {
    await page.goto('/career');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Holger/);
    await percySnapshot(page, `career ${browserName}`);
  });

  test('buzzwords', async ({ page, browserName }) => {
    await page.goto('/buzzwords');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Holger/);
    await percySnapshot(page, `buzzwords ${browserName}`);
  });

  test('publications', async ({ page, browserName }) => {
    await page.goto('/publications');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Holger/);
    await percySnapshot(page, `publications ${browserName}`);
  });

  test('certifications', async ({ page, browserName }) => {
    await page.goto('/certifications');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Holger/);
    await percySnapshot(page, `certifications ${browserName}`);
  });

  test('projects', async ({ page, browserName }) => {
    await page.goto('/projects');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Holger/);
    await percySnapshot(page, `projects ${browserName}`);
  });
});


