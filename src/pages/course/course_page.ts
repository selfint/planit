import { COURSE_SYNC_EVENT } from '$lib/courseSync';
import { ConsoleNav } from '$components/ConsoleNav';
import { CourseCard } from '$components/CourseCard';
import type { CourseRecord } from '$lib/indexeddb';
import { state as appState } from '$lib/stateManagement';

import templateHtml from './course_page.html?raw';

const EMPTY_VALUE = '—';
const UNKNOWN_COURSE_LABEL = 'קורס לא זמין במאגר';
const COURSES_BATCH_SIZE = 300;
const PLAN_META_VERSION = 3;
const DEFAULT_SEMESTER_COUNT = 6;

const COUNT_SKELETON_CLASS = [
    'skeleton-shimmer',
    'inline-block',
    'h-3',
    'w-16',
    'rounded-md',
    'text-transparent',
] as const;

type CoursePageElements = {
    courseName: HTMLElement;
    courseAbout: HTMLElement;
    coursePoints: HTMLElement;
    courseMedian: HTMLElement;
    courseFaculty: HTMLElement;
    courseSeasons: HTMLElement;
    coursePointsCard: HTMLElement;
    courseMedianCard: HTMLElement;
    courseFacultyCard: HTMLElement;
    courseSeasonsCard: HTMLElement;
    semesterSplitControl: HTMLElement;
    semesterAddCurrent: HTMLButtonElement;
    semesterDropdown: HTMLDetailsElement;
    semesterDropdownMenu: HTMLElement;
    wishlistAdd: HTMLButtonElement;
    exemptionsAdd: HTMLButtonElement;
    placementRemove: HTMLButtonElement;
    actionStatus: HTMLElement;
    notFoundState: HTMLElement;
    notFoundMessage: HTMLElement;
    dependenciesGrid: HTMLElement;
    dependenciesCount: HTMLElement;
    dependenciesEmpty: HTMLElement;
    dependantsGrid: HTMLElement;
    dependantsCount: HTMLElement;
    dependantsEmpty: HTMLElement;
    adjacentGrid: HTMLElement;
    adjacentCount: HTMLElement;
    adjacentEmpty: HTMLElement;
    exclusiveGrid: HTMLElement;
    exclusiveCount: HTMLElement;
    exclusiveEmpty: HTMLElement;
};

type DependencyGroup = string[];
type RelatedCourseGroups = CourseRecord[][];

type PersistedPlan = {
    version: number;
    semesterCount?: number;
    currentSemester?: number;
    semesters: { id?: string; courseCodes?: string[] }[];
    wishlistCourseCodes?: string[];
    exemptionsCourseCodes?: string[];
};

type NormalizedPersistedPlan = {
    version: number;
    semesterCount: number;
    currentSemester: number;
    semesters: { id?: string; courseCodes?: string[] }[];
    wishlistCourseCodes: string[];
    exemptionsCourseCodes: string[];
};

type CoursePlacement =
    | { kind: 'none' }
    | { kind: 'semester'; semesterIndex: number }
    | { kind: 'wishlist' }
    | { kind: 'exemptions' };

export function CoursePage(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('CoursePage template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('CoursePage template root not found');
    }

    const consoleNavHost =
        root.querySelector<HTMLElement>('[data-console-nav]');
    if (consoleNavHost !== null) {
        consoleNavHost.replaceWith(ConsoleNav({ activePath: '/course' }));
    }

    const elements = queryElements(root);
    const requestedCode = getRequestedCourseCode(window.location.search);
    setupCourseActions(root, elements, requestedCode);

    if (requestedCode === undefined) {
        showNotFound(
            elements,
            'נדרש פרמטר code בכתובת, למשל /course?code=104031.'
        );
        disableCourseActions(elements);
        elements.actionStatus.textContent = 'אי אפשר לעדכן תכנית בלי קוד קורס.';
        return root;
    }

    void loadAndRenderCourse(elements, requestedCode);

    window.addEventListener(COURSE_SYNC_EVENT, () => {
        if (!root.isConnected) {
            return;
        }
        void loadAndRenderCourse(elements, requestedCode);
    });

    return root;
}

export function CoursePageSkeletonPreview(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('CoursePage template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('CoursePage template root not found');
    }

    const consoleNavHost =
        root.querySelector<HTMLElement>('[data-console-nav]');
    if (consoleNavHost !== null) {
        consoleNavHost.replaceWith(ConsoleNav({ activePath: '/course' }));
    }

    return root;
}

