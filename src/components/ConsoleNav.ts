import logoUrl from '$assets/logo.webp?w=256';
import templateHtml from './ConsoleNav.html?raw';
import titleUrl from '$assets/Title.svg?url';

type ConsoleLinkKey = 'catalog' | 'plan' | 'search';

type ConsoleNavOptions = {
    activePath?: string;
};

const ACTIVE_PATHS: Record<ConsoleLinkKey, string> = {
    catalog: '/catalog',
    plan: '/plan',
    search: '/search',
};

export function ConsoleNav(options: ConsoleNavOptions = {}): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('ConsoleNav template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('ConsoleNav template root not found');
    }

    const logo = root.querySelector<HTMLImageElement>('[data-logo]');
    if (logo !== null) {
        logo.src = logoUrl;
    }

    const titleUse = root.querySelector<SVGUseElement>('[data-title-use]');
    if (titleUse !== null) {
        titleUse.setAttribute('href', titleUrl);
    }

    applyActiveState(root, options.activePath);

    return root;
}

function applyActiveState(
    root: HTMLElement,
    activePath: string | undefined
): void {
    const normalizedPath = normalizePath(activePath);
    const links = root.querySelectorAll<HTMLAnchorElement>(
        '[data-console-link]'
    );
    for (const link of links) {
        const linkKey = link.dataset.consoleLink;
        if (!isConsoleLinkKey(linkKey)) {
            continue;
        }

        const isActive = normalizedPath === ACTIVE_PATHS[linkKey];
        if (isActive) {
            link.classList.add('text-text');
            link.classList.add('font-medium');
            link.classList.remove('text-text-muted');
            continue;
        }

        link.classList.remove('font-medium');
    }
}

function isConsoleLinkKey(value: string | undefined): value is ConsoleLinkKey {
    return value === 'catalog' || value === 'plan' || value === 'search';
}

function normalizePath(path: string | undefined): string {
    if (path === undefined || path === '') {
        return '/';
    }
    if (path === '/') {
        return '/';
    }
    return path.replace(/\/+$/, '');
}
