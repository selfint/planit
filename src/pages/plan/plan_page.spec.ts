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

async function clickPlanRow(
    page: import('@playwright/test').Page,
    rowId: string
): Promise<void> {
    await page.evaluate((targetRowId) => {
        const row = document.querySelector<HTMLElement>(
            `[data-plan-row][data-row-id="${CSS.escape(targetRowId)}"]`
        );
        row?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, rowId);
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

    test('does not navigate when clicking semester row background', async ({
        page,
    }) => {
        await page.goto('plan');

        await page.click('[data-plan-row][data-row-id="אביב-2026-0"]');

        await expect(page).toHaveURL(/\/plan$/);
        await expect(page.locator('[data-page="plan"]')).toBeVisible();
    });

    test('uses course-page-like grid width management for plan cards', async ({
        page,
    }) => {
        await page.goto('plan');
        await page.waitForFunction(() => {
            return document.querySelector('[data-course-action]') !== null;
        });

        const listClasses = await page.evaluate(() => {
            return Array.from(
                document.querySelectorAll<HTMLElement>('[data-row-course-list]')
            ).map((element) => element.className);
        });

        expect(listClasses.length).toBeGreaterThan(0);
        expect(
            listClasses.every((className) => className.includes('grid'))
        ).toBe(true);
        expect(
            listClasses.every((className) =>
                className.includes(
                    'grid-cols-[repeat(auto-fit,minmax(5rem,1fr))]'
                )
            )
        ).toBe(true);
        expect(
            listClasses.every(
                (className) =>
                    className.includes(
                        'md:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))]'
                    ) &&
                    className.includes(
                        'lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]'
                    )
            )
        ).toBe(true);
        expect(
            listClasses.every((className) => !className.includes('flex'))
        ).toBe(true);

        const cardActionClasses = await page.evaluate(() => {
            const firstCourseAction = document.querySelector<HTMLElement>(
                '[data-course-action]'
            );
            return firstCourseAction?.className ?? '';
        });

        expect(cardActionClasses).toContain('w-full');
        expect(cardActionClasses).not.toContain('basis-full');
        expect(cardActionClasses).not.toContain('sm:basis-');
        expect(cardActionClasses).not.toContain('lg:basis-');
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

    test('updates current-semester tests when moving a tested course into current semester', async ({
        page,
    }) => {
        await page.goto('plan');
        await page.waitForFunction(() => {
            return (
                document.querySelector(
                    '[data-plan-row][data-current-semester-row="true"] [data-row-metrics]'
                ) !== null
            );
        });

        const fixture = await page.evaluate(() => {
            const currentRow = document.querySelector<HTMLElement>(
                '[data-plan-row][data-current-semester-row="true"]'
            );
            if (currentRow?.dataset.rowId === undefined) {
                return null;
            }

            const currentRowId = currentRow.dataset.rowId;
            const currentMetricsText =
                currentRow.querySelector<HTMLElement>('[data-row-metrics]')
                    ?.textContent ?? '';
            const currentTestsMatch = /מבחנים:\s*(\d+)/.exec(
                currentMetricsText
            );
            const currentTestsBefore = Number.parseInt(
                currentTestsMatch?.[1] ?? '0',
                10
            );

            const sourceRow = Array.from(
                document.querySelectorAll<HTMLElement>('[data-plan-row]')
            ).find((row) => {
                const rowId = row.dataset.rowId;
                if (
                    rowId === undefined ||
                    rowId === currentRowId ||
                    rowId === 'wishlist' ||
                    rowId === 'exemptions' ||
                    row.querySelectorAll('[data-course-action]').length !== 1
                ) {
                    return false;
                }

                const sourceMetricsText =
                    row.querySelector<HTMLElement>('[data-row-metrics]')
                        ?.textContent ?? '';
                const sourceTestsMatch = /מבחנים:\s*(\d+)/.exec(
                    sourceMetricsText
                );
                const sourceTestsCount = Number.parseInt(
                    sourceTestsMatch?.[1] ?? '0',
                    10
                );
                return (
                    Number.isFinite(sourceTestsCount) && sourceTestsCount > 0
                );
            });

            if (sourceRow?.dataset.rowId === undefined) {
                return null;
            }

            const courseCode = sourceRow.querySelector<HTMLElement>(
                '[data-course-action]'
            )?.dataset.courseCode;
            if (courseCode === undefined) {
                return null;
            }

            return {
                sourceRowId: sourceRow.dataset.rowId,
                currentRowId,
                courseCode,
                currentTestsBefore,
            };
        });

        expect(fixture).not.toBeNull();

        const sourceRowId = fixture?.sourceRowId ?? '';
        const currentRowId = fixture?.currentRowId ?? '';
        const courseCode = fixture?.courseCode ?? '';
        const currentTestsBefore = fixture?.currentTestsBefore ?? 0;

        await page.click(
            `[data-course-action][data-row-id="${sourceRowId}"][data-course-code="${courseCode}"]`
        );
        await clickPlanRow(page, currentRowId);

        await expect
            .poll(async () => {
                const text = await page
                    .locator(
                        `[data-plan-row][data-row-id="${currentRowId}"] [data-row-metrics]`
                    )
                    .innerText();
                const match = /מבחנים:\s*(\d+)/.exec(text);
                return Number.parseInt(match?.[1] ?? '0', 10);
            })
            .toBeGreaterThan(currentTestsBefore);
    });

    test('removes current-semester test label when moving tested course out of current semester', async ({
        page,
    }) => {
        await page.goto('plan');
        await page.waitForFunction(() => {
            return (
                document.querySelector(
                    '[data-plan-row][data-current-semester-row="true"] [data-test-course-code]'
                ) !== null
            );
        });

        const fixture = await page.evaluate(() => {
            const currentRow = document.querySelector<HTMLElement>(
                '[data-plan-row][data-current-semester-row="true"]'
            );
            if (currentRow?.dataset.rowId === undefined) {
                return null;
            }

            const currentRowId = currentRow.dataset.rowId;
            const testedCourseCode = currentRow.querySelector<HTMLElement>(
                '[data-test-course-code]'
            )?.dataset.testCourseCode;
            if (testedCourseCode === undefined) {
                return null;
            }

            const targetRow = Array.from(
                document.querySelectorAll<HTMLElement>('[data-plan-row]')
            ).find((row) => {
                const rowId = row.dataset.rowId;
                return (
                    rowId !== undefined &&
                    rowId !== currentRowId &&
                    rowId !== 'wishlist' &&
                    rowId !== 'exemptions'
                );
            });
            if (targetRow?.dataset.rowId === undefined) {
                return null;
            }

            return {
                sourceRowId: currentRowId,
                targetRowId: targetRow.dataset.rowId,
                courseCode: testedCourseCode,
            };
        });

        expect(fixture).not.toBeNull();

        const sourceRowId = fixture?.sourceRowId ?? '';
        const targetRowId = fixture?.targetRowId ?? '';
        const courseCode = fixture?.courseCode ?? '';

        await page.click(
            `[data-course-action][data-row-id="${sourceRowId}"][data-course-code="${courseCode}"]`
        );
        await clickPlanRow(page, targetRowId);

        await expect
            .poll(async () => {
                return page
                    .locator(
                        `[data-plan-row][data-row-id="${sourceRowId}"] [data-test-course-code="${courseCode}"]`
                    )
                    .count();
            })
            .toBe(0);
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
        await page.waitForFunction(() => {
            return (
                document.querySelector('[data-app-loading-screen]') === null &&
                document.querySelector('[data-semester-rail]') !== null &&
                document.querySelector('[data-schedule-problems]') !== null
            );
        });

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

    test('shows current-semester test schedule and switches with selector', async ({
        page,
    }) => {
        await page.goto('plan');
        await page.waitForFunction(() => {
            return (
                document.querySelector('[data-current-semester-select]') !==
                    null &&
                document.querySelector('[data-tests-track="0"]') !== null
            );
        });

        const select = page.locator('[data-current-semester-select]');
        await expect(select).toBeVisible();
        await expect(
            page.locator('[data-plan-row][data-current-semester-row="true"]')
        ).toHaveCount(1);

        await select.selectOption('1');

        await expect(
            page.locator(
                '[data-plan-row][data-current-semester-row="true"] [data-semester-link][data-semester-number="2"]'
            )
        ).toHaveCount(1);
        const firstTrackCount = await page
            .locator('[data-tests-track="0"] [data-test-course-code]')
            .count();
        expect(firstTrackCount).toBeGreaterThan(0);
    });

    test('keeps current-semester test rows visible after moving a course into current semester', async ({
        page,
    }) => {
        await page.goto('plan');

        await page.waitForFunction(() => {
            const currentRow = document.querySelector<HTMLElement>(
                '[data-plan-row][data-current-semester-row="true"]'
            );
            if (currentRow === null) {
                return false;
            }

            const currentRowId = currentRow.dataset.rowId;
            if (currentRowId === undefined) {
                return false;
            }

            const sourceRow = Array.from(
                document.querySelectorAll<HTMLElement>('[data-plan-row]')
            ).find((row) => {
                const rowId = row.dataset.rowId;
                return (
                    rowId !== undefined &&
                    rowId !== currentRowId &&
                    rowId !== 'wishlist' &&
                    rowId !== 'exemptions' &&
                    row.querySelector('[data-course-action]') !== null
                );
            });

            return sourceRow !== undefined;
        });

        const moveFixture = await page.evaluate(() => {
            const currentRow = document.querySelector<HTMLElement>(
                '[data-plan-row][data-current-semester-row="true"]'
            );
            const targetRowId = currentRow?.dataset.rowId;
            if (targetRowId === undefined) {
                return null;
            }

            const sourceRow = Array.from(
                document.querySelectorAll<HTMLElement>('[data-plan-row]')
            ).find((row) => {
                const rowId = row.dataset.rowId;
                return (
                    rowId !== undefined &&
                    rowId !== targetRowId &&
                    rowId !== 'wishlist' &&
                    rowId !== 'exemptions' &&
                    row.querySelector<HTMLElement>('[data-course-action]') !==
                        null
                );
            });

            if (sourceRow?.dataset.rowId === undefined) {
                return null;
            }

            const sourceButton = sourceRow.querySelector<HTMLElement>(
                '[data-course-action]'
            );
            const courseCode = sourceButton?.dataset.courseCode;
            if (courseCode === undefined) {
                return null;
            }

            return {
                sourceRowId: sourceRow.dataset.rowId,
                targetRowId,
                courseCode,
            };
        });

        expect(moveFixture).not.toBeNull();

        const sourceRowId = moveFixture?.sourceRowId ?? '';
        const targetRowId = moveFixture?.targetRowId ?? '';
        const courseCode = moveFixture?.courseCode ?? '';

        await expect(
            page.locator(
                '[data-plan-row][data-current-semester-row="true"] [data-tests-track="0"]'
            )
        ).toHaveCount(1);
        await expect(
            page.locator(
                '[data-plan-row][data-current-semester-row="true"] [data-tests-track="1"]'
            )
        ).toHaveCount(1);

        await page.click(
            `[data-course-action][data-row-id="${sourceRowId}"][data-course-code="${courseCode}"]`
        );
        await page.click(`[data-plan-row][data-row-id="${targetRowId}"]`);

        await expect(
            page.locator(
                '[data-plan-row][data-current-semester-row="true"] [data-tests-track="0"]'
            )
        ).toHaveCount(1);
        await expect(
            page.locator(
                '[data-plan-row][data-current-semester-row="true"] [data-tests-track="1"]'
            )
        ).toHaveCount(1);
    });
});
