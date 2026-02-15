import { CourseCard } from '$components/CourseCard';
import {
    type CourseRecord,
    getCoursesPage,
    getMeta,
    setMeta,
} from '$lib/indexeddb';

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
    selected?: { semesterId: string; courseCode: string };
    warning?: string;
};

type PersistedPlan = {
    version: number;
    semesters: { id: string; courseCodes: string[] }[];
};

const PLAN_META_KEY = 'planPageState';
const PLAN_META_VERSION = 1;

const DEFAULT_SEMESTERS: Omit<SemesterState, 'courses'>[] = [
    { id: 'spring-2026', title: 'אביב 2026', season: 'אביב', year: 2026 },
    { id: 'summer-2026', title: 'קיץ 2026', season: 'קיץ', year: 2026 },
    { id: 'winter-2027', title: 'חורף 2027', season: 'חורף', year: 2027 },
    { id: 'spring-2027', title: 'אביב 2027', season: 'אביב', year: 2027 },
    { id: 'summer-2027', title: 'קיץ 2027', season: 'קיץ', year: 2027 },
    { id: 'winter-2028', title: 'חורף 2028', season: 'חורף', year: 2028 },
];

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
    return {
        semesters: DEFAULT_SEMESTERS.map((semester) => ({
            ...semester,
            courses: [],
        })),
    };
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

    const rail = root.querySelector<HTMLElement>('[data-semester-rail]');
    const selectedStatus = root.querySelector<HTMLElement>(
        '[data-selected-status]'
    );
    const clearButton = root.querySelector<HTMLButtonElement>(
        '[data-clear-selection]'
    );
    const warning = root.querySelector<HTMLElement>('[data-plan-warning]');
    const prevButton =
        root.querySelector<HTMLButtonElement>('[data-rail-prev]');
    const nextButton =
        root.querySelector<HTMLButtonElement>('[data-rail-next]');

    if (
        rail === null ||
        selectedStatus === null ||
        clearButton === null ||
        warning === null ||
        prevButton === null ||
        nextButton === null
    ) {
        throw new Error('PlanPage required elements not found');
    }

    const state = createInitialPlanState();

    clearButton.addEventListener('click', () => {
        state.selected = undefined;
        renderPlan(state, rail, selectedStatus, clearButton, warning);
    });

    rail.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const courseButton = target.closest<HTMLElement>(
            '[data-course-action]'
        );
        if (courseButton !== null) {
            const semesterId = courseButton.dataset.semesterId;
            const courseCode = courseButton.dataset.courseCode;
            if (semesterId === undefined || courseCode === undefined) {
                return;
            }

            handleCourseClick(
                state,
                semesterId,
                courseCode,
                rail,
                selectedStatus,
                clearButton,
                warning
            );
            return;
        }

        const semesterColumn = target.closest<HTMLElement>(
            '[data-semester-column]'
        );
        const targetSemesterId = semesterColumn?.dataset.semesterId;
        if (targetSemesterId === undefined) {
            return;
        }

        void handleSemesterClick(
            state,
            targetSemesterId,
            rail,
            selectedStatus,
            clearButton,
            warning
        );
    });

    setupRailNavigation(rail, prevButton, nextButton);
    renderPlan(state, rail, selectedStatus, clearButton, warning);
    void hydratePlan(state, rail, selectedStatus, clearButton, warning);

    return root;
}

async function hydratePlan(
    state: PlanState,
    rail: HTMLElement,
    selectedStatus: HTMLElement,
    clearButton: HTMLButtonElement,
    warning: HTMLElement
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
        state.semesters = restored;
    } else {
        state.semesters = distributeCoursesAcrossSemesters(usableCourses);
    }

    const dedupeWarning = normalizeDuplicateCourses(state.semesters);
    if (dedupeWarning !== undefined) {
        state.warning = dedupeWarning;
    }

    renderPlan(state, rail, selectedStatus, clearButton, warning);
}

function renderPlan(
    state: PlanState,
    rail: HTMLElement,
    selectedStatus: HTMLElement,
    clearButton: HTMLButtonElement,
    warning: HTMLElement
): void {
    selectedStatus.textContent = getSelectedStatusText(state);
    clearButton.disabled = state.selected === undefined;

    if (state.warning !== undefined && state.warning.length > 0) {
        warning.textContent = state.warning;
        warning.classList.remove('hidden');
    } else {
        warning.textContent = '';
        warning.classList.add('hidden');
    }

    rail.replaceChildren();

    for (const semester of state.semesters) {
        const column = createSemesterColumn(state, semester);
        rail.append(column);
    }

    updateRailButtonState(rail);
}

