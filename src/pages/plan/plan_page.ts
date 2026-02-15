import {
    type CourseRecord,
    getCoursesPage,
    getMeta,
    setMeta,
} from '$lib/indexeddb';
import { ConsoleNav } from '$components/ConsoleNav';
import { CourseCard } from '$components/CourseCard';

import templateHtml from './plan_page.html?raw';

type SemesterState = {
    id: string;
    title: string;
    season: string;
    year: number;
    courses: CourseRecord[];
};

type PlanState = {
    semesters: SemesterState[];
    wishlist: CourseRecord[];
    exemptions: CourseRecord[];
    semesterCount: number;
    selected?: { rowId: string; courseCode: string };
    warning?: string;
    problems: string[];
};

type PersistedPlan = {
    version: number;
    semesterCount?: number;
    semesters: { id: string; courseCodes: string[] }[];
    wishlistCourseCodes?: string[];
    exemptionsCourseCodes?: string[];
};

const PLAN_META_KEY = 'planPageState';
const PLAN_META_VERSION = 2;
const MIN_SEMESTERS = 3;
const DEFAULT_SEMESTER_COUNT = 6;
const WISHLIST_ROW_ID = 'wishlist';
const EXEMPTIONS_ROW_ID = 'exemptions';
const WISHLIST_ROW_TITLE = 'רשימת משאלות';
const EXEMPTIONS_ROW_TITLE = 'פטורים';

type PlanRow = {
    id: string;
    title: string;
    kind: 'semester' | 'wishlist' | 'exemptions';
    courses: CourseRecord[];
    season?: string;
};

type SemesterBlueprint = Omit<SemesterState, 'courses'>;

const SEMESTER_SEASONS = ['אביב', 'קיץ', 'חורף'] as const;
const SEMESTER_SEASON_LABEL: Record<(typeof SEMESTER_SEASONS)[number], string> =
    {
        אביב: 'אביב',
        קיץ: 'קיץ',
        חורף: 'חורף',
    };

const FALLBACK_COURSES: CourseRecord[] = [
    {
        code: '104031',
        name: 'חשבון אינפיניטסימלי 1',
        points: 5,
        median: 78,
        seasons: ['חורף', 'אביב'],
        tests: [{ year: 2025, monthIndex: 1, day: 15 }],
    },
    {
        code: '104166',
        name: 'אלגברה לינארית 1',
        points: 5,
        median: 74,
        seasons: ['חורף', 'אביב'],
        tests: [{ year: 2025, monthIndex: 5, day: 20 }],
    },
    {
        code: '234114',
        name: 'מבוא למדעי המחשב',
        points: 4,
        median: 81,
        seasons: ['אביב', 'קיץ'],
        tests: [null],
    },
    {
        code: '234124',
        name: 'מבני נתונים',
        points: 4,
        median: 76,
        seasons: ['חורף', 'אביב'],
        tests: [{ year: 2025, monthIndex: 8, day: 3 }],
    },
    {
        code: '044252',
        name: 'מערכות ספרתיות',
        points: 3,
        median: 79,
        seasons: ['חורף'],
        tests: [{ year: 2025, monthIndex: 11, day: 10 }],
    },
    {
        code: '236363',
        name: 'מערכות הפעלה',
        points: 3,
        median: 82,
        seasons: ['אביב'],
        tests: [{ year: 2025, monthIndex: 7, day: 27 }],
    },
    {
        code: '236360',
        name: 'תורת הקומפילציה',
        points: 3,
        median: 75,
        seasons: ['חורף'],
        tests: [null],
    },
    {
        code: '236350',
        name: 'בסיסי נתונים',
        points: 3,
        median: 84,
        seasons: ['אביב', 'קיץ'],
        tests: [{ year: 2024, monthIndex: 6, day: 19 }],
    },
    {
        code: '236501',
        name: 'מבוא לבינה מלאכותית',
        points: 3,
        median: 87,
        seasons: ['אביב'],
        tests: [{ year: 2024, monthIndex: 5, day: 8 }],
    },
    {
        code: '236299',
        name: 'פרויקט תכנה',
        points: 2,
        median: 90,
        seasons: ['קיץ'],
        tests: [null],
    },
];

