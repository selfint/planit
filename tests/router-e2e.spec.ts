import { expect, test } from './helpers/testWithDevState';

test.describe('SPA router behavior', () => {
    test('intercepts internal links with query and hash without reload', async ({
        page,
    }) => {
        await page.goto('/');

        await page.evaluate(() => {
            (window as Window & { __spaMarker?: string }).__spaMarker = 'alive';
            const anchor = document.createElement('a');
            anchor.id = 'query-hash-link';
            anchor.href = '/search?q=algo#top';
            anchor.textContent = 'go search';
            document.body.append(anchor);
        });

        await page.click('#query-hash-link');

        await expect(page).toHaveURL(/\/search\?q=algo#top$/);
        await expect(page.locator('[data-search-input]')).toBeVisible();

        const marker = await page.evaluate(
            () => (window as Window & { __spaMarker?: string }).__spaMarker
        );
        expect(marker).toBe('alive');
    });

    test('restores deep-link from session storage on boot', async ({
        page,
    }) => {
        await page.goto('/');

        await page.evaluate(() => {
            window.sessionStorage.setItem(
                'planit:redirect-path',
                '/course?code=236501#details'
            );
        });

        await page.reload();

        await expect(page).toHaveURL(/\/course\?code=236501#details$/);

        const redirectValue = await page.evaluate(() =>
            window.sessionStorage.getItem('planit:redirect-path')
        );
        expect(redirectValue).toBeNull();
    });

    test('keeps same-page hash navigation native and scrolls to target', async ({
        page,
    }) => {
        await page.goto('/');

        await page.evaluate(() => {
            const spacer = document.createElement('div');
            spacer.style.height = '2200px';
            spacer.style.width = '1px';
            document.body.append(spacer);

            const target = document.createElement('div');
            target.id = 'native-anchor-target';
            target.textContent = 'target';
            target.style.height = '24px';
            document.body.append(target);

            const anchor = document.createElement('a');
            anchor.id = 'native-anchor-link';
            anchor.href = '#native-anchor-target';
            anchor.textContent = 'jump';
            document.body.prepend(anchor);
        });

        await page.click('#native-anchor-link');
        await page.waitForFunction(
            () => window.location.hash === '#native-anchor-target'
        );

        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(200);
    });
});