function createSemesterColumn(
    state: PlanState,
    semester: SemesterState
): HTMLElement {
    const column = document.createElement('section');
    column.className =
        'border-border/60 bg-surface-2/70 flex min-h-[25rem] w-[85vw] shrink-0 snap-start flex-col gap-3 rounded-2xl border p-3 sm:w-[22rem] lg:w-[20rem]';
    column.dataset.semesterColumn = 'true';
    column.dataset.semesterId = semester.id;

    const header = document.createElement('header');
    header.className = 'flex flex-col gap-2';

    const title = document.createElement('p');
    title.className = 'text-sm font-medium';
    title.textContent = semester.title;

    const metrics = document.createElement('div');
    metrics.className = 'grid grid-cols-3 gap-2 text-xs';
    const semesterMetrics = summarizeSemester(semester.courses);
    metrics.append(createMetricChip('נק״ז', semesterMetrics.totalPoints));
    metrics.append(createMetricChip('חציון', semesterMetrics.avgMedian));
    metrics.append(createMetricChip('מבחנים', semesterMetrics.testsCount));

    header.append(title, metrics);

    const canReceiveMove =
        state.selected !== undefined &&
        state.selected.semesterId !== semester.id;
    if (canReceiveMove) {
        const moveTarget = document.createElement('p');
        moveTarget.className =
            'border-accent/40 bg-accent/10 text-accent rounded-xl border px-2 py-1 text-xs';
        moveTarget.textContent = 'לחצו כאן להעברת הקורס הנבחר';
        header.append(moveTarget);
    }

    const list = document.createElement('div');
    list.className = 'flex min-h-0 flex-1 flex-col gap-2';

    if (semester.courses.length === 0) {
        const empty = document.createElement('p');
        empty.className =
            'border-border/50 bg-surface-1/60 text-text-muted rounded-xl border border-dashed px-3 py-4 text-xs';
        empty.textContent = 'אין קורסים בסמסטר זה. אפשר ללחוץ כדי להעביר לכאן.';
        list.append(empty);
    }

    for (const course of semester.courses) {
        list.append(createSemesterCourse(state, semester, course));
    }

    column.append(header, list);
    return column;
}

function createSemesterCourse(
    state: PlanState,
    semester: SemesterState,
    course: CourseRecord
): HTMLElement {
    const holder = document.createElement('button');
    holder.type = 'button';
    holder.className =
        'focus-visible:ring-accent/60 w-full rounded-2xl text-start transition duration-200 ease-out focus-visible:ring-2';
    holder.dataset.courseAction = 'true';
    holder.dataset.courseCode = course.code;
    holder.dataset.semesterId = semester.id;

    const isSelected =
        state.selected?.courseCode === course.code &&
        state.selected.semesterId === semester.id;
    if (isSelected) {
        holder.classList.add('ring-accent/50', 'ring-2');
    }

    const card = CourseCard(course, {
        statusClass: getStatusClassForSeason(semester.season),
    });

    const cardRoot = card.querySelector<HTMLElement>(
        '[data-component="CourseCard"]'
    );
    if (cardRoot !== null) {
        cardRoot.classList.add('hover:border-accent/40');
    }
    holder.append(card);

    const warning = getAvailabilityWarning(course, semester.season);
    if (warning !== undefined) {
        const message = document.createElement('p');
        message.className = 'text-warning px-1 pt-1 text-xs';
        message.textContent = warning;
        holder.append(message);
    }

    return holder;
}

