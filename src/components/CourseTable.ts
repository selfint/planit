import { getCoursesPageSorted, getMeta } from '../db/indexeddb';
import { initCourseSync } from '../sync/courseSync';

import templateHtml from './CourseTable.html?raw';

const COURSE_TABLE_LIMIT = 12;
const COURSE_COUNT_KEY = 'courseDataCount';
const COURSE_REMOTE_UPDATED_KEY = 'courseDataRemoteUpdatedAt';
const COURSE_COUNT_PREFIX = 'מוצגים';
const COURSE_COUNT_SUFFIX = 'קורסים';
const COURSE_COUNT_JOINER = 'מתוך';
const COURSE_LAST_UPDATE_EMPTY = 'עדכון אחרון: —';
const COURSE_LAST_UPDATE_LABEL = 'עדכון אחרון';
const COURSE_PAGE_LABEL = 'עמוד';
const COURSE_PAGE_JOINER = 'מתוך';
const COURSE_EMPTY_VALUE = '—';

type CourseRowData = {
    code: string;
    name?: string;
    points?: number;
    median?: number;
};

type CourseSortKey = 'code' | 'name' | 'points' | 'median';
type CourseSortDirection = 'asc' | 'desc';

type CourseTableState = {
    pageIndex: number;
    sortKey: CourseSortKey;
    sortDirection: CourseSortDirection;
};

export function CourseTable(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('CourseTable template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('CourseTable template root not found');
    }

    const rows =
        root.querySelector<HTMLTableSectionElement>('[data-course-rows]');
    const empty = root.querySelector<HTMLParagraphElement>(
        '[data-course-empty]'
    );
    const count = root.querySelector<HTMLParagraphElement>(
        '[data-course-count]'
    );
    const lastUpdated = root.querySelector<HTMLParagraphElement>(
        '[data-course-last-updated]'
    );
    const pageLabel = root.querySelector<HTMLSpanElement>('[data-course-page]');
    const prevButton =
        root.querySelector<HTMLButtonElement>('[data-course-prev]');
    const nextButton =
        root.querySelector<HTMLButtonElement>('[data-course-next]');
    const sortButtons = Array.from(
        root.querySelectorAll<HTMLButtonElement>('[data-course-sort]')
    );
    const sortIndicators = Array.from(
        root.querySelectorAll<HTMLSpanElement>('[data-sort-indicator]')
    );

    if (
        rows === null ||
        empty === null ||
        count === null ||
        lastUpdated === null ||
        pageLabel === null ||
        prevButton === null ||
        nextButton === null ||
        sortButtons.length === 0 ||
        sortIndicators.length === 0
    ) {
        throw new Error('CourseTable required elements not found');
    }

    const state: CourseTableState = {
        pageIndex: 0,
        sortKey: 'code',
        sortDirection: 'asc',
    };

    prevButton.addEventListener('click', () => {
        if (state.pageIndex > 0) {
            state.pageIndex -= 1;
            void loadCourseTable(
                state,
                rows,
                empty,
                count,
                lastUpdated,
                pageLabel,
                prevButton,
                nextButton,
                sortButtons,
                sortIndicators
            );
        }
    });

    nextButton.addEventListener('click', () => {
        state.pageIndex += 1;
        void loadCourseTable(
            state,
            rows,
            empty,
            count,
            lastUpdated,
            pageLabel,
            prevButton,
            nextButton,
            sortButtons,
            sortIndicators
        );
    });

    for (const button of sortButtons) {
        button.addEventListener('click', () => {
            const sortKey = parseSortKey(button.dataset.sortKey);
            if (sortKey === undefined) {
                return;
            }

            if (state.sortKey === sortKey) {
                state.sortDirection =
                    state.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortKey = sortKey;
                state.sortDirection = 'asc';
            }

            state.pageIndex = 0;
            void loadCourseTable(
                state,
                rows,
                empty,
                count,
                lastUpdated,
                pageLabel,
                prevButton,
                nextButton,
                sortButtons,
                sortIndicators
            );
        });
    }

    initCourseSync({
        onSync: () => {
            void loadCourseTable(
                state,
                rows,
                empty,
                count,
                lastUpdated,
                pageLabel,
                prevButton,
                nextButton,
                sortButtons,
                sortIndicators
            );
        },
    });

    void loadCourseTable(
        state,
        rows,
        empty,
        count,
        lastUpdated,
        pageLabel,
        prevButton,
        nextButton,
        sortButtons,
        sortIndicators
    );

    return root;
}

async function loadCourseTable(
    state: CourseTableState,
    rows: HTMLTableSectionElement,
    empty: HTMLParagraphElement,
    count: HTMLParagraphElement,
    lastUpdated: HTMLParagraphElement,
    pageLabel: HTMLSpanElement,
    prevButton: HTMLButtonElement,
    nextButton: HTMLButtonElement,
    sortButtons: HTMLButtonElement[],
    sortIndicators: HTMLSpanElement[]
): Promise<void> {
    const [pageCourses, countMeta, updatedMeta] = await Promise.all([
        getCoursesPageSorted(
            COURSE_TABLE_LIMIT,
            state.pageIndex * COURSE_TABLE_LIMIT,
            state.sortKey,
            state.sortDirection
        ),
        getMeta(COURSE_COUNT_KEY),
        getMeta(COURSE_REMOTE_UPDATED_KEY),
    ]);

    updateSortControls(sortButtons, sortIndicators, state);
    updateCourseCount(count, pageCourses.length, countMeta?.value);
    updateLastUpdated(lastUpdated, updatedMeta?.value);

    rows.replaceChildren();
    for (const course of pageCourses) {
        rows.append(createCourseRow(course));
    }

    if (pageCourses.length === 0) {
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
    }

    updateCoursePagination(
        pageLabel,
        prevButton,
        nextButton,
        state.pageIndex,
        countMeta?.value,
        pageCourses.length
    );
}

