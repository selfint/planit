import { getMeta, replaceRequirementsWithCow, setMeta } from '$lib/indexeddb';
import type { RequirementRecord } from '$lib/indexeddb';

const REQUIREMENTS_META_KEYS = {
    activeCatalogId: 'requirementsActiveCatalogId',
    activeFacultyId: 'requirementsActiveFacultyId',
    activeProgramId: 'requirementsActiveProgramId',
    activePath: 'requirementsActivePath',
    lastSync: 'requirementsLastSync',
};

export type RequirementsSelection = {
    catalogId: string;
    facultyId: string;
    programId: string;
    path?: string;
};

export type RequirementsSyncResult = {
    status: 'updated' | 'offline' | 'failed';
    error?: string;
};

function isOnline(): boolean {
    return 'onLine' in navigator ? navigator.onLine : true;
}

function buildRequirementsUrl(selection: RequirementsSelection): string {
    return `https://raw.githubusercontent.com/selfint/degree-planner/main/static/_catalogs/${selection.catalogId}/${selection.facultyId}/${selection.programId}/requirementsData.json`;
}

export async function getActiveRequirementsSelection(): Promise<
    RequirementsSelection | undefined
> {
    const [catalogEntry, facultyEntry, programEntry, pathEntry] =
        await Promise.all([
            getMeta(REQUIREMENTS_META_KEYS.activeCatalogId),
            getMeta(REQUIREMENTS_META_KEYS.activeFacultyId),
            getMeta(REQUIREMENTS_META_KEYS.activeProgramId),
            getMeta(REQUIREMENTS_META_KEYS.activePath),
        ]);

    const catalogId =
        typeof catalogEntry?.value === 'string'
            ? catalogEntry.value
            : undefined;
    const facultyId =
        typeof facultyEntry?.value === 'string'
            ? facultyEntry.value
            : undefined;
    const programId =
        typeof programEntry?.value === 'string'
            ? programEntry.value
            : undefined;
    const pathValue =
        typeof pathEntry?.value === 'string' ? pathEntry.value : undefined;

    if (
        catalogId === undefined ||
        catalogId.length === 0 ||
        facultyId === undefined ||
        facultyId.length === 0 ||
        programId === undefined ||
        programId.length === 0
    ) {
        return undefined;
    }

    return {
        catalogId,
        facultyId,
        programId,
        path:
            typeof pathValue === 'string' && pathValue.length > 0
                ? pathValue
                : undefined,
    };
}

export async function syncRequirements(
    selection: RequirementsSelection
): Promise<RequirementsSyncResult> {
    if (!isOnline()) {
        return { status: 'offline' };
    }

    const previousProgramEntry = await getMeta(
        REQUIREMENTS_META_KEYS.activeProgramId
    );
    const previousProgramId =
        typeof previousProgramEntry?.value === 'string'
            ? previousProgramEntry.value
            : undefined;

    const response = await fetch(buildRequirementsUrl(selection));
    if (!response.ok) {
        return {
            status: 'failed',
            error: `שגיאה בטעינת דרישות (${String(response.status)})`,
        };
    }

    const data = (await response.json()) as RequirementRecord['data'];

    await replaceRequirementsWithCow(
        {
            catalogId: selection.catalogId,
            facultyId: selection.facultyId,
            programId: selection.programId,
            path: selection.path,
            data,
        },
        previousProgramId
    );

    await setMeta({
        key: REQUIREMENTS_META_KEYS.lastSync,
        value: new Date().toISOString(),
    });

    return { status: 'updated' };
}
