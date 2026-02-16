import { registerSW } from 'virtual:pwa-register';

export const PWA_UPDATE_EVENT = 'planit:pwa-update';

export type UpdateSW = (reloadPage?: boolean) => Promise<void>;

export function initPWA(): void {
    let pendingUpdate = false;
    let pendingNeedRefresh = false;
    let bannerShown = false;
    let updateSW: UpdateSW | null = null;
    let checkForUpdate: (() => Promise<void>) | null = null;
    // check for updates every 10 minutes
    const period = 10 * 60 * 1000;

    const dispatchUpdateAvailable = (): void => {
        if (updateSW === null) {
            return;
        }

        if (bannerShown) {
            return;
        }
        bannerShown = true;

        window.dispatchEvent(
            new CustomEvent(PWA_UPDATE_EVENT, {
                detail: { updateSW },
            })
        );
    };

    const handleUpdateAvailable = (): void => {
        if (updateSW === null) {
            pendingNeedRefresh = true;
            return;
        }

        if ('onLine' in navigator && !navigator.onLine) {
            pendingUpdate = true;
            return;
        }

        dispatchUpdateAvailable();
    };

    window.addEventListener('online', () => {
        if (!pendingUpdate && !pendingNeedRefresh) {
            if (checkForUpdate !== null) {
                void checkForUpdate();
            }
            return;
        }
        pendingUpdate = false;
        pendingNeedRefresh = false;
        dispatchUpdateAvailable();
        if (checkForUpdate !== null) {
            void checkForUpdate();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') {
            return;
        }
        if (checkForUpdate !== null) {
            void checkForUpdate();
        }
    });

    window.addEventListener('load', () => {
        updateSW = registerSW({
            immediate: true,
            onNeedRefresh() {
                handleUpdateAvailable();
            },
            onRegisteredSW(swUrl, r) {
                if (period <= 0) {
                    return;
                }

                if (r === undefined) {
                    return;
                }

                if (r.active?.state === 'activated') {
                    checkForUpdate = registerPeriodicSync(period, swUrl, r);
                    void checkForUpdate();
                } else {
                    const installing = r.installing;
                    if (installing === null) {
                        return;
                    }
                    installing.addEventListener('statechange', (e) => {
                        const sw = e.target as ServiceWorker;
                        if (sw.state === 'activated') {
                            checkForUpdate = registerPeriodicSync(
                                period,
                                swUrl,
                                r
                            );
                            void checkForUpdate();
                        }
                    });
                }
            },
        });
        if (pendingNeedRefresh) {
            pendingNeedRefresh = false;
            handleUpdateAvailable();
        }
    });
}

/**
 * This function will register a periodic sync check.
 */
function registerPeriodicSync(
    period: number,
    swUrl: string,
    r: ServiceWorkerRegistration
): () => Promise<void> {
    if (period <= 0) {
        return async (): Promise<void> => Promise.resolve();
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

    return checkForSwUpdate;
}