function createInitialPlanState(): PlanState {
    const semesterCount = DEFAULT_SEMESTER_COUNT;
    return {
        semesterCount,
        semesters: buildSemesterBlueprints(semesterCount).map((semester) => ({
            ...semester,
            courses: [],
        })),
        wishlist: [],
        exemptions: [],
        problems: [],
    };
}

function buildSemesterBlueprints(count: number): SemesterBlueprint[] {
    const safeCount = Math.max(MIN_SEMESTERS, Math.floor(count));
    const startYear = 2026;

    const semesters: SemesterBlueprint[] = [];
    for (let index = 0; index < safeCount; index += 1) {
        const season = SEMESTER_SEASONS[index % SEMESTER_SEASONS.length];
        const yearOffset = Math.floor((index + 1) / SEMESTER_SEASONS.length);
        const year = startYear + yearOffset;
        semesters.push({
            id: `${season}-${year}-${index}`,
            title: `${SEMESTER_SEASON_LABEL[season]} ${year}`,
            season,
            year,
        });
    }

    return semesters;
}

export function PlanPage(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('PlanPage template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('PlanPage template root not found');
    }

    const consoleNavHost =
        root.querySelector<HTMLElement>('[data-console-nav]');
    if (consoleNavHost !== null) {
        consoleNavHost.replaceWith(ConsoleNav({ activePath: '/plan' }));
    }

    const rail = root.querySelector<HTMLElement>('[data-semester-rail]');
    const warning = root.querySelector<HTMLElement>('[data-plan-warning]');
    const problemsList = root.querySelector<HTMLElement>(
        '[data-schedule-problems]'
    );
    const problemsCount = root.querySelector<HTMLElement>(
        '[data-problems-count]'
    );
    const semesterCountInput = root.querySelector<HTMLInputElement>(
        '[data-semester-count]'
    );

    if (
        rail === null ||
        warning === null ||
        problemsList === null ||
        problemsCount === null ||
        semesterCountInput === null
    ) {
        throw new Error('PlanPage required elements not found');
    }

    const state = createInitialPlanState();
    semesterCountInput.value = state.semesterCount.toString();

    semesterCountInput.addEventListener('change', () => {
        const minimumCount = getMinimumSemesterCount(state);
        const nextCount = parseSemesterCount(
            semesterCountInput.value,
            minimumCount
        );
        semesterCountInput.value = nextCount.toString();
        resizeSemesters(state, nextCount);
        void persistPlanState(state);
        renderPlan(
            state,
            rail,
            warning,
            problemsList,
            problemsCount,
            semesterCountInput
        );
    });

    rail.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const courseButton = target.closest<HTMLElement>(
            '[data-course-action]'
        );
        const cancelButton = target.closest<HTMLElement>(
            '[data-cancel-selection]'
        );
        if (cancelButton !== null) {
            clearSelection(state, rail);
            return;
        }

        if (courseButton !== null) {
            const rowId = courseButton.dataset.rowId;
            const courseCode = courseButton.dataset.courseCode;
            if (rowId === undefined || courseCode === undefined) {
                return;
            }

            handleCourseClick(state, rowId, courseCode, rail);
            return;
        }

        const planRow = target.closest<HTMLElement>('[data-plan-row]');
        const targetRowId = planRow?.dataset.rowId;
        if (targetRowId === undefined) {
            return;
        }

        void handleRowClick(state, targetRowId, rail);
    });

    renderPlan(
        state,
        rail,
        warning,
        problemsList,
        problemsCount,
        semesterCountInput
    );
    void hydratePlan(
        state,
        rail,
        warning,
        problemsList,
        problemsCount,
        semesterCountInput
    );

    return root;
}

