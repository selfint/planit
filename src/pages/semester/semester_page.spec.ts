import { expect, test } from '@playwright/test';

test.describe('/semester page route', () => {
    test('renders semester route and current semester section', async ({
        page,
    }) => {
        await page.goto('semester');

        await expect(page.getByRole('main')).toBeVisible();
        await expect(
            page.locator('[data-role="current-semester-title"]')
        ).toBeVisible();
    });

    test('supports query-based semester deep link', async ({ page }) => {
        await page.goto('semester?number=3');

        await expect(
            page.locator('[data-role="current-semester-title"]')
        ).toContainText('סמסטר 3');
    });
});
