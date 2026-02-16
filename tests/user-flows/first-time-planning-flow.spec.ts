import { type Page, expect, test } from '@playwright/test';

const HARD_CODED_COURSE = '03240033';

test.describe('first-time planning flow', () => {
    test('completes landing to semester journey with hardcoded course', async ({
        page,
    }) => {
        await page.goto('');
        await expect(
            page.locator('[data-component="LandingHero"]')
        ).toBeVisible();

        await page
            .locator(
                '[data-component="LandingHero"] a[data-action="primary"][href="/catalog"]'
            )
            .click();
        await expect(page).toHaveURL(/\/catalog$/);
        await expect(page.locator('[data-page="catalog"]')).toBeVisible();

        await selectFirstNonEmptyOption(page, '[data-degree-catalog]');
        await selectFirstNonEmptyOption(page, '[data-degree-faculty]');
        await selectFirstNonEmptyOption(page, '[data-degree-program]');
        await selectPathIfRequired(page);

        await expect(page.locator('[data-catalog-groups]')).toBeVisible();

        await page.goto(`course?code=${HARD_CODED_COURSE}`);
        await expect(page).toHaveURL(
            new RegExp(`/course\\?code=${HARD_CODED_COURSE}$`)
        );
        await expect(page.locator('[data-page="course"]')).toBeVisible();

        await page.locator('[data-role="wishlist-add"]').click();
        await expect(
            page.locator('[data-role="wishlist-status"]')
        ).toContainText(/נוסף|כבר/);

        await page
            .locator('[data-page="course"] a[href="/plan"]')
            .first()
            .click();
        await expect(page).toHaveURL(/\/plan$/);
        await expect(page.locator('[data-page="plan"]')).toBeVisible();

        const wishlistCourse = page.locator(
            `[data-course-action][data-row-id="wishlist"][data-course-code="${HARD_CODED_COURSE}"]`
        );
        await expect(wishlistCourse).toBeVisible();
        await wishlistCourse.click();

        const firstSemesterRow = page
            .locator('[data-plan-row][data-row-kind="semester"]')
            .first();
        await firstSemesterRow.locator('header').click();

        await expect(
            firstSemesterRow.locator(
                `[data-course-action][data-course-code="${HARD_CODED_COURSE}"]`
            )
        ).toHaveCount(1);
        await expect(wishlistCourse).toHaveCount(0);

        await firstSemesterRow.locator('header').click();
        await expect(page).toHaveURL(/\/semester\?number=1$/);
        await expect(
            page.locator(
                `[data-role="current-semester-courses"] [data-course-code="${HARD_CODED_COURSE}"]`
            )
        ).toHaveCount(1);
    });
});

async function selectFirstNonEmptyOption(
    page: Page,
    selector: string
): Promise<void> {
    const select = page.locator(selector);
    await expect(select).toBeVisible();
    await expect(select).toBeEnabled();

    await expect
        .poll(async () => {
            return select.evaluate((node) => {
                if (!(node instanceof HTMLSelectElement)) {
                    return 0;
                }
                return Array.from(node.options).filter(
                    (option) => option.value.trim().length > 0
                ).length;
            });
        })
        .toBeGreaterThan(0);

    const selected = await select.evaluate((node) => {
        if (!(node instanceof HTMLSelectElement)) {
            return false;
        }
        const first = Array.from(node.options).find(
            (option) => option.value.trim().length > 0
        );
        if (first === undefined) {
            return false;
        }

        node.value = first.value;
        node.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    });

    expect(selected).toBe(true);
}

async function selectPathIfRequired(page: Page): Promise<void> {
    const pathSelect = page.locator('[data-degree-path]');
    await expect(pathSelect).toBeVisible();

    const isRequired = await pathSelect.evaluate((node) => {
        return node instanceof HTMLSelectElement && node.required;
    });
    if (!isRequired) {
        return;
    }

    await selectFirstNonEmptyOption(page, '[data-degree-path]');
}
