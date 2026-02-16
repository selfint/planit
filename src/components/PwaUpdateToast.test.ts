/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

import { PWA_UPDATE_EVENT } from '$lib/pwa';

import { PwaUpdateToast } from './PwaUpdateToast';

describe('PwaUpdateToast', () => {
    it('is hidden by default and becomes visible on update event', () => {
        const banner = PwaUpdateToast();
        document.body.append(banner);

        const toast = banner.querySelector<HTMLElement>(
            '[data-component="PwaUpdateToast"]'
        );
        if (toast === null) {
            throw new Error('Missing toast element');
        }

        expect(toast.classList.contains('hidden')).toBe(true);

        const updateSW = vi.fn<() => Promise<void>>(
            (): Promise<void> => Promise.resolve()
        );
        window.dispatchEvent(
            new CustomEvent(PWA_UPDATE_EVENT, {
                detail: { updateSW },
            })
        );

        expect(toast.classList.contains('hidden')).toBe(false);
    });

    it('applies update only when user clicks apply', async () => {
        const banner = PwaUpdateToast();
        document.body.append(banner);

        const updateSW = vi.fn<(reloadPage?: boolean) => Promise<void>>(
            (): Promise<void> => Promise.resolve()
        );
        window.dispatchEvent(
            new CustomEvent(PWA_UPDATE_EVENT, {
                detail: { updateSW },
            })
        );

        expect(updateSW).not.toHaveBeenCalled();

        const applyButton = banner.querySelector<HTMLButtonElement>(
            '[data-role="apply"]'
        );
        if (applyButton === null) {
            throw new Error('Missing apply button');
        }

        applyButton.click();
        await Promise.resolve();

        expect(updateSW).toHaveBeenCalledWith(true);
    });
});
