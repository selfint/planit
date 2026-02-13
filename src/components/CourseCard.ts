import type { CourseRecord } from '$lib/indexeddb';

import templateHtml from './CourseCard.html?raw';

export type CourseCardOptions = {
    statusClass?: string;
    emptyValue?: string;
};

const DEFAULT_STATUS_CLASS = 'bg-success';
const DEFAULT_EMPTY_VALUE = '—';
const DEFAULT_TITLE = 'קורס ללא שם';

export function CourseCard(
    course: CourseRecord,
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

    const statusClass = options?.statusClass ?? DEFAULT_STATUS_CLASS;
    const emptyValue = options?.emptyValue ?? DEFAULT_EMPTY_VALUE;
    const titleText = course.name ?? DEFAULT_TITLE;

    const statusDot = root.querySelector<HTMLSpanElement>(
        "[data-role='status-dot']"
    );
    if (statusDot !== null) {
        statusDot.className = `size-2 rounded-full ${statusClass}`;
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

function formatCourseNumber(
    value: number | undefined,
    emptyValue: string
): string {
    if (value === undefined || !Number.isFinite(value)) {
        return emptyValue;
    }
    return value.toString();
}
