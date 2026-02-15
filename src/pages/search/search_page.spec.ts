/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
    queryCoursesMock,
    getCourseFacultiesMock,
    getCoursesCountMock,
    getRequirementMock,
    getMetaMock,
} = vi.hoisted(() => {
    return {
        queryCoursesMock: vi.fn(),
        getCourseFacultiesMock: vi.fn(),
        getCoursesCountMock: vi.fn(),
        getRequirementMock: vi.fn(),
        getMetaMock: vi.fn(),
    };
});

vi.mock('$lib/indexeddb', () => ({
    queryCourses: queryCoursesMock,
    getCourseFaculties: getCourseFacultiesMock,
    getCoursesCount: getCoursesCountMock,
    getRequirement: getRequirementMock,
    getMeta: getMetaMock,
}));

import { SearchPage } from './search_page';

describe('search page integration filters', () => {
    beforeEach(() => {
        queryCoursesMock.mockReset();
        getCourseFacultiesMock.mockReset();
        getCoursesCountMock.mockReset();
        getRequirementMock.mockReset();
        getMetaMock.mockReset();

        queryCoursesMock.mockResolvedValue({ courses: [], total: 0 });
        getCourseFacultiesMock.mockResolvedValue(['CS', 'Math']);
        getCoursesCountMock.mockResolvedValue(100);
        getRequirementMock.mockResolvedValue({
            programId: 'p1',
            data: { he: 'ליבה', courses: ['234114'] },
        });
        getMetaMock.mockImplementation(async (key: string) => {
            if (key === 'requirementsActiveProgramId') {
                return { key, value: 'p1' };
            }
            return { key, value: '' };
        });

        window.history.replaceState(null, '', '/search');
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders filters and results region', () => {
        const page = SearchPage();

        expect(page.querySelector('[data-search-input]')).toBeInstanceOf(
            HTMLInputElement
        );
        expect(page.querySelector('[data-filter-available]')).toBeInstanceOf(
            HTMLInputElement
        );
        expect(page.querySelector('[data-filter-faculty]')).toBeInstanceOf(
            HTMLSelectElement
        );
        expect(page.querySelector('[data-search-results]')).toBeInstanceOf(
            HTMLDivElement
        );
    });

    it('passes available filter to query', async () => {
        const page = SearchPage();
        await settle();
        queryCoursesMock.mockClear();

        const available = page.querySelector<HTMLInputElement>(
            '[data-filter-available]'
        );
        available!.checked = true;
        available!.dispatchEvent(new Event('change'));
        await settle();

        expect(lastQuery()).toEqual(
            expect.objectContaining({ availableOnly: true })
        );
    });

    it('passes faculty filter to query', async () => {
        const page = SearchPage();
        await settle();
        queryCoursesMock.mockClear();

        const faculty = page.querySelector<HTMLSelectElement>(
            '[data-filter-faculty]'
        );
        faculty!.value = 'Math';
        faculty!.dispatchEvent(new Event('change'));
        await settle();

        expect(lastQuery()).toEqual(
            expect.objectContaining({ faculty: 'Math' })
        );
    });

    it('passes points min and max filters to query', async () => {
        const page = SearchPage();
        await settle();
        queryCoursesMock.mockClear();

        const pointsMin = page.querySelector<HTMLInputElement>(
            '[data-filter-points-min]'
        );
        const pointsMax = page.querySelector<HTMLInputElement>(
            '[data-filter-points-max]'
        );

        pointsMin!.value = '3.5';
        pointsMin!.dispatchEvent(new Event('input'));
        pointsMax!.value = '5';
        pointsMax!.dispatchEvent(new Event('input'));
        await settle();

        expect(lastQuery()).toEqual(
            expect.objectContaining({ pointsMin: 3.5, pointsMax: 5 })
        );
    });

    it('passes median minimum filter to query', async () => {
        const page = SearchPage();
        await settle();
        queryCoursesMock.mockClear();

        const medianMin = page.querySelector<HTMLInputElement>(
            '[data-filter-median-min]'
        );
        medianMin!.value = '82';
        medianMin!.dispatchEvent(new Event('input'));
        await settle();

        expect(lastQuery()).toEqual(expect.objectContaining({ medianMin: 82 }));
    });

    it('passes requirement filter to query', async () => {
        const page = SearchPage();
        await settle();
        queryCoursesMock.mockClear();

        const requirement = page.querySelector<HTMLSelectElement>(
            '[data-filter-requirement]'
        );
        requirement!.value = 'ליבה';
        requirement!.dispatchEvent(new Event('change'));
        await settle();

        expect(lastQuery()).toEqual(
            expect.objectContaining({ requirementCourseCodes: ['234114'] })
        );
    });
});

function lastQuery(): unknown {
    return queryCoursesMock.mock.calls.at(-1)?.[0];
}

async function settle(): Promise<void> {
    await new Promise((resolve) => {
        window.setTimeout(resolve, 0);
    });
}
