import { CourseTable } from './CourseTable';
import templateHtml from './PlannerOverview.html?raw';

export function PlannerOverview(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('PlannerOverview template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('PlannerOverview template root not found');
    }

    const courseTableHost = root.querySelector<HTMLElement>(
        '[data-course-table]'
    );
    if (courseTableHost !== null) {
        courseTableHost.replaceWith(CourseTable());
    }

    return root;
}
