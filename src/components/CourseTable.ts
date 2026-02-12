import { getCoursesPage, getMeta } from '../db/indexeddb';
import { initCourseSync } from '../sync/courseSync';
import i18n from '../i18n/he.json';

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

    document.addEventListener('i18n:loaded', () => {
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
    const prefix = i18n.courseTable?.countPrefix ?? 'Showing';
    const suffix = i18n.courseTable?.countSuffix ?? 'courses';
    const joiner = i18n.courseTable?.countOfJoiner ?? 'of';
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
    if (!formattedDate) {
        element.textContent =
            i18n.courseTable?.lastUpdateEmpty ?? 'Last update: —';
        return;
    }
    const label = i18n.courseTable?.lastUpdateLabel ?? 'Last update';
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
    const pageLabel = i18n.courseTable?.pagination?.pageLabel ?? 'Page';
    const pageJoiner = i18n.courseTable?.pagination?.pageOfJoiner ?? 'of';
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

    row.append(createCourseCell(course.code));
    row.append(createCourseCell(course.name ?? emptyValue));
    row.append(createCourseCell(formatCoursePoints(course.points)));
    row.append(createCourseCell(course.faculty ?? emptyValue));

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
        return getEmptyValueLabel();
    }
    return points.toString();
}

function getEmptyValueLabel(): string {
    return i18n.common?.emptyValue ?? '—';
}
