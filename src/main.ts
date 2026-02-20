import './style.css';

import { DEV_STATE_STORAGE_KEY, initDevSync } from '$lib/test-utils/devSync';
import { initRendering, initRouterNavigationInterception } from '$lib/router';
import { PwaUpdateToast } from '$components/PwaUpdateToast';
import { initPWA } from '$lib/pwa';
import { preloadFirebase } from '$lib/firebase';
import { syncCatalogs } from '$lib/catalogSync';
import { syncCourseData } from '$lib/courseSync';

import { default as appLoadingScreenHtml } from '$components/AppLoadingScreen.html?raw';

async function main(): Promise<void> {
    initPWA();
    initRouterNavigationInterception();

    if (isOnline() && !import.meta.env.DEV) {
        const loadingScreen = createLoadingScreen();
        document.body.append(loadingScreen);

        await Promise.all([
            syncCatalogs(),
            syncCourseData(),
            preloadFirebase(),
        ]);

        loadingScreen.remove();
    }

    initRendering();
    document.body.append(PwaUpdateToast());
}

function isOnline(): boolean {
    if (!('onLine' in navigator)) {
        return true;
    }

    return navigator.onLine;
}

function createLoadingScreen(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = appLoadingScreenHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('AppLoadingScreen template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('AppLoadingScreen template root not found');
    }

    return root;
}

if (
    import.meta.env.DEV &&
    localStorage.getItem(DEV_STATE_STORAGE_KEY) !== null
) {
    await initDevSync();
}

void main();