function queryElements(root: HTMLElement): CoursePageElements {
    const courseName = root.querySelector<HTMLElement>(
        "[data-role='course-name']"
    );
    const courseAbout = root.querySelector<HTMLElement>(
        "[data-role='course-about']"
    );
    const coursePoints = root.querySelector<HTMLElement>(
        "[data-role='course-points']"
    );
    const courseMedian = root.querySelector<HTMLElement>(
        "[data-role='course-median']"
    );
    const courseFaculty = root.querySelector<HTMLElement>(
        "[data-role='course-faculty']"
    );
    const courseSeasons = root.querySelector<HTMLElement>(
        "[data-role='course-seasons']"
    );
    const coursePointsCard = root.querySelector<HTMLElement>(
        "[data-role='course-points-card']"
    );
    const courseMedianCard = root.querySelector<HTMLElement>(
        "[data-role='course-median-card']"
    );
    const courseFacultyCard = root.querySelector<HTMLElement>(
        "[data-role='course-faculty-card']"
    );
    const courseSeasonsCard = root.querySelector<HTMLElement>(
        "[data-role='course-seasons-card']"
    );
    const semesterSplitControl = root.querySelector<HTMLElement>(
        "[data-role='semester-split-control']"
    );
    const semesterAddCurrent = root.querySelector<HTMLButtonElement>(
        "[data-role='semester-add-current']"
    );
    const semesterDropdown = root.querySelector<HTMLDetailsElement>(
        "[data-role='semester-dropdown']"
    );
    const semesterDropdownMenu = root.querySelector<HTMLElement>(
        "[data-role='semester-dropdown-menu']"
    );
    const wishlistAdd = root.querySelector<HTMLButtonElement>(
        "[data-role='wishlist-add']"
    );
    const exemptionsAdd = root.querySelector<HTMLButtonElement>(
        "[data-role='exemptions-add']"
    );
    const placementRemove = root.querySelector<HTMLButtonElement>(
        "[data-role='placement-remove']"
    );
    const actionStatus = root.querySelector<HTMLElement>(
        "[data-role='action-status']"
    );
    const notFoundState = root.querySelector<HTMLElement>(
        "[data-state='not-found']"
    );
    const notFoundMessage = root.querySelector<HTMLElement>(
        "[data-role='not-found-message']"
    );
    const dependenciesGrid = root.querySelector<HTMLElement>(
        "[data-role='dependencies-grid']"
    );
    const dependenciesCount = root.querySelector<HTMLElement>(
        "[data-role='dependencies-count']"
    );
    const dependenciesEmpty = root.querySelector<HTMLElement>(
        "[data-role='dependencies-empty']"
    );
    const dependantsGrid = root.querySelector<HTMLElement>(
        "[data-role='dependants-grid']"
    );
    const dependantsCount = root.querySelector<HTMLElement>(
        "[data-role='dependants-count']"
    );
    const dependantsEmpty = root.querySelector<HTMLElement>(
        "[data-role='dependants-empty']"
    );
    const adjacentGrid = root.querySelector<HTMLElement>(
        "[data-role='adjacent-grid']"
    );
    const adjacentCount = root.querySelector<HTMLElement>(
        "[data-role='adjacent-count']"
    );
    const adjacentEmpty = root.querySelector<HTMLElement>(
        "[data-role='adjacent-empty']"
    );
    const exclusiveGrid = root.querySelector<HTMLElement>(
        "[data-role='exclusive-grid']"
    );
    const exclusiveCount = root.querySelector<HTMLElement>(
        "[data-role='exclusive-count']"
    );
    const exclusiveEmpty = root.querySelector<HTMLElement>(
        "[data-role='exclusive-empty']"
    );

    if (
        courseName === null ||
        courseAbout === null ||
        coursePoints === null ||
        courseMedian === null ||
        courseFaculty === null ||
        courseSeasons === null ||
        coursePointsCard === null ||
        courseMedianCard === null ||
        courseFacultyCard === null ||
        courseSeasonsCard === null ||
        semesterSplitControl === null ||
        semesterAddCurrent === null ||
        semesterDropdown === null ||
        semesterDropdownMenu === null ||
        wishlistAdd === null ||
        exemptionsAdd === null ||
        placementRemove === null ||
        actionStatus === null ||
        notFoundState === null ||
        notFoundMessage === null ||
        dependenciesGrid === null ||
        dependenciesCount === null ||
        dependenciesEmpty === null ||
        dependantsGrid === null ||
        dependantsCount === null ||
        dependantsEmpty === null ||
        adjacentGrid === null ||
        adjacentCount === null ||
        adjacentEmpty === null ||
        exclusiveGrid === null ||
        exclusiveCount === null ||
        exclusiveEmpty === null
    ) {
        throw new Error('CoursePage required elements not found');
    }

    return {
        courseName,
        courseAbout,
        coursePoints,
        courseMedian,
        courseFaculty,
        courseSeasons,
        coursePointsCard,
        courseMedianCard,
        courseFacultyCard,
        courseSeasonsCard,
        semesterSplitControl,
        semesterAddCurrent,
        semesterDropdown,
        semesterDropdownMenu,
        wishlistAdd,
        exemptionsAdd,
        placementRemove,
        actionStatus,
        notFoundState,
        notFoundMessage,
        dependenciesGrid,
        dependenciesCount,
        dependenciesEmpty,
        dependantsGrid,
        dependantsCount,
        dependantsEmpty,
        adjacentGrid,
        adjacentCount,
        adjacentEmpty,
        exclusiveGrid,
        exclusiveCount,
        exclusiveEmpty,
    };
}

