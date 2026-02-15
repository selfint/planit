import {
    type CourseQueryParams,
    type CourseRecord,
    getCourseFaculties,
    getCoursesCount,
    getMeta,
    getRequirement,
    queryCourses,
} from '$lib/indexeddb';
import { CourseCard } from '$components/CourseCard';

import templateHtml from './search_page.html?raw';

const SEARCH_DEBOUNCE_MS = 220;

type SearchPageElements = {
    form: HTMLFormElement;
    input: HTMLInputElement;
    available: HTMLInputElement;
    faculty: HTMLSelectElement;
    requirement: HTMLSelectElement;
    pointsMin: HTMLInputElement;
    pointsMax: HTMLInputElement;
    medianMin: HTMLInputElement;
    status: HTMLParagraphElement;
    sync: HTMLParagraphElement;
    empty: HTMLParagraphElement;
    results: HTMLDivElement;
};

type SearchPageState = {
    query: string;
    availableOnly: boolean;
    faculty: string;
    requirement: string;
    pointsMin: string;
    pointsMax: string;
    medianMin: string;
    debounceId: number | undefined;
    requestId: number;
    requirementCodes: Map<string, string[]>;
    totalCourses: number | undefined;
};

type RequirementNode = {
    name?: string;
    en?: string;
    he?: string;
    courses?: string[];
    nested?: RequirementNode[];
};

type RequirementOption = {
    id: string;
    label: string;
    courseCodes: string[];
};

export function SearchPage(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('SearchPage template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('SearchPage template root not found');
    }

    const elements = collectElements(root);
    const state = parseStateFromUrl();

    hydrateFormFromState(elements, state);
    bindEvents(elements, state);

    void updateSyncLabel(elements.sync);
    void hydrateFilterOptions(elements, state);
    void hydrateTotalCourses(state, elements);
    void runSearch(elements, state, false);

    return root;
}

function collectElements(root: HTMLElement): SearchPageElements {
    const form = root.querySelector<HTMLFormElement>('[data-search-form]');
    const input = root.querySelector<HTMLInputElement>('[data-search-input]');
    const available = root.querySelector<HTMLInputElement>(
        '[data-filter-available]'
    );
    const faculty = root.querySelector<HTMLSelectElement>(
        '[data-filter-faculty]'
    );
    const requirement = root.querySelector<HTMLSelectElement>(
        '[data-filter-requirement]'
    );
    const pointsMin = root.querySelector<HTMLInputElement>(
        '[data-filter-points-min]'
    );
    const pointsMax = root.querySelector<HTMLInputElement>(
        '[data-filter-points-max]'
    );
    const medianMin = root.querySelector<HTMLInputElement>(
        '[data-filter-median-min]'
    );
    const status = root.querySelector<HTMLParagraphElement>(
        '[data-search-status]'
    );
    const sync = root.querySelector<HTMLParagraphElement>('[data-search-sync]');
    const empty = root.querySelector<HTMLParagraphElement>(
        '[data-search-empty]'
    );
    const results = root.querySelector<HTMLDivElement>('[data-search-results]');

    if (
        form === null ||
        input === null ||
        available === null ||
        faculty === null ||
        requirement === null ||
        pointsMin === null ||
        pointsMax === null ||
        medianMin === null ||
        status === null ||
        sync === null ||
        empty === null ||
        results === null
    ) {
        throw new Error('SearchPage required elements not found');
    }

    return {
        form,
        input,
        available,
        faculty,
        requirement,
        pointsMin,
        pointsMax,
        medianMin,
        status,
        sync,
        empty,
        results,
    };
}

