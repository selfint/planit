import logoUrl from '../../assets/logo.webp';
import templateHtml from './page.html?raw';

export function LandingPage(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('LandingPage template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingPage template root not found');
    }

    const placeholderImages = root.querySelectorAll<HTMLImageElement>(
        '[data-placeholder="logo"]'
    );
    placeholderImages.forEach((image) => {
        image.src = logoUrl;
        image.loading = 'lazy';
        image.decoding = 'async';
    });

    const mediaContainers = root.querySelectorAll<HTMLElement>(
        '[data-feature-media], [data-hero-media]'
    );
    mediaContainers.forEach((container) => {
        container.dataset.videoReady = 'false';
    });

    return root;
}