function getRequestedCourseCode(search: string): string | undefined {
    const params = new URLSearchParams(search);
    const value = params.get('code');
    if (value === null) {
        return undefined;
    }

    const normalized = value.trim().toUpperCase();
    if (normalized.length === 0) {
        return undefined;
    }

    return normalized;
}

function setupCourseActions(
    root: HTMLElement,
    elements: CoursePageElements,
    requestedCode: string | undefined
): void {
    void refreshCourseActionsUi(elements, requestedCode);

    elements.semesterAddCurrent.addEventListener('click', () => {
        if (requestedCode === undefined) {
            return;
        }
        void handleAddToCurrentSemester(elements, requestedCode);
    });

    elements.wishlistAdd.addEventListener('click', () => {
        if (requestedCode === undefined) {
            return;
        }
        void handleAddToWishlist(elements, requestedCode);
    });

    elements.exemptionsAdd.addEventListener('click', () => {
        if (requestedCode === undefined) {
            return;
        }
        void handleAddToExemptions(elements, requestedCode);
    });

    elements.placementRemove.addEventListener('click', () => {
        if (requestedCode === undefined) {
            return;
        }
        void handleRemovePlacement(elements, requestedCode);
    });

    elements.semesterDropdownMenu.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const semesterButton = target.closest<HTMLButtonElement>(
            '[data-semester-option]'
        );
        if (semesterButton === null) {
            return;
        }
        const semesterIndex = Number.parseInt(
            semesterButton.dataset.semesterIndex ?? '',
            10
        );
        if (!Number.isFinite(semesterIndex) || requestedCode === undefined) {
            return;
        }

        void handleAddToSemester(elements, requestedCode, semesterIndex);
    });

    root.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Node)) {
            return;
        }
        if (elements.semesterDropdown.contains(target)) {
            return;
        }
        elements.semesterDropdown.open = false;
    });
}

function disableCourseActions(elements: CoursePageElements): void {
    hideInlineFlexElement(elements.semesterSplitControl);
    hideInlineFlexElement(elements.wishlistAdd);
    hideInlineFlexElement(elements.exemptionsAdd);
    showInlineFlexElement(elements.placementRemove);
    elements.placementRemove.disabled = true;
    elements.semesterDropdown.open = false;
}

async function refreshCourseActionsUi(
    elements: CoursePageElements,
    code: string | undefined
): Promise<void> {
    if (code === undefined) {
        disableCourseActions(elements);
        if (elements.actionStatus.textContent.trim().length === 0) {
            elements.actionStatus.textContent =
                'אי אפשר לעדכן תכנית בלי קוד קורס.';
        }
        return;
    }

    const plan = await readPersistedPlan();
    const placement = resolveCoursePlacement(plan, code);
    renderSemesterOptions(elements, plan.semesters, plan.currentSemester);

    if (placement.kind === 'none') {
        showInlineFlexElement(elements.semesterSplitControl);
        showInlineFlexElement(elements.wishlistAdd);
        showInlineFlexElement(elements.exemptionsAdd);
        hideInlineFlexElement(elements.placementRemove);
        elements.placementRemove.disabled = true;
        return;
    }

    hideInlineFlexElement(elements.semesterSplitControl);
    hideInlineFlexElement(elements.wishlistAdd);
    hideInlineFlexElement(elements.exemptionsAdd);
    showInlineFlexElement(elements.placementRemove);
    elements.placementRemove.disabled = false;
    elements.placementRemove.textContent = getPlacementRemoveLabel(placement);
    elements.semesterDropdown.open = false;
}

function hideInlineFlexElement(element: HTMLElement): void {
    element.classList.remove('inline-flex');
    element.classList.add('hidden');
}

function showInlineFlexElement(element: HTMLElement): void {
    element.classList.remove('hidden');
    element.classList.add('inline-flex');
}

function renderSemesterOptions(
    elements: CoursePageElements,
    semesters: { id?: string; courseCodes?: string[] }[],
    currentSemester: number
): void {
    const semesterCount = Math.max(DEFAULT_SEMESTER_COUNT, semesters.length);
    const normalizedCurrent = normalizeCurrentSemester(
        currentSemester,
        semesterCount
    );
    elements.semesterAddCurrent.textContent = `הוסף לסמסטר ${String(normalizedCurrent + 1)}`;

    elements.semesterDropdownMenu.replaceChildren();
    for (
        let semesterIndex = 0;
        semesterIndex < semesterCount;
        semesterIndex += 1
    ) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className =
            'hover:bg-surface-2 text-text touch-manipulation min-h-10 rounded-xl px-2.5 py-1.5 text-start text-xs';
        button.dataset.semesterOption = 'true';
        button.dataset.semesterIndex = String(semesterIndex);
        const isCurrent = semesterIndex === normalizedCurrent;
        button.textContent = isCurrent
            ? `סמסטר ${String(semesterIndex + 1)} (נוכחי)`
            : `סמסטר ${String(semesterIndex + 1)}`;
        elements.semesterDropdownMenu.append(button);
    }
}

