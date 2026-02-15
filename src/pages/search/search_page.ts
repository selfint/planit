import { CourseCard } from '$components/CourseCard';
import {
    getCourseFaculties,
    getMeta,
    getRequirement,
    queryCourses,
    type CourseQueryParams,
    type CourseRecord,
} from '$lib/indexeddb';

import templateHtml from './search_page.html?raw';

const SEARCH_DEBOUNCE_MS = 220;

type PageSize = number | 'all';

type SearchPageElements = {
    form: HTMLFormElement;
    input: HTMLInputElement;
    clearButton: HTMLButtonElement;
    available: HTMLInputElement;
    faculty: HTMLSelectElement;
    requirement: HTMLSelectElement;
    pointsMin: HTMLInputElement;
    pointsMax: HTMLInputElement;
    medianMin: HTMLInputElement;
    pageSize: HTMLSelectElement;
    prevButton: HTMLButtonElement;
    nextButton: HTMLButtonElement;
    pageLabel: HTMLSpanElement;
    paginationWrap: HTMLDivElement;
    status: HTMLParagraphElement;
    count: HTMLParagraphElement;
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
    pageSize: PageSize;
    page: number;
    debounceId: number | undefined;
    requestId: number;
    requirementCodes: Map<string, string[]>;
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
    void runSearch(elements, state, false);

    return root;
}

function collectElements(root: HTMLElement): SearchPageElements {
    const form = root.querySelector<HTMLFormElement>('[data-search-form]');
    const input = root.querySelector<HTMLInputElement>('[data-search-input]');
    const clearButton = root.querySelector<HTMLButtonElement>(
        '[data-search-clear]'
    );
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
    const pageSize = root.querySelector<HTMLSelectElement>(
        '[data-search-page-size]'
    );
    const prevButton =
        root.querySelector<HTMLButtonElement>('[data-search-prev]');
    const nextButton =
        root.querySelector<HTMLButtonElement>('[data-search-next]');
    const pageLabel = root.querySelector<HTMLSpanElement>(
        '[data-search-page-label]'
    );
    const paginationWrap = root.querySelector<HTMLDivElement>(
        '[data-search-pagination]'
    );
    const status = root.querySelector<HTMLParagraphElement>(
        '[data-search-status]'
    );
    const count = root.querySelector<HTMLParagraphElement>(
        '[data-search-count]'
    );
    const sync = root.querySelector<HTMLParagraphElement>('[data-search-sync]');
    const empty = root.querySelector<HTMLParagraphElement>(
        '[data-search-empty]'
    );
    const results = root.querySelector<HTMLDivElement>('[data-search-results]');

    if (
        form === null ||
        input === null ||
        clearButton === null ||
        available === null ||
        faculty === null ||
        requirement === null ||
        pointsMin === null ||
        pointsMax === null ||
        medianMin === null ||
        pageSize === null ||
        prevButton === null ||
        nextButton === null ||
        pageLabel === null ||
        paginationWrap === null ||
        status === null ||
        count === null ||
        sync === null ||
        empty === null ||
        results === null
    ) {
        throw new Error('SearchPage required elements not found');
    }

    return {
        form,
        input,
        clearButton,
        available,
        faculty,
        requirement,
        pointsMin,
        pointsMax,
        medianMin,
        pageSize,
        prevButton,
        nextButton,
        pageLabel,
        paginationWrap,
        status,
        count,
        sync,
        empty,
        results,
    };
}

