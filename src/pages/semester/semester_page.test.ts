/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { state, type StateProvider } from '$lib/stateManagement';

const mocks = vi.hoisted(() => ({
    getMetaMock: vi.fn(),
    queryCoursesMock: vi.fn(),
    getRequirementMock: vi.fn(),
    getCourseMock: vi.fn(),
    getActiveRequirementsSelectionMock: vi.fn(),
}));

vi.mock('$components/CourseCard', () => ({
    CourseCard: (course?: { code?: string; name?: string }): HTMLElement => {
        const card = document.createElement('article');
        card.dataset.component = 'CourseCard';
        card.dataset.courseCode = course?.code ?? 'skeleton';
        card.textContent = course?.name ?? course?.code ?? 'skeleton';
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

import { SemesterPage } from './semester_page';

describe('SemesterPage', () => {
    beforeEach(async () => {
        mocks.getMetaMock.mockReset();
        mocks.queryCoursesMock.mockReset();
        mocks.getRequirementMock.mockReset();
        mocks.getCourseMock.mockReset();
        mocks.getActiveRequirementsSelectionMock.mockReset();
        mocks.getCourseMock.mockResolvedValue(undefined);
        window.history.replaceState(null, '', '/semester');
        await state.provider.set(createStateProviderMock());
    });

    it('uses query param number and shows semester metadata in sticky title', async () => {
        window.history.replaceState(null, '', '/semester?number=3');
        mocks.getMetaMock.mockResolvedValue({
            value: {
                semesters: [
                    { id: 'אביב-2026-0', courseCodes: [] },
                    { id: 'קיץ-2026-1', courseCodes: [] },
                    { id: 'חורף-2027-2', courseCodes: ['104031'] },
                ],
            },
        });
        mocks.queryCoursesMock.mockResolvedValue({
            courses: [{ code: '104031', name: 'חדו"א 1', faculty: 'מתמטיקה' }],
            total: 1,
        });
        mocks.getActiveRequirementsSelectionMock.mockResolvedValue(undefined);

        const page = SemesterPage();
        await flushPromises();

        const currentTitle = page.querySelector(
            '[data-role="current-semester-title"]'
        );
        expect(currentTitle?.textContent).toContain('סמסטר 3');
        expect(currentTitle?.textContent).toContain('חורף 2027');
    });

    it('renders current semester separately from catalog and free-elective groups', async () => {
        window.history.replaceState(null, '', '/semester?number=2');
        mocks.getMetaMock.mockResolvedValue({
            value: {
                semesters: [
                    { id: 'אביב-2026-0', courseCodes: [] },
                    { id: 'קיץ-2026-1', courseCodes: ['A100'] },
                ],
            },
        });
        mocks.queryCoursesMock.mockResolvedValue({
            courses: [
                {
                    code: 'A100',
                    name: 'A100',
                    faculty: 'מדעי המחשב',
                    median: 90,
                },
                {
                    code: 'B200',
                    name: 'B200',
                    faculty: 'מדעי המחשב',
                    median: 80,
                },
                { code: 'C300', name: 'C300', faculty: 'מתמטיקה', median: 70 },
                { code: 'D400', name: 'D400', faculty: 'פיזיקה', median: 85 },
            ],
            total: 4,
        });
        mocks.getActiveRequirementsSelectionMock.mockResolvedValue({
            catalogId: '2025_200',
            facultyId: 'computer-science',
            programId: '0324',
            path: 'software',
        });
        mocks.getRequirementMock.mockResolvedValue({
            data: {
                name: 'root',
                nested: [
                    {
                        name: 'software',
                        en: 'Software Path',
                        nested: [
                            {
                                name: 'core',
                                courses: ['A100', 'B200'],
                            },
                        ],
                    },
                ],
            },
        });

        const page = SemesterPage();
        await flushPromises();

        const currentCodes = Array.from(
            page.querySelectorAll(
                '[data-role="current-semester-courses"] a[data-course-code]'
            )
        ).map((node) => node.getAttribute('data-course-code'));
        expect(currentCodes).toEqual(['A100']);

        const requirementSections = page.querySelectorAll(
            '[data-group-kind="requirement"]'
        );
        expect(requirementSections.length).toBeGreaterThan(0);
        const requirementCodes = Array.from(
            requirementSections[0].querySelectorAll('a[data-course-code]')
        ).map((node) => node.getAttribute('data-course-code'));
        expect(requirementCodes).toContain('B200');

        const freeTitles = Array.from(
            page.querySelectorAll<HTMLElement>('[data-group-kind="free"] h2')
        ).map((node) => node.textContent.trim());
        expect(freeTitles).toContain('בחירה חופשית: מתמטיקה');
        expect(freeTitles).toContain('בחירה חופשית: פיזיקה');
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
            get: mocks.getCourseMock,
            set: vi.fn(),
            query: mocks.queryCoursesMock,
            page: vi.fn(),
            count: vi.fn(),
            faculties: vi.fn(),
            getLastSync: vi.fn(),
        },
        catalogs: {
            get: vi.fn(),
            set: vi.fn(),
        },
        requirements: {
            get: mocks.getRequirementMock,
            set: vi.fn(),
            sync: vi.fn(),
        },
        userDegree: {
            get: mocks.getActiveRequirementsSelectionMock,
            set: vi.fn(),
        },
        userPlan: {
            get: mocks.getMetaMock,
            set: vi.fn(),
        },
    };
}
