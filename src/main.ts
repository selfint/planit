import './style.css';

import { DEV_STATE_STORAGE_KEY, initDevSync } from '$lib/test-utils/devSync';
import { PwaUpdateToast } from '$components/PwaUpdateToast';
import { default as appLoadingScreenHtml } from '$components/AppLoadingScreen.html?raw';
import { initCatalogSync } from '$lib/catalogSync';
import { initCourseSync } from '$lib/courseSync';
import { initPWA } from '$lib/pwa';
import { initRouter } from '$lib/router';
import { preloadFirebase } from '$lib/firebase';

function main(): void {
    initRouter();
    document.body.append(PwaUpdateToast());
    initPWA();

    initCourseSync();
    initCatalogSync();
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

async function preloadFirebaseWithLoadingScreen(): Promise<void> {
    if (!isOnline()) {
        return;
    }

    const loadingScreen = createLoadingScreen();
    document.body.append(loadingScreen);
    try {
        await preloadFirebase();
    } finally {
        loadingScreen.remove();
    }
}

async function bootstrap(): Promise<void> {
    if (
        import.meta.env.DEV &&
        localStorage.getItem(DEV_STATE_STORAGE_KEY) !== null
    ) {
        await initDevSync();
    }

    await preloadFirebaseWithLoadingScreen();
    main();
}

void bootstrap().catch((error: unknown) => {
    console.error('App bootstrap failed', error);
});
