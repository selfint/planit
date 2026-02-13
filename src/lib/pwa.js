import { registerSW } from 'virtual:pwa-register';

export const PWA_UPDATE_EVENT = 'planit:pwa-update';

/**
 * @typedef {(reloadPage?: boolean) => Promise<void>} UpdateSW
 */

export function initPWA() {
    let swActivated = false;
    let pendingUpdate = false;
    let pendingInitialUpdate = false;
    let bannerShown = false;
    /** @type {UpdateSW | null} */
    let updateSW = null;
    /** @type {(() => Promise<void>) | null} */
    let checkForUpdate = null;
    let isInitialLoad = true;
    // check for updates every 10 minutes
    const period = 10 * 60 * 1000;

    const dispatchUpdateAvailable = () => {
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

    const handleUpdateAvailable = () => {
        if (isInitialLoad) {
            if ('onLine' in navigator && !navigator.onLine) {
                pendingUpdate = true;
                return;
            }
            if (updateSW !== null) {
                void updateSW(true);
                return;
            }
            pendingInitialUpdate = true;
            return;
        }

        if ('onLine' in navigator && !navigator.onLine) {
            pendingUpdate = true;
            return;
        }

        dispatchUpdateAvailable();
    };

    window.addEventListener('online', () => {
        if (!pendingUpdate) {
            if (checkForUpdate !== null) {
                void checkForUpdate();
            }
            return;
        }
        pendingUpdate = false;
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
                    swActivated = true;
                    checkForUpdate = registerPeriodicSync(period, swUrl, r);
                    void checkForUpdate();
                } else {
                    const installing = r.installing;
                    if (installing === null) {
                        return;
                    }
                    installing.addEventListener('statechange', (e) => {
                        const sw = /** @type {ServiceWorker} */ (e.target);
                        swActivated = sw.state === 'activated';
                        if (swActivated) {
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
        if (pendingInitialUpdate) {
            pendingInitialUpdate = false;
            void updateSW(true);
        }
        isInitialLoad = false;
    });
}

/**
 * This function will register a periodic sync check.
 * @param {number} period
 * @param {string} swUrl
 * @param {ServiceWorkerRegistration} r
 * @returns {() => Promise<void>}
 */
function registerPeriodicSync(period, swUrl, r) {
    if (period <= 0) {
        return async () => Promise.resolve();
    }

    const checkForSwUpdate = async () => {
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

    setInterval(() => {
        void checkForSwUpdate();
    }, period);

    return checkForSwUpdate;
}
