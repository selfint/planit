import { registerSW } from 'virtual:pwa-register';

const getRequiredElement = (root: ParentNode, selector: string): Element => {
    const element = root.querySelector(selector);

    if (element === null) {
        throw new Error(`Missing element: ${selector}`);
    }

    return element;
};

const getRequiredDiv = (root: ParentNode, selector: string): HTMLDivElement => {
    const element = getRequiredElement(root, selector);

    if (!(element instanceof HTMLDivElement)) {
        throw new Error(`Expected ${selector} to be a div`);
    }

    return element;
};

const getRequiredButton = (
    root: ParentNode,
    selector: string
): HTMLButtonElement => {
    const element = getRequiredElement(root, selector);

    if (!(element instanceof HTMLButtonElement)) {
        throw new Error(`Expected ${selector} to be a button`);
    }

    return element;
};

export function initPWA(app: Element): void {
    const pwaToast = getRequiredDiv(app, '#pwa-toast');
    const pwaToastMessage = getRequiredDiv(pwaToast, '#toast-message');
    const pwaCloseBtn = getRequiredButton(pwaToast, '#pwa-close');
    const pwaRefreshBtn = getRequiredButton(pwaToast, '#pwa-refresh');

    let refreshSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

    const refreshCallback = (): void => {
        void refreshSW?.(true);
    };

    function hidePwaToast(raf: boolean): void {
        if (raf) {
            requestAnimationFrame(() => {
                hidePwaToast(false);
            });
            return;
        }
        if (!pwaRefreshBtn.classList.contains('hidden')) {
            pwaRefreshBtn.removeEventListener('click', refreshCallback);
            pwaRefreshBtn.classList.add('hidden');
        }

        pwaToast.classList.add('hidden');
    }
    function showPwaToast(offline: boolean): void {
        requestAnimationFrame(() => {
            hidePwaToast(false);
            if (!offline) {
                pwaRefreshBtn.classList.remove('hidden');
                pwaRefreshBtn.addEventListener('click', refreshCallback);
            } else {
                pwaRefreshBtn.classList.add('hidden');
            }
            pwaToast.classList.remove('hidden');
        });
    }

    let swActivated = false;
    // check for updates every hour
    const period = 60 * 60 * 1000;

    window.addEventListener('load', () => {
        pwaCloseBtn.addEventListener('click', () => {
            hidePwaToast(true);
        });
        refreshSW = registerSW({
            immediate: true,
            onOfflineReady() {
                pwaToastMessage.innerHTML = 'App ready to work offline';
                showPwaToast(true);
            },
            onNeedRefresh() {
                pwaToastMessage.innerHTML =
                    'New content available, click on reload button to update';
                showPwaToast(false);
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
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
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