function getPlacementRemoveLabel(
    placement: Exclude<CoursePlacement, { kind: 'none' }>
): string {
    if (placement.kind === 'semester') {
        return `הסר מסמסטר ${String(placement.semesterIndex + 1)}`;
    }
    if (placement.kind === 'wishlist') {
        return 'הסר מרשימת המשאלות';
    }
    return 'הסר מהפטורים';
}

async function handleAddToCurrentSemester(
    elements: CoursePageElements,
    courseCode: string
): Promise<void> {
    setCourseActionsBusy(elements, true);
    elements.actionStatus.textContent = 'מוסיף לסמסטר הנוכחי...';

    const plan = await readPersistedPlan();
    const added = await addCourseToSemester(courseCode, plan.currentSemester);
    elements.actionStatus.textContent = added
        ? `הקורס נוסף לסמסטר ${String(plan.currentSemester + 1)}.`
        : 'הקורס כבר קיים בסמסטר הנוכחי.';
    await refreshCourseActionsUi(elements, courseCode);
    setCourseActionsBusy(elements, false);
}

async function handleAddToSemester(
    elements: CoursePageElements,
    courseCode: string,
    semesterIndex: number
): Promise<void> {
    setCourseActionsBusy(elements, true);
    elements.actionStatus.textContent = `מוסיף לסמסטר ${String(semesterIndex + 1)}...`;

    const added = await addCourseToSemester(courseCode, semesterIndex);
    elements.actionStatus.textContent = added
        ? `הקורס נוסף לסמסטר ${String(semesterIndex + 1)}.`
        : `הקורס כבר קיים בסמסטר ${String(semesterIndex + 1)}.`;
    await refreshCourseActionsUi(elements, courseCode);
    setCourseActionsBusy(elements, false);
}

async function handleAddToWishlist(
    elements: CoursePageElements,
    courseCode: string
): Promise<void> {
    setCourseActionsBusy(elements, true);
    elements.actionStatus.textContent = 'מעדכן רשימת משאלות...';

    const added = await addCourseToWishlist(courseCode);
    elements.actionStatus.textContent = added
        ? 'הקורס נוסף לרשימת המשאלות.'
        : 'הקורס כבר קיים ברשימת המשאלות.';
    await refreshCourseActionsUi(elements, courseCode);
    setCourseActionsBusy(elements, false);
}

async function handleAddToExemptions(
    elements: CoursePageElements,
    courseCode: string
): Promise<void> {
    setCourseActionsBusy(elements, true);
    elements.actionStatus.textContent = 'מעדכן פטורים...';

    const added = await addCourseToExemptions(courseCode);
    elements.actionStatus.textContent = added
        ? 'הקורס נוסף לפטורים.'
        : 'הקורס כבר קיים בפטורים.';
    await refreshCourseActionsUi(elements, courseCode);
    setCourseActionsBusy(elements, false);
}

async function handleRemovePlacement(
    elements: CoursePageElements,
    courseCode: string
): Promise<void> {
    setCourseActionsBusy(elements, true);
    elements.actionStatus.textContent = 'מסיר את הקורס מהתכנית...';

    const plan = await readPersistedPlan();
    const placement = resolveCoursePlacement(plan, courseCode);
    if (placement.kind === 'none') {
        elements.actionStatus.textContent = 'הקורס לא נמצא בתכנית כרגע.';
        await refreshCourseActionsUi(elements, courseCode);
        setCourseActionsBusy(elements, false);
        return;
    }

    if (placement.kind === 'semester') {
        await removeCourseFromSemester(courseCode, placement.semesterIndex);
        elements.actionStatus.textContent = `הקורס הוסר מסמסטר ${String(placement.semesterIndex + 1)}.`;
    } else if (placement.kind === 'wishlist') {
        await removeCourseFromWishlist(courseCode);
        elements.actionStatus.textContent = 'הקורס הוסר מרשימת המשאלות.';
    } else {
        await removeCourseFromExemptions(courseCode);
        elements.actionStatus.textContent = 'הקורס הוסר מהפטורים.';
    }

    await refreshCourseActionsUi(elements, courseCode);
    setCourseActionsBusy(elements, false);
}

function setCourseActionsBusy(
    elements: CoursePageElements,
    busy: boolean
): void {
    elements.semesterAddCurrent.disabled = busy;
    elements.wishlistAdd.disabled = busy;
    elements.exemptionsAdd.disabled = busy;
    elements.placementRemove.disabled = busy;

    const semesterButtons =
        elements.semesterDropdownMenu.querySelectorAll<HTMLButtonElement>(
            '[data-semester-option]'
        );
    for (const semesterButton of semesterButtons) {
        semesterButton.disabled = busy;
    }

    if (busy) {
        elements.semesterDropdown.open = false;
    }
}

