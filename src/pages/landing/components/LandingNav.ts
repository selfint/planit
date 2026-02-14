import templateHtml from './LandingNav.html?raw';

export function LandingNav(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('LandingNav template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingNav template root not found');
    }

    return root;
}
