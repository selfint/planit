import './style.css';

import {
    DEV_STATE_STORAGE_KEY,
    createDevStateProvider,
    parseDevStatePayload,
} from '$lib/devStateProvider';
import { PwaUpdateToast } from '$components/PwaUpdateToast';
import { initCatalogSync } from '$lib/catalogSync';
import { initCourseSync } from '$lib/courseSync';
import { initPWA } from '$lib/pwa';
import { initRouter } from '$lib/router';
import { state } from '$lib/stateManagement';

function installDevStateProviderFromStorage(): boolean {
    if (!import.meta.env.DEV) {
        return false;
    }

    const serialized = window.localStorage.getItem(DEV_STATE_STORAGE_KEY);
    if (serialized === null || serialized.length === 0) {
        return false;
    }

    const payload = parseDevStatePayload(serialized);
    if (payload === undefined) {
        console.warn('Ignoring invalid dev state from localStorage.');
        return false;
    }

    state.provider.set(createDevStateProvider(payload));
    return true;
}

function main(): void {
    try {
        const hasDevStateProvider = installDevStateProviderFromStorage();
        initRouter();
        document.body.append(PwaUpdateToast());
        initPWA();
        if (!hasDevStateProvider) {
            initCourseSync();
            initCatalogSync();
        }
    } catch (err: unknown) {
        console.error('Failed to start app:', err);
    }
}

main();
