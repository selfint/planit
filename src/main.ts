import './style.css';

import { DEV_STATE_STORAGE_KEY, initDevSync } from '$lib/test-utils/devSync';
import { PwaUpdateToast } from '$components/PwaUpdateToast';
import { initCatalogSync } from '$lib/catalogSync';
import { initCourseSync } from '$lib/courseSync';
import { initPWA } from '$lib/pwa';
import { initRouter } from '$lib/router';

function main(): void {
    initRouter();
    document.body.append(PwaUpdateToast());
    initPWA();

    initCourseSync();
    initCatalogSync();
}

if (
    import.meta.env.DEV &&
    localStorage.getItem(DEV_STATE_STORAGE_KEY) !== null
) {
    void initDevSync()
        .then(() => {
            main();
        })
        .catch((error: unknown) => {
            console.error('Dev sync failed', error);
        });
} else {
    main();
}
