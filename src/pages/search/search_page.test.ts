/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
    queryCoursesMock,
    getMetaMock,
    getCourseFacultiesMock,
    getCoursesCountMock,
    getRequirementMock,
} = vi.hoisted(() => {
    return {
        queryCoursesMock: vi.fn(),
        getMetaMock: vi.fn(),
        getCourseFacultiesMock: vi.fn(),
        getCoursesCountMock: vi.fn(),
        getRequirementMock: vi.fn(),
    };
});

vi.mock('$lib/indexeddb', () => ({
    queryCourses: queryCoursesMock,
    getMeta: getMetaMock,
    getCourseFaculties: getCourseFacultiesMock,
    getCoursesCount: getCoursesCountMock,
    getRequirement: getRequirementMock,
}));

vi.mock('$components/CourseCard', () => ({
    CourseCard: (course?: { code?: string }): HTMLElement => {
        const card = document.createElement('article');
        card.dataset.component = 'CourseCard';
        if (course?.code !== undefined) {
            card.dataset.code = course.code;
        }
        return card;
    },
}));

vi.mock('$components/ConsoleNav', () => ({
    ConsoleNav: (): HTMLElement => {
        const nav = document.createElement('nav');
        nav.dataset.component = 'ConsoleNav';
        return nav;
    },
}));

import { SearchPage } from './search_page';

async function waitForSearchRender(): Promise<void> {
    await new Promise((resolve) => {
        window.setTimeout(resolve, 0);
    });
    await new Promise((resolve) => {
        window.setTimeout(resolve, 0);
    });
}

describe('SearchPage', () => {
    beforeEach(() => {
        queryCoursesMock.mockReset();
        getMetaMock.mockReset();
        getCourseFacultiesMock.mockReset();
        getCoursesCountMock.mockReset();
        getRequirementMock.mockReset();

        queryCoursesMock.mockResolvedValue({ courses: [], total: 0 });
        getCourseFacultiesMock.mockResolvedValue(['CS', 'Math']);
        getCoursesCountMock.mockResolvedValue(10);
        getRequirementMock.mockResolvedValue(undefined);
        getMetaMock.mockImplementation((key: string) => {
            if (key === 'courseDataLastSync') {
                return { key, value: '' };
            }
            return { key, value: '' };
        });

        window.history.replaceState(null, '', '/search');
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders result grid and filter controls', async () => {
        const page = SearchPage();
        await waitForSearchRender();

        const grid = page.querySelector<HTMLElement>('[data-search-results]');
        const availableFilter = page.querySelector('[data-filter-available]');
        const facultyFilter = page.querySelector('[data-filter-faculty]');
        const requirementFilter = page.querySelector(
            '[data-filter-requirement]'
        );
        const syncCatalogLink = page.querySelector<HTMLAnchorElement>(
            '[data-search-sync] a[href="/catalog"]'
        );

        expect(grid).toBeInstanceOf(HTMLElement);
        expect(grid?.className).toContain('grid-cols-3');
        expect(grid?.className).toContain('sm:grid-cols-4');
        expect(availableFilter).toBeInstanceOf(HTMLInputElement);
        expect(facultyFilter).toBeInstanceOf(HTMLSelectElement);
        expect(requirementFilter).toBeInstanceOf(HTMLSelectElement);
        expect(page.querySelector('[data-search-page-size]')).toBeNull();
        expect(page.querySelector('[data-search-clear]')).toBeNull();
        const filterGrid = page.querySelector<HTMLElement>(
            '[data-search-form] > .grid:last-child'
        );
        expect(filterGrid?.className).toContain('grid-cols-2');
        expect(page.querySelector('[data-search-suggestion]')).toBeNull();
        expect(syncCatalogLink?.textContent).toContain('עברו לקטלוג');
    });

    it('renders all queried cards from results', async () => {
        queryCoursesMock.mockResolvedValue({
            courses: [
                { code: '234114', name: 'מבוא למדעי המחשב', current: true },
                { code: '234124', name: 'מבני נתונים', current: false },
            ],
            total: 2,
        });

        const page = SearchPage();
        await waitForSearchRender();

        const links = page.querySelectorAll<HTMLAnchorElement>(
            '[data-search-results] > a'
        );

        expect(queryCoursesMock).toHaveBeenCalledWith(
            expect.objectContaining({ pageSize: 'all', page: 1 })
        );
        expect(links).toHaveLength(2);

        const firstLink = links[0];
        const secondLink = links[1];

        expect(firstLink.getAttribute('href')).toBe('/course?code=234114');
        expect(secondLink.className).toContain('opacity-45');
    });

    it('hides empty filter message before courses are available', async () => {
        queryCoursesMock.mockResolvedValue({ courses: [], total: 0 });
        getCoursesCountMock.mockResolvedValue(0);

        const page = SearchPage();
        await waitForSearchRender();

        const emptyMessage = page.querySelector<HTMLElement>(
            '[data-search-empty]'
        );
        expect(emptyMessage?.classList.contains('hidden')).toBe(true);
    });

    it('keeps filter interactions reactive while results are pending', async () => {
        vi.useFakeTimers();

        try {
            queryCoursesMock.mockImplementation(
                (params: { signal?: AbortSignal }) =>
                    new Promise((resolve, reject) => {
                        const signal = params.signal;
                        if (signal?.aborted === true) {
                            reject(
                                new DOMException(
                                    'The operation was aborted.',
                                    'AbortError'
                                )
                            );
                            return;
                        }

                        signal?.addEventListener(
                            'abort',
                            () => {
                                reject(
                                    new DOMException(
                                        'The operation was aborted.',
                                        'AbortError'
                                    )
                                );
                            },
                            { once: true }
                        );

                        void resolve;
                    })
            );
            getCoursesCountMock.mockImplementation(
                () => new Promise(() => undefined)
            );

            const page = SearchPage();
            const availableFilter = page.querySelector<HTMLInputElement>(
                '[data-filter-available]'
            );
            const status = page.querySelector<HTMLElement>(
                '[data-search-status]'
            );

            expect(availableFilter).toBeInstanceOf(HTMLInputElement);
            expect(status).toBeInstanceOf(HTMLElement);

            availableFilter!.checked = true;
            availableFilter!.dispatchEvent(
                new Event('change', { bubbles: true })
            );

            expect(status?.textContent).toBe('מחפש...');
            expect(window.location.search).toContain('available=1');
            expect(queryCoursesMock).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(0);

            expect(queryCoursesMock).toHaveBeenCalled();
            expect(queryCoursesMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    availableOnly: true,
                    signal: expect.any(Object),
                })
            );

            const firstSignal = queryCoursesMock.mock.calls[0][0].signal as
                | AbortSignal
                | undefined;

            availableFilter!.checked = false;
            availableFilter!.dispatchEvent(
                new Event('change', { bubbles: true })
            );

            expect(firstSignal?.aborted).toBe(true);
            expect(status?.textContent).toBe('מחפש...');

            await vi.advanceTimersByTimeAsync(0);

            const latestCallArgs = queryCoursesMock.mock.calls.at(-1)?.[0] as
                | { signal?: AbortSignal; availableOnly?: boolean }
                | undefined;
            expect(latestCallArgs?.availableOnly).toBe(false);
            expect(latestCallArgs?.signal?.aborted).toBe(false);

            const empty = page.querySelector<HTMLElement>(
                '[data-search-empty]'
            );
            expect(empty?.classList.contains('hidden')).toBe(true);
        } finally {
            vi.useRealTimers();
        }
    });
});
