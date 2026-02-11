import logoUrl from '../assets/logo.webp';
import templateHtml from './AppHeader.html?raw';
import titleSvg from '../assets/Title.svg?raw';

export function AppHeader(): HTMLElement {
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

    const logo = root.querySelector<HTMLImageElement>('[data-logo]');
    if (logo !== null) {
        logo.src = logoUrl;
    }

    const title = root.querySelector<HTMLDivElement>('[data-title]');
    if (title !== null) {
        title.innerHTML = titleSvg;
        const svg = title.querySelector<SVGElement>('svg');
        if (svg !== null) {
            svg.setAttribute('class', 'h-full w-auto');
        }
    }

    return root;
}
