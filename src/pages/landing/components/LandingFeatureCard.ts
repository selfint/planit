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

const TEMPLATE_ROOT = createTemplateRoot();
const LABEL_PATH = createSelectorPath('[data-slot="label"]');
const TITLE_PATH = createSelectorPath('[data-slot="title"]');
const DESCRIPTION_PATH = createSelectorPath('[data-slot="description"]');
const LINK_PATH = createSelectorPath('[data-slot="link"]');
const MEDIA_PATH = createSelectorPath('[data-slot="media"]');

export function LandingFeatureCard(
    options: LandingFeatureCardOptions = {}
): HTMLElement {
    const root = TEMPLATE_ROOT.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingFeatureCard template root not found');
    }

    const label = getElementByPath<HTMLElement>(root, LABEL_PATH, 'label');
    if (options.label !== undefined) {
        label.textContent = options.label;
    }

    const title = getElementByPath<HTMLElement>(root, TITLE_PATH, 'title');
    if (options.title !== undefined) {
        title.textContent = options.title;
    }

    const description = getElementByPath<HTMLElement>(
        root,
        DESCRIPTION_PATH,
        'description'
    );
    if (options.description !== undefined) {
        description.textContent = options.description;
    }

    const link = getElementByPath<HTMLAnchorElement>(root, LINK_PATH, 'link');
    if (options.linkLabel !== undefined) {
        link.textContent = options.linkLabel;
    }
    if (options.href !== undefined) {
        link.href = options.href;
    }

    if (options.mediaSrc !== undefined) {
        const mediaSlot = getElementByPath<HTMLElement>(
            root,
            MEDIA_PATH,
            'media'
        );
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

    return root;
}

function createTemplateRoot(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml.trim();
    const root = template.content.firstElementChild;
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingFeatureCard template root not found');
    }
    return root;
}

function createSelectorPath(selector: string): number[] {
    const element = TEMPLATE_ROOT.querySelector(selector);
    if (!(element instanceof Element)) {
        throw new Error(`LandingFeatureCard selector not found: ${selector}`);
    }
    return getNodePath(TEMPLATE_ROOT, element);
}

function getElementByPath<TElement extends Element>(
    root: Element,
    path: number[],
    label: string
): TElement {
    let current: Element = root;
    for (const index of path) {
        const child = current.children.item(index);
        if (!(child instanceof Element)) {
            throw new Error(`LandingFeatureCard ${label} not found in clone`);
        }
        current = child;
    }
    return current as TElement;
}

function getNodePath(root: Element, target: Element): number[] {
    const path: number[] = [];
    let current: Element | null = target;
    while (current !== null && current !== root) {
        const parent: Element | null = current.parentElement;
        if (parent === null) {
            throw new Error(
                'LandingFeatureCard target node is detached from template'
            );
        }
        const index = Array.prototype.indexOf.call(parent.children, current);
        if (index < 0) {
            throw new Error(
                'LandingFeatureCard target index not found in template'
            );
        }
        path.unshift(index);
        current = parent;
    }
    if (current !== root) {
        throw new Error('LandingFeatureCard target is outside template root');
    }
    return path;
}