async function hydratePlan(
    state: PlanState,
    rail: HTMLElement,
    warning: HTMLElement,
    problemsList: HTMLElement,
    problemsCount: HTMLElement,
    semesterCountInput: HTMLInputElement
): Promise<void> {
    const [meta, courses] = await Promise.all([
        getMeta(PLAN_META_KEY).catch(() => undefined),
        getCoursesPage(18, 0).catch(() => []),
    ]);

    const usableCourses = dedupeCourses(
        courses.length > 0 ? courses : FALLBACK_COURSES
    );
    const map = createCourseMap(usableCourses);

    const restored = restoreSemestersFromMeta(meta?.value, map);
    if (restored !== undefined) {
        state.semesterCount = restored.semesters.length;
        state.semesters = restored.semesters;
        state.wishlist = restored.wishlist;
        state.exemptions = restored.exemptions;
    } else {
        state.semesters = distributeCoursesAcrossSemesters(
            usableCourses,
            state.semesterCount
        );
    }

    const dedupeWarning = normalizeDuplicateCourses(state.semesters);
    if (dedupeWarning !== undefined) {
        state.warning = dedupeWarning;
    }

    renderPlan(
        state,
        rail,
        warning,
        problemsList,
        problemsCount,
        semesterCountInput
    );
}

function renderPlan(
    state: PlanState,
    rail: HTMLElement,
    warning: HTMLElement,
    problemsList: HTMLElement,
    problemsCount: HTMLElement,
    semesterCountInput: HTMLInputElement
): void {
    semesterCountInput.min = getMinimumSemesterCount(state).toString();
    semesterCountInput.value = state.semesterCount.toString();

    if (state.warning !== undefined && state.warning.length > 0) {
        warning.textContent = state.warning;
        warning.classList.remove('hidden');
    } else {
        warning.textContent = '';
        warning.classList.add('hidden');
    }

    state.problems = collectScheduleProblems(state.semesters);
    renderProblems(state.problems, problemsList, problemsCount);

    rail.replaceChildren();

    for (const row of getPlanRows(state)) {
        const rowElement = createPlanRow(state, row);
        rail.append(rowElement);
    }

    toggleMoveTargets(rail, state.selected?.rowId);
}

function getPlanRows(state: PlanState): PlanRow[] {
    const semesterRows: PlanRow[] = state.semesters.map((semester) => ({
        id: semester.id,
        title: semester.title,
        kind: 'semester',
        courses: semester.courses,
        season: semester.season,
    }));

    return [
        ...semesterRows,
        {
            id: WISHLIST_ROW_ID,
            title: WISHLIST_ROW_TITLE,
            kind: 'wishlist',
            courses: state.wishlist,
        },
        {
            id: EXEMPTIONS_ROW_ID,
            title: EXEMPTIONS_ROW_TITLE,
            kind: 'exemptions',
            courses: state.exemptions,
        },
    ];
}

