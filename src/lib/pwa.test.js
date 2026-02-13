/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PWA_UPDATE_EVENT, initPWA } from '$lib/pwa';

/**
 * @typedef {(options?: {
 *   immediate?: boolean,
 *   onRegisteredSW?: (
 *     swUrl: string,
 *     registration: ServiceWorkerRegistration | undefined
 *   ) => void,
 *   onNeedRefresh?: () => void
 * }) => () => Promise<void>} RegisterSW
 */

const { registerSW } = vi.hoisted(() => ({
    registerSW: /** @type {import('vitest').MockInstance<RegisterSW>} */ (
        vi.fn()
    ),
}));

vi.mock('virtual:pwa-register', () => ({
    registerSW,
}));

/** @typedef {Parameters<RegisterSW>[0]} RegisterOptions */

function fireLoad() {
    window.dispatchEvent(new Event('load'));
}

describe('pwa lib', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        registerSW.mockReset();
    });

    it('registers the service worker on load', () => {
        initPWA();

        fireLoad();

        expect(registerSW).toHaveBeenCalledWith(
            expect.objectContaining({ immediate: true })
        );
    });

    it('checks for updates on the interval', async () => {
        /** @type {RegisterOptions | undefined} */
        let options;
        registerSW.mockImplementation((opts) => {
            options = opts;
            return () => Promise.resolve();
        });
        vi.stubGlobal(
            'fetch',
            vi.fn(() =>
                Promise.resolve(/** @type {Response} */ ({ status: 200 }))
            )
        );
        Object.defineProperty(window.navigator, 'onLine', {
            value: true,
            configurable: true,
        });

        initPWA();
        fireLoad();

        const update = vi.fn();
        options?.onRegisteredSW?.(
            'sw.js',
            /** @type {ServiceWorkerRegistration} */ ({
                active: { state: 'activated' },
                update,
            })
        );

        await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

        expect(fetch).toHaveBeenCalled();
        expect(update).toHaveBeenCalledTimes(2);
    });

    it('auto-updates on initial load when refresh is needed', () => {
        const updateSW =
            /** @type {import('vitest').MockInstance<() => Promise<void>>} */ (
                vi.fn(() => Promise.resolve())
            );
        registerSW.mockImplementation((opts) => {
            opts?.onNeedRefresh?.();
            return updateSW;
        });
        Object.defineProperty(window.navigator, 'onLine', {
            value: true,
            configurable: true,
        });

        initPWA();
        fireLoad();

        expect(updateSW).toHaveBeenCalledWith(true);
    });

    it('dispatches update event when refresh is needed mid-session', () => {
        /** @type {RegisterOptions | undefined} */
        let options;
        const updateSW =
            /** @type {import('vitest').MockInstance<() => Promise<void>>} */ (
                vi.fn(() => Promise.resolve())
            );
        registerSW.mockImplementation((opts) => {
            options = opts;
            return updateSW;
        });
        Object.defineProperty(window.navigator, 'onLine', {
            value: true,
            configurable: true,
        });
        const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

        initPWA();
        fireLoad();

        options?.onNeedRefresh?.();

        const event = dispatchEventSpy.mock.calls
            .map((call) => call[0])
            .find((candidate) => candidate.type === PWA_UPDATE_EVENT);
        expect(event?.type).toBe(PWA_UPDATE_EVENT);
    });

    it('checks for updates when back online or visible', async () => {
        /** @type {RegisterOptions | undefined} */
        let options;
        registerSW.mockImplementation((opts) => {
            options = opts;
            return () => Promise.resolve();
        });
        vi.stubGlobal(
            'fetch',
            vi.fn(() =>
                Promise.resolve(/** @type {Response} */ ({ status: 200 }))
            )
        );
        Object.defineProperty(window.navigator, 'onLine', {
            value: true,
            configurable: true,
        });
        Object.defineProperty(document, 'visibilityState', {
            value: 'visible',
            configurable: true,
        });

        initPWA();
        fireLoad();

        const update = vi.fn();
        options?.onRegisteredSW?.(
            'sw.js',
            /** @type {ServiceWorkerRegistration} */ ({
                active: { state: 'activated' },
                update,
            })
        );

        await Promise.resolve();

        window.dispatchEvent(new Event('online'));
        await Promise.resolve();
        document.dispatchEvent(new Event('visibilitychange'));
        await Promise.resolve();

        expect(update).toHaveBeenCalledTimes(3);
    });
});
