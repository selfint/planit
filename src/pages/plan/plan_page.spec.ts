import { expect, test, type Page } from '@playwright/test';

async function getVisibleSemesterId(page: Page) {
    return page.evaluate(() => {
        const rail = document.querySelector<HTMLElement>(
            '[data-semester-rail]'
        );
        if (rail === null) {
            return null;
        }

        const columns = Array.from(
            rail.querySelectorAll<HTMLElement>('[data-semester-column]')
        );
        if (columns.length === 0) {
            return null;
        }

        const railRect = rail.getBoundingClientRect();
        const isRtl = getComputedStyle(rail).direction === 'rtl';

        let closestId: string | null = null;
        let closestDistance = Number.POSITIVE_INFINITY;

        for (const column of columns) {
            const columnRect = column.getBoundingClientRect();
            const distance = isRtl
                ? Math.abs(columnRect.right - railRect.right)
                : Math.abs(columnRect.left - railRect.left);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestId = column.dataset.semesterId ?? null;
            }
        }

        return closestId;
    });
}

async function getVisibleMoveTargetCount(page: Page) {
    return page.evaluate(() => {
        const moveTargets = Array.from(
            document.querySelectorAll<HTMLElement>('p')
        ).filter(
            (item) => item.textContent?.trim() === 'לחצו כאן להעברת הקורס הנבחר'
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
    test('keeps horizontal rail position on course select', async ({
        page,
    }) => {
        await page.goto('plan');
        await expect(page.locator('[data-semester-rail]')).toBeVisible();

        await page.waitForFunction(() => {
            const rail = document.querySelector<HTMLElement>(
                '[data-semester-rail]'
            );
            return (
                rail !== null &&
                rail.querySelectorAll('[data-semester-column]').length >= 3 &&
                rail.querySelector('[data-course-action]') !== null
            );
        });

        const initialVisibleSemesterId = await getVisibleSemesterId(page);

        await page.evaluate(() => {
            const rail = document.querySelector<HTMLElement>(
                '[data-semester-rail]'
            );
            if (rail === null) {
                return;
            }
            const columns = Array.from(
                rail.querySelectorAll<HTMLElement>('[data-semester-column]')
            );
            if (columns.length < 3) {
                return;
            }

            const target = columns[2];
            const railRect = rail.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const isRtl = getComputedStyle(rail).direction === 'rtl';
            const delta = isRtl
                ? targetRect.right - railRect.right
                : targetRect.left - railRect.left;
            rail.scrollBy({ left: delta });
        });

        await page.waitForFunction((previousId) => {
            const rail = document.querySelector<HTMLElement>(
                '[data-semester-rail]'
            );
            if (rail === null) {
                return false;
            }
            const columns = Array.from(
                rail.querySelectorAll<HTMLElement>('[data-semester-column]')
            );
            if (columns.length === 0) {
                return false;
            }

            const railRect = rail.getBoundingClientRect();
            const isRtl = getComputedStyle(rail).direction === 'rtl';
            let closestId: string | null = null;
            let closestDistance = Number.POSITIVE_INFINITY;

            for (const column of columns) {
                const columnRect = column.getBoundingClientRect();
                const distance = isRtl
                    ? Math.abs(columnRect.right - railRect.right)
                    : Math.abs(columnRect.left - railRect.left);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestId = column.dataset.semesterId ?? null;
                }
            }

            return closestId !== null && closestId !== previousId;
        }, initialVisibleSemesterId);

        const beforeSelectSemesterId = await getVisibleSemesterId(page);
        expect(beforeSelectSemesterId).not.toBeNull();

        await page.click(
            `[data-course-action][data-semester-id="${beforeSelectSemesterId}"]`
        );

        await expect(page.locator('[data-clear-selection]')).toBeEnabled();
        await expect(page.locator('[data-selected-status]')).not.toHaveText(
            'לא נבחר קורס'
        );

        const afterSelectSemesterId = await getVisibleSemesterId(page);
        expect(afterSelectSemesterId).toBe(beforeSelectSemesterId);
    });

    test('moves selected course without full rail reset', async ({ page }) => {
        await page.goto('plan');
        await expect(page.locator('[data-semester-rail]')).toBeVisible();

        const moveFixture = await page.evaluate(() => {
            const columns = Array.from(
                document.querySelectorAll<HTMLElement>('[data-semester-column]')
            );
            const source = columns.find(
                (column) =>
                    column.querySelector('[data-course-action]') !== null &&
                    column.dataset.semesterId !== undefined
            );
            if (source === undefined) {
                return null;
            }

            const target = columns.find(
                (column) =>
                    column.dataset.semesterId !== undefined &&
                    column.dataset.semesterId !== source.dataset.semesterId
            );
            if (target === undefined) {
                return null;
            }

            const sourceButton = source.querySelector<HTMLElement>(
                '[data-course-action]'
            );
            if (sourceButton === null) {
                return null;
            }

            return {
                sourceSemesterId: source.dataset.semesterId,
                targetSemesterId: target.dataset.semesterId,
                courseCode: sourceButton.dataset.courseCode,
            };
        });

        expect(moveFixture).not.toBeNull();

        const sourceSemesterId = moveFixture?.sourceSemesterId ?? '';
        const targetSemesterId = moveFixture?.targetSemesterId ?? '';
        const courseCode = moveFixture?.courseCode ?? '';

        await page.click(
            `[data-course-action][data-semester-id="${sourceSemesterId}"][data-course-code="${courseCode}"]`
        );

        await expect
            .poll(async () => getVisibleMoveTargetCount(page))
            .toBeGreaterThan(0);

        await page.click(
            `[data-semester-column][data-semester-id="${targetSemesterId}"]`
        );

        await expect(page.locator('[data-selected-status]')).toHaveText(
            'לא נבחר קורס'
        );
        await expect(page.locator('[data-clear-selection]')).toBeDisabled();
        await expect.poll(async () => getVisibleMoveTargetCount(page)).toBe(0);

        await expect(
            page.locator(
                `[data-course-action][data-course-code="${courseCode}"][data-semester-id="${targetSemesterId}"]`
            )
        ).toHaveCount(1);
        await expect(
            page.locator(
                `[data-course-action][data-course-code="${courseCode}"][data-semester-id="${sourceSemesterId}"]`
            )
        ).toHaveCount(0);
    });
});