function createPlanRow(state: PlanState, row: PlanRow): HTMLElement {
    const rowElement = document.createElement('section');
    rowElement.className =
        'border-border/50 bg-surface-1/40 flex flex-col gap-3 rounded-2xl border p-3 sm:p-4';
    rowElement.dataset.planRow = 'true';
    rowElement.dataset.rowId = row.id;
    rowElement.dataset.rowKind = row.kind;

    const header = document.createElement('header');
    header.className = 'flex flex-col gap-2';

    const headingRow = document.createElement('div');
    headingRow.className = 'flex flex-wrap items-center gap-2';

    const title = document.createElement('p');
    title.className = 'text-sm font-medium whitespace-nowrap';
    title.textContent = row.title;

    const metrics = document.createElement('div');
    metrics.className =
        'text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs';
    metrics.dataset.rowMetrics = 'true';
    metrics.dataset.rowId = row.id;
    renderRowMetrics(metrics, row);

    const moveTarget = document.createElement('p');
    moveTarget.className =
        'border-accent/40 bg-accent/10 text-accent min-h-7 rounded-xl border px-2 py-1 text-xs opacity-0 transition-opacity duration-200 ease-out invisible pointer-events-none';
    moveTarget.textContent = 'העברה';
    moveTarget.dataset.moveTarget = 'true';
    moveTarget.dataset.rowId = row.id;

    const cancelSelectionButton = document.createElement('button');
    cancelSelectionButton.type = 'button';
    cancelSelectionButton.className =
        'border-border/60 bg-surface-1/70 text-text-muted hover:border-accent/50 hover:text-text ms-auto min-h-7 rounded-xl border px-2 py-1 text-xs opacity-0 transition-opacity duration-200 ease-out invisible pointer-events-none touch-manipulation';
    cancelSelectionButton.textContent = 'ביטול';
    cancelSelectionButton.dataset.cancelSelection = 'true';
    cancelSelectionButton.dataset.rowId = row.id;

    headingRow.append(title, moveTarget, cancelSelectionButton);
    header.append(headingRow, metrics);

    const list = document.createElement('div');
    list.className = 'flex flex-wrap gap-2';
    list.dataset.rowCourseList = 'true';

    for (const course of row.courses) {
        list.append(createSemesterCourse(state, row, course));
    }
    rowElement.append(header, list);
    return rowElement;
}

function createSemesterCourse(
    state: PlanState,
    row: PlanRow,
    course: CourseRecord
): HTMLElement {
    const holder = document.createElement('button');
    holder.type = 'button';
    holder.className =
        'focus-visible:ring-accent/60 basis-full rounded-2xl text-start transition duration-200 ease-out focus-visible:ring-2 sm:basis-[calc(50%-0.25rem)] lg:basis-[calc(33.333%-0.35rem)]';
    holder.dataset.courseAction = 'true';
    holder.dataset.courseCode = course.code;
    holder.dataset.rowId = row.id;

    const isSelected =
        state.selected?.courseCode === course.code &&
        state.selected.rowId === row.id;
    setCourseSelectionState(holder, isSelected);

    const card = CourseCard(course, {
        statusClass:
            row.kind === 'semester' && row.season !== undefined
                ? getStatusClassForSeason(row.season)
                : 'bg-accent',
    });

    const cardRoot = card.querySelector<HTMLElement>(
        '[data-component="CourseCard"]'
    );
    if (cardRoot !== null) {
        cardRoot.classList.add('hover:border-accent/40');
    }
    holder.append(card);

    return holder;
}

function createMetricChip(label: string, value: string): HTMLElement {
    const chip = document.createElement('p');
    chip.className = 'text-text-muted rounded-xl px-1 py-1';
    chip.textContent = `${label}: ${value}`;
    return chip;
}

function renderRowMetrics(container: HTMLElement, row: PlanRow): void {
    container.replaceChildren();

    if (row.kind === 'semester') {
        const semesterMetrics = summarizeSemester(row.courses);
        container.append(createMetricChip('נק״ז', semesterMetrics.totalPoints));
        container.append(createMetricChip('חציון', semesterMetrics.avgMedian));
        container.append(
            createMetricChip('מבחנים', semesterMetrics.testsCount)
        );
        return;
    }

    container.append(createMetricChip('קורסים', String(row.courses.length)));
}

function refreshRowMetrics(
    state: PlanState,
    rail: HTMLElement,
    rowId: string
): void {
    const rowMetrics = rail.querySelector<HTMLElement>(
        `[data-row-metrics][data-row-id="${CSS.escape(rowId)}"]`
    );
    const row = getRowById(state, rowId);
    if (rowMetrics === null || row === undefined) {
        return;
    }

    renderRowMetrics(rowMetrics, row);
}

