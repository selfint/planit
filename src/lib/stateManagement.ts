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

export type DevStateSnapshot = {
    courses?: CourseRecord[];
    catalogs?: Record<string, unknown>;
    requirements?: RequirementRecord[];
    requirementsByProgramId?: Record<string, unknown>;
    userDegree?: RequirementsSelection;
    userPlan?: unknown;
    courseLastSync?: string;
};

declare global {
    interface Window {
        __PLANIT_DEV_STATE__?: DevStateSnapshot;
    }
}

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

type GlobalState = StateProvider & {
    provider: {
        get(): StateProvider;
        set(nextProvider: StateProvider): Promise<void>;
    };
};

let provider: StateProvider = resolveInitialStateProvider();
let providerChangeHandler: (() => void) | undefined;

export const state: GlobalState = {
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
        set(nextProvider: StateProvider): Promise<void> {
            provider = nextProvider;
            providerChangeHandler?.();
            return Promise.resolve();
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

export async function installDevStateProviderFromWindow(): Promise<boolean> {
    if (!import.meta.env.DEV || typeof window === 'undefined') {
        return false;
    }

    const snapshot = window.__PLANIT_DEV_STATE__;
    if (snapshot === undefined) {
        return false;
    }

    await state.provider.set(createMemoryStateProvider(snapshot));
    return true;
}

function resolveInitialStateProvider(): StateProvider {
    if (!import.meta.env.DEV || typeof window === 'undefined') {
        return createLocalStateProvider();
    }

    const snapshot = window.__PLANIT_DEV_STATE__;
    if (snapshot === undefined) {
        return createLocalStateProvider();
    }

    return createMemoryStateProvider(snapshot);
}

function createMemoryStateProvider(snapshot: DevStateSnapshot): StateProvider {
    let courses = cloneStateValue(snapshot.courses ?? []);
    let catalogs = cloneStateValue(snapshot.catalogs ?? {});
    const requirements = new Map(
        buildRequirementsRecords(snapshot).map((record) => [
            record.programId,
            cloneStateValue(record),
        ])
    );
    let userDegree = cloneStateValue(snapshot.userDegree);
    let userPlan = cloneStateValue(snapshot.userPlan);
    let courseLastSync =
        typeof snapshot.courseLastSync === 'string'
            ? snapshot.courseLastSync
            : undefined;

    return {
        courses: {
            async get(code: string): Promise<CourseRecord | undefined> {
                const normalizedCode = code.trim().toUpperCase();
                const entry = courses.find(
                    (course) =>
                        course.code.trim().toUpperCase() === normalizedCode
                );
                return cloneStateValue(entry);
            },
            async set(nextCourses: CourseRecord[]): Promise<void> {
                courses = cloneStateValue(nextCourses);
            },
            async query(params: CourseQueryParams): Promise<CourseQueryResult> {
                const rankedCourses = rankCourses(courses, params);
                const pageSize = normalizePageSize(params.pageSize);
                if (pageSize === 'all') {
                    return {
                        courses: cloneStateValue(rankedCourses),
                        total: rankedCourses.length,
                    };
                }

                const page = normalizePage(params.page);
                const offset = (page - 1) * pageSize;
                return {
                    courses: cloneStateValue(
                        rankedCourses.slice(offset, offset + pageSize)
                    ),
                    total: rankedCourses.length,
                };
            },
            async page(limit: number, offset: number): Promise<CourseRecord[]> {
                const safeLimit = Math.max(0, Math.floor(limit));
                const safeOffset = Math.max(0, Math.floor(offset));
                return cloneStateValue(
                    courses.slice(safeOffset, safeOffset + safeLimit)
                );
            },
            async count(): Promise<number> {
                return courses.length;
            },
            async faculties(): Promise<string[]> {
                const labels = new Set<string>();
                for (const course of courses) {
                    const faculty = normalizeSearchText(course.faculty ?? '');
                    if (faculty.length > 0) {
                        labels.add(faculty);
                    }
                }
                return [...labels].sort((left, right) =>
                    left.localeCompare(right)
                );
            },
            async getLastSync(): Promise<string | undefined> {
                return courseLastSync;
            },
        },
        catalogs: {
            async get(): Promise<Record<string, unknown>> {
                return cloneStateValue(catalogs);
            },
            async set(nextCatalogs: Record<string, unknown>): Promise<void> {
                catalogs = cloneStateValue(nextCatalogs);
            },
        },
        requirements: {
            async get(
                programId: string
            ): Promise<RequirementRecord | undefined> {
                return cloneStateValue(requirements.get(programId));
            },
            async sync(
                selection: RequirementsSelection,
                options?: { persistActiveSelection?: boolean }
            ): Promise<RequirementsSyncResult> {
                if (options?.persistActiveSelection !== false) {
                    userDegree = cloneStateValue(selection);
                }

                const existing = requirements.get(selection.programId);
                if (existing !== undefined) {
                    requirements.set(selection.programId, {
                        ...existing,
                        catalogId: selection.catalogId,
                        facultyId: selection.facultyId,
                        path: selection.path,
                    });
                }

                return { status: 'updated' };
            },
        },
        userDegree: {
            async get(): Promise<RequirementsSelection | undefined> {
                return cloneStateValue(userDegree);
            },
            async set(selection: RequirementsSelection): Promise<void> {
                userDegree = cloneStateValue(selection);
            },
        },
        userPlan: {
            async get(): Promise<MetaEntry | undefined> {
                if (userPlan === undefined) {
                    return undefined;
                }

                return {
                    key: PLAN_META_KEY,
                    value: cloneStateValue(userPlan),
                };
            },
            async set(value: unknown): Promise<void> {
                userPlan = cloneStateValue(value);
            },
        },
    };
}

function buildRequirementsRecords(
    snapshot: DevStateSnapshot
): RequirementRecord[] {
    if (
        Array.isArray(snapshot.requirements) &&
        snapshot.requirements.length > 0
    ) {
        return snapshot.requirements;
    }

    const byProgramId = snapshot.requirementsByProgramId;
    if (byProgramId === undefined) {
        return [];
    }

    return Object.entries(byProgramId).map(([programId, data]) => ({
        programId,
        catalogId: snapshot.userDegree?.catalogId ?? 'dev-catalog',
        facultyId: snapshot.userDegree?.facultyId ?? 'dev-faculty',
        path: snapshot.userDegree?.path,
        data,
    }));
}

function rankCourses(
    source: CourseRecord[],
    params: CourseQueryParams
): CourseRecord[] {
    const normalizedQuery = normalizeSearchText(params.query ?? '');
    const tokens =
        normalizedQuery.length === 0 ? [] : normalizedQuery.split(' ');
    const filterFaculty = normalizeSearchText(params.faculty ?? '');
    const filterRequirementCodes = new Set(
        (params.requirementCourseCodes ?? []).map((code) =>
            code.trim().toUpperCase()
        )
    );

    const exactCodeMatches: CourseRecord[] = [];
    const prefixNameMatches: CourseRecord[] = [];
    const textMatches: CourseRecord[] = [];
    const plainMatches: CourseRecord[] = [];

    for (const course of source) {
        if (
            !matchesCourseFilters(
                course,
                params,
                filterFaculty,
                filterRequirementCodes
            )
        ) {
            continue;
        }

        if (tokens.length === 0) {
            plainMatches.push(course);
            continue;
        }

        const courseCode = normalizeSearchText(course.code);
        const courseName = normalizeSearchText(course.name ?? '');
        const haystack = normalizeSearchText(
            `${course.code} ${course.name ?? ''}`
        );
        const hasAllTokens = tokens.every((token) => haystack.includes(token));
        if (!hasAllTokens) {
            continue;
        }

        if (courseCode.startsWith(normalizedQuery)) {
            exactCodeMatches.push(course);
        } else if (courseName.startsWith(normalizedQuery)) {
            prefixNameMatches.push(course);
        } else {
            textMatches.push(course);
        }
    }

    return tokens.length === 0
        ? plainMatches
        : [...exactCodeMatches, ...prefixNameMatches, ...textMatches];
}

function matchesCourseFilters(
    course: CourseRecord,
    params: CourseQueryParams,
    filterFaculty: string,
    filterRequirementCodes: Set<string>
): boolean {
    if (params.availableOnly === true && course.current !== true) {
        return false;
    }

    if (filterFaculty.length > 0) {
        const courseFaculty = normalizeSearchText(course.faculty ?? '');
        if (courseFaculty !== filterFaculty) {
            return false;
        }
    }

    if (
        typeof params.pointsMin === 'number' &&
        Number.isFinite(params.pointsMin) &&
        (course.points === undefined || course.points < params.pointsMin)
    ) {
        return false;
    }

    if (
        typeof params.pointsMax === 'number' &&
        Number.isFinite(params.pointsMax) &&
        (course.points === undefined || course.points > params.pointsMax)
    ) {
        return false;
    }

    if (
        typeof params.medianMin === 'number' &&
        Number.isFinite(params.medianMin) &&
        (course.median === undefined || course.median < params.medianMin)
    ) {
        return false;
    }

    if (filterRequirementCodes.size > 0) {
        const normalizedCode = course.code.trim().toUpperCase();
        if (!filterRequirementCodes.has(normalizedCode)) {
            return false;
        }
    }

    return true;
}

function normalizePage(value: number | undefined): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return 1;
    }

    return Math.max(1, Math.floor(value));
}

function normalizePageSize(value: number | 'all' | undefined): number | 'all' {
    if (value === 'all') {
        return 'all';
    }

    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return 20;
    }

    return Math.max(1, Math.floor(value));
}

function normalizeSearchText(value: string): string {
    return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function cloneStateValue<T>(value: T): T {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }

    if (value === undefined) {
        return value;
    }

    return JSON.parse(JSON.stringify(value)) as T;
}
