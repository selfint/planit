import logoUrl from '$assets/logo.webp?w=256';
import templateHtml from './LandingNav.html?raw';
import titleUrl from '$assets/Title.svg?url';

const TEMPLATE_ROOT = createTemplateRoot();
const LOGO_PATH = createSelectorPath('[data-logo]');
const TITLE_USE_PATH = createSelectorPath('[data-title-use]');
const MOBILE_MENU_PATH = createSelectorPath('[data-role="mobile-menu"]');

export function LandingNav(): HTMLElement {
    const root = TEMPLATE_ROOT.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingNav template root not found');
    }

    const logo = getElementByPath<HTMLImageElement>(root, LOGO_PATH, 'logo');
    logo.src = logoUrl;

    const titleUse = getElementByPath<SVGUseElement>(
        root,
        TITLE_USE_PATH,
        'title use'
    );
    titleUse.setAttribute('href', titleUrl);

    const toggleButtons = root.querySelectorAll<HTMLButtonElement>(
        '[data-action="toggle-menu"]'
    );
    if (toggleButtons.length === 0) {
        throw new Error('LandingNav toggleButtons not found');
    }
    const mobileMenu = getElementByPath<HTMLElement>(
        root,
        MOBILE_MENU_PATH,
        'mobile menu'
    );
    toggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden', !isHidden);
            toggleButtons.forEach((control) => {
                control.setAttribute('aria-expanded', String(isHidden));
            });
        });
    });

    return root;
}

function createTemplateRoot(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml.trim();
    const root = template.content.firstElementChild;
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingNav template root not found');
    }
    return root;
}

function createSelectorPath(selector: string): number[] {
    const element = TEMPLATE_ROOT.querySelector(selector);
    if (!(element instanceof Element)) {
        throw new Error(`LandingNav selector not found: ${selector}`);
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
            throw new Error(`LandingNav ${label} not found in clone`);
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
            throw new Error('LandingNav target node is detached from template');
        }
        const index = Array.prototype.indexOf.call(parent.children, current);
        if (index < 0) {
            throw new Error('LandingNav target index not found in template');
        }
        path.unshift(index);
        current = parent;
    }
    if (current !== root) {
        throw new Error('LandingNav target is outside template root');
    }
    return path;
}
