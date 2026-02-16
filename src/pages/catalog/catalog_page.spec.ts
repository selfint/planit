import { expect, test } from '@playwright/test';

test.describe('/catalog page route', () => {
    test('renders catalog route and picker section', async ({ page }) => {
        await page.goto('catalog');

        await expect(page.getByRole('main')).toBeVisible();
        await expect(page.locator('[data-degree-catalog]')).toBeVisible();
        await expect(page.locator('[data-catalog-groups]')).toBeVisible();
    });
});
