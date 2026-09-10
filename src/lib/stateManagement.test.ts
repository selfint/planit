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
    firebaseLoginMock: vi.fn(),
    firebaseLogoutMock: vi.fn(),
    firebaseGetUserMock: vi.fn(),
    firebaseLoadUserDataMock: vi.fn(),
    firebaseSaveUserDataMock: vi.fn(),
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

vi.mock('$lib/firebase', () => ({
    getUser: mocks.firebaseGetUserMock,
    loadUserData: mocks.firebaseLoadUserDataMock,
    login: mocks.firebaseLoginMock,
    logout: mocks.firebaseLogoutMock,
    saveUserData: mocks.firebaseSaveUserDataMock,
}));

import {
    createLocalStateProvider,
    setStateProviderChangeHandler,
    state,
} from './stateManagement';

describe('stateManagement', () => {
    it('proxies local provider course and degree getters', async () => {
        mocks.firebaseGetUserMock.mockReturnValue(null);
        const localProvider = createLocalStateProvider();

        await localProvider.courses.get('236501');
        await localProvider.courses.query({ page: 1, pageSize: 'all' });
        await localProvider.courses.page(10, 0);
        await localProvider.courses.count();
        await localProvider.courses.faculties();
        await localProvider.courses.getLastSync();
        await localProvider.catalogs.get();
        await localProvider.requirements.get('0324');
        await localProvider.userDegree.get();
        await localProvider.userPlan.get();
        localProvider.firebase.getUser();
        await localProvider.firebase.login();
        await localProvider.firebase.logout();

        expect(mocks.getCourseMock).toHaveBeenCalledWith('236501');
        expect(mocks.queryCoursesMock).toHaveBeenCalledWith({
            page: 1,
            pageSize: 'all',
        });
        expect(mocks.getCoursesPageMock).toHaveBeenCalledWith(10, 0);
        expect(mocks.getCoursesCountMock).toHaveBeenCalled();
        expect(mocks.getCourseFacultiesMock).toHaveBeenCalled();
        expect(mocks.getMetaMock).toHaveBeenCalledWith('courseDataGeneratedAt');
        expect(mocks.getCatalogsMock).toHaveBeenCalled();
        expect(mocks.getRequirementMock).toHaveBeenCalledWith('0324');
        expect(mocks.getActiveRequirementsSelectionMock).toHaveBeenCalled();
        expect(mocks.getMetaMock).toHaveBeenCalledWith('planPageState');
        expect(mocks.firebaseGetUserMock).toHaveBeenCalled();
        expect(mocks.firebaseLoginMock).toHaveBeenCalled();
        expect(mocks.firebaseLogoutMock).toHaveBeenCalled();
    });

    it('swaps provider and notifies rerender handler', () => {
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
            firebase: {
                getUser: vi.fn(),
                login: vi.fn(),
                logout: vi.fn(),
            },
        };

        state.provider.set(customProvider);
        expect(state.provider.get()).toBe(customProvider);
        expect(rerenderHandler).toHaveBeenCalledTimes(1);

        setStateProviderChangeHandler(undefined);
        state.provider.set(createLocalStateProvider());
    });

    it('loads user degree and plan from firestore when authenticated', async () => {
        const localProvider = createLocalStateProvider();
        const firestoreSelection = {
            catalogId: '2024-2025',
            facultyId: '01',
            programId: '1234',
            path: 'main',
        };
        const firestorePlan = {
            semesterCount: 8,
            currentSemester: 2,
        };

        mocks.firebaseGetUserMock.mockReturnValue({ uid: 'u-1' });
        mocks.firebaseLoadUserDataMock.mockImplementation((key: string) => {
            if (key === 'userDegree') {
                return Promise.resolve(firestoreSelection);
            }
            if (key === 'planPageState') {
                return Promise.resolve(firestorePlan);
            }
            return Promise.resolve(undefined);
        });

        const resolvedSelection = await localProvider.userDegree.get();
        const resolvedPlan = await localProvider.userPlan.get();

        expect(resolvedSelection).toEqual(firestoreSelection);
        expect(mocks.setActiveRequirementsSelectionMock).toHaveBeenCalledWith(
            firestoreSelection
        );
        expect(resolvedPlan).toEqual({
            key: 'planPageState',
            value: firestorePlan,
        });
        expect(mocks.setMetaMock).toHaveBeenCalledWith({
            key: 'planPageState',
            value: firestorePlan,
        });
    });

    it('saves user degree and plan to firestore when authenticated', async () => {
        const localProvider = createLocalStateProvider();
        const selection = {
            catalogId: '2024-2025',
            facultyId: '01',
            programId: '1234',
            path: undefined,
        };
        const planPayload = {
            semesterCount: 6,
            currentSemester: 1,
        };

        mocks.firebaseGetUserMock.mockReturnValue({ uid: 'u-1' });

        await localProvider.userDegree.set(selection);
        await localProvider.userPlan.set(planPayload);

        expect(mocks.setActiveRequirementsSelectionMock).toHaveBeenCalledWith(
            selection
        );
        expect(mocks.firebaseSaveUserDataMock).toHaveBeenCalledWith(
            'userDegree',
            selection
        );
        expect(mocks.setMetaMock).toHaveBeenCalledWith({
            key: 'planPageState',
            value: planPayload,
        });
        expect(mocks.firebaseSaveUserDataMock).toHaveBeenCalledWith(
            'planPageState',
            planPayload
        );
    });
});
