import { expect, test } from '@playwright/test';

test.describe('/search page route', () => {
    test('renders search form, filters, and results region', async ({
        page,
    }) => {
        await page.goto('search');

        await expect(page.getByRole('main')).toBeVisible();
        await expect(page.locator('[data-search-form]')).toBeVisible();
        await expect(page.locator('[data-filter-faculty]')).toBeVisible();
        await expect(page.locator('[data-search-results]')).toBeVisible();
    });

    test('keeps query parameter in the input when deep-linked', async ({
        page,
    }) => {
        await page.goto('search?q=104031');

        await expect(page.locator('[data-search-input]')).toHaveValue('104031');
    });
});
