import './style.css';

import appTemplate from './app.html?raw';
import { initPWA } from './pwa.ts';
import { mountAppHeader } from './components/AppHeader';

function initApp(): HTMLDivElement {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app === null) {
        throw new Error('Missing #app element');
    }
    app.innerHTML = appTemplate;

    const headerHost = app.querySelector<HTMLElement>('[data-app-header]');
    if (headerHost) {
        mountAppHeader(headerHost);
    }

    return app;
}

function main(): void {
    const app = initApp();
    initPWA(app);

    if (import.meta.env.DEV) {
        import('./dev-components').then(({ initComponentRoutes }) => {
            initComponentRoutes(app);
        });
    }
}

main();
