import { expect, test } from '@playwright/test';

test.describe('/ landing page route', () => {
    test('renders hero and navigation actions', async ({ page }) => {
        await page.goto('/');

        await expect(
            page.locator('[data-component="LandingNav"]')
        ).toBeVisible();
        await expect(
            page.locator('[data-component="LandingHero"]')
        ).toBeVisible();
        await expect(page.locator('a[href="/plan"]').first()).toBeVisible();
        await expect(page.locator('a[href="/catalog"]').first()).toBeVisible();
    });
});
