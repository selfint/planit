import { expect, test } from '@playwright/test';

test.describe('/share page route', () => {
    test('renders share and import sections', async ({ page }) => {
        await page.goto('/share');

        await expect(page.getByRole('main')).toBeVisible();
        await expect(page.locator('[data-share-create]')).toBeVisible();
        await expect(page.locator('[data-share-import]')).toBeVisible();
    });
});
