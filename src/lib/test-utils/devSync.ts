import {
    type CourseRecord,
    type RequirementRecord,
    getMeta,
    putCatalogs,
    putCourses,
    replaceRequirementsWithCow,
    setMeta,
} from '$lib/indexeddb';
import type { RequirementsSelection } from '$lib/requirementsSync';

const COURSE_META_KEYS = {
    lastSync: 'courseDataLastSync',
    count: 'courseDataCount',
};

const CATALOGS_META_KEYS = {
    lastSync: 'catalogsDataLastSync',
    count: 'catalogsDataCount',
};

const REQUIREMENTS_META_KEYS = {
    activeProgramId: 'requirementsActiveProgramId',
    lastSync: 'requirementsLastSync',
};

export const DEV_STATE_STORAGE_KEY = 'planit:dev-state';

export type DevStatePayload = {
    courses: Record<string, CourseRecord> | CourseRecord[];
    catalogs: Record<string, unknown>;
    userDegree: RequirementsSelection;
    requirements: RequirementRecord['data'];
};

export async function initDevSync(): Promise<boolean> {
    if (!import.meta.env.DEV) {
        return false;
    }

    const serialized = window.localStorage.getItem(DEV_STATE_STORAGE_KEY);
    if (serialized === null || serialized.length === 0) {
        return false;
    }

    const payload = parseDevStatePayload(serialized);
    if (payload === undefined) {
        throw new Error('Invalid dev state payload in localStorage');
    }

    const now = new Date().toISOString();
    const courses = normalizeCourses(payload.courses);
    const catalogs = payload.catalogs;
    const userDegree = normalizeSelection(payload.userDegree);

    const previousProgramEntry = await getMeta(
        REQUIREMENTS_META_KEYS.activeProgramId
    );
    const previousProgramId =
        typeof previousProgramEntry?.value === 'string'
            ? previousProgramEntry.value
            : undefined;

    await putCourses(courses);
    await putCatalogs(catalogs);
    await replaceRequirementsWithCow(
        {
            catalogId: userDegree.catalogId,
            facultyId: userDegree.facultyId,
            programId: userDegree.programId,
            path: userDegree.path,
            data: payload.requirements,
        },
        previousProgramId,
        true
    );

    await Promise.all([
        setMeta({ key: COURSE_META_KEYS.lastSync, value: now }),
        setMeta({ key: COURSE_META_KEYS.count, value: courses.length }),
        setMeta({
            key: CATALOGS_META_KEYS.lastSync,
            value: now,
        }),
        setMeta({
            key: CATALOGS_META_KEYS.count,
            value: Object.keys(catalogs).length,
        }),
        setMeta({
            key: REQUIREMENTS_META_KEYS.lastSync,
            value: now,
        }),
    ]);

    return true;
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

function normalizeCourses(
    courses: Record<string, CourseRecord> | CourseRecord[]
): CourseRecord[] {
    if (Array.isArray(courses)) {
        return courses;
    }

    return Object.entries(courses).map(([code, value]) => ({
        ...value,
        code,
    }));
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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
