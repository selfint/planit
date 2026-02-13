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

    const statusClass = options?.statusClass ?? DEFAULT_STATUS_CLASS;
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
        statusDot.className = `h-2.5 w-2.5 ${shapeClass} ${statusClass}`;
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
    root.setAttribute('aria-busy', 'true');

    const statusDot = root.querySelector<HTMLSpanElement>(
        "[data-role='status-dot']"
    );
    const points = root.querySelector<HTMLSpanElement>(
        "[data-role='course-points']"
    );
    const median = root.querySelector<HTMLSpanElement>(
        "[data-role='course-median']"
    );
    const title = root.querySelector<HTMLParagraphElement>(
        "[data-role='course-title']"
    );
    const code = root.querySelector<HTMLParagraphElement>(
        "[data-role='course-code']"
    );

    if (statusDot !== null) {
        statusDot.className =
            'h-3 w-3 rounded-none bg-surface-2/70 dark:bg-surface-2/85 animate-pulse';
    }
    if (points !== null) {
        applySkeletonBlock(points, 'w-7', 'h-3');
    }
    if (median !== null) {
        applySkeletonBlock(median, 'w-10', 'h-3');
    }
    if (title !== null) {
        applySkeletonBlock(title, 'w-32', 'h-4');
    }
    if (code !== null) {
        applySkeletonBlock(code, 'w-20', 'h-3');
    }
}

function applySkeletonBlock(
    element: HTMLElement,
    widthClass: string,
    heightClass: string
): void {
    element.textContent = '';
    element.classList.add(
        'animate-pulse',
        'bg-surface-2',
        'dark:bg-surface-2/85',
        'text-transparent',
        'rounded-md',
        widthClass,
        heightClass
    );
    if (element instanceof HTMLSpanElement) {
        element.classList.add('inline-block');
    } else {
        element.classList.add('block');
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
