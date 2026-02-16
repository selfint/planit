import './style.css';

import { PwaUpdateBanner } from '$components/PwaUpdateBanner';
import { initCatalogSync } from '$lib/catalogSync';
import { initCourseSync } from '$lib/courseSync';
import { initPWA } from '$lib/pwa';
import { initRouter } from '$lib/router';

function main(): void {
    try {
        initRouter();
        document.body.append(PwaUpdateBanner());
        initPWA();
        initCourseSync();
        initCatalogSync();
    } catch (err: unknown) {
        console.error('Failed to start app:', err);
    }
}

main();
