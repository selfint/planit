/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/indexeddb', () => ({
    queryCourses: vi.fn().mockResolvedValue({ courses: [], total: 0 }),
    getCourseFaculties: vi.fn().mockResolvedValue(['CS']),
    getRequirement: vi.fn().mockResolvedValue(undefined),
    getMeta: vi
        .fn()
        .mockResolvedValue({ key: 'courseDataLastSync', value: '' }),
}));

import { SearchPage } from './search_page';

describe('search page route-level behavior', () => {
    it('renders filters and results region', () => {
        const page = SearchPage();

        const input = page.querySelector('[data-search-input]');
        const faculty = page.querySelector('[data-filter-faculty]');
        const available = page.querySelector('[data-filter-available]');
        const results = page.querySelector('[data-search-results]');

        expect(page.querySelector('h1')).toBeNull();
        expect(input).toBeInstanceOf(HTMLInputElement);
        expect(faculty).toBeInstanceOf(HTMLSelectElement);
        expect(available).toBeInstanceOf(HTMLInputElement);
        expect(page.querySelector('[data-search-page-size]')).toBeNull();
        expect(results).toBeInstanceOf(HTMLDivElement);
    });
});
