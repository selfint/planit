import { CourseCard } from '$components/CourseCard';
import {
    type CourseRecord,
    getCourse,
    getMeta,
    getRequirement,
    queryCourses,
} from '$lib/indexeddb';
import { getActiveRequirementsSelection } from '$lib/requirementsSync';
import {
    type RequirementNode,
    filterRequirementsByPath,
} from '$lib/requirementsUtils';
import templateHtml from './semester_page.html?raw';

const PLAN_META_KEY = 'planPageState';
const FALLBACK_COURSE_NAME_PREFIX = 'קורס';
const FALLBACK_FACULTY = 'ללא פקולטה';
const DEFAULT_SEMESTER_NUMBER = 1;
const SEASONS = ['אביב', 'קיץ', 'חורף'] as const;

type PersistedPlan = {
    semesters?: Array<{ id?: string; courseCodes?: string[] }>;
};

type SemesterPageElements = {
    title: HTMLElement;
    subtitle: HTMLElement;
    status: HTMLElement;
    groupsRoot: HTMLElement;
    currentMeta: HTMLElement;
    currentCount: HTMLElement;
    currentCourses: HTMLElement;
    currentEmpty: HTMLElement;
};

type SemesterInfo = {
    number: number;
    season: string;
    year: number;
};

type CourseGroup = {
    title: string;
    courses: CourseRecord[];
};

export function SemesterPage(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('SemesterPage template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('SemesterPage template root not found');
    }

    const elements = queryElements(root);
    const semesterNumber = getSemesterNumberFromUrl(window.location.search);
    const semesterInfo = getFallbackSemesterInfo(semesterNumber);

    elements.title.textContent = `סמסטר ${String(semesterNumber)}`;
    elements.subtitle.textContent = `${semesterInfo.season} ${String(semesterInfo.year)}`;
    elements.status.textContent = 'טוען נתונים...';

    void hydratePage(elements, semesterNumber);

    return root;
}

function queryElements(root: HTMLElement): SemesterPageElements {
    const title = root.querySelector<HTMLElement>('[data-role="title"]');
    const subtitle = root.querySelector<HTMLElement>(
        '[data-role="semester-subtitle"]'
    );
    const status = root.querySelector<HTMLElement>('[data-role="status"]');
    const groupsRoot = root.querySelector<HTMLElement>(
        '[data-role="groups-root"]'
    );
    const currentMeta = root.querySelector<HTMLElement>(
        '[data-role="current-semester-meta"]'
    );
    const currentCount = root.querySelector<HTMLElement>(
        '[data-role="current-semester-count"]'
    );
    const currentCourses = root.querySelector<HTMLElement>(
        '[data-role="current-semester-courses"]'
    );
    const currentEmpty = root.querySelector<HTMLElement>(
        '[data-role="current-semester-empty"]'
    );

    if (
        title === null ||
        subtitle === null ||
        status === null ||
        groupsRoot === null ||
        currentMeta === null ||
        currentCount === null ||
        currentCourses === null ||
        currentEmpty === null
    ) {
        throw new Error('SemesterPage required elements not found');
    }

    return {
        title,
        subtitle,
        status,
        groupsRoot,
        currentMeta,
        currentCount,
        currentCourses,
        currentEmpty,
    };
}

function getSemesterNumberFromUrl(search: string): number {
    const params = new URLSearchParams(search);
    const raw = params.get('number');
    if (raw === null) {
        return DEFAULT_SEMESTER_NUMBER;
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
        return DEFAULT_SEMESTER_NUMBER;
    }
    return parsed;
}

function getFallbackSemesterInfo(number: number): SemesterInfo {
    const index = Math.max(0, number - 1);
    const season = SEASONS[index % SEASONS.length];
    const year = 2026 + Math.floor(number / SEASONS.length);
    return {
        number,
        season,
        year,
    };
}

