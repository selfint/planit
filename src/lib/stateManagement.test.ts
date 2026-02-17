import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    getCatalogsMock: vi.fn(),
    getCourseMock: vi.fn(),
    getCourseFacultiesMock: vi.fn(),
    getCoursesCountMock: vi.fn(),
    getCoursesPageMock: vi.fn(),
    getMetaMock: vi.fn(),
    getRequirementMock: vi.fn(),
    putCatalogsMock: vi.fn(),
    putCoursesMock: vi.fn(),
    queryCoursesMock: vi.fn(),
    replaceRequirementsWithCowMock: vi.fn(),
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
    putCatalogs: mocks.putCatalogsMock,
    putCourses: mocks.putCoursesMock,
    queryCourses: mocks.queryCoursesMock,
    replaceRequirementsWithCow: mocks.replaceRequirementsWithCowMock,
    setMeta: mocks.setMetaMock,
}));

vi.mock('$lib/requirementsSync', () => ({
    getActiveRequirementsSelection: mocks.getActiveRequirementsSelectionMock,
    setActiveRequirementsSelection: mocks.setActiveRequirementsSelectionMock,
    syncRequirements: mocks.syncRequirementsMock,
}));

import {
    createLocalStateProvider,
    setStateProviderChangeHandler,
    state,
} from './stateManagement';

describe('stateManagement', () => {
    it('proxies local provider course and degree getters', async () => {
        const localProvider = createLocalStateProvider();

        await localProvider.courses.get('236501');
        await localProvider.courses.query({ page: 1, pageSize: 'all' });
        await localProvider.courses.page(10, 0);
        await localProvider.courses.count();
        await localProvider.courses.faculties();
        await localProvider.catalogs.get();
        await localProvider.requirements.get('0324');
        await localProvider.userDegree.get();
        await localProvider.userPlan.get();

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
        expect(mocks.getMetaMock).toHaveBeenCalledWith('planPageState');
    });

    it('swaps provider and notifies rerender handler', async () => {
        const rerenderHandler = vi.fn();
        setStateProviderChangeHandler(rerenderHandler);

        const customProvider = {
            courses: {
                get: vi.fn(),
                set: vi.fn(),
                query: vi.fn(),
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
                get: vi.fn(),
                set: vi.fn(),
                sync: vi.fn(),
            },
            userDegree: {
                get: vi.fn(),
                set: vi.fn(),
            },
            userPlan: {
                get: vi.fn(),
                set: vi.fn(),
            },
        };

        await state.provider.set(customProvider);
        expect(state.provider.get()).toBe(customProvider);
        expect(rerenderHandler).toHaveBeenCalledTimes(1);

        setStateProviderChangeHandler(undefined);
        await state.provider.set(createLocalStateProvider());
    });
});
