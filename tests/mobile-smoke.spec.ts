import { expect, test } from '@playwright/test';

test.describe('mobile smoke', () => {
    test('navigates key routes on a mobile device profile', async ({
        page,
    }) => {
        await page.goto('/planit/');

        await expect(
            page.locator('[data-component="LandingNav"]')
        ).toBeVisible();

        await page.goto('/planit/plan');
        await expect(page.locator('[data-page="plan"]')).toBeVisible();
        await expect(
            page.locator('[data-component="ConsoleNav"]')
        ).toBeVisible();

        await page.click('[data-console-link="search"]');
        await expect(page).toHaveURL(/\/planit\/search$/);
        await expect(page.locator('[data-page="search"]')).toBeVisible();
    });
});
