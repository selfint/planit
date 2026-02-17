import {
    type CourseQueryParams,
    type CourseQueryResult,
    type CourseRecord,
    type MetaEntry,
    type RequirementRecord,
    getCatalogs,
    getCourse,
    getCourseFaculties,
    getCoursesCount,
    getCoursesPage,
    getMeta,
    getRequirement,
    putCatalogs,
    putCourses,
    queryCourses,
    replaceRequirementsWithCow,
    setMeta,
} from '$lib/indexeddb';
import {
    type RequirementsSelection,
    type RequirementsSyncResult,
    getActiveRequirementsSelection,
    setActiveRequirementsSelection,
    syncRequirements,
} from '$lib/requirementsSync';

const PLAN_META_KEY = 'planPageState';
const COURSE_LAST_SYNC_META_KEY = 'courseDataLastSync';

export type StateProvider = {
    courses: {
        get(code: string): Promise<CourseRecord | undefined>;
        set(courses: CourseRecord[]): Promise<void>;
        query(params: CourseQueryParams): Promise<CourseQueryResult>;
        page(limit: number, offset: number): Promise<CourseRecord[]>;
        count(): Promise<number>;
        faculties(): Promise<string[]>;
        getLastSync(): Promise<string | undefined>;
    };
    catalogs: {
        get(): Promise<Record<string, unknown>>;
        set(catalogs: Record<string, unknown>): Promise<void>;
    };
    requirements: {
        get(programId: string): Promise<RequirementRecord | undefined>;
        set(
            record: RequirementRecord,
            previousProgramId?: string,
            persistActiveSelection?: boolean
        ): Promise<void>;
        sync(
            selection: RequirementsSelection,
            options?: { persistActiveSelection?: boolean }
        ): Promise<RequirementsSyncResult>;
    };
    userDegree: {
        get(): Promise<RequirementsSelection | undefined>;
        set(selection: RequirementsSelection): Promise<void>;
    };
    userPlan: {
        get(): Promise<MetaEntry | undefined>;
        set(value: unknown): Promise<void>;
    };
};

export type StateManagement = Record<string, unknown>;

let provider: StateProvider = createLocalStateProvider();
let providerChangeHandler: (() => void) | undefined;

export const state = {
    courses: {
        get(code: string): Promise<CourseRecord | undefined> {
            return provider.courses.get(code);
        },
        set(courses: CourseRecord[]): Promise<void> {
            return provider.courses.set(courses);
        },
        query(params: CourseQueryParams): Promise<CourseQueryResult> {
            return provider.courses.query(params);
        },
        page(limit: number, offset: number): Promise<CourseRecord[]> {
            return provider.courses.page(limit, offset);
        },
        count(): Promise<number> {
            return provider.courses.count();
        },
        faculties(): Promise<string[]> {
            return provider.courses.faculties();
        },
        getLastSync(): Promise<string | undefined> {
            return provider.courses.getLastSync();
        },
    },
    catalogs: {
        get(): Promise<Record<string, unknown>> {
            return provider.catalogs.get();
        },
        set(catalogs: Record<string, unknown>): Promise<void> {
            return provider.catalogs.set(catalogs);
        },
    },
    requirements: {
        get(programId: string): Promise<RequirementRecord | undefined> {
            return provider.requirements.get(programId);
        },
        set(
            record: RequirementRecord,
            previousProgramId?: string,
            persistActiveSelection?: boolean
        ): Promise<void> {
            return provider.requirements.set(
                record,
                previousProgramId,
                persistActiveSelection
            );
        },
        sync(
            selection: RequirementsSelection,
            options?: { persistActiveSelection?: boolean }
        ): Promise<RequirementsSyncResult> {
            return provider.requirements.sync(selection, options);
        },
    },
    userDegree: {
        get(): Promise<RequirementsSelection | undefined> {
            return provider.userDegree.get();
        },
        set(selection: RequirementsSelection): Promise<void> {
            return provider.userDegree.set(selection);
        },
    },
    userPlan: {
        get(): Promise<MetaEntry | undefined> {
            return provider.userPlan.get();
        },
        set(value: unknown): Promise<void> {
            return provider.userPlan.set(value);
        },
    },
    provider: {
        get(): StateProvider {
            return provider;
        },
        async set(nextProvider: StateProvider): Promise<void> {
            provider = nextProvider;
            providerChangeHandler?.();
        },
    },
};

export function setStateProviderChangeHandler(
    handler: (() => void) | undefined
): void {
    providerChangeHandler = handler;
}

export function createLocalStateProvider(): StateProvider {
    return {
        courses: {
            get: getCourse,
            set: putCourses,
            query: queryCourses,
            page: getCoursesPage,
            count: getCoursesCount,
            faculties: getCourseFaculties,
            async getLastSync(): Promise<string | undefined> {
                const entry = await getMeta(COURSE_LAST_SYNC_META_KEY);
                return typeof entry?.value === 'string'
                    ? entry.value
                    : undefined;
            },
        },
        catalogs: {
            get: getCatalogs,
            set: putCatalogs,
        },
        requirements: {
            get: getRequirement,
            set: replaceRequirementsWithCow,
            sync: syncRequirements,
        },
        userDegree: {
            get: getActiveRequirementsSelection,
            set: setActiveRequirementsSelection,
        },
        userPlan: {
            get: () => getMeta(PLAN_META_KEY),
            set: (value) =>
                setMeta({
                    key: PLAN_META_KEY,
                    value,
                }),
        },
    };
}
