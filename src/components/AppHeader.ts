import templateHtml from './AppHeader.html?raw';
import logoUrl from '../assets/logo.webp';
import titleSvg from '../assets/Title.svg?raw';

export function createAppHeader(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const root = template.content.firstElementChild?.cloneNode(
        true
    ) as HTMLElement;

    const logo = root.querySelector<HTMLImageElement>('[data-logo]');
    if (logo) {
        logo.src = logoUrl;
    }

    const title = root.querySelector<HTMLDivElement>('[data-title]');
    if (title) {
        title.innerHTML = titleSvg;
        const svg = title.querySelector<SVGElement>('svg');
        if (svg) {
            svg.setAttribute('class', 'h-full w-auto');
        }
    }

    return root;
}

export function mountAppHeader(target: HTMLElement): HTMLElement {
    const root = createAppHeader();
    target.appendChild(root);
    return root;
}
