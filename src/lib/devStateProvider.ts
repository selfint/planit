import type {
    CourseQueryParams,
    CourseQueryResult,
    CourseRecord,
    MetaEntry,
    RequirementRecord,
} from '$lib/indexeddb';
import type {
    RequirementsSelection,
    RequirementsSyncResult,
} from '$lib/requirementsSync';
import type { StateProvider } from '$lib/stateManagement';

export const DEV_STATE_STORAGE_KEY = 'planit:dev-state';

export type DevStatePayload = {
    courses: Record<string, CourseRecord> | CourseRecord[];
    catalogs: Record<string, unknown>;
    userDegree: RequirementsSelection;
    requirements: RequirementRecord['data'];
};

type DevStateRuntime = {
    courses: Map<string, CourseRecord>;
    catalogs: Record<string, unknown>;
    userDegree: RequirementsSelection;
    requirements: RequirementRecord;
    userPlanMeta: MetaEntry | undefined;
};

export function createDevStateProvider(
    payload: DevStatePayload
): StateProvider {
    const runtime = toDevStateRuntime(payload);

    return {
        courses: {
            get(code: string): Promise<CourseRecord | undefined> {
                return Promise.resolve(runtime.courses.get(code));
            },
            set(courses: CourseRecord[]): Promise<void> {
                for (const course of courses) {
                    runtime.courses.set(course.code, course);
                }
                return Promise.resolve();
            },
            query(params: CourseQueryParams): Promise<CourseQueryResult> {
                return Promise.resolve(queryCourses(runtime.courses, params));
            },
            page(limit: number, offset: number): Promise<CourseRecord[]> {
                if (limit <= 0 || offset < 0) {
                    return Promise.resolve([]);
                }

                const courses = Array.from(runtime.courses.values());
                return Promise.resolve(courses.slice(offset, offset + limit));
            },
            count(): Promise<number> {
                return Promise.resolve(runtime.courses.size);
            },
            faculties(): Promise<string[]> {
                const faculties = new Set<string>();
                for (const course of runtime.courses.values()) {
                    if (
                        typeof course.faculty === 'string' &&
                        course.faculty.trim().length > 0
                    ) {
                        faculties.add(course.faculty.trim());
                    }
                }

                return Promise.resolve(
                    Array.from(faculties).sort((left, right) =>
                        left.localeCompare(right)
                    )
                );
            },
            getLastSync(): Promise<string | undefined> {
                return Promise.resolve(undefined);
            },
        },
        catalogs: {
            get(): Promise<Record<string, unknown>> {
                return Promise.resolve(runtime.catalogs);
            },
            set(catalogs: Record<string, unknown>): Promise<void> {
                runtime.catalogs = catalogs;
                return Promise.resolve();
            },
        },
        requirements: {
            get(programId: string): Promise<RequirementRecord | undefined> {
                if (runtime.requirements.programId !== programId) {
                    return Promise.resolve(undefined);
                }

                return Promise.resolve(runtime.requirements);
            },
            sync(
                selection: RequirementsSelection
            ): Promise<RequirementsSyncResult> {
                runtime.userDegree = normalizeSelection(selection);
                runtime.requirements = {
                    catalogId: runtime.userDegree.catalogId,
                    facultyId: runtime.userDegree.facultyId,
                    programId: runtime.userDegree.programId,
                    path: runtime.userDegree.path,
                    data: runtime.requirements.data,
                };
                return Promise.resolve({ status: 'updated' });
            },
        },
        userDegree: {
            get(): Promise<RequirementsSelection | undefined> {
                return Promise.resolve(runtime.userDegree);
            },
            set(selection: RequirementsSelection): Promise<void> {
                runtime.userDegree = normalizeSelection(selection);
                runtime.requirements = {
                    catalogId: runtime.userDegree.catalogId,
                    facultyId: runtime.userDegree.facultyId,
                    programId: runtime.userDegree.programId,
                    path: runtime.userDegree.path,
                    data: runtime.requirements.data,
                };
                return Promise.resolve();
            },
        },
        userPlan: {
            get(): Promise<MetaEntry | undefined> {
                return Promise.resolve(runtime.userPlanMeta);
            },
            set(value: unknown): Promise<void> {
                runtime.userPlanMeta = {
                    key: 'planPageState',
                    value,
                };
                return Promise.resolve();
            },
        },
    };
}

export function parseDevStatePayload(raw: string): DevStatePayload | undefined {
    try {
        const parsed = JSON.parse(raw) as unknown;
        const payload = toDevStatePayload(parsed);
        return payload;
    } catch {
        return undefined;
    }
}

function toDevStatePayload(value: unknown): DevStatePayload | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const coursesValue = value.courses;
    const catalogsValue = value.catalogs;
    const userDegreeValue = value.userDegree;
    const requirementsValue = value.requirements;

    if (!isRecord(catalogsValue)) {
        return undefined;
    }

    const userDegree = parseSelection(userDegreeValue);
    if (userDegree === undefined) {
        return undefined;
    }

    if (!isRecord(requirementsValue) && !Array.isArray(requirementsValue)) {
        return undefined;
    }

    if (!Array.isArray(coursesValue) && !isRecord(coursesValue)) {
        return undefined;
    }

    return {
        courses: coursesValue as DevStatePayload['courses'],
        catalogs: catalogsValue,
        userDegree,
        requirements: requirementsValue,
    };
}

function toDevStateRuntime(payload: DevStatePayload): DevStateRuntime {
    const userDegree = normalizeSelection(payload.userDegree);

    return {
        courses: normalizeCourses(payload.courses),
        catalogs: payload.catalogs,
        userDegree,
        requirements: {
            catalogId: userDegree.catalogId,
            facultyId: userDegree.facultyId,
            programId: userDegree.programId,
            path: userDegree.path,
            data: payload.requirements,
        },
        userPlanMeta: undefined,
    };
}

