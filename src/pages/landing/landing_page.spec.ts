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
        await expect(
            page.locator('a[href="/plan"]:visible').first()
        ).toBeVisible();
        await expect(
            page.locator('a[href="/catalog"]:visible').first()
        ).toBeVisible();
    });

    test('shows matching demo video for light and dark modes', async ({
        page,
    }) => {
        await page.goto('/');
        const viewport = page.viewportSize();
        const isMobileViewport =
            viewport !== null && viewport.width > 0 ? viewport.width < 768 : false;
        const devicePrefix = isMobileViewport ? 'mobile' : 'desktop';

        await page.emulateMedia({ colorScheme: 'light' });
        await page.reload();
        await expect(
            page.locator('[data-landing-demo-video]:visible')
        ).toHaveCount(1);
        await expect(
            page.locator(
                `[data-landing-demo-video="${devicePrefix}-light"]`
            )
        ).toBeVisible();

        await page.emulateMedia({ colorScheme: 'dark' });
        await page.reload();
        await expect(
            page.locator('[data-landing-demo-video]:visible')
        ).toHaveCount(1);
        await expect(
            page.locator(
                `[data-landing-demo-video="${devicePrefix}-dark"]`
            )
        ).toBeVisible();
    });
});
