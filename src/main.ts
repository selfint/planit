import './style.css';

import { DEV_STATE_STORAGE_KEY, initDevSync } from '$lib/test-utils/devSync';
import { initRendering, initRouterNavigationInterception } from '$lib/router';
import { PwaUpdateToast } from '$components/PwaUpdateToast';
import { initPWA } from '$lib/pwa';
import { preloadFirebase } from '$lib/firebase';
import { syncCatalogs } from '$lib/catalogSync';
import type { SyncProgress } from '$lib/catalogSync';
import { syncCourseData } from '$lib/courseSync';

import { default as appLoadingScreenHtml } from '$components/AppLoadingScreen.html?raw';

async function main(): Promise<void> {
    initPWA();
    initRouterNavigationInterception();

    if (isOnline() && !import.meta.env.DEV) {
        const loadingScreen = createLoadingScreen();
        document.body.append(loadingScreen);

        await Promise.all([
            syncCatalogs({
                onProgress(progress): void {
                    updateLoadingScreen(loadingScreen, progress);
                },
            }),
            syncCourseData({
                onProgress(progress): void {
                    updateLoadingScreen(loadingScreen, progress);
                },
            }),
            preloadFirebase().then(() => {
                updateLoadingMessage(loadingScreen, 'מסנכרן נתוני קורסים ומסלולים...');
            }),
        ]);

        loadingScreen.remove();
    }

    initRendering();
    document.body.append(PwaUpdateToast());
}



function updateLoadingScreen(
    loadingScreen: HTMLElement,
    progress: SyncProgress
): void {
    updateLoadingMessage(loadingScreen, progress.message);

    const bytesText = loadingScreen.querySelector<HTMLElement>(
        '[data-app-loading-bytes]'
    );
    if (bytesText === null) {
        throw new Error('App loading bytes indicator not found');
    }

    bytesText.textContent = formatProgressBytes(progress.downloadedBytes, progress.totalBytes);

    const progressBar = loadingScreen.querySelector<HTMLElement>(
        '[data-app-loading-progress]'
    );
    if (progressBar === null) {
        throw new Error('App loading progress bar not found');
    }

    const percent =
        progress.totalBytes > 0
            ? Math.min(100, Math.round((progress.downloadedBytes / progress.totalBytes) * 100))
            : 0;
    progressBar.style.width = `${String(percent)}%`;
}

function updateLoadingMessage(loadingScreen: HTMLElement, message: string): void {
    const text = loadingScreen.querySelector<HTMLElement>('[data-app-loading-message]');
    if (text === null) {
        throw new Error('App loading message element not found');
    }

    text.textContent = message;
}

function formatProgressBytes(downloadedBytes: number, totalBytes: number): string {
    return `${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}`;
}

function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** unitIndex;
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
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
