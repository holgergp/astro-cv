import { test, expect } from '@playwright/test';

const pages = ['/', '/career/', '/buzzwords/', '/publications/', '/certifications/', '/projects/', '/impressum/', '/datenschutz/'];

test.describe('legal pages', () => {
  [
    { link: 'Imprint/Impressum', path: '/impressum/', heading: 'Impressum' },
    { link: 'Privacy/Datenschutz', path: '/datenschutz/', heading: 'Datenschutzerklärung' },
  ].forEach(({ link, path, heading }) => {
    test(`footer links to ${heading}`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: link }).click();

      await expect(page).toHaveURL(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    });
  });

  pages.forEach((path) => {
    test(`${path} has the legal links in the footer`, async ({ page }) => {
      await page.goto(path);

      const legal = page.getByRole('navigation', { name: 'Legal' });
      await expect(legal.getByRole('link', { name: 'Imprint/Impressum' })).toHaveAttribute('href', '/impressum/');
      await expect(legal.getByRole('link', { name: 'Privacy/Datenschutz' })).toHaveAttribute('href', '/datenschutz/');
    });

    // The privacy policy states that no third-party content (e.g. Google Fonts) is loaded
    test(`${path} makes no third-party requests`, async ({ page, baseURL }) => {
      const origin = new URL(baseURL!).origin;
      const thirdParty: string[] = [];
      page.on('request', (request) => {
        const url = new URL(request.url());
        if (url.protocol.startsWith('http') && url.origin !== origin) {
          thirdParty.push(request.url());
        }
      });

      await page.goto(path, { waitUntil: 'networkidle' });

      expect(thirdParty).toEqual([]);
    });
  });
});
