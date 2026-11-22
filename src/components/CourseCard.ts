import type { CourseRecord } from '$lib/indexeddb';

import templateHtml from './CourseCard.html?raw';

export type CourseCardOptions = {
    emptyValue?: string;
};

const DEFAULT_STATUS_COLOR = 'hsl(168 56% 46%)';
const DEFAULT_EMPTY_VALUE = '—';
const DEFAULT_TITLE = 'קורס ללא שם';
const TEMPLATE_ROOT = createTemplateRoot();

const STATUS_DOT_PATH = createSelectorPath("[data-role='status-dot']");
const POINTS_PATH = createSelectorPath("[data-role='course-points']");
const MEDIAN_PATH = createSelectorPath("[data-role='course-median']");
const TITLE_PATH = createSelectorPath("[data-role='course-title']");
const CODE_PATH = createSelectorPath("[data-role='course-code']");

export function CourseCard(
    course?: CourseRecord,
    options?: CourseCardOptions
): HTMLElement {
    const root = TEMPLATE_ROOT.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('CourseCard template root not found');
    }

    if (course === undefined) {
        applySkeleton(root);
        return root;
    }

    root.removeAttribute('data-skeleton');
    root.removeAttribute('aria-busy');

    const statusColor =
        getStatusColorFromCode(course.code) ?? DEFAULT_STATUS_COLOR;
    const emptyValue = options?.emptyValue ?? DEFAULT_EMPTY_VALUE;
    const titleText = course.name ?? DEFAULT_TITLE;
    const hasTests = Array.isArray(course.tests)
        ? course.tests.some((test) => test !== null)
        : false;
    const shapeClass = hasTests ? 'rounded-full' : 'rounded-none';

    const statusDot = getElementByPath<HTMLSpanElement>(
        root,
        STATUS_DOT_PATH,
        'status dot'
    );
    statusDot.className = `me-[10px] h-3 w-3 min-h-3 min-w-3 shrink-0 ${shapeClass}`;
    statusDot.style.backgroundColor = statusColor;

    const points = getElementByPath<HTMLSpanElement>(
        root,
        POINTS_PATH,
        'course points'
    );
    points.textContent = formatCourseNumber(course.points, emptyValue);

    const median = getElementByPath<HTMLSpanElement>(
        root,
        MEDIAN_PATH,
        'course median'
    );
    median.textContent = formatCourseNumber(course.median, emptyValue);

    const title = getElementByPath<HTMLParagraphElement>(
        root,
        TITLE_PATH,
        'course title'
    );
    title.textContent = titleText;

    const code = getElementByPath<HTMLParagraphElement>(
        root,
        CODE_PATH,
        'course code'
    );
    code.textContent = course.code;

    return root;
}

function createTemplateRoot(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml.trim();
    const root = template.content.firstElementChild;
    if (!(root instanceof HTMLElement)) {
        throw new Error('CourseCard template root not found');
    }
    return root;
}

function createSelectorPath(selector: string): number[] {
    const element = TEMPLATE_ROOT.querySelector(selector);
    if (!(element instanceof Element)) {
        throw new Error(`CourseCard selector not found: ${selector}`);
    }
    return getNodePath(TEMPLATE_ROOT, element);
}

function getElementByPath<TElement extends Element>(
    root: Element,
    path: number[],
    label: string
): TElement {
    let current: Element = root;
    for (const index of path) {
        const child = current.children.item(index);
        if (!(child instanceof Element)) {
            throw new Error(`CourseCard ${label} not found in clone`);
        }
        current = child;
    }
    return current as TElement;
}

function getNodePath(root: Element, target: Element): number[] {
    const path: number[] = [];
    let current: Element | null = target;
    while (current !== null && current !== root) {
        const parent: Element | null = current.parentElement;
        if (parent === null) {
            throw new Error('CourseCard target node is detached from template');
        }
        const index = Array.prototype.indexOf.call(parent.children, current);
        if (index < 0) {
            throw new Error('CourseCard target index not found in template');
        }
        path.unshift(index);
        current = parent;
    }
    if (current !== root) {
        throw new Error('CourseCard target is outside template root');
    }
    return path;
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
