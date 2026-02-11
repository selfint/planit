import './style.css';

import { getCourses, getMeta } from './db/indexeddb';

import { AppHeader } from './components/AppHeader';
import appTemplate from './app.html?raw';
import { initCourseSync } from './sync/courseSync';
import { initPWA } from './pwa.ts';

const COURSE_TABLE_LIMIT = 12;
const COURSE_COUNT_KEY = 'courseDataCount';

function initApp(): HTMLDivElement {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app === null) {
        throw new Error('Missing #app element');
    }
    app.innerHTML = appTemplate;

    const headerHost = app.querySelector<HTMLElement>('[data-app-header]');
    if (headerHost !== null) {
        headerHost.replaceWith(AppHeader());
    }

    return app;
}

function main(): void {
    const app = initApp();
    initPWA();
    function handleSync(): void {
        void loadCourseTable(app);
    }

    initCourseSync({ onSync: handleSync });
    void loadCourseTable(app);
}

main();

async function loadCourseTable(app: ParentNode): Promise<void> {
    const rows =
        app.querySelector<HTMLTableSectionElement>('[data-course-rows]');
    const empty = app.querySelector<HTMLParagraphElement>(
        '[data-course-empty]'
    );
    const count = app.querySelector<HTMLParagraphElement>(
        '[data-course-count]'
    );

    if (rows === null || empty === null || count === null) {
        return;
    }

    const [courses, meta] = await Promise.all([
        getCourses(COURSE_TABLE_LIMIT),
        getMeta(COURSE_COUNT_KEY),
    ]);
    updateCourseCount(count, courses.length, meta?.value);

    rows.replaceChildren();
    for (const course of courses) {
        rows.append(createCourseRow(course));
    }

    if (courses.length === 0) {
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
    }
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

function createCourseRow(course: {
    code: string;
    name?: string;
    points?: number;
    faculty?: string;
}): HTMLTableRowElement {
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
