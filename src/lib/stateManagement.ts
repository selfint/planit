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
    queryCourses,
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

export type StateManagement = {
    courses: {
        getCourse(code: string): Promise<CourseRecord | undefined>;
        queryCourses(params: CourseQueryParams): Promise<CourseQueryResult>;
        getCoursesPage(limit: number, offset: number): Promise<CourseRecord[]>;
        getCoursesCount(): Promise<number>;
        getCourseFaculties(): Promise<string[]>;
    };
    catalogs: {
        getCatalogs(): Promise<Record<string, unknown>>;
    };
    requirements: {
        getRequirement(
            programId: string
        ): Promise<RequirementRecord | undefined>;
        getActiveSelection(): Promise<RequirementsSelection | undefined>;
        setActiveSelection(selection: RequirementsSelection): Promise<void>;
        sync(
            selection: RequirementsSelection,
            options?: { persistActiveSelection?: boolean }
        ): Promise<RequirementsSyncResult>;
    };
    plan: {
        getPlanState(): Promise<MetaEntry | undefined>;
        setPlanState(value: unknown): Promise<void>;
    };
    meta: {
        get(key: string): Promise<MetaEntry | undefined>;
        set(entry: MetaEntry): Promise<void>;
    };
};

export function createStateManagement(): StateManagement {
    return {
        courses: {
            getCourse,
            queryCourses,
            getCoursesPage,
            getCoursesCount,
            getCourseFaculties,
        },
        catalogs: {
            getCatalogs,
        },
        requirements: {
            getRequirement,
            getActiveSelection: getActiveRequirementsSelection,
            setActiveSelection: setActiveRequirementsSelection,
            sync: syncRequirements,
        },
        plan: {
            getPlanState: () => getMeta(PLAN_META_KEY),
            setPlanState: (value) =>
                setMeta({
                    key: PLAN_META_KEY,
                    value,
                }),
        },
        meta: {
            get: getMeta,
            set: setMeta,
        },
    };
}
