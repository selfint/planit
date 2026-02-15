import templateHtml from './not_found_page.html?raw';

export function NotFoundPage(pathname = '/404'): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('NotFoundPage template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('NotFoundPage template root not found');
    }

    const pathSlot = root.querySelector<HTMLElement>('[data-slot="path"]');
    if (pathSlot !== null) {
        pathSlot.textContent = pathname;
    }

    return root;
}
