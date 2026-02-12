/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PWA_UPDATE_EVENT, initPWA } from '$lib/pwa';

type RegisterSW = (options?: {
    immediate?: boolean;
    onRegisteredSW?: (
        swUrl: string,
        registration: ServiceWorkerRegistration | undefined
    ) => void;
    onNeedRefresh?: () => void;
}) => () => Promise<void>;

const { registerSW } = vi.hoisted(() => ({
    registerSW: vi.fn<RegisterSW>(),
}));

vi.mock('virtual:pwa-register', () => ({
    registerSW,
}));

type RegisterOptions = Parameters<RegisterSW>[0];

function fireLoad(): void {
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
        let options: RegisterOptions | undefined;
        registerSW.mockImplementation((opts): (() => Promise<void>) => {
            options = opts;
            return (): Promise<void> => Promise.resolve();
        });
        vi.stubGlobal(
            'fetch',
            vi.fn(
                (): Promise<Response> =>
                    Promise.resolve({ status: 200 } as Response)
            )
        );
        Object.defineProperty(window.navigator, 'onLine', {
            value: true,
            configurable: true,
        });

        initPWA();
        fireLoad();

        const update = vi.fn();
        options?.onRegisteredSW?.('sw.js', {
            active: { state: 'activated' },
            update,
        } as unknown as ServiceWorkerRegistration);

        await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

        expect(fetch).toHaveBeenCalled();
        expect(update).toHaveBeenCalledTimes(2);
    });

    it('auto-updates on initial load when refresh is needed', () => {
        const updateSW = vi.fn<() => Promise<void>>(
            (): Promise<void> => Promise.resolve()
        );
        registerSW.mockImplementation((opts): (() => Promise<void>) => {
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
        let options: RegisterOptions | undefined;
        const updateSW = vi.fn<() => Promise<void>>(
            (): Promise<void> => Promise.resolve()
        );
        registerSW.mockImplementation((opts): (() => Promise<void>) => {
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
            .map((call) => call[0] as Event)
            .find((candidate) => candidate.type === PWA_UPDATE_EVENT);
        expect(event?.type).toBe(PWA_UPDATE_EVENT);
    });

    it('checks for updates when back online or visible', async () => {
        let options: RegisterOptions | undefined;
        registerSW.mockImplementation((opts): (() => Promise<void>) => {
            options = opts;
            return (): Promise<void> => Promise.resolve();
        });
        vi.stubGlobal(
            'fetch',
            vi.fn(
                (): Promise<Response> =>
                    Promise.resolve({ status: 200 } as Response)
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
        options?.onRegisteredSW?.('sw.js', {
            active: { state: 'activated' },
            update,
        } as unknown as ServiceWorkerRegistration);

        await Promise.resolve();

        window.dispatchEvent(new Event('online'));
        await Promise.resolve();
        document.dispatchEvent(new Event('visibilitychange'));
        await Promise.resolve();

        expect(update).toHaveBeenCalledTimes(3);
    });
});