function updateCourseCount(
    count: HTMLParagraphElement,
    visibleCount: number,
    metaValue: unknown
): void {
    const totalCount = parseMetaCount(metaValue);
    const prefix = COURSE_COUNT_PREFIX;
    const suffix = COURSE_COUNT_SUFFIX;
    const joiner = COURSE_COUNT_JOINER;
    if (totalCount !== undefined && totalCount > visibleCount) {
        count.textContent = `${prefix} ${String(visibleCount)} ${joiner} ${String(totalCount)} ${suffix}`;
        return;
    }
    count.textContent = `${prefix} ${String(visibleCount)} ${suffix}`;
}

function parseMetaCount(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return undefined;
}

function updateLastUpdated(
    element: HTMLParagraphElement,
    metaValue: unknown
): void {
    const formattedDate = formatRemoteUpdatedAt(metaValue);
    if (formattedDate === undefined) {
        element.textContent = COURSE_LAST_UPDATE_EMPTY;
        return;
    }
    const label = COURSE_LAST_UPDATE_LABEL;
    element.textContent = `${label}: ${formattedDate}`;
}

function formatRemoteUpdatedAt(metaValue: unknown): string | undefined {
    if (typeof metaValue !== 'string' || metaValue.length === 0) {
        return undefined;
    }

    const date = new Date(metaValue);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    return date.toLocaleDateString();
}

function updateCoursePagination(
    label: HTMLSpanElement,
    prevButton: HTMLButtonElement,
    nextButton: HTMLButtonElement,
    pageIndex: number,
    metaValue: unknown,
    visibleCount: number
): void {
    const totalCount = parseMetaCount(metaValue);
    const totalPages =
        totalCount !== undefined
            ? Math.max(1, Math.ceil(totalCount / COURSE_TABLE_LIMIT))
            : pageIndex + 1;
    const currentPage = Math.min(pageIndex + 1, totalPages);
    const pageLabel = COURSE_PAGE_LABEL;
    const pageJoiner = COURSE_PAGE_JOINER;
    label.textContent = `${pageLabel} ${String(currentPage)} ${pageJoiner} ${String(totalPages)}`;

    prevButton.disabled = pageIndex <= 0;
    nextButton.disabled =
        totalCount !== undefined
            ? pageIndex + 1 >= totalPages
            : visibleCount < COURSE_TABLE_LIMIT;
    togglePaginationButtonState(prevButton);
    togglePaginationButtonState(nextButton);
}

function togglePaginationButtonState(button: HTMLButtonElement): void {
    if (button.disabled) {
        button.classList.add('opacity-60');
        button.classList.add('cursor-not-allowed');
    } else {
        button.classList.remove('opacity-60');
        button.classList.remove('cursor-not-allowed');
    }
}

function createCourseRow(course: CourseRowData): HTMLTableRowElement {
    const row = document.createElement('tr');
    row.className = 'text-text';
    const emptyValue = getEmptyValueLabel();

    row.append(createCourseCell(course.code, 'whitespace-nowrap'));
    row.append(createCourseCell(course.name ?? emptyValue, 'w-full'));
    row.append(
        createCourseCell(formatCourseNumber(course.points), 'whitespace-nowrap')
    );
    row.append(
        createCourseCell(formatCourseNumber(course.median), 'whitespace-nowrap')
    );

    return row;
}

function createCourseCell(
    text: string,
    className?: string
): HTMLTableCellElement {
    const cell = document.createElement('td');
    cell.className =
        className !== undefined && className.length > 0
            ? `px-2 py-2 text-start ${className}`
            : 'px-2 py-2 text-start';
    cell.textContent = text;
    return cell;
}

function formatCourseNumber(value?: number): string {
    if (value === undefined || !Number.isFinite(value)) {
        return getEmptyValueLabel();
    }
    return value.toString();
}

function getEmptyValueLabel(): string {
    return COURSE_EMPTY_VALUE;
}

function parseSortKey(value: string | undefined): CourseSortKey | undefined {
    if (
        value === 'code' ||
        value === 'name' ||
        value === 'points' ||
        value === 'median'
    ) {
        return value;
    }
    return undefined;
}

function updateSortControls(
    buttons: HTMLButtonElement[],
    indicators: HTMLSpanElement[],
    state: CourseTableState
): void {
    for (const button of buttons) {
        const key = parseSortKey(button.dataset.sortKey);
        if (key === undefined) {
            continue;
        }
        const isActive = key === state.sortKey;
        button.classList.toggle('text-text', isActive);
        button.classList.toggle('text-text-muted', !isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }

    for (const indicator of indicators) {
        const key = parseSortKey(indicator.dataset.sortKey);
        if (key === undefined) {
            continue;
        }
        if (key !== state.sortKey) {
            indicator.replaceChildren();
            continue;
        }
        indicator.replaceChildren(createSortIcon(state.sortDirection));
    }
}

function createSortIcon(direction: CourseSortDirection): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('h-3', 'w-3', 'text-text-muted');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute(
        'd',
        direction === 'asc' ? 'M12 8l5 6H7l5-6z' : 'M12 16l-5-6h10l-5 6z'
    );
    svg.append(path);

    return svg;
}
