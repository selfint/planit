/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/indexeddb', () => ({
    searchCourses: vi.fn().mockResolvedValue([]),
    getMeta: vi
        .fn()
        .mockResolvedValue({ key: 'courseDataLastSync', value: '' }),
}));

import { SearchPage } from './search_page';

describe('search page route-level behavior', () => {
    it('renders heading, input and results region', () => {
        const page = SearchPage();

        const heading = page.querySelector('h1');
        const input = page.querySelector('[data-search-input]');
        const results = page.querySelector('[data-search-results]');

        expect(heading?.textContent).toContain('חיפוש קורסים מהיר');
        expect(input).toBeInstanceOf(HTMLInputElement);
        expect(results).toBeInstanceOf(HTMLDivElement);
    });
});