function parseStateFromUrl(): SearchPageState {
    const url = new URL(window.location.href);

    return {
        query: normalizeText(url.searchParams.get('q') ?? ''),
        availableOnly: url.searchParams.get('available') === '1',
        faculty: normalizeText(url.searchParams.get('faculty') ?? ''),
        requirement: normalizeText(url.searchParams.get('requirement') ?? ''),
        pointsMin: normalizeText(url.searchParams.get('pointsMin') ?? ''),
        pointsMax: normalizeText(url.searchParams.get('pointsMax') ?? ''),
        medianMin: normalizeText(url.searchParams.get('medianMin') ?? ''),
        debounceId: undefined,
        requestId: 0,
        requirementCodes: new Map(),
        totalCourses: undefined,
    };
}

function hydrateFormFromState(
    elements: SearchPageElements,
    state: SearchPageState
): void {
    elements.input.value = state.query;
    elements.available.checked = state.availableOnly;
    elements.faculty.value = state.faculty;
    elements.requirement.value = state.requirement;
    elements.pointsMin.value = state.pointsMin;
    elements.pointsMax.value = state.pointsMax;
    elements.medianMin.value = state.medianMin;
}

function bindEvents(
    elements: SearchPageElements,
    state: SearchPageState
): void {
    elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        state.query = normalizeText(elements.input.value);
        cancelDebounce(state);
        void runSearch(elements, state, true);
    });

    elements.input.addEventListener('input', () => {
        state.query = normalizeText(elements.input.value);
        cancelDebounce(state);
        state.debounceId = window.setTimeout(() => {
            state.debounceId = undefined;
            void runSearch(elements, state, true);
        }, SEARCH_DEBOUNCE_MS);
    });

    elements.input.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }
        event.preventDefault();
        state.query = '';
        elements.input.value = '';
        cancelDebounce(state);
        void runSearch(elements, state, true);
    });

    elements.available.addEventListener('change', () => {
        state.availableOnly = elements.available.checked;
        void runSearch(elements, state, true);
    });

    elements.faculty.addEventListener('change', () => {
        state.faculty = normalizeText(elements.faculty.value);
        void runSearch(elements, state, true);
    });

    elements.requirement.addEventListener('change', () => {
        state.requirement = normalizeText(elements.requirement.value);
        void runSearch(elements, state, true);
    });

    elements.pointsMin.addEventListener('input', () => {
        state.pointsMin = normalizeText(elements.pointsMin.value);
        void runSearch(elements, state, true);
    });

    elements.pointsMax.addEventListener('input', () => {
        state.pointsMax = normalizeText(elements.pointsMax.value);
        void runSearch(elements, state, true);
    });

    elements.medianMin.addEventListener('input', () => {
        state.medianMin = normalizeText(elements.medianMin.value);
        void runSearch(elements, state, true);
    });
}

function cancelDebounce(state: SearchPageState): void {
    if (state.debounceId === undefined) {
        return;
    }
    window.clearTimeout(state.debounceId);
    state.debounceId = undefined;
}

async function hydrateFilterOptions(
    elements: SearchPageElements,
    state: SearchPageState
): Promise<void> {
    try {
        const [faculties, requirementOptions] = await Promise.all([
            getCourseFaculties(),
            readRequirementOptions(),
        ]);

        renderSelectOptions(elements.faculty, 'כל הפקולטות', faculties);
        if (
            state.faculty.length > 0 &&
            faculties.some((faculty) => faculty === state.faculty)
        ) {
            elements.faculty.value = state.faculty;
        } else {
            state.faculty = '';
            elements.faculty.value = '';
        }

        const requirementLabels = requirementOptions.map((option) => ({
            value: option.id,
            label: option.label,
        }));
        renderSelectOptions(
            elements.requirement,
            'כל הדרישות',
            requirementLabels,
            true
        );

        state.requirementCodes = new Map(
            requirementOptions.map((option) => [option.id, option.courseCodes])
        );

        const hasSelectedRequirement = requirementOptions.some(
            (option) => option.id === state.requirement
        );
        if (hasSelectedRequirement) {
            elements.requirement.value = state.requirement;
        } else {
            state.requirement = '';
            elements.requirement.value = '';
        }
    } catch {
        elements.status.textContent =
            'הפילטרים נטענו חלקית (נתוני דרישות חסרים).';
    }
}