function summarizeSemester(courses: CourseRecord[]): {
    totalPoints: string;
    avgMedian: string;
    testsCount: string;
} {
    let points = 0;
    let mediansTotal = 0;
    let mediansCount = 0;
    let testsCount = 0;

    for (const course of courses) {
        if (
            typeof course.points === 'number' &&
            Number.isFinite(course.points)
        ) {
            points += course.points;
        }

        if (
            typeof course.median === 'number' &&
            Number.isFinite(course.median)
        ) {
            mediansTotal += course.median;
            mediansCount += 1;
        }

        if (
            Array.isArray(course.tests) &&
            course.tests.some((item) => item !== null)
        ) {
            testsCount += 1;
        }
    }

    return {
        totalPoints: points.toString(),
        avgMedian:
            mediansCount > 0 ? (mediansTotal / mediansCount).toFixed(1) : '—',
        testsCount: testsCount.toString(),
    };
}

function getStatusClassForSeason(season: string): string {
    if (season === 'חורף') {
        return 'bg-info';
    }
    if (season === 'אביב') {
        return 'bg-success';
    }
    return 'bg-warning';
}

function getAvailabilityWarning(
    course: CourseRecord,
    semesterSeason: string
): string | undefined {
    if (!Array.isArray(course.seasons) || course.seasons.length === 0) {
        return undefined;
    }

    if (course.seasons.includes(semesterSeason)) {
        return undefined;
    }

    return 'הקורס לרוב לא נפתח בעונה זו';
}

function parseSemesterCount(
    value: string,
    minimum: number = MIN_SEMESTERS
): number {
    const parsed = Number.parseInt(value, 10);
    const safeMinimum = Math.max(MIN_SEMESTERS, Math.floor(minimum));
    if (Number.isNaN(parsed)) {
        return safeMinimum;
    }
    return Math.max(safeMinimum, parsed);
}

function getMinimumSemesterCount(state: PlanState): number {
    for (let index = state.semesters.length - 1; index >= 0; index -= 1) {
        if (state.semesters[index].courses.length > 0) {
            return Math.max(MIN_SEMESTERS, index + 1);
        }
    }

    return MIN_SEMESTERS;
}

function resizeSemesters(state: PlanState, semesterCount: number): void {
    const minimumCount = getMinimumSemesterCount(state);
    const safeCount = Math.max(minimumCount, Math.floor(semesterCount));
    if (safeCount === state.semesterCount) {
        return;
    }

    const blueprints = buildSemesterBlueprints(safeCount);
    const nextSemesters: SemesterState[] = blueprints.map((semester) => ({
        ...semester,
        courses: [],
    }));

    state.semesters.forEach((semester, index) => {
        const targetIndex = Math.min(index, nextSemesters.length - 1);
        nextSemesters[targetIndex].courses.push(...semester.courses);
    });

    const selectedCode = state.selected?.courseCode;
    state.semesterCount = safeCount;
    state.semesters = nextSemesters;

    if (selectedCode !== undefined) {
        const selectedSemester = nextSemesters.find((semester) =>
            semester.courses.some((course) => course.code === selectedCode)
        );
        if (selectedSemester !== undefined) {
            state.selected = {
                rowId: selectedSemester.id,
                courseCode: selectedCode,
            };
        } else {
            state.selected = undefined;
        }
    }
}

function renderProblems(
    problems: string[],
    container: HTMLElement,
    countElement: HTMLElement
): void {
    countElement.textContent = problems.length.toString();
    container.replaceChildren();

    if (problems.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'לא זוהו בעיות כרגע.';
        container.append(empty);
        return;
    }

    for (const problem of problems) {
        const item = document.createElement('li');
        item.className = 'text-warning';
        item.textContent = problem;
        container.append(item);
    }
}

