import './style.css';

import appTemplate from './app.html?raw';
import { initPWA } from './pwa.ts';
import logoUrl from './assets/logo.webp';
import titleSvg from './assets/Title.svg?raw';

function initApp(): HTMLDivElement {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app === null) {
        throw new Error('Missing #app element');
    }
    app.innerHTML = appTemplate;

    const logo = app.querySelector<HTMLImageElement>('[data-logo]');
    if (logo) {
        logo.src = logoUrl;
    }

    const title = app.querySelector<HTMLDivElement>('[data-title]');
    if (title) {
        title.innerHTML = titleSvg;
        const svg = title.querySelector<SVGElement>('svg');
        if (svg) {
            svg.setAttribute('class', 'h-full w-auto');
        }
    }

    return app;
}

function main(): void {
    const app = initApp();
    initPWA(app);
}

main();
