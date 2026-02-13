import { getCoursesPageSorted, getMeta } from '$lib/indexeddb';
import { initCourseSync } from '$lib/courseSync';

import templateHtml from './CourseTable.html?raw';

const COURSE_TABLE_LIMIT = 12;
const COURSE_COUNT_KEY = 'courseDataCount';
const COURSE_REMOTE_UPDATED_KEY = 'courseDataRemoteUpdatedAt';
const COURSE_COUNT_SUFFIX = 'קורסים';
const COURSE_LAST_UPDATE_EMPTY = 'עדכון אחרון: —';
const COURSE_LAST_UPDATE_LABEL = 'עדכון אחרון';
const COURSE_PAGE_LABEL = 'עמוד';
const COURSE_PAGE_JOINER = 'מתוך';
const COURSE_EMPTY_VALUE = '—';

/**
 * @typedef {{
 *   code: string,
 *   name?: string,
 *   points?: number,
 *   median?: number
 * }} CourseRowData
 */

/** @typedef {'code' | 'name' | 'points' | 'median'} CourseSortKey */
/** @typedef {'asc' | 'desc'} CourseSortDirection */

/**
 * @typedef {{
 *   pageIndex: number,
 *   sortKey: CourseSortKey,
 *   sortDirection: CourseSortDirection
 * }} CourseTableState
 */

/**
 * @returns {HTMLElement}
 */
export function CourseTable() {
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

    const rows = root.querySelector('[data-course-rows]');
    const empty = root.querySelector('[data-course-empty]');
    const count = root.querySelector('[data-course-count]');
    const lastUpdated = root.querySelector('[data-course-last-updated]');
    const pageLabel = root.querySelector('[data-course-page]');
    const prevButton = root.querySelector('[data-course-prev]');
    const nextButton = root.querySelector('[data-course-next]');
    /** @type {HTMLButtonElement[]} */
    const sortButtons = Array.from(root.querySelectorAll('[data-course-sort]'));
    /** @type {HTMLSpanElement[]} */
    const sortIndicators = Array.from(
        root.querySelectorAll('[data-sort-indicator]')
    );

    if (
        !(rows instanceof HTMLTableSectionElement) ||
        !(empty instanceof HTMLParagraphElement) ||
        !(count instanceof HTMLParagraphElement) ||
        !(lastUpdated instanceof HTMLParagraphElement) ||
        !(pageLabel instanceof HTMLSpanElement) ||
        !(prevButton instanceof HTMLButtonElement) ||
        !(nextButton instanceof HTMLButtonElement) ||
        sortButtons.length === 0 ||
        sortIndicators.length === 0
    ) {
        throw new Error('CourseTable required elements not found');
    }

    /** @type {CourseTableState} */
    const state = {
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

/**
 * @param {CourseTableState} state
 * @param {HTMLTableSectionElement} rows
 * @param {HTMLParagraphElement} empty
 * @param {HTMLParagraphElement} count
 * @param {HTMLParagraphElement} lastUpdated
 * @param {HTMLSpanElement} pageLabel
 * @param {HTMLButtonElement} prevButton
 * @param {HTMLButtonElement} nextButton
 * @param {HTMLButtonElement[]} sortButtons
 * @param {HTMLSpanElement[]} sortIndicators
 * @returns {Promise<void>}
 */
async function loadCourseTable(
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
) {
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

/**
 * @param {HTMLParagraphElement} count
 * @param {number} visibleCount
 * @param {unknown} metaValue
 * @returns {void}
 */
function updateCourseCount(count, visibleCount, metaValue) {
    const totalCount = parseMetaCount(metaValue);
    const suffix = COURSE_COUNT_SUFFIX;
    const displayedCount = totalCount ?? visibleCount;
    count.textContent = `${String(displayedCount)} ${suffix}`;
}

/**
 * @param {unknown} value
 * @returns {number | undefined}
 */
function parseMetaCount(value) {
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

/**
 * @param {HTMLParagraphElement} element
 * @param {unknown} metaValue
 * @returns {void}
 */
function updateLastUpdated(element, metaValue) {
    const formattedDate = formatRemoteUpdatedAt(metaValue);
    if (formattedDate === undefined) {
        element.textContent = COURSE_LAST_UPDATE_EMPTY;
        return;
    }
    const label = COURSE_LAST_UPDATE_LABEL;
    element.textContent = `${label}: ${formattedDate}`;
}

/**
 * @param {unknown} metaValue
 * @returns {string | undefined}
 */
function formatRemoteUpdatedAt(metaValue) {
    if (typeof metaValue !== 'string' || metaValue.length === 0) {
        return undefined;
    }

    const date = new Date(metaValue);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    return date.toLocaleDateString();
}

/**
 * @param {HTMLSpanElement} label
 * @param {HTMLButtonElement} prevButton
 * @param {HTMLButtonElement} nextButton
 * @param {number} pageIndex
 * @param {unknown} metaValue
 * @param {number} visibleCount
 * @returns {void}
 */
function updateCoursePagination(
    label,
    prevButton,
    nextButton,
    pageIndex,
    metaValue,
    visibleCount
) {
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

/**
 * @param {HTMLButtonElement} button
 * @returns {void}
 */
function togglePaginationButtonState(button) {
    if (button.disabled) {
        button.classList.add('opacity-60');
        button.classList.add('cursor-not-allowed');
    } else {
        button.classList.remove('opacity-60');
        button.classList.remove('cursor-not-allowed');
    }
}

/**
 * @param {CourseRowData} course
 * @returns {HTMLTableRowElement}
 */
function createCourseRow(course) {
    const row = document.createElement('tr');
    row.className = 'text-text';
    const emptyValue = getEmptyValueLabel();

    row.append(
        createCourseCell(course.code, 'whitespace-nowrap overflow-hidden')
    );
    row.append(
        createCourseCell(course.name ?? emptyValue, 'w-full whitespace-normal')
    );
    row.append(
        createCourseCell(
            formatCourseNumber(course.points),
            'whitespace-nowrap overflow-hidden'
        )
    );
    row.append(
        createCourseCell(
            formatCourseNumber(course.median),
            'whitespace-nowrap overflow-hidden'
        )
    );

    return row;
}

/**
 * @param {string} text
 * @param {string | undefined} className
 * @returns {HTMLTableCellElement}
 */
function createCourseCell(text, className) {
    const cell = document.createElement('td');
    cell.className =
        className !== undefined && className.length > 0
            ? `px-2 py-2 text-start ${className}`
            : 'px-2 py-2 text-start';
    cell.textContent = text;
    return cell;
}

/**
 * @param {number | undefined} value
 * @returns {string}
 */
function formatCourseNumber(value) {
    if (value === undefined || !Number.isFinite(value)) {
        return getEmptyValueLabel();
    }
    return value.toString();
}

/**
 * @returns {string}
 */
function getEmptyValueLabel() {
    return COURSE_EMPTY_VALUE;
}

/**
 * @param {string | undefined} value
 * @returns {CourseSortKey | undefined}
 */
function parseSortKey(value) {
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

/**
 * @param {HTMLButtonElement[]} buttons
 * @param {HTMLSpanElement[]} indicators
 * @param {CourseTableState} state
 * @returns {void}
 */
function updateSortControls(buttons, indicators, state) {
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

/**
 * @param {CourseSortDirection} direction
 * @returns {SVGSVGElement}
 */
function createSortIcon(direction) {
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