function collectScheduleProblems(semesters: SemesterState[]): string[] {
    const problems: string[] = [];
    const allCourses = new Set<string>();
    const priorCourses = new Set<string>();

    for (const semester of semesters) {
        for (const course of semester.courses) {
            allCourses.add(course.code);
        }
    }

    for (const semester of semesters) {
        for (const course of semester.courses) {
            const availability = getAvailabilityWarning(
                course,
                semester.season
            );
            if (availability !== undefined) {
                problems.push(
                    `${course.code}: ${availability} (${semester.title})`
                );
            }

            const prerequisiteIssue = getPrerequisiteProblem(
                course,
                priorCourses
            );
            if (prerequisiteIssue !== undefined) {
                problems.push(
                    `${course.code}: ${prerequisiteIssue} (${semester.title})`
                );
            }

            const exclusionIssue = getExclusionProblem(course, allCourses);
            if (exclusionIssue !== undefined) {
                problems.push(
                    `${course.code}: ${exclusionIssue} (${semester.title})`
                );
            }
        }

        for (const course of semester.courses) {
            priorCourses.add(course.code);
        }
    }

    return Array.from(new Set(problems));
}

function getPrerequisiteProblem(
    course: CourseRecord,
    priorCourses: Set<string>
): string | undefined {
    const dependencies = course.connections?.dependencies;
    if (!Array.isArray(dependencies) || dependencies.length === 0) {
        return undefined;
    }

    const normalized = dependencies
        .filter(
            (group): group is string[] =>
                Array.isArray(group) && group.length > 0
        )
        .map((group) => group.filter((code) => typeof code === 'string'));
    if (normalized.length === 0) {
        return undefined;
    }

    const satisfied = normalized.some((group) =>
        group.every((code) => priorCourses.has(code))
    );
    if (satisfied) {
        return undefined;
    }

    const unmet = normalized[0].filter((code) => !priorCourses.has(code));
    if (unmet.length === 0) {
        return 'דרישות קדם אינן מסופקות';
    }
    return `דרישות קדם חסרות: ${unmet.join(', ')}`;
}

function getExclusionProblem(
    course: CourseRecord,
    allCourses: Set<string>
): string | undefined {
    const exclusive = course.connections?.exclusive;
    if (!Array.isArray(exclusive) || exclusive.length === 0) {
        return undefined;
    }

    const conflicts = exclusive.filter((code) => allCourses.has(code));
    if (conflicts.length === 0) {
        return undefined;
    }

    return `חפיפה לקורסים הדדיים: ${conflicts.join(', ')}`;
}

function setCourseSelectionState(
    button: HTMLElement,
    isSelected: boolean
): void {
    if (isSelected) {
        button.classList.add('ring-accent/50', 'ring-2');
        return;
    }

    button.classList.remove('ring-accent/50', 'ring-2');
}

function getCourseButtonElement(
    rail: HTMLElement,
    rowId: string,
    courseCode: string
): HTMLElement | undefined {
    const candidate = rail.querySelector<HTMLElement>(
        `[data-course-action][data-row-id="${CSS.escape(rowId)}"][data-course-code="${CSS.escape(courseCode)}"]`
    );
    return candidate ?? undefined;
}

function toggleMoveTargets(
    rail: HTMLElement,
    sourceRowId: string | undefined
): void {
    const moveTargets =
        rail.querySelectorAll<HTMLElement>('[data-move-target]');
    for (const moveTarget of moveTargets) {
        const targetRowId = moveTarget.dataset.rowId;
        const shouldShowMove =
            sourceRowId !== undefined &&
            targetRowId !== undefined &&
            targetRowId !== sourceRowId;
        moveTarget.classList.toggle('invisible', !shouldShowMove);
        moveTarget.classList.toggle('opacity-0', !shouldShowMove);
        moveTarget.classList.toggle('pointer-events-none', !shouldShowMove);
    }

    const cancelButtons = rail.querySelectorAll<HTMLElement>(
        '[data-cancel-selection]'
    );
    for (const cancelButton of cancelButtons) {
        const shouldShowCancel = sourceRowId !== undefined;
        cancelButton.classList.toggle('invisible', !shouldShowCancel);
        cancelButton.classList.toggle('opacity-0', !shouldShowCancel);
        cancelButton.classList.toggle('pointer-events-none', !shouldShowCancel);
    }

    const planRows = rail.querySelectorAll<HTMLElement>('[data-plan-row]');
    for (const semesterRow of planRows) {
        const isClickableTarget =
            sourceRowId !== undefined &&
            semesterRow.dataset.rowId !== undefined &&
            semesterRow.dataset.rowId !== sourceRowId;
        semesterRow.classList.toggle('!bg-surface-2/80', isClickableTarget);
        semesterRow.classList.toggle('!border-accent/40', isClickableTarget);
    }
}