function parseStateFromUrl(): SearchPageState {
    const url = new URL(window.location.href);
    const pageSizeParam = url.searchParams.get('pageSize');
    const pageSize = parsePageSize(pageSizeParam);

    return {
        query: normalizeText(url.searchParams.get('q') ?? ''),
        availableOnly: url.searchParams.get('available') === '1',
        faculty: normalizeText(url.searchParams.get('faculty') ?? ''),
        requirement: normalizeText(url.searchParams.get('requirement') ?? ''),
        pointsMin: normalizeText(url.searchParams.get('pointsMin') ?? ''),
        pointsMax: normalizeText(url.searchParams.get('pointsMax') ?? ''),
        medianMin: normalizeText(url.searchParams.get('medianMin') ?? ''),
        pageSize,
        page: parsePage(url.searchParams.get('page')),
        debounceId: undefined,
        requestId: 0,
        requirementCodes: new Map(),
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
    elements.pageSize.value =
        state.pageSize === 'all' ? 'all' : state.pageSize.toString();
}

function bindEvents(
    elements: SearchPageElements,
    state: SearchPageState
): void {
    elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        state.query = normalizeText(elements.input.value);
        state.page = 1;
        cancelDebounce(state);
        void runSearch(elements, state, true);
    });

    elements.input.addEventListener('input', () => {
        state.query = normalizeText(elements.input.value);
        state.page = 1;
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
        state.page = 1;
        cancelDebounce(state);
        void runSearch(elements, state, true);
    });

    elements.clearButton.addEventListener('click', () => {
        state.query = '';
        elements.input.value = '';
        state.page = 1;
        cancelDebounce(state);
        elements.input.focus();
        void runSearch(elements, state, true);
    });

    elements.available.addEventListener('change', () => {
        state.availableOnly = elements.available.checked;
        state.page = 1;
        void runSearch(elements, state, true);
    });

    elements.faculty.addEventListener('change', () => {
        state.faculty = normalizeText(elements.faculty.value);
        state.page = 1;
        void runSearch(elements, state, true);
    });

    elements.requirement.addEventListener('change', () => {
        state.requirement = normalizeText(elements.requirement.value);
        state.page = 1;
        void runSearch(elements, state, true);
    });

    elements.pointsMin.addEventListener('input', () => {
        state.pointsMin = normalizeText(elements.pointsMin.value);
        state.page = 1;
        void runSearch(elements, state, true);
    });

    elements.pointsMax.addEventListener('input', () => {
        state.pointsMax = normalizeText(elements.pointsMax.value);
        state.page = 1;
        void runSearch(elements, state, true);
    });

    elements.medianMin.addEventListener('input', () => {
        state.medianMin = normalizeText(elements.medianMin.value);
        state.page = 1;
        void runSearch(elements, state, true);
    });

    elements.pageSize.addEventListener('change', () => {
        state.pageSize = parsePageSize(elements.pageSize.value);
        state.page = 1;
        void runSearch(elements, state, true);
    });

    elements.prevButton.addEventListener('click', () => {
        if (state.page <= 1 || state.pageSize === 'all') {
            return;
        }
        state.page -= 1;
        void runSearch(elements, state, true);
    });

    elements.nextButton.addEventListener('click', () => {
        if (state.pageSize === 'all') {
            return;
        }
        state.page += 1;
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
    } catch (_error: unknown) {
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

    renderLoadingState(
        elements.results,
        state.pageSize === 'all' ? 6 : Math.min(state.pageSize, 12)
    );
    elements.empty.classList.add('hidden');
    elements.status.textContent = 'מחפש...';
    elements.count.textContent = '...';

    const queryParams = buildQueryParams(state);

    try {
        const result = await queryCourses(queryParams);
        if (requestId !== state.requestId) {
            return;
        }

        if (state.pageSize !== 'all') {
            const totalPages = Math.max(
                1,
                Math.ceil(result.total / state.pageSize)
            );
            if (state.page > totalPages) {
                state.page = totalPages;
                if (syncUrl) {
                    writeStateToUrl(state);
                }
                void runSearch(elements, state, false);
                return;
            }
        }

        renderResults(elements.results, result.courses);
        updatePagination(elements, state, result.total);

        if (result.total === 0) {
            elements.count.textContent = '0 תוצאות';
            elements.status.textContent = 'לא נמצאו קורסים עבור הסינון הנוכחי.';
            elements.empty.textContent =
                'נסו להרחיב את הטווחים או לנקות חלק מהפילטרים.';
            elements.empty.classList.remove('hidden');
            return;
        }

        const visibleCount = result.courses.length;
        elements.count.textContent = `${String(visibleCount)} / ${String(result.total)} תוצאות`;
        elements.status.textContent =
            state.pageSize === 'all'
                ? `מציג את כל ${String(result.total)} הקורסים המתאימים.`
                : `מציג עמוד ${String(state.page)} מתוך תוצאות הסינון.`;
    } catch (_error: unknown) {
        if (requestId !== state.requestId) {
            return;
        }

        elements.results.replaceChildren();
        elements.count.textContent = '0 תוצאות';
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
        page: state.page,
        pageSize: state.pageSize,
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
    setOrDeleteParam(
        url,
        'pageSize',
        state.pageSize === 'all' ? '' : state.pageSize.toString()
    );
    setOrDeleteParam(
        url,
        'page',
        state.pageSize === 'all' || state.page <= 1 ? '' : state.page.toString()
    );

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

function parsePage(raw: string | null): number {
    if (raw === null) {
        return 1;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
        return 1;
    }
    return parsed;
}

function parsePageSize(raw: string | null): PageSize {
    if (raw === null || raw.length === 0 || raw === 'all') {
        return 'all';
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return 'all';
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
        anchor.className =
            'focus-visible:ring-accent/60 block rounded-2xl focus-visible:ring-2';
        anchor.setAttribute('aria-label', `פתיחת הקורס ${course.code}`);
        anchor.append(CourseCard(course));
        return anchor;
    });
    results.replaceChildren(...nodes);
}

function updatePagination(
    elements: SearchPageElements,
    state: SearchPageState,
    total: number
): void {
    if (state.pageSize === 'all') {
        elements.paginationWrap.classList.add('hidden');
        elements.pageLabel.textContent = 'עמוד 1 מתוך 1';
        elements.prevButton.disabled = true;
        elements.nextButton.disabled = true;
        return;
    }

    elements.paginationWrap.classList.remove('hidden');

    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    elements.pageLabel.textContent = `עמוד ${String(state.page)} מתוך ${String(totalPages)}`;
    elements.prevButton.disabled = state.page <= 1;
    elements.nextButton.disabled = state.page >= totalPages;
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
