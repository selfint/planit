import type { CourseRecord } from '$lib/indexeddb';

import templateHtml from './CourseCard.html?raw';

export type CourseCardOptions = {
    statusClass?: string;
    emptyValue?: string;
};

const DEFAULT_STATUS_CLASS = 'bg-success';
const STATUS_CLASSES = [
    'bg-success',
    'bg-warning',
    'bg-info',
    'bg-danger',
    'bg-accent',
];
const DEFAULT_EMPTY_VALUE = '—';
const DEFAULT_TITLE = 'קורס ללא שם';

export function CourseCard(
    course?: CourseRecord,
    options?: CourseCardOptions
): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('CourseCard template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('CourseCard template root not found');
    }

    if (course === undefined) {
        applySkeleton(root);
        return root;
    }

    root.removeAttribute('data-skeleton');
    root.removeAttribute('aria-busy');

    const statusClass =
        options?.statusClass ??
        getStatusClassFromCode(course.code) ??
        DEFAULT_STATUS_CLASS;
    const emptyValue = options?.emptyValue ?? DEFAULT_EMPTY_VALUE;
    const titleText = course.name ?? DEFAULT_TITLE;
    const hasTests = Array.isArray(course.tests)
        ? course.tests.some((test) => test !== null)
        : false;
    const shapeClass = hasTests ? 'rounded-full' : 'rounded-none';

    const statusDot = root.querySelector<HTMLSpanElement>(
        "[data-role='status-dot']"
    );
    if (statusDot !== null) {
        statusDot.className = `me-[5px] h-3 w-3 min-h-3 min-w-3 shrink-0 ${shapeClass} ${statusClass}`;
    }

    const points = root.querySelector<HTMLSpanElement>(
        "[data-role='course-points']"
    );
    if (points !== null) {
        points.textContent = formatCourseNumber(course.points, emptyValue);
    }

    const median = root.querySelector<HTMLSpanElement>(
        "[data-role='course-median']"
    );
    if (median !== null) {
        median.textContent = formatCourseNumber(course.median, emptyValue);
    }

    const title = root.querySelector<HTMLParagraphElement>(
        "[data-role='course-title']"
    );
    if (title !== null) {
        title.textContent = titleText;
    }

    const code = root.querySelector<HTMLParagraphElement>(
        "[data-role='course-code']"
    );
    if (code !== null) {
        code.textContent = course.code;
    }

    return root;
}

function applySkeleton(root: HTMLElement): void {
    root.setAttribute('data-skeleton', 'true');
    root.setAttribute('aria-busy', 'true');

    const textNodes = root.querySelectorAll<HTMLElement>(
        "[data-role='course-points'], [data-role='course-median'], [data-role='course-title'], [data-role='course-code']"
    );

    for (const node of textNodes) {
        node.textContent = '';
    }
}

function formatCourseNumber(
    value: number | undefined,
    emptyValue: string
): string {
    if (value === undefined || !Number.isFinite(value)) {
        return emptyValue;
    }
    return value.toString();
}

function getStatusClassFromCode(code: string): string | undefined {
    const normalized = code.trim();
    if (normalized.length === 0) {
        return undefined;
    }
    let hash = 0;
    for (let index = 0; index < normalized.length; index += 1) {
        hash =
            (hash * 31 + normalized.charCodeAt(index)) % STATUS_CLASSES.length;
    }
    return STATUS_CLASSES[hash];
}
