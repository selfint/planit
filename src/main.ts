import './style.css';

import { PwaUpdateToast } from '$components/PwaUpdateToast';
import { initCatalogSync } from '$lib/catalogSync';
import { initCourseSync } from '$lib/courseSync';
import { initPWA } from '$lib/pwa';
import { initRouter } from '$lib/router';
import { createStateManagement } from '$lib/stateManagement';

function main(): void {
    try {
        const stateManagement = createStateManagement();
        initRouter(stateManagement);
        document.body.append(PwaUpdateToast());
        initPWA();
        initCourseSync();
        initCatalogSync();
    } catch (err: unknown) {
        console.error('Failed to start app:', err);
    }
}

main();
