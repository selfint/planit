import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    getCatalogsMock: vi.fn(),
    getCourseMock: vi.fn(),
    getCourseFacultiesMock: vi.fn(),
    getCoursesCountMock: vi.fn(),
    getCoursesPageMock: vi.fn(),
    getMetaMock: vi.fn(),
    getRequirementMock: vi.fn(),
    queryCoursesMock: vi.fn(),
    setMetaMock: vi.fn(),
    getActiveRequirementsSelectionMock: vi.fn(),
    setActiveRequirementsSelectionMock: vi.fn(),
    syncRequirementsMock: vi.fn(),
}));

vi.mock('$lib/indexeddb', () => ({
    getCatalogs: mocks.getCatalogsMock,
    getCourse: mocks.getCourseMock,
    getCourseFaculties: mocks.getCourseFacultiesMock,
    getCoursesCount: mocks.getCoursesCountMock,
    getCoursesPage: mocks.getCoursesPageMock,
    getMeta: mocks.getMetaMock,
    getRequirement: mocks.getRequirementMock,
    queryCourses: mocks.queryCoursesMock,
    setMeta: mocks.setMetaMock,
}));

vi.mock('$lib/requirementsSync', () => ({
    getActiveRequirementsSelection: mocks.getActiveRequirementsSelectionMock,
    setActiveRequirementsSelection: mocks.setActiveRequirementsSelectionMock,
    syncRequirements: mocks.syncRequirementsMock,
}));

import { createStateManagement } from './stateManagement';

describe('stateManagement', () => {
    it('proxies course, catalog, and requirements reads', async () => {
        const state = createStateManagement();

        await state.courses.getCourse('236501');
        await state.courses.queryCourses({ page: 1, pageSize: 'all' });
        await state.courses.getCoursesPage(10, 0);
        await state.courses.getCoursesCount();
        await state.courses.getCourseFaculties();
        await state.catalogs.getCatalogs();
        await state.requirements.getRequirement('0324');
        await state.requirements.getActiveSelection();

        expect(mocks.getCourseMock).toHaveBeenCalledWith('236501');
        expect(mocks.queryCoursesMock).toHaveBeenCalledWith({
            page: 1,
            pageSize: 'all',
        });
        expect(mocks.getCoursesPageMock).toHaveBeenCalledWith(10, 0);
        expect(mocks.getCoursesCountMock).toHaveBeenCalled();
        expect(mocks.getCourseFacultiesMock).toHaveBeenCalled();
        expect(mocks.getCatalogsMock).toHaveBeenCalled();
        expect(mocks.getRequirementMock).toHaveBeenCalledWith('0324');
        expect(mocks.getActiveRequirementsSelectionMock).toHaveBeenCalled();
    });

    it('persists requirements selection and plan state', async () => {
        const state = createStateManagement();

        await state.requirements.setActiveSelection({
            catalogId: '2025_200',
            facultyId: 'computer-science',
            programId: '0324',
            path: 'software-path',
        });
        await state.requirements.sync(
            {
                catalogId: '2025_200',
                facultyId: 'computer-science',
                programId: '0324',
            },
            { persistActiveSelection: false }
        );
        await state.plan.getPlanState();
        await state.plan.setPlanState({ version: 2 });
        await state.meta.get('courseDataLastSync');
        await state.meta.set({ key: 'x', value: 'y' });

        expect(mocks.setActiveRequirementsSelectionMock).toHaveBeenCalledWith({
            catalogId: '2025_200',
            facultyId: 'computer-science',
            programId: '0324',
            path: 'software-path',
        });
        expect(mocks.syncRequirementsMock).toHaveBeenCalledWith(
            {
                catalogId: '2025_200',
                facultyId: 'computer-science',
                programId: '0324',
            },
            { persistActiveSelection: false }
        );
        expect(mocks.getMetaMock).toHaveBeenCalledWith('planPageState');
        expect(mocks.setMetaMock).toHaveBeenCalledWith({
            key: 'planPageState',
            value: { version: 2 },
        });
        expect(mocks.getMetaMock).toHaveBeenCalledWith('courseDataLastSync');
        expect(mocks.setMetaMock).toHaveBeenCalledWith({
            key: 'x',
            value: 'y',
        });
    });
});
