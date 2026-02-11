import { getCoursesPage, getMeta } from '../db/indexeddb';
import { initCourseSync } from '../sync/courseSync';

import templateHtml from './CourseTable.html?raw';

const COURSE_TABLE_LIMIT = 12;
const COURSE_COUNT_KEY = 'courseDataCount';
const COURSE_REMOTE_UPDATED_KEY = 'courseDataRemoteUpdatedAt';

type CourseRowData = {
    code: string;
    name?: string;
    points?: number;
    faculty?: string;
};

type CourseTableState = {
    pageIndex: number;
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

    if (
        rows === null ||
        empty === null ||
        count === null ||
        lastUpdated === null ||
        pageLabel === null ||
        prevButton === null ||
        nextButton === null
    ) {
        throw new Error('CourseTable required elements not found');
    }

    const state: CourseTableState = { pageIndex: 0 };

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
                nextButton
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
            nextButton
        );
    });

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
                nextButton
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
        nextButton
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
    nextButton: HTMLButtonElement
): Promise<void> {
    const [courses, countMeta, updatedMeta] = await Promise.all([
        getCoursesPage(
            COURSE_TABLE_LIMIT,
            state.pageIndex * COURSE_TABLE_LIMIT
        ),
        getMeta(COURSE_COUNT_KEY),
        getMeta(COURSE_REMOTE_UPDATED_KEY),
    ]);

    updateCourseCount(count, courses.length, countMeta?.value);
    updateLastUpdated(lastUpdated, updatedMeta?.value);

    rows.replaceChildren();
    for (const course of courses) {
        rows.append(createCourseRow(course));
    }

    if (courses.length === 0) {
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
        courses.length
    );
}

function updateCourseCount(
    count: HTMLParagraphElement,
    visibleCount: number,
    metaValue: unknown
): void {
    const totalCount = parseMetaCount(metaValue);
    if (totalCount !== undefined && totalCount > visibleCount) {
        count.textContent = `Showing ${String(visibleCount)} of ${String(
            totalCount
        )} courses`;
        return;
    }
    count.textContent = `Showing ${String(visibleCount)} courses`;
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
    const formatted = formatRemoteUpdatedAt(metaValue);
    element.textContent = formatted ?? 'Last update: —';
}

function formatRemoteUpdatedAt(metaValue: unknown): string | undefined {
    if (typeof metaValue !== 'string' || metaValue.length === 0) {
        return undefined;
    }

    const date = new Date(metaValue);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    return `Last update: ${date.toLocaleDateString()}`;
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
    label.textContent = `Page ${String(currentPage)} of ${String(totalPages)}`;

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

    row.append(createCourseCell(course.code));
    row.append(createCourseCell(course.name ?? '—'));
    row.append(createCourseCell(formatCoursePoints(course.points)));
    row.append(createCourseCell(course.faculty ?? '—'));

    return row;
}

function createCourseCell(text: string): HTMLTableCellElement {
    const cell = document.createElement('td');
    cell.className = 'py-2 text-start';
    cell.textContent = text;
    return cell;
}

function formatCoursePoints(points?: number): string {
    if (points === undefined || !Number.isFinite(points)) {
        return '—';
    }
    return points.toString();
}