async function readPersistedPlan(): Promise<NormalizedPersistedPlan> {
    const metaEntry = await appState.userPlan.get();
    const rawPlan = toPersistedPlan(metaEntry?.value);
    const semesterCount = normalizeSemesterCount(rawPlan?.semesterCount);
    return {
        version: PLAN_META_VERSION,
        semesterCount,
        currentSemester: normalizeCurrentSemester(
            rawPlan?.currentSemester,
            semesterCount
        ),
        semesters: ensureSemesters(
            normalizeSemesters(rawPlan?.semesters),
            semesterCount
        ),
        wishlistCourseCodes: normalizeCourseCodes(rawPlan?.wishlistCourseCodes),
        exemptionsCourseCodes: normalizeCourseCodes(
            rawPlan?.exemptionsCourseCodes
        ),
    };
}

function resolveCoursePlacement(
    plan: NormalizedPersistedPlan,
    courseCode: string
): CoursePlacement {
    const normalizedCode = courseCode.trim().toUpperCase();
    if (normalizedCode.length === 0) {
        return { kind: 'none' };
    }

    for (const [semesterIndex, semester] of plan.semesters.entries()) {
        const courseCodes = normalizeCourseCodes(semester.courseCodes);
        if (courseCodes.includes(normalizedCode)) {
            return { kind: 'semester', semesterIndex };
        }
    }

    if (
        normalizeCourseCodes(plan.wishlistCourseCodes).includes(normalizedCode)
    ) {
        return { kind: 'wishlist' };
    }
    if (
        normalizeCourseCodes(plan.exemptionsCourseCodes).includes(
            normalizedCode
        )
    ) {
        return { kind: 'exemptions' };
    }
    return { kind: 'none' };
}

function ensureSemesters(
    semesters: { id?: string; courseCodes?: string[] }[],
    semesterCount: number
): { id?: string; courseCodes?: string[] }[] {
    const normalizedSemesters = semesters.map((semester) => ({
        id: semester.id,
        courseCodes: normalizeCourseCodes(semester.courseCodes),
    }));
    while (normalizedSemesters.length < semesterCount) {
        normalizedSemesters.push({ id: undefined, courseCodes: [] });
    }
    return normalizedSemesters;
}

async function updatePersistedPlan(
    update: (plan: NormalizedPersistedPlan) => boolean
): Promise<boolean> {
    const plan = await readPersistedPlan();
    const changed = update(plan);
    if (!changed) {
        return false;
    }

    await appState.userPlan.set(plan);
    return true;
}

async function addCourseToSemester(
    courseCode: string,
    semesterIndex: number
): Promise<boolean> {
    const code = courseCode.trim().toUpperCase();
    if (code.length === 0) {
        return false;
    }

    return updatePersistedPlan((plan) => {
        const safeIndex = normalizeCurrentSemester(
            semesterIndex,
            plan.semesterCount
        );
        plan.semesters = ensureSemesters(plan.semesters, plan.semesterCount);
        const semester = plan.semesters[safeIndex];
        const currentCodes = normalizeCourseCodes(semester.courseCodes);
        if (currentCodes.includes(code)) {
            return false;
        }
        semester.courseCodes = [...currentCodes, code];
        return true;
    });
}

async function addCourseToWishlist(courseCode: string): Promise<boolean> {
    const code = courseCode.trim().toUpperCase();
    if (code.length === 0) {
        return false;
    }

    return updatePersistedPlan((plan) => {
        const wishlist = normalizeCourseCodes(plan.wishlistCourseCodes);
        if (wishlist.includes(code)) {
            return false;
        }
        plan.wishlistCourseCodes = [...wishlist, code];
        return true;
    });
}

async function addCourseToExemptions(courseCode: string): Promise<boolean> {
    const code = courseCode.trim().toUpperCase();
    if (code.length === 0) {
        return false;
    }

    return updatePersistedPlan((plan) => {
        const exemptions = normalizeCourseCodes(plan.exemptionsCourseCodes);
        if (exemptions.includes(code)) {
            return false;
        }
        plan.exemptionsCourseCodes = [...exemptions, code];
        return true;
    });
}

async function removeCourseFromSemester(
    courseCode: string,
    semesterIndex: number
): Promise<boolean> {
    const code = courseCode.trim().toUpperCase();
    if (code.length === 0) {
        return false;
    }

    return updatePersistedPlan((plan) => {
        const safeIndex = normalizeCurrentSemester(
            semesterIndex,
            plan.semesterCount
        );
        plan.semesters = ensureSemesters(plan.semesters, plan.semesterCount);
        const semester = plan.semesters[safeIndex];
        const currentCodes = normalizeCourseCodes(semester.courseCodes);
        const nextCodes = currentCodes.filter((entry) => entry !== code);
        if (nextCodes.length === currentCodes.length) {
            return false;
        }
        semester.courseCodes = nextCodes;
        return true;
    });
}

