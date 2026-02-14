import templateHtml from './LandingFeatureCard.html?raw';

type LandingFeatureCardOptions = {
    label: string;
    title: string;
    description: string;
    href: string;
    linkLabel: string;
    mediaSrc?: string;
    mediaAlt?: string;
};

export function LandingFeatureCard(
    options: LandingFeatureCardOptions
): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('LandingFeatureCard template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingFeatureCard template root not found');
    }

    const label = root.querySelector<HTMLElement>('[data-slot="label"]');
    if (label !== null) {
        label.textContent = options.label;
    }

    const title = root.querySelector<HTMLElement>('[data-slot="title"]');
    if (title !== null) {
        title.textContent = options.title;
    }

    const description = root.querySelector<HTMLElement>(
        '[data-slot="description"]'
    );
    if (description !== null) {
        description.textContent = options.description;
    }

    const link = root.querySelector<HTMLAnchorElement>('[data-slot="link"]');
    if (link !== null) {
        link.href = options.href;
        link.textContent = options.linkLabel;
    }

    if (options.mediaSrc !== undefined) {
        const mediaSlot = root.querySelector<HTMLElement>(
            '[data-slot="media"]'
        );
        if (mediaSlot !== null) {
            const image = document.createElement('img');
            image.className = 'h-20 w-20 object-contain opacity-70';
            image.src = options.mediaSrc;
            image.loading = 'lazy';
            image.decoding = 'async';
            image.alt = options.mediaAlt ?? 'תצוגת כרטיס';
            mediaSlot.appendChild(image);
            mediaSlot.removeAttribute('data-skeleton');
            const skeletonLayer = mediaSlot.querySelector<HTMLElement>(
                '[data-skeleton-layer]'
            );
            if (skeletonLayer !== null) {
                skeletonLayer.remove();
            }
        }
    }

    return root;
}