async function runSearch(
    elements: SearchPageElements,
    state: SearchPageState,
    syncUrl: boolean
): Promise<void> {
    const requestId = state.requestId + 1;
    state.requestId = requestId;

    if (syncUrl) {
        writeStateToUrl(state);
    }

    renderLoadingState(elements.results, 6);
    elements.empty.classList.add('hidden');
    elements.status.textContent = 'מחפש...';

    const queryParams = buildQueryParams(state);

    try {
        const result = await queryCourses(queryParams);
        if (requestId !== state.requestId) {
            return;
        }

        renderResults(elements.results, result.courses);

        if (result.total === 0) {
            const totalCourses = state.totalCourses ?? 0;
            elements.status.textContent = `מציג 0 מתוך ${String(totalCourses)}`;
            elements.empty.textContent =
                'נסו להרחיב את הטווחים או לנקות חלק מהפילטרים.';
            elements.empty.classList.remove('hidden');
            return;
        }

        const totalCourses = state.totalCourses ?? result.total;
        elements.status.textContent = `מציג ${String(result.total)} מתוך ${String(totalCourses)}`;
    } catch {
        if (requestId !== state.requestId) {
            return;
        }

        elements.results.replaceChildren();
        elements.status.textContent = 'טעינת התוצאות נכשלה.';
        elements.empty.textContent = 'אירעה שגיאה בקריאת הנתונים המקומיים.';
        elements.empty.classList.remove('hidden');
    }
}

function buildQueryParams(state: SearchPageState): CourseQueryParams {
    const requirementCourseCodes =
        state.requirement.length > 0
            ? (state.requirementCodes.get(state.requirement) ?? [])
            : [];

    return {
        query: state.query,
        availableOnly: state.availableOnly,
        faculty: state.faculty,
        pointsMin: parseOptionalNumber(state.pointsMin),
        pointsMax: parseOptionalNumber(state.pointsMax),
        medianMin: parseOptionalNumber(state.medianMin),
        requirementCourseCodes,
        page: 1,
        pageSize: 'all',
    };
}

function writeStateToUrl(state: SearchPageState): void {
    const url = new URL(window.location.href);

    setOrDeleteParam(url, 'q', state.query);
    setOrDeleteParam(url, 'available', state.availableOnly ? '1' : '');
    setOrDeleteParam(url, 'faculty', state.faculty);
    setOrDeleteParam(url, 'requirement', state.requirement);
    setOrDeleteParam(url, 'pointsMin', state.pointsMin);
    setOrDeleteParam(url, 'pointsMax', state.pointsMax);
    setOrDeleteParam(url, 'medianMin', state.medianMin);

    window.history.replaceState(null, '', url);
}

function setOrDeleteParam(url: URL, key: string, value: string): void {
    if (value.length === 0) {
        url.searchParams.delete(key);
        return;
    }

    url.searchParams.set(key, value);
}

function parseOptionalNumber(value: string): number | undefined {
    if (value.length === 0) {
        return undefined;
    }
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) {
        return undefined;
    }

    return parsed;
}

function normalizeText(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
}

function renderLoadingState(results: HTMLDivElement, amount: number): void {
    const placeholders: HTMLElement[] = [];
    for (let index = 0; index < amount; index += 1) {
        placeholders.push(CourseCard());
    }
    results.replaceChildren(...placeholders);
}

function renderResults(results: HTMLDivElement, courses: CourseRecord[]): void {
    const nodes = courses.map((course) => {
        const anchor = document.createElement('a');
        anchor.href = `/course?code=${encodeURIComponent(course.code)}`;
        const availabilityClass =
            course.current === true ? '' : 'opacity-45 saturate-40';
        anchor.className =
            `focus-visible:ring-accent/60 block rounded-2xl focus-visible:ring-2 ${availabilityClass}`.trim();
        anchor.setAttribute('aria-label', `פתיחת הקורס ${course.code}`);
        anchor.append(CourseCard(course));
        return anchor;
    });
    results.replaceChildren(...nodes);
}

