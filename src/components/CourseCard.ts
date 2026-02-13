import templateHtml from './CourseCard.html?raw';

export type CourseCardData = {
    title: string;
    code: string;
    points: string;
    median: string;
    statusClass: string;
};

const DEFAULT_DATA: CourseCardData = {
    title: 'חשבון דיפרנציאלי ואינטגרלי 1מ',
    code: '01040012',
    points: '5.5',
    median: '73.3',
    statusClass: 'bg-success',
};

export function CourseCard(data?: Partial<CourseCardData>): HTMLElement {
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

    const content = { ...DEFAULT_DATA, ...data };

    const statusDot = root.querySelector<HTMLSpanElement>(
        "[data-role='status-dot']"
    );
    if (statusDot !== null) {
        statusDot.className = `size-2 rounded-full ${content.statusClass}`;
    }

    const points = root.querySelector<HTMLSpanElement>(
        "[data-role='course-points']"
    );
    if (points !== null) {
        points.textContent = content.points;
    }

    const median = root.querySelector<HTMLSpanElement>(
        "[data-role='course-median']"
    );
    if (median !== null) {
        median.textContent = content.median;
    }

    const title = root.querySelector<HTMLParagraphElement>(
        "[data-role='course-title']"
    );
    if (title !== null) {
        title.textContent = content.title;
    }

    const code = root.querySelector<HTMLParagraphElement>(
        "[data-role='course-code']"
    );
    if (code !== null) {
        code.textContent = content.code;
    }

    return root;
}
