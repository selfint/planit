import { PWA_UPDATE_EVENT } from '$lib/pwa';
import type { UpdateSW } from '$lib/pwa';

import templateHtml from './PwaUpdateToast.html?raw';

type UpdateEventDetail = {
    updateSW: UpdateSW;
};

export function PwaUpdateToast(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('PwaUpdateToast template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('PwaUpdateToast template root not found');
    }

    const toast = root.querySelector<HTMLElement>(
        '[data-component="PwaUpdateToast"]'
    );
    const applyButton = root.querySelector<HTMLButtonElement>(
        '[data-role="apply"]'
    );

    if (toast === null || applyButton === null) {
        throw new Error('PwaUpdateToast required elements not found');
    }

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
