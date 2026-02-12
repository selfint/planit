import { PWA_UPDATE_EVENT, type UpdateSW } from '$lib/pwa';

import templateHtml from './UpdateBanner.html?raw';

type UpdateDetail = { updateSW?: UpdateSW };

export function UpdateBanner(): HTMLElement {
    const host = document.createElement('div');
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('UpdateBanner template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('UpdateBanner template root not found');
    }

    const action = root.querySelector<HTMLButtonElement>(
        '[data-update-action]'
    );
    if (action === null) {
        throw new Error('UpdateBanner action not found');
    }

    let pendingUpdate: UpdateSW | null = null;

    const showBanner = (updateSW: UpdateSW): void => {
        pendingUpdate = updateSW;
        host.append(root);
    };

    const hideBanner = (): void => {
        root.remove();
    };

    action.addEventListener('click', () => {
        if (pendingUpdate === null) {
            return;
        }
        action.disabled = true;
        action.textContent = 'מעדכן...';
        void pendingUpdate(true);
        hideBanner();
    });

    window.addEventListener(PWA_UPDATE_EVENT, (event) => {
        if ('onLine' in navigator && !navigator.onLine) {
            return;
        }
        const detail = (event as CustomEvent<UpdateDetail>).detail;
        if (typeof detail.updateSW !== 'function') {
            return;
        }
        showBanner(detail.updateSW);
    });

    if (import.meta.env.DEV) {
        showBanner((reloadPage) => {
            if (reloadPage === true) {
                window.location.reload();
            }
            return Promise.resolve();
        });
    }

    return host;
}