function clearSelection(state: PlanState, rail: HTMLElement): void {
    if (state.selected === undefined) {
        return;
    }

    const selectedCourseButton = getCourseButtonElement(
        rail,
        state.selected.rowId,
        state.selected.courseCode
    );
    if (selectedCourseButton !== undefined) {
        setCourseSelectionState(selectedCourseButton, false);
    }

    state.selected = undefined;
    toggleMoveTargets(rail, undefined);
}

function getSemesterCourseListElement(
    rail: HTMLElement,
    rowId: string
): HTMLElement | undefined {
    const row = rail.querySelector<HTMLElement>(
        `[data-plan-row][data-row-id="${CSS.escape(rowId)}"]`
    );
    const list = row?.querySelector<HTMLElement>('[data-row-course-list]');
    return list ?? undefined;
}

function handleCourseClick(
    state: PlanState,
    rowId: string,
    courseCode: string,
    rail: HTMLElement
): void {
    const isSameSelection =
        state.selected?.rowId === rowId &&
        state.selected.courseCode === courseCode;
    if (isSameSelection) {
        navigateToCoursePage(courseCode);
        return;
    }

    const previousSelected = state.selected;
    if (previousSelected !== undefined) {
        const previousButton = getCourseButtonElement(
            rail,
            previousSelected.rowId,
            previousSelected.courseCode
        );
        if (previousButton !== undefined) {
            setCourseSelectionState(previousButton, false);
        }
    }

    state.selected = { rowId, courseCode };
    const selectedButton = getCourseButtonElement(rail, rowId, courseCode);
    if (selectedButton !== undefined) {
        setCourseSelectionState(selectedButton, true);
    }

    toggleMoveTargets(rail, rowId);
}

function getRowById(state: PlanState, rowId: string): PlanRow | undefined {
    return getPlanRows(state).find((row) => row.id === rowId);
}

async function handleRowClick(
    state: PlanState,
    targetRowId: string,
    rail: HTMLElement
): Promise<void> {
    if (state.selected === undefined) {
        return;
    }

    const selectedCourseCode = state.selected.courseCode;
    const sourceRowId = state.selected.rowId;

    const sourceRow = getRowById(state, sourceRowId);
    const targetRow = getRowById(state, targetRowId);
    if (sourceRow === undefined || targetRow === undefined) {
        return;
    }

    if (sourceRow.id === targetRow.id) {
        return;
    }

    const courseIndex = sourceRow.courses.findIndex(
        (course) => course.code === selectedCourseCode
    );
    if (courseIndex < 0) {
        return;
    }

    const [course] = sourceRow.courses.splice(courseIndex, 1);
    targetRow.courses.push(course);

    const movedButton = getCourseButtonElement(
        rail,
        sourceRowId,
        selectedCourseCode
    );
    const targetList = getSemesterCourseListElement(rail, targetRowId);

    if (movedButton !== undefined && targetList !== undefined) {
        movedButton.dataset.rowId = targetRowId;
        setCourseSelectionState(movedButton, false);
        targetList.append(movedButton);
    }

    refreshRowMetrics(state, rail, sourceRowId);
    refreshRowMetrics(state, rail, targetRowId);

    state.selected = undefined;
    toggleMoveTargets(rail, undefined);

    await persistPlanState(state);
}

