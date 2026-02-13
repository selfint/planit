import templateHtml from './StatusSidebar.html?raw';

/**
 * @returns {HTMLElement}
 */
export function StatusSidebar() {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('StatusSidebar template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('StatusSidebar template root not found');
    }

    return root;
}
