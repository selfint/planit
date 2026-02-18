import { expect, test } from './helpers/testWithDevState';

test('playwright sanity check', async ({ page }) => {
    await page.setContent('<main><h1>Playwright is ready</h1></main>');

    await expect(
        page.getByRole('heading', {
            name: 'Playwright is ready',
        })
    ).toBeVisible();
});
