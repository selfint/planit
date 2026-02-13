import { PWA_UPDATE_EVENT } from '$lib/pwa';

import templateHtml from './UpdateBanner.html?raw';

/** @typedef {import('$lib/pwa').UpdateSW} UpdateSW */

/** @typedef {{ updateSW?: UpdateSW }} UpdateDetail */

/**
 * @returns {HTMLElement}
 */
export function UpdateBanner() {
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

    const action = root.querySelector('[data-update-action]');
    if (!(action instanceof HTMLButtonElement)) {
        throw new Error('UpdateBanner action not found');
    }

    /** @type {UpdateSW | null} */
    let pendingUpdate = null;

    /** @param {UpdateSW} updateSW */
    const showBanner = (updateSW) => {
        pendingUpdate = updateSW;
        host.append(root);
    };

    const hideBanner = () => {
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
        const detail = /** @type {CustomEvent<UpdateDetail>} */ (event).detail;
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
