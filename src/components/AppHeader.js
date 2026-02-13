import logoUrl from '../assets/logo.webp';
import templateHtml from './AppHeader.html?raw';
import titleSvg from '../assets/Title.svg?raw';

/**
 * @returns {HTMLElement}
 */
export function AppHeader() {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('AppHeader template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('AppHeader template root not found');
    }

    const logo = root.querySelector('[data-logo]');
    if (logo instanceof HTMLImageElement) {
        logo.src = logoUrl;
    }

    const title = root.querySelector('[data-title]');
    if (title instanceof HTMLDivElement) {
        title.innerHTML = titleSvg;
        const svg = title.querySelector('svg');
        if (svg instanceof SVGElement) {
            svg.setAttribute('class', 'h-full w-auto');
        }
    }

    return root;
}