function createMetricChip(label: string, value: string): HTMLElement {
    const chip = document.createElement('p');
    chip.className =
        'border-border/50 bg-surface-1/70 rounded-xl border px-2 py-1';
    chip.textContent = `${label}: ${value}`;
    return chip;
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

function getSelectedStatusText(state: PlanState): string {
    if (state.selected === undefined) {
        return 'לא נבחר קורס';
    }

    const semester = state.semesters.find(
        (item) => item.id === state.selected?.semesterId
    );
    const course = semester?.courses.find(
        (item) => item.code === state.selected?.courseCode
    );
    if (semester === undefined || course === undefined) {
        return 'לא נבחר קורס';
    }

    const label = course.name ?? course.code;
    return `נבחר: ${label} (${semester.title})`;
}

function handleCourseClick(
    state: PlanState,
    semesterId: string,
    courseCode: string,
    rail: HTMLElement,
    selectedStatus: HTMLElement,
    clearButton: HTMLButtonElement,
    warning: HTMLElement
): void {
    const isSameSelection =
        state.selected?.semesterId === semesterId &&
        state.selected.courseCode === courseCode;
    if (isSameSelection) {
        navigateToCoursePage(courseCode);
        return;
    }

    state.selected = { semesterId, courseCode };
    renderPlan(state, rail, selectedStatus, clearButton, warning);
}

async function handleSemesterClick(
    state: PlanState,
    targetSemesterId: string,
    rail: HTMLElement,
    selectedStatus: HTMLElement,
    clearButton: HTMLButtonElement,
    warning: HTMLElement
): Promise<void> {
    if (state.selected === undefined) {
        return;
    }

    const sourceSemester = state.semesters.find(
        (semester) => semester.id === state.selected?.semesterId
    );
    const targetSemester = state.semesters.find(
        (semester) => semester.id === targetSemesterId
    );
    if (sourceSemester === undefined || targetSemester === undefined) {
        return;
    }

    if (sourceSemester.id === targetSemester.id) {
        return;
    }

    const courseIndex = sourceSemester.courses.findIndex(
        (course) => course.code === state.selected?.courseCode
    );
    if (courseIndex < 0) {
        return;
    }

    const [course] = sourceSemester.courses.splice(courseIndex, 1);
    targetSemester.courses.push(course);
    state.selected = undefined;
    state.warning = getAvailabilityWarning(course, targetSemester.season);
    await persistPlanState(state);
    renderPlan(state, rail, selectedStatus, clearButton, warning);
}

function navigateToCoursePage(courseCode: string): void {
    const url = new URL('/course', window.location.origin);
    url.searchParams.set('code', courseCode);
    window.history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
}

function distributeCoursesAcrossSemesters(
    courses: CourseRecord[]
): SemesterState[] {
    const semesters = createInitialPlanState().semesters;
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
): SemesterState[] | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }

    const record = value as Partial<PersistedPlan>;
    if (
        record.version !== PLAN_META_VERSION ||
        !Array.isArray(record.semesters)
    ) {
        return undefined;
    }

    const semesters = createInitialPlanState().semesters;
    for (const entry of record.semesters) {
        const semester = semesters.find((item) => item.id === entry.id);
        if (semester === undefined) {
            continue;
        }

        const codes = Array.isArray(entry.courseCodes) ? entry.courseCodes : [];
        for (const code of codes) {
            const course = courseMap.get(code);
            if (course !== undefined) {
                semester.courses.push(course);
            }
        }
    }

    return semesters;
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
        semesters: state.semesters.map((semester) => ({
            id: semester.id,
            courseCodes: semester.courses.map((course) => course.code),
        })),
    };

    await setMeta({
        key: PLAN_META_KEY,
        value: payload,
    }).catch(() => undefined);
}

function setupRailNavigation(
    rail: HTMLElement,
    prevButton: HTMLButtonElement,
    nextButton: HTMLButtonElement
): void {
    prevButton.addEventListener('click', () => {
        scrollRailBySemester(rail, 'prev');
    });

    nextButton.addEventListener('click', () => {
        scrollRailBySemester(rail, 'next');
    });

    rail.addEventListener('scroll', () => {
        updateRailButtonState(rail);
    });

    window.addEventListener('resize', () => {
        updateRailButtonState(rail);
    });
}

function updateRailButtonState(rail: HTMLElement): void {
    const prevButton =
        document.querySelector<HTMLButtonElement>('[data-rail-prev]');
    const nextButton =
        document.querySelector<HTMLButtonElement>('[data-rail-next]');
    if (prevButton === null || nextButton === null) {
        return;
    }

    const columns = Array.from(
        rail.querySelectorAll<HTMLElement>('[data-semester-column]')
    );
    const hasOverflow = rail.scrollWidth > rail.clientWidth + 2;
    if (!hasOverflow || columns.length <= 1) {
        prevButton.disabled = true;
        nextButton.disabled = true;
        return;
    }

    const currentIndex = getCurrentVisibleColumnIndex(rail, columns);
    prevButton.disabled = currentIndex <= 0;
    nextButton.disabled = currentIndex >= columns.length - 1;
}

function scrollRailBySemester(
    rail: HTMLElement,
    direction: 'prev' | 'next'
): void {
    const columns = Array.from(
        rail.querySelectorAll<HTMLElement>('[data-semester-column]')
    );
    if (columns.length === 0) {
        return;
    }

    const currentIndex = getCurrentVisibleColumnIndex(rail, columns);
    const step = direction === 'next' ? 1 : -1;
    const nextIndex = Math.min(
        columns.length - 1,
        Math.max(0, currentIndex + step)
    );
    columns[nextIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
    });
}

function getCurrentVisibleColumnIndex(
    rail: HTMLElement,
    columns: HTMLElement[]
): number {
    const railRect = rail.getBoundingClientRect();
    const isRtl = getComputedStyle(rail).direction === 'rtl';

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    columns.forEach((column, index) => {
        const columnRect = column.getBoundingClientRect();
        const distance = isRtl
            ? Math.abs(columnRect.right - railRect.right)
            : Math.abs(columnRect.left - railRect.left);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex;
}
