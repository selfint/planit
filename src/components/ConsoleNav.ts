import logoUrl from '$assets/logo.webp?w=256';
import templateHtml from './ConsoleNav.html?raw';
import titleUrl from '$assets/Title.svg?url';

import { onUserChange } from '$lib/firebase';
import { state } from '$lib/stateManagement';

type ConsoleLinkKey = 'catalog' | 'plan' | 'search';

type ConsoleNavOptions = {
    activePath?: string;
};

const ACTIVE_PATHS: Record<ConsoleLinkKey, string> = {
    catalog: '/catalog',
    plan: '/plan',
    search: '/search',
};
const TEMPLATE_ROOT = createTemplateRoot();

const LOGO_PATH = createSelectorPath('[data-logo]');
const TITLE_USE_PATH = createSelectorPath('[data-title-use]');
const LOGIN_PATH = createSelectorPath('[data-login]');
const LOGOUT_PATH = createSelectorPath('[data-logout]');

export function ConsoleNav(options: ConsoleNavOptions = {}): HTMLElement {
    const root = TEMPLATE_ROOT.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('ConsoleNav template root not found');
    }

    const logo = getElementByPath<HTMLImageElement>(root, LOGO_PATH, 'logo');
    logo.src = logoUrl;

    const titleUse = getElementByPath<SVGUseElement>(
        root,
        TITLE_USE_PATH,
        'title use'
    );
    titleUse.setAttribute('href', titleUrl);

    applyActiveState(root, options.activePath);
    bindAuthControls(root);

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

function bindAuthControls(root: HTMLElement): void {
    const resolvedLoginButton = getElementByPath<HTMLButtonElement>(
        root,
        LOGIN_PATH,
        'login button'
    );

    const resolvedLogoutButton = getElementByPath<HTMLButtonElement>(
        root,
        LOGOUT_PATH,
        'logout button'
    );

    function render(): void {
        const user = state.firebase.getUser();
        const loggedIn = user !== null;

        resolvedLoginButton.classList.toggle('hidden', loggedIn);
        resolvedLoginButton.classList.toggle('inline-flex', !loggedIn);
        resolvedLoginButton.setAttribute('aria-hidden', String(loggedIn));

        resolvedLogoutButton.classList.toggle('hidden', !loggedIn);
        resolvedLogoutButton.classList.toggle('inline-flex', loggedIn);
        resolvedLogoutButton.setAttribute('aria-hidden', String(!loggedIn));
    }

    resolvedLoginButton.addEventListener('click', () => {
        void state.firebase.login().catch((error: unknown) => {
            console.error('Firebase login failed', error);
        });
    });

    resolvedLogoutButton.addEventListener('click', () => {
        void state.firebase.logout().catch((error: unknown) => {
            console.error('Firebase logout failed', error);
        });
    });

    const unsubscribe = onUserChange(() => {
        render();
    });
    root.addEventListener(
        'DOMNodeRemoved',
        () => {
            unsubscribe();
        },
        { once: true }
    );

    render();
}

function createTemplateRoot(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml.trim();
    const root = template.content.firstElementChild;
    if (!(root instanceof HTMLElement)) {
        throw new Error('ConsoleNav template root not found');
    }
    return root;
}

function createSelectorPath(selector: string): number[] {
    const element = TEMPLATE_ROOT.querySelector(selector);
    if (!(element instanceof Element)) {
        throw new Error(`ConsoleNav selector not found: ${selector}`);
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
            throw new Error(`ConsoleNav ${label} not found in clone`);
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
            throw new Error('ConsoleNav target node is detached from template');
        }
        const index = Array.prototype.indexOf.call(parent.children, current);
        if (index < 0) {
            throw new Error('ConsoleNav target index not found in template');
        }
        path.unshift(index);
        current = parent;
    }
    if (current !== root) {
        throw new Error('ConsoleNav target is outside template root');
    }
    return path;
}
