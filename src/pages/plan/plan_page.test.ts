/* @vitest-environment jsdom */
import { type StateProvider, state } from '$lib/stateManagement';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
    return {
        getCoursesPageMock: vi.fn(),
        getMetaMock: vi.fn(),
        setMetaMock: vi.fn(),
    };
});

vi.mock('$components/ConsoleNav', () => ({
    ConsoleNav: (): HTMLElement => {
        const nav = document.createElement('nav');
        nav.dataset.component = 'ConsoleNav';
        return nav;
    },
}));

vi.mock('$components/CourseCard', () => ({
    CourseCard: (course?: { code?: string }): HTMLElement => {
        const card = document.createElement('article');
        card.dataset.component = 'CourseCard';
        if (course?.code !== undefined) {
            card.dataset.courseCode = course.code;
        }
        return card;
    },
}));

import { PlanPage } from './plan_page';

describe('plan page', () => {
    beforeEach(() => {
        if (typeof window.CSS === 'undefined') {
            Object.defineProperty(window, 'CSS', {
                configurable: true,
                value: {},
            });
        }
        if (typeof window.CSS.escape !== 'function') {
            window.CSS.escape = (value: string): string => value;
        }

        mocks.getCoursesPageMock.mockReset();
        mocks.getMetaMock.mockReset();
        mocks.setMetaMock.mockReset();
        mocks.getMetaMock.mockResolvedValue(undefined);
        mocks.getCoursesPageMock.mockResolvedValue([
            {
                code: '104031',
                name: 'חדו"א 1',
                points: 5,
                median: 78,
                tests: [
                    { year: 2025, monthIndex: 0, day: 12 },
                    { year: 2025, monthIndex: 1, day: 14 },
                ],
            },
            {
                code: '234114',
                name: 'מבוא למדמ"ח',
                points: 4,
                median: 81,
                tests: [
                    { year: 2025, monthIndex: 0, day: 13 },
                    { year: 2025, monthIndex: 1, day: 20 },
                ],
            },
        ]);
        mocks.setMetaMock.mockResolvedValue(undefined);
        state.provider.set(createStateProviderMock());
    });

    afterEach(() => {
        document.body.replaceChildren();
    });

    it('renders planner rows including wishlist and exemptions', async () => {
        const page = PlanPage();
        await flushPromises();

        expect(page).toBeInstanceOf(HTMLElement);
        expect(page.getAttribute('data-page')).toBe('plan');
        expect(page.querySelectorAll('[data-plan-row]').length).toBe(8);
        expect(
            page.querySelector('[data-plan-row][data-row-id="wishlist"]')
                ?.textContent
        ).toContain('רשימת משאלות');
        expect(
            page.querySelector('[data-plan-row][data-row-id="exemptions"]')
                ?.textContent
        ).toContain('פטורים');

        const semesterLinks = Array.from(
            page.querySelectorAll<HTMLAnchorElement>('[data-semester-link]')
        );
        expect(semesterLinks).toHaveLength(6);
        expect(semesterLinks.map((link) => link.getAttribute('href'))).toEqual([
            '/semester?number=1',
            '/semester?number=2',
            '/semester?number=3',
            '/semester?number=4',
            '/semester?number=5',
            '/semester?number=6',
        ]);
    });

    it('shows row move controls and clears selection with row cancel', async () => {
        const page = PlanPage();
        await flushPromises();

        const courseButton = page.querySelector<HTMLElement>(
            '[data-plan-row][data-row-kind="semester"] [data-course-action]'
        );
        expect(courseButton).toBeTruthy();
        courseButton?.click();

        const sourceRowId = courseButton?.dataset.rowId ?? '';
        const sourceCancelButton = page.querySelector<HTMLElement>(
            `[data-cancel-selection][data-row-id="${sourceRowId}"]`
        );
        const sourceMoveTarget = page.querySelector<HTMLElement>(
            `[data-move-target][data-row-id="${sourceRowId}"]`
        );
        const wishlistRow = page.querySelector<HTMLElement>(
            '[data-plan-row][data-row-id="wishlist"]'
        );

        const visibleCancelButtons = page.querySelectorAll<HTMLElement>(
            '[data-cancel-selection]:not(.invisible)'
        );
        expect(visibleCancelButtons.length).toBeGreaterThan(0);
        expect(sourceMoveTarget?.classList.contains('invisible')).toBe(true);
        expect(wishlistRow?.classList.contains('!bg-surface-2/80')).toBe(true);

        sourceCancelButton?.click();

        const visibleMoveTargets = page.querySelectorAll<HTMLElement>(
            '[data-move-target]:not(.invisible)'
        );
        const highlightedRows = Array.from(
            page.querySelectorAll<HTMLElement>('[data-plan-row]')
        ).filter((row) => row.classList.contains('!bg-surface-2/80'));
        expect(visibleMoveTargets.length).toBe(0);
        expect(highlightedRows.length).toBe(0);
    });

    it('clamps semester count to last semester containing courses', async () => {
        mocks.getCoursesPageMock.mockResolvedValue([
            { code: 'A101', name: 'A101', tests: [null] },
            { code: 'B202', name: 'B202', tests: [null] },
        ]);
        mocks.getMetaMock.mockResolvedValue({
            key: 'planPageState',
            value: {
                version: 2,
                semesterCount: 6,
                semesters: [
                    { id: 'אביב-2026-0', courseCodes: ['A101'] },
                    { id: 'קיץ-2026-1', courseCodes: [] },
                    { id: 'חורף-2026-2', courseCodes: [] },
                    { id: 'אביב-2027-3', courseCodes: [] },
                    { id: 'קיץ-2027-4', courseCodes: [] },
                    { id: 'חורף-2027-5', courseCodes: ['B202'] },
                ],
                wishlistCourseCodes: [],
                exemptionsCourseCodes: [],
            },
        });

        const page = PlanPage();
        await flushPromises();

        const input = page.querySelector<HTMLInputElement>(
            '[data-semester-count]'
        );
        expect(input).toBeTruthy();
        expect(input?.min).toBe('6');

        if (input !== null) {
            input.value = '3';
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        expect(input?.value).toBe('6');
        expect(mocks.setMetaMock).toHaveBeenCalled();
        const payload = mocks.setMetaMock.mock.calls.at(-1)?.[0] as
            | { value?: { semesterCount?: number } }
            | undefined;
        expect(payload?.value?.semesterCount).toBe(6);
    });

    it('persists selected current semester index', async () => {
        const page = PlanPage();
        await flushPromises();

        const select = page.querySelector<HTMLSelectElement>(
            '[data-current-semester-select]'
        );
        expect(select).toBeTruthy();

        if (select !== null) {
            select.value = '2';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const payload = mocks.setMetaMock.mock.calls.at(-1)?.[0] as
            | { value?: { currentSemester?: number } }
            | undefined;
        expect(payload?.value?.currentSemester).toBe(2);
    });

    it('renders tests from the current semester only and sorted by exam date', async () => {
        mocks.getCoursesPageMock.mockResolvedValue([
            {
                code: 'A101',
                name: 'A101',
                tests: [
                    { year: 2025, monthIndex: 0, day: 13 },
                    { year: 2025, monthIndex: 1, day: 20 },
                ],
            },
            {
                code: 'B202',
                name: 'B202',
                tests: [
                    { year: 2025, monthIndex: 0, day: 12 },
                    { year: 2025, monthIndex: 1, day: 14 },
                ],
            },
            {
                code: 'C303',
                name: 'C303',
                tests: [
                    { year: 2025, monthIndex: 0, day: 18 },
                    { year: 2025, monthIndex: 1, day: 22 },
                ],
            },
        ]);
        mocks.getMetaMock.mockResolvedValue({
            key: 'planPageState',
            value: {
                version: 3,
                semesterCount: 3,
                currentSemester: 1,
                semesters: [
                    { id: 'אביב-2026-0', courseCodes: ['C303'] },
                    { id: 'קיץ-2026-1', courseCodes: ['A101', 'B202'] },
                    { id: 'חורף-2026-2', courseCodes: [] },
                ],
                wishlistCourseCodes: [],
                exemptionsCourseCodes: [],
            },
        });

        const page = PlanPage();
        await flushPromises();

        const first = Array.from(
            page.querySelectorAll<HTMLElement>(
                '[data-tests-track="0"] [data-test-course-code]'
            )
        ).map((item) => item.textContent?.trim());
        const second = Array.from(
            page.querySelectorAll<HTMLElement>(
                '[data-tests-track="1"] [data-test-course-code]'
            )
        ).map((item) => item.textContent?.trim());
        expect(first).toEqual(['12/1', '1']);
        expect(second).toEqual(['14/2', '6']);
    });

    it('highlights current semester course on test-square hover', async () => {
        mocks.getCoursesPageMock.mockResolvedValue([
            {
                code: 'A101',
                name: 'A101',
                tests: [{ year: 2025, monthIndex: 0, day: 13 }],
            },
            {
                code: 'B202',
                name: 'B202',
                tests: [{ year: 2025, monthIndex: 0, day: 12 }],
            },
        ]);
        mocks.getMetaMock.mockResolvedValue({
            key: 'planPageState',
            value: {
                version: 3,
                semesterCount: 2,
                currentSemester: 0,
                semesters: [
                    { id: 'אביב-2026-0', courseCodes: ['A101', 'B202'] },
                    { id: 'קיץ-2026-1', courseCodes: [] },
                ],
                wishlistCourseCodes: [],
                exemptionsCourseCodes: [],
            },
        });

        const page = PlanPage();
        await flushPromises();

        const targetSquare = page.querySelector<HTMLElement>(
            '[data-tests-track="0"] [data-test-course-code="B202"]'
        );
        const courseButton = page.querySelector<HTMLElement>(
            '[data-current-semester-course="true"][data-course-code="B202"]'
        );
        expect(targetSquare).toBeTruthy();
        expect(courseButton).toBeTruthy();

        targetSquare?.dispatchEvent(
            new MouseEvent('mouseover', { bubbles: true })
        );
        expect(courseButton?.classList.contains('ring-2')).toBe(true);

        targetSquare?.dispatchEvent(
            new MouseEvent('mouseout', { bubbles: true })
        );
        expect(courseButton?.classList.contains('ring-2')).toBe(false);
    });
});

async function flushPromises(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => {
        window.setTimeout(resolve, 0);
    });
}

function createStateProviderMock(): StateProvider {
    return {
        courses: {
            get: vi.fn(),
            set: vi.fn(),
            query: vi.fn(),
            page: mocks.getCoursesPageMock,
            count: vi.fn(),
            faculties: vi.fn(),
            getLastSync: vi.fn(),
        },
        catalogs: {
            get: vi.fn(),
            set: vi.fn(),
        },
        requirements: {
            get: vi.fn(),
            sync: vi.fn(),
        },
        userDegree: {
            get: vi.fn(),
            set: vi.fn(),
        },
        userPlan: {
            get: mocks.getMetaMock,
            set: (value: unknown): Promise<void> => {
                mocks.setMetaMock({ key: 'planPageState', value });
                return Promise.resolve();
            },
        },
    };
}
