import { expect, test } from '@playwright/test';

test.describe('/404 fallback route', () => {
    test('renders not-found content for unknown route', async ({ page }) => {
        await page.goto('/planit/missing-route');

        await expect(
            page.getByRole('heading', { name: 'העמוד לא נמצא' })
        ).toBeVisible();
        await expect(page.locator('[data-slot="path"]')).toContainText(
            '/missing-route'
        );
        await expect(page.locator('a[href="/"]')).toBeVisible();
    });
});
