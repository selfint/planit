/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { searchCoursesMock, getMetaMock } = vi.hoisted(() => {
    return {
        searchCoursesMock: vi.fn(),
        getMetaMock: vi.fn(),
    };
});

vi.mock('$lib/indexeddb', () => ({
    searchCourses: searchCoursesMock,
    getMeta: getMetaMock,
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

import { SearchPage } from './search_page';

describe('SearchPage', () => {
    beforeEach(() => {
        searchCoursesMock.mockReset();
        getMetaMock.mockReset();
        searchCoursesMock.mockResolvedValue([]);
        getMetaMock.mockResolvedValue({ key: 'courseDataLastSync', value: '' });
        window.history.replaceState(null, '', '/search');
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders search results grid with at least 3 columns classes', () => {
        const page = SearchPage();

        const grid = page.querySelector<HTMLElement>('[data-search-results]');

        expect(grid).toBeInstanceOf(HTMLElement);
        expect(grid?.className).toContain('grid-cols-3');
        expect(grid?.className).toContain('sm:grid-cols-4');
    });

    it('renders course cards from URL query search results', async () => {
        searchCoursesMock.mockResolvedValue([
            { code: '234114', name: 'מבוא למדעי המחשב' },
            { code: '234124', name: 'מבני נתונים' },
        ]);
        window.history.replaceState(null, '', '/search?q=234');

        const page = SearchPage();
        await new Promise((resolve) => {
            window.setTimeout(resolve, 0);
        });

        const links = page.querySelectorAll<HTMLAnchorElement>(
            '[data-search-results] > a'
        );

        expect(searchCoursesMock).toHaveBeenCalledWith('234', 25);
        expect(links).toHaveLength(2);
        expect(links[0]?.getAttribute('href')).toBe('/course?code=234114');
    });
});