async function removeCourseFromWishlist(courseCode: string): Promise<boolean> {
    const code = courseCode.trim().toUpperCase();
    if (code.length === 0) {
        return false;
    }

    return updatePersistedPlan((plan) => {
        const wishlist = normalizeCourseCodes(plan.wishlistCourseCodes);
        const nextWishlist = wishlist.filter((entry) => entry !== code);
        if (nextWishlist.length === wishlist.length) {
            return false;
        }
        plan.wishlistCourseCodes = nextWishlist;
        return true;
    });
}

async function removeCourseFromExemptions(
    courseCode: string
): Promise<boolean> {
    const code = courseCode.trim().toUpperCase();
    if (code.length === 0) {
        return false;
    }

    return updatePersistedPlan((plan) => {
        const exemptions = normalizeCourseCodes(plan.exemptionsCourseCodes);
        const nextExemptions = exemptions.filter((entry) => entry !== code);
        if (nextExemptions.length === exemptions.length) {
            return false;
        }
        plan.exemptionsCourseCodes = nextExemptions;
        return true;
    });
}

function toPersistedPlan(value: unknown): Partial<PersistedPlan> | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    return value as Partial<PersistedPlan>;
}

function normalizeCourseCodes(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const codes = new Set<string>();
    for (const entry of value) {
        if (typeof entry !== 'string') {
            continue;
        }
        const normalized = entry.trim().toUpperCase();
        if (normalized.length === 0) {
            continue;
        }
        codes.add(normalized);
    }

    return [...codes];
}

function normalizeSemesters(
    value: unknown
): { id?: string; courseCodes?: string[] }[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((entry) => {
        if (typeof entry !== 'object' || entry === null) {
            return { courseCodes: [] };
        }
        const raw = entry as {
            id?: unknown;
            courseCodes?: unknown;
            courses?: unknown;
        };
        const courseCodes = normalizeCourseCodes(raw.courseCodes);
        return {
            id: typeof raw.id === 'string' ? raw.id : undefined,
            courseCodes:
                courseCodes.length > 0
                    ? courseCodes
                    : normalizeLegacySemesterCourses(raw.courses),
        };
    });
}

function normalizeLegacySemesterCourses(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const legacyCodes: string[] = [];
    for (const entry of value) {
        if (typeof entry === 'string') {
            legacyCodes.push(entry);
            continue;
        }

        if (typeof entry !== 'object' || entry === null) {
            continue;
        }

        const record = entry as { code?: unknown };
        if (typeof record.code === 'string') {
            legacyCodes.push(record.code);
        }
    }

    return normalizeCourseCodes(legacyCodes);
}

function normalizeSemesterCount(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.max(3, Math.floor(value));
    }
    return DEFAULT_SEMESTER_COUNT;
}

function normalizeCurrentSemester(
    value: unknown,
    semesterCount: number
): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.max(0, Math.min(semesterCount - 1, Math.floor(value)));
    }
    return 0;
}

function showNotFound(elements: CoursePageElements, message: string): void {
    elements.notFoundState.classList.remove('hidden');
    elements.notFoundMessage.textContent = message;
    setPrimaryStatsLoading(elements, false);
    resetRelationSectionsToEmpty(elements);
}

function showCourseFound(elements: CoursePageElements): void {
    elements.notFoundState.classList.add('hidden');
    setPrimaryStatsLoading(elements, false);
}

function setPrimaryStatsLoading(
    elements: CoursePageElements,
    loading: boolean
): void {
    setStatTileSkeleton(elements.coursePointsCard, loading);
    setStatTileSkeleton(elements.courseMedianCard, loading);
    setStatTileSkeleton(elements.courseFacultyCard, loading);
    setStatTileSkeleton(elements.courseSeasonsCard, loading);
}

function setStatTileSkeleton(element: HTMLElement, loading: boolean): void {
    if (loading) {
        element.dataset.loading = 'true';
        return;
    }

    element.dataset.loading = 'false';
}

function setCountSkeleton(element: HTMLElement, loading: boolean): void {
    if (loading) {
        element.textContent = '';
        element.classList.add(...COUNT_SKELETON_CLASS);
        return;
    }

    element.classList.remove(...COUNT_SKELETON_CLASS);
}

function resetRelationSectionsToEmpty(elements: CoursePageElements): void {
    renderDependencyGroups(
        elements.dependenciesGrid,
        elements.dependenciesCount,
        elements.dependenciesEmpty,
        []
    );
    renderRelatedCourseCards(
        elements.dependantsGrid,
        elements.dependantsCount,
        elements.dependantsEmpty,
        []
    );
    renderRelatedCourseCards(
        elements.adjacentGrid,
        elements.adjacentCount,
        elements.adjacentEmpty,
        []
    );
    renderRelatedCourseCards(
        elements.exclusiveGrid,
        elements.exclusiveCount,
        elements.exclusiveEmpty,
        []
    );
}

