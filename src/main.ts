import './style.css';

import { AppHeader } from './components/AppHeader';
import appTemplate from './app.html?raw';
import { initI18n } from './i18n';
import { initPWA } from './pwa.ts';

function initApp(): HTMLDivElement {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app === null) {
        throw new Error('Missing #app element');
    }
    app.innerHTML = appTemplate;

    const headerHost = app.querySelector<HTMLElement>('[data-app-header]');
    if (headerHost !== null) {
        headerHost.replaceWith(AppHeader());
    }

    return app;
}

async function main(): Promise<void> {
    initApp();
    await initI18n();
    initPWA();
}

main();
