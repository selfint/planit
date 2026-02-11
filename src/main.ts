import './style.css';

import appTemplate from './app.html?raw';
import { initPWA } from './pwa.ts';
import { AppHeader } from './components/AppHeader';

function initApp(): HTMLDivElement {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app === null) {
        throw new Error('Missing #app element');
    }
    app.innerHTML = appTemplate;

    const headerHost = app.querySelector<HTMLElement>('[data-app-header]');
    if (headerHost !== null) {
        headerHost.outerHTML = AppHeader().outerHTML;
    }

    return app;
}

function main(): void {
    initApp();
    initPWA();
}

main();
