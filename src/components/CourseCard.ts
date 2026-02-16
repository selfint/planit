import type { CourseRecord } from '$lib/indexeddb';

import templateHtml from './CourseCard.html?raw';

export type CourseCardOptions = {
    statusClass?: string;
    emptyValue?: string;
};

const DEFAULT_STATUS_COLOR = 'hsl(168 56% 46%)';
const DEFAULT_EMPTY_VALUE = '—';
const DEFAULT_TITLE = 'קורס ללא שם';
let cachedTemplateElement: HTMLElement | undefined;

type CourseCardElements = {
    statusDot: HTMLSpanElement | undefined;
    points: HTMLSpanElement | undefined;
    median: HTMLSpanElement | undefined;
    title: HTMLParagraphElement | undefined;
    code: HTMLParagraphElement | undefined;
};

export function CourseCard(
    course?: CourseRecord,
    options?: CourseCardOptions
): HTMLElement {
    const root = getTemplate();
    const elements = collectCourseCardElements(root);

    if (course === undefined) {
        applySkeleton(root, elements);
        return root;
    }

    root.removeAttribute('data-skeleton');
    root.removeAttribute('aria-busy');

    const statusClass = options?.statusClass;
    const statusColor =
        statusClass === undefined
            ? (getStatusColorFromCode(course.code) ?? DEFAULT_STATUS_COLOR)
            : undefined;
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
        statusDot.className =
            statusClass === undefined
                ? `me-[10px] h-3 w-3 min-h-3 min-w-3 shrink-0 ${shapeClass}`
                : `me-[10px] h-3 w-3 min-h-3 min-w-3 shrink-0 ${shapeClass} ${statusClass}`;
        if (statusColor !== undefined) {
            statusDot.style.backgroundColor = statusColor;
        } else {
            statusDot.style.removeProperty('background-color');
        }
    }

    if (elements.points !== undefined) {
        elements.points.textContent = formatCourseNumber(
            course.points,
            emptyValue
        );
    }

    if (elements.median !== undefined) {
        elements.median.textContent = formatCourseNumber(
            course.median,
            emptyValue
        );
    }

    if (elements.title !== undefined) {
        elements.title.textContent = titleText;
    }

    if (elements.code !== undefined) {
        elements.code.textContent = course.code;
    }

    return root;
}

function getTemplate(): HTMLElement {
    if (cachedTemplateElement !== undefined) {
        return cachedTemplateElement.cloneNode(true) as HTMLElement;
    }

    const wrapper = document.createElement('template');
    wrapper.innerHTML = templateHtml;
    const templateElement = wrapper.content.firstElementChild;
    if (!(templateElement instanceof HTMLElement)) {
        throw new Error('CourseCard element not found');
    }

    cachedTemplateElement = templateElement;

    return templateElement.cloneNode(true) as HTMLElement;
}

function collectCourseCardElements(root: HTMLElement): CourseCardElements {
    const elements: CourseCardElements = {
        statusDot: undefined,
        points: undefined,
        median: undefined,
        title: undefined,
        code: undefined,
    };

    const roleElements = root.querySelectorAll<HTMLElement>('[data-role]');
    for (const roleElement of roleElements) {
        const role = roleElement.dataset.role;
        switch (role) {
            case 'status-dot':
                if (roleElement instanceof HTMLSpanElement) {
                    elements.statusDot = roleElement;
                }
                break;
            case 'course-points':
                if (roleElement instanceof HTMLSpanElement) {
                    elements.points = roleElement;
                }
                break;
            case 'course-median':
                if (roleElement instanceof HTMLSpanElement) {
                    elements.median = roleElement;
                }
                break;
            case 'course-title':
                if (roleElement instanceof HTMLParagraphElement) {
                    elements.title = roleElement;
                }
                break;
            case 'course-code':
                if (roleElement instanceof HTMLParagraphElement) {
                    elements.code = roleElement;
                }
                break;
            default:
                break;
        }
    }

    return elements;
}

function applySkeleton(root: HTMLElement, elements: CourseCardElements): void {
    root.setAttribute('data-skeleton', 'true');
    root.setAttribute('aria-busy', 'true');

    if (elements.points !== undefined) {
        elements.points.textContent = '';
    }
    if (elements.median !== undefined) {
        elements.median.textContent = '';
    }
    if (elements.title !== undefined) {
        elements.title.textContent = '';
    }
    if (elements.code !== undefined) {
        elements.code.textContent = '';
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

function getStatusColorFromCode(code: string): string | undefined {
    const normalized = code.trim();
    if (normalized.length === 0) {
        return undefined;
    }

    let hash = 0x811c9dc5;
    for (let index = 0; index < normalized.length; index += 1) {
        hash ^= normalized.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
    }
    hash >>>= 0;

    const hue = hash % 360;
    const saturation = 58 + ((hash >>> 9) % 18);
    const lightness = 42 + ((hash >>> 17) % 16);
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
}
