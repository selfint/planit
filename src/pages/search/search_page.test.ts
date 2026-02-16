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
        await new Promise((resolve) => {
            window.setTimeout(resolve, 0);
        });

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
        await new Promise((resolve) => {
            window.setTimeout(resolve, 0);
        });

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
        expect(firstLink.className).toContain('h-[7.5rem]');
        expect(firstLink.className).toContain('sm:h-[6.5rem]');
        expect(firstLink.className).toContain(
            '[contain-intrinsic-size:7.5rem]'
        );
        expect(firstLink.className).toContain(
            'sm:[contain-intrinsic-size:6.5rem]'
        );
        expect(secondLink.className).toContain('opacity-45');
    });

    it('hides empty filter message before courses are available', async () => {
        queryCoursesMock.mockResolvedValue({ courses: [], total: 0 });
        getCoursesCountMock.mockResolvedValue(0);

        const page = SearchPage();
        await new Promise((resolve) => {
            window.setTimeout(resolve, 0);
        });

        const emptyMessage = page.querySelector<HTMLElement>(
            '[data-search-empty]'
        );
        expect(emptyMessage?.classList.contains('hidden')).toBe(true);
    });
});
