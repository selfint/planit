import { PWA_UPDATE_EVENT } from '$lib/pwaEvents';
import type { UpdateSW } from '$lib/pwaEvents';

import templateHtml from './PwaUpdateBanner.html?raw';

type UpdateEventDetail = {
    updateSW: UpdateSW;
};

export function PwaUpdateBanner(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('PwaUpdateBanner template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('PwaUpdateBanner template root not found');
    }

    const toast = root.querySelector<HTMLElement>(
        '[data-component="PwaUpdateToast"]'
    );
    const message = root.querySelector<HTMLElement>('[data-role="message"]');
    const dismissButton = root.querySelector<HTMLButtonElement>(
        '[data-role="dismiss"]'
    );
    const applyButton = root.querySelector<HTMLButtonElement>(
        '[data-role="apply"]'
    );

    if (
        toast === null ||
        message === null ||
        dismissButton === null ||
        applyButton === null
    ) {
        throw new Error('PwaUpdateBanner required elements not found');
    }

    let pendingUpdate: UpdateSW | null = null;

    window.addEventListener(PWA_UPDATE_EVENT, (event) => {
        const customEvent = event as CustomEvent<UpdateEventDetail>;
        const updateSW = customEvent.detail?.updateSW;
        if (typeof updateSW !== 'function') {
            return;
        }
        pendingUpdate = updateSW;
        message.textContent = 'ניתן לעדכן עכשיו כדי לטעון את הגרסה החדשה.';
        applyButton.disabled = false;
        dismissButton.disabled = false;
        toast.classList.remove('hidden');
    });

    dismissButton.addEventListener('click', () => {
        toast.classList.add('hidden');
    });

    applyButton.addEventListener('click', () => {
        if (pendingUpdate === null) {
            return;
        }
        applyButton.disabled = true;
        dismissButton.disabled = true;
        message.textContent = 'מעדכן גרסה...';
        void pendingUpdate(true).catch(() => {
            applyButton.disabled = false;
            dismissButton.disabled = false;
            message.textContent = 'העדכון נכשל. נסו שוב בעוד רגע.';
        });
    });

    return root;
}
