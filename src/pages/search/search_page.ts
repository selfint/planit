import { CourseCard } from '$components/CourseCard';
import { getMeta, searchCourses, type CourseRecord } from '$lib/indexeddb';

import templateHtml from './search_page.html?raw';

const SEARCH_DEBOUNCE_MS = 220;
const SEARCH_LIMIT = 25;

type SearchPageElements = {
    root: HTMLElement;
    form: HTMLFormElement;
    input: HTMLInputElement;
    clearButton: HTMLButtonElement;
    status: HTMLParagraphElement;
    count: HTMLParagraphElement;
    sync: HTMLParagraphElement;
    empty: HTMLParagraphElement;
    results: HTMLDivElement;
    suggestions: HTMLButtonElement[];
};

type SearchPageState = {
    query: string;
    debounceId: number | undefined;
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
    const initialQuery = readQueryFromUrl();
    const state: SearchPageState = {
        query: initialQuery,
        debounceId: undefined,
    };

    elements.input.value = initialQuery;
    bindSearchEvents(elements, state);

    void updateSyncLabel(elements.sync);
    void runSearch(elements, state, false);

    return root;
}

function collectElements(root: HTMLElement): SearchPageElements {
    const form = root.querySelector<HTMLFormElement>('[data-search-form]');
    const input = root.querySelector<HTMLInputElement>('[data-search-input]');
    const clearButton = root.querySelector<HTMLButtonElement>(
        '[data-search-clear]'
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
    const suggestions = Array.from(
        root.querySelectorAll<HTMLButtonElement>('[data-search-suggestion]')
    );

    if (
        form === null ||
        input === null ||
        clearButton === null ||
        status === null ||
        count === null ||
        sync === null ||
        empty === null ||
        results === null
    ) {
        throw new Error('SearchPage required elements not found');
    }

    return {
        root,
        form,
        input,
        clearButton,
        status,
        count,
        sync,
        empty,
        results,
        suggestions,
    };
}

function bindSearchEvents(
    elements: SearchPageElements,
    state: SearchPageState
): void {
    elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        state.query = normalizeQuery(elements.input.value);
        if (state.debounceId !== undefined) {
            window.clearTimeout(state.debounceId);
            state.debounceId = undefined;
        }
        void runSearch(elements, state, true);
    });

    elements.input.addEventListener('input', () => {
        state.query = normalizeQuery(elements.input.value);
        if (state.debounceId !== undefined) {
            window.clearTimeout(state.debounceId);
        }
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
        if (state.debounceId !== undefined) {
            window.clearTimeout(state.debounceId);
            state.debounceId = undefined;
        }
        void runSearch(elements, state, true);
    });

    elements.clearButton.addEventListener('click', () => {
        state.query = '';
        elements.input.value = '';
        if (state.debounceId !== undefined) {
            window.clearTimeout(state.debounceId);
            state.debounceId = undefined;
        }
        elements.input.focus();
        void runSearch(elements, state, true);
    });

    for (const suggestionButton of elements.suggestions) {
        suggestionButton.addEventListener('click', () => {
            const suggestion = suggestionButton.dataset.searchSuggestion;
            if (suggestion === undefined) {
                return;
            }
            state.query = normalizeQuery(suggestion);
            elements.input.value = state.query;
            if (state.debounceId !== undefined) {
                window.clearTimeout(state.debounceId);
                state.debounceId = undefined;
            }
            void runSearch(elements, state, true);
        });
    }
}

async function runSearch(
    elements: SearchPageElements,
    state: SearchPageState,
    syncUrl: boolean
): Promise<void> {
    const query = normalizeQuery(state.query);
    state.query = query;

    if (syncUrl) {
        writeQueryToUrl(query);
    }

    if (query.length === 0) {
        elements.results.replaceChildren();
        elements.count.textContent = '0 תוצאות';
        elements.status.textContent = 'התחילו להקליד כדי לראות תוצאות.';
        elements.empty.textContent = 'אין כרגע תוצאות להצגה.';
        elements.empty.classList.remove('hidden');
        return;
    }

    renderLoadingState(elements.results, 6);
    elements.status.textContent = `מחפש עבור "${query}"...`;
    elements.count.textContent = '...';
    elements.empty.classList.add('hidden');

    try {
        const courses = await searchCourses(query, SEARCH_LIMIT);
        renderResults(elements.results, courses);
        elements.count.textContent = `${String(courses.length)} תוצאות`;

        if (courses.length === 0) {
            elements.status.textContent = `לא נמצאו התאמות עבור "${query}".`;
            elements.empty.textContent =
                'נסו לחפש לפי קוד קורס, שם חלקי או מילה קצרה יותר.';
            elements.empty.classList.remove('hidden');
            return;
        }

        elements.status.textContent = `נמצאו ${String(courses.length)} תוצאות עבור "${query}".`;
        elements.empty.classList.add('hidden');
    } catch (_error: unknown) {
        elements.results.replaceChildren();
        elements.count.textContent = '0 תוצאות';
        elements.status.textContent = 'טעינת התוצאות נכשלה.';
        elements.empty.textContent = 'אירעה שגיאה בקריאת הנתונים המקומיים.';
        elements.empty.classList.remove('hidden');
    }
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

function normalizeQuery(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
}

function readQueryFromUrl(): string {
    const url = new URL(window.location.href);
    const query = url.searchParams.get('q') ?? '';
    return normalizeQuery(query);
}

function writeQueryToUrl(query: string): void {
    const url = new URL(window.location.href);
    if (query.length === 0) {
        url.searchParams.delete('q');
    } else {
        url.searchParams.set('q', query);
    }
    window.history.replaceState(null, '', url);
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
