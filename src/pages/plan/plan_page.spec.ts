import { expect, test } from '@playwright/test';

async function getVisibleMoveTargetCount(
    page: import('@playwright/test').Page
): Promise<number> {
    return page.evaluate(() => {
        const moveTargets = Array.from(
            document.querySelectorAll<HTMLElement>('[data-move-target]')
        );
        let visibleCount = 0;
        for (const moveTarget of moveTargets) {
            const style = getComputedStyle(moveTarget);
            const isVisible =
                !moveTarget.classList.contains('hidden') &&
                style.display !== 'none' &&
                style.visibility !== 'hidden';
            if (isVisible) {
                visibleCount += 1;
            }
        }
        return visibleCount;
    });
}

test.describe('/plan page route', () => {
    test('renders vertical rows with wishlist and exemptions', async ({
        page,
    }) => {
        await page.goto('plan');

        await expect(page.locator('[data-semester-rail]')).toBeVisible();
        await expect(page.locator('[data-rail-prev]')).toHaveCount(0);
        await expect(page.locator('[data-rail-next]')).toHaveCount(0);
        await expect(page.locator('[data-clear-selection]')).toHaveCount(0);
        await expect(page.locator('[data-plan-row]')).toHaveCount(8);
        await expect(page.locator('[data-cancel-selection]')).toHaveCount(8);
        await expect(
            page.locator('[data-plan-row][data-row-id="wishlist"]')
        ).toContainText('רשימת משאלות');
        await expect(
            page.locator('[data-plan-row][data-row-id="exemptions"]')
        ).toContainText('פטורים');
        await expect(page.locator('[data-semester-link]')).toHaveCount(6);
        await expect(
            page.locator('[data-semester-link][data-semester-number="1"]')
        ).toHaveAttribute('href', /\/semester\?number=1$/);
        await expect(
            page.locator('[data-semester-link][data-semester-number="6"]')
        ).toHaveAttribute('href', /\/semester\?number=6$/);

        const usesHorizontalOverflow = await page
            .locator('[data-semester-rail]')
            .evaluate(
                (node) =>
                    node.classList.contains('overflow-x-auto') ||
                    node.classList.contains('snap-x')
            );
        expect(usesHorizontalOverflow).toBe(false);
    });

    test('navigates to semester page from semester row link', async ({
        page,
    }) => {
        await page.goto('plan');

        await page.click('[data-semester-link][data-semester-number="3"]');

        await expect(page).toHaveURL(/\/semester\?number=3$/);
        await expect(page.locator('[data-page="semester"]')).toBeVisible();
    });

    test('moves selected course to wishlist row', async ({ page }) => {
        await page.goto('plan');

        await page.waitForFunction(() => {
            const rows = Array.from(
                document.querySelectorAll<HTMLElement>('[data-plan-row]')
            );
            const hasSource = rows.some(
                (row) =>
                    row.dataset.rowId !== 'wishlist' &&
                    row.querySelector('[data-course-action]') !== null
            );
            return hasSource;
        });

        const moveFixture = await page.evaluate(() => {
            const sourceRow = Array.from(
                document.querySelectorAll<HTMLElement>('[data-plan-row]')
            ).find(
                (row) =>
                    row.dataset.rowId !== 'wishlist' &&
                    row.dataset.rowId !== 'exemptions' &&
                    row.querySelector<HTMLElement>('[data-course-action]') !==
                        null
            );
            if (sourceRow?.dataset.rowId === undefined) {
                return null;
            }

            const sourceButton = sourceRow.querySelector<HTMLElement>(
                '[data-course-action]'
            );
            const sourceRowId = sourceRow.dataset.rowId;
            const courseCode = sourceButton?.dataset.courseCode;
            if (courseCode === undefined) {
                return null;
            }

            return {
                sourceRowId,
                targetRowId: 'wishlist',
                courseCode,
            };
        });

        expect(moveFixture).not.toBeNull();

        const sourceRowId = moveFixture?.sourceRowId ?? '';
        const targetRowId = moveFixture?.targetRowId ?? '';
        const courseCode = moveFixture?.courseCode ?? '';

        await page.click(
            `[data-course-action][data-row-id="${sourceRowId}"][data-course-code="${courseCode}"]`
        );

        await expect(
            page.locator(
                `[data-cancel-selection][data-row-id="${sourceRowId}"]`
            )
        ).not.toHaveClass(/invisible/);
        await expect(
            page.locator(`[data-plan-row][data-row-id="wishlist"]`)
        ).toHaveClass(/!bg-surface-2\/80/);
        await expect(
            page.locator(`[data-plan-row][data-row-id="exemptions"]`)
        ).toHaveClass(/!bg-surface-2\/80/);

        await expect
            .poll(async () => getVisibleMoveTargetCount(page))
            .toBeGreaterThan(0);

        await page.click(`[data-plan-row][data-row-id="${targetRowId}"]`);

        await expect(page.locator('[data-selected-status]')).toHaveCount(0);
        await expect(page.locator('[data-clear-selection]')).toHaveCount(0);
        await expect.poll(async () => getVisibleMoveTargetCount(page)).toBe(0);

        await expect(
            page.locator(
                `[data-course-action][data-course-code="${courseCode}"][data-row-id="${targetRowId}"]`
            )
        ).toHaveCount(1);
        await expect(
            page.locator(
                `[data-course-action][data-course-code="${courseCode}"][data-row-id="${sourceRowId}"]`
            )
        ).toHaveCount(0);

        await expect(
            page.getByText('אין קורסים בסמסטר זה. אפשר ללחוץ כדי להעביר לכאן.')
        ).toHaveCount(0);
    });

    test('keeps semester count minimum at last populated semester', async ({
        page,
    }) => {
        await page.goto('plan');

        const semesterCountInput = page.locator('[data-semester-count]');
        await expect(semesterCountInput).toBeVisible();
        await expect(semesterCountInput).toHaveAttribute('min', '6');

        await semesterCountInput.fill('3');
        await semesterCountInput.dispatchEvent('change');
        await expect(semesterCountInput).toHaveValue('6');
    });

    test('renders schedule errors section below planner rows', async ({
        page,
    }) => {
        await page.goto('plan');

        const isProblemsSectionAfterRail = await page.evaluate(() => {
            const rail = document.querySelector('[data-semester-rail]');
            const problems = document.querySelector('[data-schedule-problems]');
            if (rail === null || problems === null) {
                return false;
            }
            return (
                (rail.compareDocumentPosition(problems) &
                    Node.DOCUMENT_POSITION_FOLLOWING) !==
                0
            );
        });

        expect(isProblemsSectionAfterRail).toBe(true);
    });
});
