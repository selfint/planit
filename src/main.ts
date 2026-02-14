import './style.css';

import { LandingPage } from './pages/landing/page';
import { initPWA } from '$lib/pwa';

function initApp(): HTMLDivElement {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app === null) {
        throw new Error('Missing #app element');
    }

    app.replaceChildren(LandingPage());

    return app;
}

function main(): void {
    try {
        initApp();
        initPWA();
    } catch (err: unknown) {
        console.error('Failed to start app:', err);
        process.exit(1);
    }
}

main();