async function hydratePage(
    elements: SemesterPageElements,
    semesterNumber: number
): Promise<void> {
    try {
        const [selection, requirementCountEntry, allCoursesResult] =
            await Promise.all([
                getActiveRequirementsSelection(),
                getMeta(PLAN_META_KEY),
                queryCourses({ page: 1, pageSize: 'all' }),
            ]);

        const allCourses = allCoursesResult.courses;
        const courseMap = new Map(
            allCourses.map((course) => [course.code, course])
        );

        const persistedPlan = toPersistedPlan(requirementCountEntry?.value);
        const semesterEntry =
            persistedPlan?.semesters?.at(Math.max(0, semesterNumber - 1)) ??
            undefined;
        const semesterCourseCodes = normalizeCourseCodes(
            semesterEntry?.courseCodes
        );
        const semesterCourses = await loadCoursesForCodes(
            semesterCourseCodes,
            courseMap
        );

        const semesterInfo = getSemesterInfo(semesterNumber, semesterEntry?.id);
        elements.subtitle.textContent = `${semesterInfo.season} ${String(semesterInfo.year)}`;
        elements.currentMeta.textContent = `סמסטר ${String(semesterInfo.number)} • ${semesterInfo.season} ${String(semesterInfo.year)}`;
        elements.currentCount.textContent = `${String(semesterCourses.length)} קורסים`;

        renderCurrentSemesterCourses(
            elements.currentCourses,
            elements.currentEmpty,
            semesterCourses
        );

        const catalogCodes =
            selection === undefined
                ? []
                : await loadCatalogCourseCodes(
                      selection.programId,
                      selection.path
                  );
        const semesterCourseCodeSet = new Set(semesterCourseCodes);

        const catalogCodeSet = new Set(catalogCodes);
        const freeElectiveGroups = groupFreeElectiveCourses(
            allCourses,
            catalogCodeSet,
            semesterCourseCodeSet
        );

        renderGroups(elements.groupsRoot, freeElectiveGroups);

        elements.status.textContent = `הוצגו ${String(semesterCourses.length)} קורסים בסמסטר ו-${String(freeElectiveGroups.length)} קבוצות בחירה חופשית.`;
    } catch {
        elements.status.textContent = 'טעינת נתוני הסמסטר נכשלה.';
        elements.groupsRoot.replaceChildren();
        const error = document.createElement('p');
        error.className = 'text-danger text-xs';
        error.textContent = 'אירעה שגיאה בקריאת הנתונים המקומיים.';
        elements.groupsRoot.append(error);
    }
}

function toPersistedPlan(value: unknown): PersistedPlan | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    return value as PersistedPlan;
}

function normalizeCourseCodes(codes: unknown): string[] {
    if (!Array.isArray(codes)) {
        return [];
    }

    const uniqueCodes = new Set<string>();
    for (const code of codes) {
        if (typeof code !== 'string') {
            continue;
        }
        const normalized = code.trim();
        if (normalized.length === 0) {
            continue;
        }
        uniqueCodes.add(normalized);
    }

    return [...uniqueCodes];
}

function getSemesterInfo(number: number, semesterId?: string): SemesterInfo {
    if (typeof semesterId === 'string') {
        const match = semesterId.match(/^(אביב|קיץ|חורף)-(\d{4})-/);
        if (match !== null) {
            return {
                number,
                season: match[1],
                year: Number.parseInt(match[2], 10),
            };
        }
    }

    return getFallbackSemesterInfo(number);
}

async function loadCoursesForCodes(
    codes: string[],
    courseMap: Map<string, CourseRecord>
): Promise<CourseRecord[]> {
    const courses: CourseRecord[] = [];

    await Promise.all(
        codes.map(async (code, index) => {
            const cached = courseMap.get(code);
            if (cached !== undefined) {
                courses[index] = cached;
                return;
            }

            const loaded = await getCourse(code);
            if (loaded !== undefined) {
                courseMap.set(code, loaded);
                courses[index] = loaded;
                return;
            }

            courses[index] = {
                code,
                name: `${FALLBACK_COURSE_NAME_PREFIX} ${code}`,
            };
        })
    );

    return courses;
}

function toRequirementNode(value: unknown): RequirementNode | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    return value as RequirementNode;
}