function navigateToCoursePage(courseCode: string): void {
    const url = new URL('/course', window.location.origin);
    url.searchParams.set('code', courseCode);
    window.history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
}

function distributeCoursesAcrossSemesters(
    courses: CourseRecord[],
    semesterCount: number
): SemesterState[] {
    const semesters = buildSemesterBlueprints(semesterCount).map(
        (semester) => ({
            ...semester,
            courses: [] as CourseRecord[],
        })
    );
    courses.forEach((course, index) => {
        const semesterIndex = index % semesters.length;
        semesters[semesterIndex].courses.push(course);
    });
    return semesters;
}

function dedupeCourses(courses: CourseRecord[]): CourseRecord[] {
    const unique: CourseRecord[] = [];
    const codes = new Set<string>();
    for (const course of courses) {
        if (codes.has(course.code)) {
            continue;
        }
        codes.add(course.code);
        unique.push(course);
    }
    return unique;
}

function createCourseMap(courses: CourseRecord[]): Map<string, CourseRecord> {
    const map = new Map<string, CourseRecord>();
    for (const course of courses) {
        map.set(course.code, course);
    }
    return map;
}

function restoreSemestersFromMeta(
    value: unknown,
    courseMap: Map<string, CourseRecord>
):
    | {
          semesters: SemesterState[];
          wishlist: CourseRecord[];
          exemptions: CourseRecord[];
      }
    | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }

    const record = value as Partial<PersistedPlan>;
    const version = Number(record.version);
    if (!Array.isArray(record.semesters) || (version !== 1 && version !== 2)) {
        return undefined;
    }

    const restoredCount = parseSemesterCount(
        String(record.semesterCount ?? record.semesters.length)
    );
    const semesters = buildSemesterBlueprints(restoredCount).map(
        (semester) => ({
            ...semester,
            courses: [] as CourseRecord[],
        })
    );

    record.semesters.forEach((entry, index) => {
        const semester =
            semesters.find((item) => item.id === entry.id) ??
            semesters.at(index);
        if (semester === undefined) {
            return;
        }

        const codes = Array.isArray(entry.courseCodes) ? entry.courseCodes : [];
        for (const code of codes) {
            const course = courseMap.get(code);
            if (course !== undefined) {
                semester.courses.push(course);
            }
        }
    });

    const wishlistCodes = Array.isArray(record.wishlistCourseCodes)
        ? record.wishlistCourseCodes
        : [];
    const exemptionsCodes = Array.isArray(record.exemptionsCourseCodes)
        ? record.exemptionsCourseCodes
        : [];

    return {
        semesters,
        wishlist: wishlistCodes
            .map((code) => courseMap.get(code))
            .filter((course): course is CourseRecord => course !== undefined),
        exemptions: exemptionsCodes
            .map((code) => courseMap.get(code))
            .filter((course): course is CourseRecord => course !== undefined),
    };
}

function normalizeDuplicateCourses(
    semesters: SemesterState[]
): string | undefined {
    const seen = new Set<string>();
    let removed = 0;

    for (const semester of semesters) {
        semester.courses = semester.courses.filter((course) => {
            if (seen.has(course.code)) {
                removed += 1;
                return false;
            }
            seen.add(course.code);
            return true;
        });
    }

    if (removed === 0) {
        return undefined;
    }

    return `זוהו ${String(removed)} כפילויות בתכנית והן אוחדו למיקום יחיד.`;
}

async function persistPlanState(state: PlanState): Promise<void> {
    const payload: PersistedPlan = {
        version: PLAN_META_VERSION,
        semesterCount: state.semesterCount,
        semesters: state.semesters.map((semester) => ({
            id: semester.id,
            courseCodes: semester.courses.map((course) => course.code),
        })),
        wishlistCourseCodes: state.wishlist.map((course) => course.code),
        exemptionsCourseCodes: state.exemptions.map((course) => course.code),
    };

    await setMeta({
        key: PLAN_META_KEY,
        value: payload,
    }).catch(() => undefined);
}
