import { PWA_UPDATE_EVENT } from '$lib/pwa';
import type { UpdateSW } from '$lib/pwa';

import templateHtml from './PwaUpdateToast.html?raw';

type UpdateEventDetail = {
    updateSW: UpdateSW;
};

const TEMPLATE_ROOT = createTemplateRoot();
const TOAST_PATH = createSelectorPath('[data-component="PwaUpdateToast"]');
const APPLY_BUTTON_PATH = createSelectorPath('[data-role="apply"]');

export function PwaUpdateToast(): HTMLElement {
    const root = TEMPLATE_ROOT.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('PwaUpdateToast template root not found');
    }

    const toast = getElementByPath<HTMLElement>(root, TOAST_PATH, 'toast');
    const applyButton = getElementByPath<HTMLButtonElement>(
        root,
        APPLY_BUTTON_PATH,
        'apply button'
    );

    let pendingUpdate: UpdateSW | null = null;

    window.addEventListener(PWA_UPDATE_EVENT, (event) => {
        const customEvent = event as CustomEvent<UpdateEventDetail>;
        const updateSW = customEvent.detail.updateSW;
        if (typeof updateSW !== 'function') {
            return;
        }
        pendingUpdate = updateSW;
        applyButton.disabled = false;
        toast.classList.remove('hidden');
    });

    applyButton.addEventListener('click', () => {
        if (pendingUpdate === null) {
            return;
        }
        applyButton.disabled = true;
        void pendingUpdate(true).catch(() => {
            applyButton.disabled = false;
        });
    });

    return root;
}

function createTemplateRoot(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml.trim();
    const root = template.content.firstElementChild;
    if (!(root instanceof HTMLElement)) {
        throw new Error('PwaUpdateToast template root not found');
    }
    return root;
}

function createSelectorPath(selector: string): number[] {
    const element = TEMPLATE_ROOT.querySelector(selector);
    if (!(element instanceof Element)) {
        throw new Error(`PwaUpdateToast selector not found: ${selector}`);
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
            throw new Error(`PwaUpdateToast ${label} not found in clone`);
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
                'PwaUpdateToast target node is detached from template'
            );
        }
        const index = Array.prototype.indexOf.call(parent.children, current);
        if (index < 0) {
            throw new Error(
                'PwaUpdateToast target index not found in template'
            );
        }
        path.unshift(index);
        current = parent;
    }
    if (current !== root) {
        throw new Error('PwaUpdateToast target is outside template root');
    }
    return path;
}