async function loadAndRenderCourse(
    elements: CoursePageElements,
    code: string
): Promise<void> {
    const course = await appState.courses.get(code);
    if (course === undefined) {
        showNotFound(elements, `לא נמצא קורס עם הקוד ${code}.`);
        return;
    }

    fillPrimaryCourseData(elements, course);
    const dependencyGroups = getDependencyGroups(course);
    const adjacentCodes = getConnectionCodes(course.connections?.adjacent);
    const exclusiveCodes = getConnectionCodes(course.connections?.exclusive);

    const [dependenciesByGroup, dependants, adjacent, exclusive] =
        await Promise.all([
            loadRelatedCourseGroups(code, dependencyGroups),
            loadDependantCourses(code),
            loadRelatedCourses(code, adjacentCodes),
            loadRelatedCourses(code, exclusiveCodes),
        ]);

    renderDependencyGroups(
        elements.dependenciesGrid,
        elements.dependenciesCount,
        elements.dependenciesEmpty,
        dependenciesByGroup
    );
    renderRelatedCourseCards(
        elements.dependantsGrid,
        elements.dependantsCount,
        elements.dependantsEmpty,
        dependants
    );
    renderRelatedCourseCards(
        elements.adjacentGrid,
        elements.adjacentCount,
        elements.adjacentEmpty,
        adjacent
    );
    renderRelatedCourseCards(
        elements.exclusiveGrid,
        elements.exclusiveCount,
        elements.exclusiveEmpty,
        exclusive
    );

    showCourseFound(elements);
}

function fillPrimaryCourseData(
    elements: CoursePageElements,
    course: CourseRecord
): void {
    elements.courseName.textContent =
        getNonEmptyString(course.name) ?? UNKNOWN_COURSE_LABEL;
    elements.courseAbout.textContent =
        getNonEmptyString(course.about) ??
        'אין תיאור זמין לקורס זה במאגר הנוכחי.';
    elements.coursePoints.textContent = formatNumber(course.points);
    elements.courseMedian.textContent = formatNumber(course.median);
    elements.courseFaculty.textContent =
        getNonEmptyString(course.faculty) ?? EMPTY_VALUE;
    elements.courseSeasons.textContent = formatSeasons(course.seasons);
}

function formatNumber(value: number | undefined): string {
    if (value === undefined || !Number.isFinite(value)) {
        return EMPTY_VALUE;
    }
    return value.toString();
}

function formatSeasons(seasons: string[] | undefined): string {
    if (!Array.isArray(seasons) || seasons.length === 0) {
        return EMPTY_VALUE;
    }

    const formatted = seasons
        .map((season) => toHebrewSeasonLabel(season))
        .filter((season) => season.length > 0);
    if (formatted.length === 0) {
        return EMPTY_VALUE;
    }
    return formatted.join(' · ');
}

function toHebrewSeasonLabel(value: string): string {
    const normalized = value.trim().toLowerCase();
    if (normalized.length === 0) {
        return '';
    }

    if (
        normalized === 'חורף' ||
        normalized === 'winter' ||
        normalized === 'a' ||
        normalized === 'א' ||
        normalized === 'semester a'
    ) {
        return 'חורף';
    }

    if (
        normalized === 'אביב' ||
        normalized === 'spring' ||
        normalized === 'b' ||
        normalized === 'ב' ||
        normalized === 'semester b'
    ) {
        return 'אביב';
    }

    if (
        normalized === 'קיץ' ||
        normalized === 'summer' ||
        normalized === 'c' ||
        normalized === 'ג' ||
        normalized === 'semester c'
    ) {
        return 'קיץ';
    }

    return value.trim();
}

function getNonEmptyString(value: string | undefined): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    const normalized = value.trim();
    if (normalized.length === 0) {
        return undefined;
    }
    return normalized;
}

function getDependencyGroups(course: CourseRecord): DependencyGroup[] {
    const dependencies = course.connections?.dependencies;
    if (!Array.isArray(dependencies)) {
        return [];
    }

    const groups: DependencyGroup[] = [];
    for (const dependencyGroup of dependencies) {
        if (!Array.isArray(dependencyGroup)) {
            continue;
        }
        const groupCodes: string[] = [];
        for (const dependencyCode of dependencyGroup) {
            if (typeof dependencyCode !== 'string') {
                continue;
            }
            const normalized = dependencyCode.trim().toUpperCase();
            if (normalized.length === 0) {
                continue;
            }
            if (!groupCodes.includes(normalized)) {
                groupCodes.push(normalized);
            }
        }
        if (groupCodes.length > 0) {
            groups.push(groupCodes);
        }
    }

    return groups;
}

function getConnectionCodes(codes: string[] | undefined): string[] {
    if (!Array.isArray(codes)) {
        return [];
    }

    return codes
        .map((code) => code.trim().toUpperCase())
        .filter((code) => code.length > 0);
}