async function loadCatalogCourseCodes(
    programId: string,
    path: string | undefined
): Promise<string[]> {
    const requirementRecord = await getRequirement(programId);
    const requirementRoot = toRequirementNode(requirementRecord?.data);
    if (requirementRoot === undefined) {
        return [];
    }

    const filteredRequirement = filterRequirementsByPath(requirementRoot, path);
    return collectRequirementCourseCodes(filteredRequirement);
}

function collectRequirementCourseCodes(root: RequirementNode): string[] {
    const codes = new Set<string>();
    collectRequirementCourseCodesRecursive(root, codes);
    return [...codes];
}

function collectRequirementCourseCodesRecursive(
    node: RequirementNode,
    target: Set<string>
): void {
    if (Array.isArray(node.courses)) {
        for (const code of node.courses) {
            if (typeof code !== 'string') {
                continue;
            }
            const normalized = code.trim();
            if (normalized.length > 0) {
                target.add(normalized);
            }
        }
    }

    if (!Array.isArray(node.nested)) {
        return;
    }

    for (const child of node.nested) {
        collectRequirementCourseCodesRecursive(child, target);
    }
}

function sortCoursesByMedianAndCode(courses: CourseRecord[]): CourseRecord[] {
    return [...courses].sort((left, right) => {
        const leftMedian =
            typeof left.median === 'number' && Number.isFinite(left.median)
                ? left.median
                : Number.NEGATIVE_INFINITY;
        const rightMedian =
            typeof right.median === 'number' && Number.isFinite(right.median)
                ? right.median
                : Number.NEGATIVE_INFINITY;

        if (rightMedian !== leftMedian) {
            return rightMedian - leftMedian;
        }
        return left.code.localeCompare(right.code);
    });
}

function groupFreeElectiveCourses(
    allCourses: CourseRecord[],
    catalogCodeSet: Set<string>,
    semesterCodeSet: Set<string>
): CourseGroup[] {
    const groups = new Map<string, CourseRecord[]>();

    for (const course of allCourses) {
        if (
            catalogCodeSet.has(course.code) ||
            semesterCodeSet.has(course.code)
        ) {
            continue;
        }

        const faculty =
            typeof course.faculty === 'string' &&
            course.faculty.trim().length > 0
                ? course.faculty.trim()
                : FALLBACK_FACULTY;
        const bucket = groups.get(faculty);
        if (bucket === undefined) {
            groups.set(faculty, [course]);
            continue;
        }
        bucket.push(course);
    }

    return [...groups.entries()]
        .sort(([left], [right]) => left.localeCompare(right, 'he'))
        .map(([faculty, courses]) => ({
            title: `בחירה חופשית: ${faculty}`,
            courses: sortCoursesByMedianAndCode(courses),
        }));
}

function renderCurrentSemesterCourses(
    container: HTMLElement,
    empty: HTMLElement,
    courses: CourseRecord[]
): void {
    container.replaceChildren();
    if (courses.length === 0) {
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    for (const course of courses) {
        container.append(createCourseLink(course));
    }
}

function renderGroups(root: HTMLElement, groups: CourseGroup[]): void {
    root.replaceChildren();
    for (const group of groups) {
        const section = document.createElement('section');
        section.className = 'flex min-w-0 flex-col gap-3';
        section.dataset.groupKind = 'free';
        section.dataset.groupTitle = group.title;

        const title = document.createElement('h2');
        title.className = 'text-sm font-medium';
        title.textContent = group.title;
        section.append(title);

        const row = document.createElement('div');
        row.className =
            'grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3';

        if (group.courses.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'text-text-muted text-xs';
            empty.textContent = 'אין קורסים להצגה בקבוצה זו.';
            row.append(empty);
        } else {
            for (const course of group.courses) {
                row.append(createCourseLink(course));
            }
        }

        section.append(row);
        root.append(section);
    }
}

function createCourseLink(course: CourseRecord): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = `/course?code=${encodeURIComponent(course.code)}`;
    link.className =
        'touch-manipulation focus-visible:ring-accent/60 block min-w-0 rounded-2xl focus-visible:ring-2';
    link.dataset.courseCode = course.code;
    if (course.current !== true) {
        link.classList.add('opacity-70');
    }

    link.append(CourseCard(course));
    return link;
}