function normalizeCourses(
    courses: Record<string, CourseRecord> | CourseRecord[]
): Map<string, CourseRecord> {
    const byCode = new Map<string, CourseRecord>();
    if (Array.isArray(courses)) {
        for (const course of courses) {
            byCode.set(course.code, course);
        }
        return byCode;
    }

    for (const [code, value] of Object.entries(courses)) {
        byCode.set(code, {
            ...value,
            code,
        });
    }
    return byCode;
}

function parseSelection(value: unknown): RequirementsSelection | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    if (
        typeof value.catalogId !== 'string' ||
        typeof value.facultyId !== 'string' ||
        typeof value.programId !== 'string'
    ) {
        return undefined;
    }

    const path = typeof value.path === 'string' ? value.path : undefined;

    return {
        catalogId: value.catalogId,
        facultyId: value.facultyId,
        programId: value.programId,
        path,
    };
}

function normalizeSelection(
    selection: RequirementsSelection
): RequirementsSelection {
    return {
        catalogId: selection.catalogId,
        facultyId: selection.facultyId,
        programId: selection.programId,
        path:
            typeof selection.path === 'string' && selection.path.length > 0
                ? selection.path
                : undefined,
    };
}

function queryCourses(
    coursesByCode: Map<string, CourseRecord>,
    params: CourseQueryParams
): CourseQueryResult {
    const normalizedQuery = normalizeSearchQuery(params.query ?? '');
    const queryTokens =
        normalizedQuery.length === 0 ? [] : normalizedQuery.split(' ');
    const normalizedFaculty = normalizeFilterText(params.faculty);
    const pointsMin = normalizePositiveNumber(params.pointsMin);
    const pointsMax = normalizePositiveNumber(params.pointsMax);
    const medianMin = normalizePositiveNumber(params.medianMin);
    const requirementCodes = new Set(params.requirementCourseCodes ?? []);
    const shouldFilterRequirement = requirementCodes.size > 0;
    const pageSize = normalizePageSize(params.pageSize);
    const page = normalizePage(params.page);
    const offset = pageSize === 'all' ? 0 : (page - 1) * pageSize;

    const plainMatches: CourseRecord[] = [];
    const codeMatches: CourseRecord[] = [];
    const namePrefixMatches: CourseRecord[] = [];
    const textMatches: CourseRecord[] = [];

    for (const course of coursesByCode.values()) {
        if (
            !isCourseMatchingFilters(
                course,
                params.availableOnly === true,
                normalizedFaculty,
                pointsMin,
                pointsMax,
                medianMin,
                requirementCodes,
                shouldFilterRequirement
            )
        ) {
            continue;
        }

        if (queryTokens.length === 0) {
            plainMatches.push(course);
            continue;
        }

        const normalizedCode = normalizeSearchQuery(course.code);
        const normalizedName = normalizeSearchQuery(course.name ?? '');
        const searchText = normalizeSearchQuery(
            `${course.code} ${course.name ?? ''}`
        );
        const hasAllTokens = queryTokens.every((token) =>
            searchText.includes(token)
        );
        if (!hasAllTokens) {
            continue;
        }

        if (normalizedCode.startsWith(normalizedQuery)) {
            codeMatches.push(course);
        } else if (normalizedName.startsWith(normalizedQuery)) {
            namePrefixMatches.push(course);
        } else {
            textMatches.push(course);
        }
    }

    const ranked =
        queryTokens.length === 0
            ? plainMatches
            : [...codeMatches, ...namePrefixMatches, ...textMatches];
    const total = ranked.length;

    if (pageSize === 'all') {
        return { courses: ranked, total };
    }

    return {
        courses: ranked.slice(offset, offset + pageSize),
        total,
    };
}

function normalizeSearchQuery(value: string): string {
    return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function normalizeFilterText(value: string | undefined): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim();
    if (normalized.length === 0) {
        return undefined;
    }
    return normalized;
}

function normalizePositiveNumber(
    value: number | undefined
): number | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return undefined;
    }

    return value;
}

function normalizePage(value: number | undefined): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
        return 1;
    }

    return value;
}

function normalizePageSize(value: number | 'all' | undefined): number | 'all' {
    if (value === 'all' || value === undefined) {
        return 'all';
    }

    if (!Number.isInteger(value) || value <= 0) {
        return 'all';
    }

    return value;
}

function isCourseMatchingFilters(
    course: CourseRecord,
    availableOnly: boolean,
    faculty: string | undefined,
    pointsMin: number | undefined,
    pointsMax: number | undefined,
    medianMin: number | undefined,
    requirementCodes: Set<string>,
    shouldFilterRequirement: boolean
): boolean {
    if (availableOnly && course.current !== true) {
        return false;
    }

    if (faculty !== undefined && course.faculty !== faculty) {
        return false;
    }

    if (pointsMin !== undefined) {
        const points = toFiniteNumber(course.points);
        if (points === undefined) {
            return false;
        }
        if (points < pointsMin) {
            return false;
        }
    }

    if (pointsMax !== undefined) {
        const points = toFiniteNumber(course.points);
        if (points === undefined) {
            return false;
        }
        if (points > pointsMax) {
            return false;
        }
    }

    if (medianMin !== undefined) {
        const median = toFiniteNumber(course.median);
        if (median === undefined) {
            return false;
        }
        if (median < medianMin) {
            return false;
        }
    }

    if (shouldFilterRequirement && !requirementCodes.has(course.code)) {
        return false;
    }

    return true;
}

function toFiniteNumber(value: unknown): number | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
