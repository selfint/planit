import templateHtml from './LandingFeatureCard.html?raw';

type LandingFeatureCardOptions = {
    label?: string;
    title?: string;
    description?: string;
    href?: string;
    linkLabel?: string;
    mediaSrc?: string;
    mediaAlt?: string;
};

export function LandingFeatureCard(
    options: LandingFeatureCardOptions = {}
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
    if (label !== null && options.label !== undefined) {
        label.textContent = options.label;
    }

    const title = root.querySelector<HTMLElement>('[data-slot="title"]');
    if (title !== null && options.title !== undefined) {
        title.textContent = options.title;
    }

    const description = root.querySelector<HTMLElement>(
        '[data-slot="description"]'
    );
    if (description !== null && options.description !== undefined) {
        description.textContent = options.description;
    }

    const link = root.querySelector<HTMLAnchorElement>('[data-slot="link"]');
    if (link !== null && options.linkLabel !== undefined) {
        link.textContent = options.linkLabel;
    }
    if (link !== null && options.href !== undefined) {
        link.href = options.href;
    }

    if (options.mediaSrc !== undefined) {
        const mediaSlot = root.querySelector<HTMLElement>(
            '[data-slot="media"]'
        );
        if (mediaSlot !== null) {
            const image = document.createElement('img');
            image.className = 'h-full w-full object-cover';
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
