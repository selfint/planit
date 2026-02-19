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
    const loginButton = root.querySelector<HTMLButtonElement>('[data-login]');
    if (loginButton === null) {
        throw new Error('ConsoleNav login button not found');
    }
    const resolvedLoginButton = loginButton;

    const logoutButton = root.querySelector<HTMLButtonElement>('[data-logout]');
    if (logoutButton === null) {
        throw new Error('ConsoleNav logout button not found');
    }
    const resolvedLogoutButton = logoutButton;

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
