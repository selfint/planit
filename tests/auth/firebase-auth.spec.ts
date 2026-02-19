import { expect, test } from '@playwright/test';

test.describe('firebase auth emulator flow', () => {
    test('logs in and logs out from console nav', async ({ page }) => {
        await page.goto('plan');

        const loginButton = page.locator('[data-login]');
        const logoutButton = page.locator('[data-logout]');

        await expect(loginButton).toBeVisible();
        await expect(logoutButton).toBeHidden();

        await loginButton.click();

        await expect(logoutButton).toBeVisible();
        await expect(loginButton).toBeHidden();

        await logoutButton.click();

        await expect(loginButton).toBeVisible();
        await expect(logoutButton).toBeHidden();
    });
});
