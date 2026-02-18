import './style.css';

import { PwaUpdateToast } from '$components/PwaUpdateToast';
import { initCatalogSync } from '$lib/catalogSync';
import { initCourseSync } from '$lib/courseSync';
import { initPWA } from '$lib/pwa';
import { initRouter } from '$lib/router';
import { installDevStateProviderFromWindow } from '$lib/stateManagement';

async function main(): Promise<void> {
    try {
        const usingDevState = await installDevStateProviderFromWindow();
        initRouter();
        document.body.append(PwaUpdateToast());
        initPWA();

        if (!usingDevState) {
            initCourseSync();
            initCatalogSync();
        }
    } catch (err: unknown) {
        console.error('Failed to start app:', err);
    }
}

void main();
