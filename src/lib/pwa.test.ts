/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initPWA } from '$lib/pwa';

type RegisterSW = (options?: {
    immediate?: boolean;
    onRegisteredSW?: (
        swUrl: string,
        registration: ServiceWorkerRegistration | undefined
    ) => void;
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
        expect(update).toHaveBeenCalled();
    });
});
