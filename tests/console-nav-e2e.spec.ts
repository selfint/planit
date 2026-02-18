import { expect, test } from './helpers/testWithDevState';

test.describe('console navbar navigation', () => {
    test('renders on all console pages and links to target routes', async ({
        page,
    }) => {
        await page.goto('/planit/plan');

        await expect(
            page.locator('[data-component="ConsoleNav"]')
        ).toBeVisible();

        await page.click('[data-console-link="catalog"]');
        await expect(page).toHaveURL(/\/planit\/catalog$/);
        await expect(page.locator('[data-page="catalog"]')).toBeVisible();

        await page.click('[data-console-link="plan"]');
        await expect(page).toHaveURL(/\/planit\/plan$/);
        await expect(page.locator('[data-page="plan"]')).toBeVisible();

        await page.click('[data-console-link="search"]');
        await expect(page).toHaveURL(/\/planit\/search$/);
        await expect(page.locator('[data-page="search"]')).toBeVisible();

        await page.click('[data-console-link="home"]');
        await expect(page).toHaveURL(/\/planit\/?$/);
        await expect(
            page.locator('[data-component="LandingNav"]')
        ).toBeVisible();
        await expect(page.locator('[data-component="ConsoleNav"]')).toHaveCount(
            0
        );
    });

    test('is available on each non-landing route and hidden on 404', async ({
        page,
    }) => {
        const consoleRoutes = [
            '/planit/plan',
            '/planit/catalog',
            '/planit/course?code=236501',
            '/planit/search',
            '/planit/semester',
        ];

        for (const route of consoleRoutes) {
            await page.goto(route);
            await expect(
                page.locator('[data-component="ConsoleNav"]')
            ).toBeVisible();
        }

        await page.goto('/planit/this-route-does-not-exist');
        await expect(page.locator('[data-component="ConsoleNav"]')).toHaveCount(
            0
        );
        await expect(
            page.getByRole('heading', { name: 'העמוד לא נמצא' })
        ).toBeVisible();
    });
});
