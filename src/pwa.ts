import { registerSW } from 'virtual:pwa-register';

export function initPWA(): void {
    let swActivated = false;
    // check for updates every 10 minutes
    const period = 10 * 60 * 1000;

    window.addEventListener('load', () => {
        registerSW({
            immediate: true,
            // onOfflineReady() {},
            // onNeedRefresh() {},
            onRegisteredSW(swUrl, r) {
                if (period <= 0) {
                    return;
                }

                if (r === undefined) {
                    return;
                }

                if (r.active?.state === 'activated') {
                    swActivated = true;
                    registerPeriodicSync(period, swUrl, r);
                } else {
                    const installing = r.installing;
                    if (installing === null) {
                        return;
                    }
                    installing.addEventListener('statechange', (e) => {
                        const sw = e.target as ServiceWorker;
                        swActivated = sw.state === 'activated';
                        if (swActivated) {
                            registerPeriodicSync(period, swUrl, r);
                        }
                    });
                }
            },
        });
    });
}

/**
 * This function will register a periodic sync check.
 */
function registerPeriodicSync(
    period: number,
    swUrl: string,
    r: ServiceWorkerRegistration
): void {
    if (period <= 0) {
        return;
    }

    const checkForSwUpdate = async (): Promise<void> => {
        if ('onLine' in navigator && !navigator.onLine) {
            return;
        }

        const resp = await fetch(swUrl, {
            cache: 'no-store',
            headers: {
                cache: 'no-store',
                'cache-control': 'no-cache',
            },
        });

        if (resp.status === 200) {
            await r.update();
        }
    };

    setInterval((): void => {
        void checkForSwUpdate();
    }, period);
}