async function loadRelatedCourses(
    currentCourseCode: string,
    relatedCodes: string[]
): Promise<CourseRecord[]> {
    const uniqueCodes = Array.from(new Set(relatedCodes)).filter(
        (relatedCode) => relatedCode !== currentCourseCode
    );
    if (uniqueCodes.length === 0) {
        return [];
    }

    const relatedCourses = await Promise.all(
        uniqueCodes.map(async (relatedCode) => {
            const relatedCourse = await appState.courses.get(relatedCode);
            if (relatedCourse !== undefined) {
                return relatedCourse;
            }
            return {
                code: relatedCode,
                name: UNKNOWN_COURSE_LABEL,
            } satisfies CourseRecord;
        })
    );

    return relatedCourses;
}

async function loadRelatedCourseGroups(
    currentCourseCode: string,
    groups: DependencyGroup[]
): Promise<RelatedCourseGroups> {
    if (groups.length === 0) {
        return [];
    }

    return Promise.all(
        groups.map(async (groupCodes) => {
            return loadRelatedCourses(currentCourseCode, groupCodes);
        })
    );
}

async function loadDependantCourses(
    currentCourseCode: string
): Promise<CourseRecord[]> {
    const normalizedCode = currentCourseCode.trim().toUpperCase();
    if (normalizedCode.length === 0) {
        return [];
    }

    const totalCourses = await appState.courses.count();
    if (totalCourses === 0) {
        return [];
    }

    const dependants: CourseRecord[] = [];
    for (let offset = 0; offset < totalCourses; offset += COURSES_BATCH_SIZE) {
        const coursesBatch = await appState.courses.page(
            COURSES_BATCH_SIZE,
            offset
        );
        if (coursesBatch.length === 0) {
            break;
        }

        for (const course of coursesBatch) {
            if (course.code === normalizedCode) {
                continue;
            }
            if (courseHasDependency(course, normalizedCode)) {
                dependants.push(course);
            }
        }
    }

    return dependants;
}

function courseHasDependency(
    course: CourseRecord,
    dependencyCode: string
): boolean {
    const dependencies = course.connections?.dependencies;
    if (!Array.isArray(dependencies)) {
        return false;
    }

    for (const group of dependencies) {
        if (!Array.isArray(group)) {
            continue;
        }

        for (const code of group) {
            if (typeof code !== 'string') {
                continue;
            }

            if (code.trim().toUpperCase() === dependencyCode) {
                return true;
            }
        }
    }

    return false;
}

function renderDependencyGroups(
    container: HTMLElement,
    count: HTMLElement,
    emptyLabel: HTMLElement,
    groups: RelatedCourseGroups
): void {
    container.replaceChildren();
    setCountSkeleton(count, false);
    const groupCount = groups.length;
    const courseCount = groups.reduce(
        (total, group) => total + group.length,
        0
    );
    count.textContent = `${String(groupCount)} חלופות · ${String(courseCount)} קורסים`;

    if (groupCount === 0 || courseCount === 0) {
        emptyLabel.classList.remove('hidden');
        return;
    }

    emptyLabel.classList.add('hidden');

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        const groupCourses = groups[groupIndex] ?? [];
        if (groupCourses.length === 0) {
            continue;
        }

        const groupSection = document.createElement('section');
        groupSection.className = 'flex flex-col gap-3';

        const groupGrid = document.createElement('div');
        groupGrid.className =
            'grid w-fit max-w-full grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] justify-start gap-2 md:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]';

        for (const course of groupCourses) {
            const link = createCourseCardLink(course);
            groupGrid.append(link);
        }

        groupSection.append(groupGrid);
        container.append(groupSection);

        if (groupIndex < groups.length - 1) {
            const separator = document.createElement('div');
            separator.className = 'flex items-center gap-2 py-1';

            const lineStart = document.createElement('span');
            lineStart.className = 'bg-border/80 h-px flex-1';

            const lineEnd = document.createElement('span');
            lineEnd.className = 'bg-border/80 h-px flex-1';

            const orBadge = document.createElement('p');
            orBadge.className =
                'bg-surface-2 text-text-muted inline-flex w-fit items-center rounded-full px-3 py-1 text-xs';
            orBadge.textContent = 'או';

            separator.append(lineStart, orBadge, lineEnd);
            container.append(separator);
        }
    }
}

function renderRelatedCourseCards(
    grid: HTMLElement,
    count: HTMLElement,
    emptyLabel: HTMLElement,
    courses: CourseRecord[]
): void {
    grid.replaceChildren();
    setCountSkeleton(count, false);
    count.textContent = `${String(courses.length)} קורסים`;
    if (courses.length === 0) {
        emptyLabel.classList.remove('hidden');
        return;
    }

    emptyLabel.classList.add('hidden');
    for (const course of courses) {
        grid.append(createCourseCardLink(course));
    }
}

function createCourseCardLink(course: CourseRecord): HTMLAnchorElement {
    const card = CourseCard(course);
    const link = document.createElement('a');
    link.href = `/course?code=${encodeURIComponent(course.code)}`;
    link.className = 'block';
    link.setAttribute('aria-label', `פתיחת הקורס ${course.code}`);
    link.append(card);
    return link;
}
