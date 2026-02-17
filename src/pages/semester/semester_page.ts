import {
    type RequirementNode,
    filterRequirementsByPath,
    getRequirementId,
    getRequirementLabel,
} from '$lib/requirementsUtils';
import { ConsoleNav } from '$components/ConsoleNav';
import { CourseCard } from '$components/CourseCard';
import { type CourseRecord } from '$lib/indexeddb';
import { state as appState } from '$lib/stateManagement';
import templateHtml from './semester_page.html?raw';

const FALLBACK_COURSE_NAME_PREFIX = 'קורס';
const FALLBACK_FACULTY = 'ללא פקולטה';
const DEFAULT_SEMESTER_NUMBER = 1;
const SEASONS = ['אביב', 'קיץ', 'חורף'] as const;

type PersistedPlan = {
    version?: number;
    semesterCount?: number;
    semesters?: { id?: string; courseCodes?: string[] }[];
    wishlistCourseCodes?: string[];
    exemptionsCourseCodes?: string[];
};

type SemesterPageElements = {
    groupsRoot: HTMLElement;
    currentSemester: HTMLElement;
    currentTitle: HTMLElement;
    currentCancelButton: HTMLButtonElement;
    currentCourses: HTMLElement;
    currentEmpty: HTMLElement;
};

type SelectedCourseState = {
    code: string;
    sourceKind: 'row' | 'current';
    element: HTMLAnchorElement;
};

type SemesterPageState = {
    elements: SemesterPageElements;
    semesterNumber: number;
    semesterId?: string;
    planValue: unknown;
    semesterCourseCodeSet: Set<string>;
    selected?: SelectedCourseState;
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
    const pageState: SemesterPageState = {
        elements,
        semesterNumber,
        planValue: undefined,
        semesterCourseCodeSet: new Set<string>(),
    };

    root.addEventListener('click', (event) => {
        handlePageClick(pageState, event);
    });

    void hydratePage(pageState);

    return root;
}

