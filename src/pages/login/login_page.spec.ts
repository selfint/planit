import { expect, test } from '@playwright/test';

test.describe('/login page route', () => {
    test('renders login placeholder page', async ({ page }) => {
        await page.goto('login');

        await expect(page.getByRole('main')).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'עמוד כניסה' })
        ).toBeVisible();
        await expect(page.locator('a[href="/"]').first()).toBeVisible();
    });
});
