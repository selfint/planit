import { CourseCard } from '$components/CourseCard';
import { ConsoleNav } from '$components/ConsoleNav';
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
    getRequirementId,
    getRequirementLabel,
} from '$lib/requirementsUtils';
import templateHtml from './semester_page.html?raw';

const PLAN_META_KEY = 'planPageState';
const FALLBACK_COURSE_NAME_PREFIX = 'קורס';
const FALLBACK_FACULTY = 'ללא פקולטה';
const DEFAULT_SEMESTER_NUMBER = 1;
const DESKTOP_MIN_WIDTH = 1024;
const DESKTOP_STICKY_GAP_PX = 8;
const DESKTOP_STICKY_BOTTOM_GAP_PX = 12;
const SEASONS = ['אביב', 'קיץ', 'חורף'] as const;

type PersistedPlan = {
    semesters?: Array<{ id?: string; courseCodes?: string[] }>;
};

type SemesterPageElements = {
    groupsRoot: HTMLElement;
    currentAside: HTMLElement;
    currentSection: HTMLElement;
    currentTitle: HTMLElement;
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
    kind: 'requirement' | 'free';
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

    const consoleNavHost =
        root.querySelector<HTMLElement>('[data-console-nav]');
    if (consoleNavHost !== null) {
        consoleNavHost.replaceWith(ConsoleNav({ activePath: '/semester' }));
    }

    const elements = queryElements(root);
    const semesterNumber = getSemesterNumberFromUrl(window.location.search);
    setupStickyExpansion(elements.currentAside, elements.currentSection);

    void hydratePage(elements, semesterNumber);

    return root;
}

function queryElements(root: HTMLElement): SemesterPageElements {
    const groupsRoot = root.querySelector<HTMLElement>(
        '[data-role="groups-root"]'
    );
    const currentAside = root.querySelector<HTMLElement>(
        '[data-role="current-semester-aside"]'
    );
    const currentSection = root.querySelector<HTMLElement>(
        '[data-role="current-semester"]'
    );
    const currentTitle = root.querySelector<HTMLElement>(
        '[data-role="current-semester-title"]'
    );
    const currentCourses = root.querySelector<HTMLElement>(
        '[data-role="current-semester-courses"]'
    );
    const currentEmpty = root.querySelector<HTMLElement>(
        '[data-role="current-semester-empty"]'
    );

    if (
        groupsRoot === null ||
        currentAside === null ||
        currentSection === null ||
        currentTitle === null ||
        currentCourses === null ||
        currentEmpty === null
    ) {
        throw new Error('SemesterPage required elements not found');
    }

    return {
        groupsRoot,
        currentAside,
        currentSection,
        currentTitle,
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
        elements.currentTitle.textContent = `סמסטר ${String(semesterInfo.number)} • ${semesterInfo.season} ${String(semesterInfo.year)}`;

        renderCurrentSemesterCourses(
            elements.currentCourses,
            elements.currentEmpty,
            semesterCourses
        );

        const semesterCourseCodeSet = new Set(semesterCourseCodes);

        const catalogGroups =
            selection === undefined
                ? []
                : await loadRequirementCourseGroups(
                      selection.programId,
                      selection.path,
                      courseMap,
                      semesterCourseCodeSet
                  );
        const catalogCodes = collectUniqueCodesFromGroups(catalogGroups);

        const catalogCodeSet = new Set(catalogCodes);
        const freeElectiveGroups = groupFreeElectiveCourses(
            allCourses,
            catalogCodeSet,
            semesterCourseCodeSet
        );

        renderGroups(elements.groupsRoot, [
            ...catalogGroups,
            ...freeElectiveGroups,
        ]);
    } catch {
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

async function loadRequirementCourseGroups(
    programId: string,
    path: string | undefined,
    courseMap: Map<string, CourseRecord>,
    semesterCodeSet: Set<string>
): Promise<CourseGroup[]> {
    const requirementRecord = await getRequirement(programId);
    const requirementRoot = toRequirementNode(requirementRecord?.data);
    if (requirementRoot === undefined) {
        return [];
    }

    const filteredRequirement = filterRequirementsByPath(requirementRoot, path);
    const rawGroups = collectRequirementGroups(filteredRequirement);
    const result: CourseGroup[] = [];

    for (const rawGroup of rawGroups) {
        const groupCodes = rawGroup.courseCodes.filter(
            (code) => !semesterCodeSet.has(code)
        );
        if (groupCodes.length === 0) {
            continue;
        }

        const courses = sortCoursesByMedianAndCode(
            await loadCoursesForCodes(groupCodes, courseMap)
        );
        result.push({
            title: rawGroup.label,
            courses,
            kind: 'requirement',
        });
    }

    return result;
}

type RequirementCourseGroup = {
    label: string;
    courseCodes: string[];
};

function collectRequirementGroups(
    root: RequirementNode
): RequirementCourseGroup[] {
    const groups: RequirementCourseGroup[] = [];
    collectRequirementGroupsRecursive(root, groups);
    return groups;
}

function collectRequirementGroupsRecursive(
    node: RequirementNode,
    groups: RequirementCourseGroup[]
): void {
    const id = getRequirementId(node) ?? '—';
    const label = getRequirementLabel(node, id);
    const courseCodes = collectDirectCourses(node);
    if (courseCodes.length > 0) {
        groups.push({ label, courseCodes });
    }

    if (!Array.isArray(node.nested)) {
        return;
    }

    for (const child of node.nested) {
        collectRequirementGroupsRecursive(child, groups);
    }
}

function collectDirectCourses(node: RequirementNode): string[] {
    if (!Array.isArray(node.courses)) {
        return [];
    }

    const uniqueCodes = new Set<string>();
    for (const course of node.courses) {
        if (typeof course !== 'string') {
            continue;
        }
        const normalized = course.trim();
        if (normalized.length > 0) {
            uniqueCodes.add(normalized);
        }
    }
    return [...uniqueCodes];
}

function collectUniqueCodesFromGroups(groups: CourseGroup[]): string[] {
    const codes = new Set<string>();
    for (const group of groups) {
        for (const course of group.courses) {
            codes.add(course.code);
        }
    }
    return [...codes];
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
            kind: 'free' as const,
        }));
}