function queryElements(root: HTMLElement): SemesterPageElements {
    const groupsRoot = root.querySelector<HTMLElement>(
        '[data-role="groups-root"]'
    );
    const currentSemester = root.querySelector<HTMLElement>(
        '[data-role="current-semester"]'
    );
    const currentTitle = root.querySelector<HTMLElement>(
        '[data-role="current-semester-title"]'
    );
    const currentCancelButton = root.querySelector<HTMLButtonElement>(
        '[data-role="current-semester-cancel"]'
    );
    const currentCourses = root.querySelector<HTMLElement>(
        '[data-role="current-semester-courses"]'
    );
    const currentEmpty = root.querySelector<HTMLElement>(
        '[data-role="current-semester-empty"]'
    );

    if (
        groupsRoot === null ||
        currentSemester === null ||
        currentTitle === null ||
        currentCancelButton === null ||
        currentCourses === null ||
        currentEmpty === null
    ) {
        throw new Error('SemesterPage required elements not found');
    }

    return {
        groupsRoot,
        currentSemester,
        currentTitle,
        currentCancelButton,
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

async function hydratePage(pageState: SemesterPageState): Promise<void> {
    const { elements, semesterNumber } = pageState;
    try {
        const [selection, requirementCountEntry, allCoursesResult] =
            await Promise.all([
                appState.userDegree.get(),
                appState.userPlan.get(),
                appState.courses.query({
                    page: 1,
                    pageSize: 'all',
                }),
            ]);

        const allCourses = allCoursesResult.courses;
        const courseMap = new Map(
            allCourses.map((course) => [course.code, course])
        );

        const persistedPlan = toPersistedPlan(requirementCountEntry?.value);
        pageState.planValue = requirementCountEntry?.value;
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
        pageState.semesterId = semesterEntry?.id;
        pageState.semesterCourseCodeSet = new Set(semesterCourseCodes);
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
        setCurrentSemesterMoveUi(pageState, false);
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
        const match = /^(אביב|קיץ|חורף)-(\d{4})-/.exec(semesterId);
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

            const loaded = await appState.courses.get(code);
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
    const requirementRecord = await appState.requirements.get(programId);
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
    const row = document.createElement('div');
    row.className =
        'me-2 flex min-h-0 snap-x snap-mandatory gap-2 p-2 lg:me-0 lg:snap-none lg:flex-col lg:p-0';
    container.append(row);

    if (courses.length === 0) {
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    for (const course of courses) {
        row.append(createCourseLink(course, 'current'));
    }
}

function renderGroups(root: HTMLElement, groups: CourseGroup[]): void {
    root.replaceChildren();
    for (const group of groups) {
        const section = document.createElement('section');
        section.className =
            'flex min-w-0 flex-col gap-2 [content-visibility:auto] [contain-intrinsic-size:24rem]';
        section.dataset.groupKind = group.kind;
        section.dataset.groupTitle = group.title;

        const title = document.createElement('h2');
        title.className = 'mx-3 text-sm font-medium';
        title.textContent = group.title;
        section.append(title);

        const rowScroll = document.createElement('div');
        rowScroll.className =
            group.kind === 'requirement'
                ? 'overflow-x-auto pb-2 [scrollbar-width:thin]'
                : 'overflow-x-auto pb-2 [scrollbar-width:thin] md:overflow-visible md:pb-0';

        const row = document.createElement('div');
        row.className =
            group.kind === 'requirement'
                ? 'me-2 flex min-w-0 snap-x snap-mandatory gap-2 p-2 lg:me-0 lg:p-0'
                : 'me-2 flex min-w-0 snap-x snap-mandatory gap-2 p-2 md:me-0 md:grid md:grid-cols-2 md:p-0 xl:grid-cols-3';

        if (group.courses.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'text-text-muted text-xs';
            empty.textContent = 'אין קורסים להצגה בקבוצה זו.';
            row.append(empty);
        } else {
            for (const course of group.courses) {
                row.append(createCourseLink(course, 'row'));
            }
        }

        rowScroll.append(row);
        section.append(rowScroll);
        root.append(section);
    }
}

function handlePageClick(state: SemesterPageState, event: Event): void {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    const cancelButton = target.closest<HTMLButtonElement>(
        '[data-role="current-semester-cancel"]'
    );
    if (cancelButton !== null) {
        event.preventDefault();
        clearSelectedCourse(state);
        return;
    }

    const courseLink = target.closest<HTMLAnchorElement>('a[data-course-code]');
    if (courseLink !== null) {
        event.preventDefault();
        handleCourseLinkClick(state, courseLink);
        return;
    }

    const currentSemester = target.closest<HTMLElement>(
        '[data-role="current-semester"]'
    );
    if (currentSemester !== null) {
        event.preventDefault();
        void addSelectedCourseToCurrentSemester(state);
    }
}

function handleCourseLinkClick(
    state: SemesterPageState,
    courseLink: HTMLAnchorElement
): void {
    const courseCode = courseLink.dataset.courseCode;
    const sourceKind = courseLink.dataset.courseKind;
    if (
        courseCode === undefined ||
        (sourceKind !== 'row' && sourceKind !== 'current')
    ) {
        return;
    }

    const selected = state.selected;
    const isSameSelection =
        selected !== undefined &&
        selected.code === courseCode &&
        selected.element === courseLink;
    if (isSameSelection) {
        navigateToCoursePage(courseCode);
        return;
    }

    if (selected !== undefined) {
        setCourseSelectionState(selected.element, false);
    }

    state.selected = {
        code: courseCode,
        sourceKind,
        element: courseLink,
    };
    setCourseSelectionState(courseLink, true);
    setCurrentSemesterMoveUi(state, true);
}

function setCourseSelectionState(
    courseLink: HTMLAnchorElement,
    isSelected: boolean
): void {
    courseLink.classList.toggle('ring-2', isSelected);
    courseLink.classList.toggle('ring-accent/50', isSelected);
}

function setCurrentSemesterMoveUi(
    state: SemesterPageState,
    isSelecting: boolean
): void {
    state.elements.currentSemester.classList.toggle(
        '!border-accent/40',
        isSelecting
    );
    state.elements.currentSemester.classList.toggle(
        '!bg-surface-2/80',
        isSelecting
    );

    const cancelButton = state.elements.currentCancelButton;
    cancelButton.classList.toggle('invisible', !isSelecting);
    cancelButton.classList.toggle('opacity-0', !isSelecting);
    cancelButton.classList.toggle('pointer-events-none', !isSelecting);
}

function clearSelectedCourse(state: SemesterPageState): void {
    if (state.selected !== undefined) {
        setCourseSelectionState(state.selected.element, false);
    }

    state.selected = undefined;
    setCurrentSemesterMoveUi(state, false);
}

async function addSelectedCourseToCurrentSemester(
    state: SemesterPageState
): Promise<void> {
    const selected = state.selected;
    if (selected === undefined || selected.sourceKind !== 'row') {
        return;
    }

    const sourceContainer = selected.element.parentElement;
    const currentRow = getOrCreateCurrentSemesterRow(
        state.elements.currentCourses
    );
    setCourseLinkKind(selected.element, 'current');
    currentRow.append(selected.element);
    state.elements.currentEmpty.classList.add('hidden');

    if (sourceContainer instanceof HTMLElement) {
        ensureGroupRowEmptyState(sourceContainer);
    }

    state.semesterCourseCodeSet.add(selected.code);
    clearSelectedCourse(state);

    await persistSemesterPlan(state);
}

function getOrCreateCurrentSemesterRow(container: HTMLElement): HTMLElement {
    const existing = container.firstElementChild;
    if (existing instanceof HTMLElement) {
        return existing;
    }

    const row = document.createElement('div');
    row.className =
        'me-2 flex min-h-0 snap-x snap-mandatory gap-2 p-2 lg:me-0 lg:snap-none lg:flex-col lg:p-0';
    container.append(row);
    return row;
}

function setCourseLinkKind(
    courseLink: HTMLAnchorElement,
    kind: 'row' | 'current'
): void {
    courseLink.dataset.courseKind = kind;
    courseLink.classList.remove('lg:w-[10.5rem]', 'lg:w-auto');
    courseLink.classList.add(
        kind === 'row' ? 'lg:w-[10.5rem]' : 'lg:w-auto',
        'w-[7.5rem]'
    );
}

function ensureGroupRowEmptyState(row: HTMLElement): void {
    if (row.querySelector('a[data-course-code]') !== null) {
        return;
    }

    if (row.querySelector('p[data-role="empty-group"]') !== null) {
        return;
    }

    const empty = document.createElement('p');
    empty.className = 'text-text-muted text-xs';
    empty.dataset.role = 'empty-group';
    empty.textContent = 'אין קורסים להצגה בקבוצה זו.';
    row.append(empty);
}

async function persistSemesterPlan(state: SemesterPageState): Promise<void> {
    const sortedCodes = [...state.semesterCourseCodeSet];
    const nextPlanValue = withUpdatedSemesterCourseCodes(
        state.planValue,
        state.semesterNumber,
        state.semesterId,
        sortedCodes
    );
    state.planValue = nextPlanValue;
    await appState.userPlan.set(nextPlanValue).catch(() => undefined);
}

function withUpdatedSemesterCourseCodes(
    planValue: unknown,
    semesterNumber: number,
    semesterId: string | undefined,
    courseCodes: string[]
): PersistedPlan {
    const base: PersistedPlan =
        typeof planValue === 'object' && planValue !== null
            ? ({ ...(planValue as PersistedPlan) } as PersistedPlan)
            : {};

    const semesters = Array.isArray(base.semesters)
        ? base.semesters.map((semester) => ({ ...semester }))
        : [];
    const semesterIndex = Math.max(0, semesterNumber - 1);

    while (semesters.length <= semesterIndex) {
        semesters.push({});
    }

    const existingSemester = semesters[semesterIndex] ?? {};
    semesters[semesterIndex] = {
        ...existingSemester,
        id:
            typeof existingSemester.id === 'string'
                ? existingSemester.id
                : semesterId,
        courseCodes,
    };

    return {
        ...base,
        semesters,
    };
}

function navigateToCoursePage(courseCode: string): void {
    const url = new URL('/course', window.location.origin);
    url.searchParams.set('code', courseCode);
    window.history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
}

function createCourseLink(
    course: CourseRecord,
    kind: 'row' | 'current'
): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = `/course?code=${encodeURIComponent(course.code)}`;
    const widthClass =
        kind === 'row' ? 'w-[7.5rem] lg:w-[10.5rem]' : 'w-[7.5rem] lg:w-auto';
    link.className =
        `touch-manipulation focus-visible:ring-accent/60 block h-[7.5rem] ${widthClass} shrink-0 snap-start rounded-2xl focus-visible:ring-2 sm:h-[6.5rem] [content-visibility:auto] [contain-intrinsic-size:7.5rem] sm:[contain-intrinsic-size:6.5rem]`.trim();
    link.dataset.courseCode = course.code;
    link.dataset.courseKind = kind;
    if (course.current !== true) {
        link.classList.add('opacity-70');
    }

    link.append(CourseCard(course));
    return link;
}
