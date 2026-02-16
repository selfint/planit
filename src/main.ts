import './style.css';

import { PwaUpdateToast } from '$components/PwaUpdateToast';
import { initCatalogSync } from '$lib/catalogSync';
import { initCourseSync } from '$lib/courseSync';
import { initPWA } from '$lib/pwa';
import { initRouter } from '$lib/router';

function main(): void {
    try {
        initRouter();
        document.body.append(PwaUpdateToast());
        initPWA();
        initCourseSync();
        initCatalogSync();
    } catch (err: unknown) {
        console.error('Failed to start app:', err);
    }
}

main();