function renderSelectOptions(
    select: HTMLSelectElement,
    placeholder: string,
    values: string[] | { value: string; label: string }[],
    optionsAreObjects = false
): void {
    select.replaceChildren();

    const first = document.createElement('option');
    first.value = '';
    first.textContent = placeholder;
    select.append(first);

    for (const value of values) {
        const option = document.createElement('option');
        if (optionsAreObjects) {
            const item = value as { value: string; label: string };
            option.value = item.value;
            option.textContent = item.label;
        } else {
            const label = value as string;
            option.value = label;
            option.textContent = label;
        }
        select.append(option);
    }
}

async function readRequirementOptions(): Promise<RequirementOption[]> {
    const activeProgramMeta = await getMeta('requirementsActiveProgramId');
    const programId =
        typeof activeProgramMeta?.value === 'string'
            ? activeProgramMeta.value
            : '';
    if (programId.length === 0) {
        return [];
    }

    const requirementRecord = await getRequirement(programId);
    if (requirementRecord === undefined) {
        return [];
    }

    const root = toRequirementNode(requirementRecord.data);
    if (root === undefined) {
        return [];
    }

    const options: RequirementOption[] = [];
    collectRequirementOptions(root, [], options);
    return options;
}

function collectRequirementOptions(
    node: RequirementNode,
    ancestry: string[],
    options: RequirementOption[]
): void {
    const label = getRequirementLabel(node);
    const nextAncestry = label.length > 0 ? [...ancestry, label] : ancestry;
    const courses = collectRequirementCourses(node);

    if (courses.length > 0 && nextAncestry.length > 0) {
        options.push({
            id: nextAncestry.join('::'),
            label: nextAncestry.join(' > '),
            courseCodes: courses,
        });
    }

    if (!Array.isArray(node.nested)) {
        return;
    }

    for (const child of node.nested) {
        collectRequirementOptions(child, nextAncestry, options);
    }
}

function collectRequirementCourses(node: RequirementNode): string[] {
    const courses = new Set<string>();
    collectRequirementCoursesRecursive(node, courses);
    return Array.from(courses);
}

function collectRequirementCoursesRecursive(
    node: RequirementNode,
    target: Set<string>
): void {
    if (Array.isArray(node.courses)) {
        for (const code of node.courses) {
            if (typeof code === 'string' && code.length > 0) {
                target.add(code);
            }
        }
    }

    if (!Array.isArray(node.nested)) {
        return;
    }

    for (const child of node.nested) {
        collectRequirementCoursesRecursive(child, target);
    }
}

function getRequirementLabel(node: RequirementNode): string {
    if (typeof node.he === 'string' && node.he.length > 0) {
        return node.he;
    }
    if (typeof node.en === 'string' && node.en.length > 0) {
        return node.en;
    }
    if (typeof node.name === 'string' && node.name.length > 0) {
        return node.name;
    }
    return '';
}

function toRequirementNode(value: unknown): RequirementNode | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    return value as RequirementNode;
}

async function updateSyncLabel(target: HTMLParagraphElement): Promise<void> {
    const meta = await getMeta('courseDataLastSync');
    if (typeof meta?.value !== 'string' || meta.value.length === 0) {
        target.textContent = 'עדיין לא בוצע סנכרון נתונים.';
        return;
    }

    const date = new Date(meta.value);
    if (Number.isNaN(date.getTime())) {
        target.textContent = 'סטטוס סנכרון לא זמין.';
        return;
    }

    target.textContent = `עודכן לאחרונה: ${date.toLocaleString()}`;
}

async function hydrateTotalCourses(
    state: SearchPageState,
    elements: SearchPageElements
): Promise<void> {
    try {
        state.totalCourses = await getCoursesCount();
        void runSearch(elements, state, false);
    } catch {
        state.totalCourses = undefined;
    }
}