function renderCurrentSemesterCourses(
    container: HTMLElement,
    empty: HTMLElement,
    courses: CourseRecord[]
): void {
    container.replaceChildren();
    container.append(createLeadingSeparator('current'));
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
        section.dataset.groupKind = group.kind;
        section.dataset.groupTitle = group.title;

        const title = document.createElement('h2');
        title.className = 'mx-3 text-sm font-medium';
        title.textContent = group.title;
        section.append(title);

        const row = document.createElement('div');
        row.className =
            'flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-3';
        row.append(createLeadingSeparator('group'));

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
        'touch-manipulation focus-visible:ring-accent/60 block w-[15.5rem] shrink-0 snap-start rounded-2xl focus-visible:ring-2 md:w-auto md:shrink';
    link.dataset.courseCode = course.code;
    if (course.current !== true) {
        link.classList.add('opacity-70');
    }

    link.append(CourseCard(course));
    return link;
}

function createLeadingSeparator(kind: 'current' | 'group'): HTMLElement {
    const separator = document.createElement('div');
    if (kind === 'current') {
        separator.className = 'w-2 min-w-2 shrink-0 lg:hidden';
    } else {
        separator.className = 'w-3 min-w-3 shrink-0 md:hidden';
    }
    separator.setAttribute('aria-hidden', 'true');
    return separator;
}

function setupStickyExpansion(aside: HTMLElement, section: HTMLElement): void {
    let expanded = false;

    function update(): void {
        const isDesktop = window.innerWidth >= DESKTOP_MIN_WIDTH;
        const navBottom = getConsoleNavBottom();
        const topOffset = isDesktop
            ? navBottom + DESKTOP_STICKY_GAP_PX
            : navBottom;
        aside.style.top = `${String(topOffset)}px`;

        if (isDesktop) {
            const desktopMaxHeight = Math.max(
                160,
                window.innerHeight - topOffset - DESKTOP_STICKY_BOTTOM_GAP_PX
            );
            section.style.maxHeight = `${String(desktopMaxHeight)}px`;
            section.style.overflowY = 'auto';
            if (expanded) {
                setExpanded(false);
            }
            return;
        }

        section.style.maxHeight = '';
        section.style.overflowY = '';

        const shouldExpand = aside.getBoundingClientRect().top <= topOffset + 1;
        if (shouldExpand === expanded) {
            return;
        }
        setExpanded(shouldExpand);
    }

    function setExpanded(nextExpanded: boolean): void {
        expanded = nextExpanded;
        section.classList.toggle('rounded-none', nextExpanded);
        section.classList.toggle('border-s-0', nextExpanded);
        section.classList.toggle('border-e-0', nextExpanded);
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}

function getConsoleNavBottom(): number {
    const nav = document.querySelector<HTMLElement>(
        '[data-component="ConsoleNav"]'
    );
    if (nav === null) {
        return 0;
    }

    return Math.max(0, nav.getBoundingClientRect().bottom);
}
