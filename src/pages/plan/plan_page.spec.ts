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
        await expect(page.locator('[data-plan-row]')).toHaveCount(8);
        await expect(
            page.locator('[data-plan-row][data-row-id="wishlist"]')
        ).toContainText('רשימת משאלות');
        await expect(
            page.locator('[data-plan-row][data-row-id="exemptions"]')
        ).toContainText('פטורים');

        const usesHorizontalOverflow = await page
            .locator('[data-semester-rail]')
            .evaluate(
                (node) =>
                    node.classList.contains('overflow-x-auto') ||
                    node.classList.contains('snap-x')
            );
        expect(usesHorizontalOverflow).toBe(false);
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
            if (
                sourceRow === undefined ||
                sourceRow.dataset.rowId === undefined
            ) {
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

        await expect
            .poll(async () => getVisibleMoveTargetCount(page))
            .toBeGreaterThan(0);

        await page.click(`[data-plan-row][data-row-id="${targetRowId}"]`);

        await expect(page.locator('[data-selected-status]')).toHaveText(
            'לא נבחר קורס'
        );
        await expect(page.locator('[data-clear-selection]')).toBeDisabled();
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
