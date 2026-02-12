import './style.css';

import { AppHeader } from './components/AppHeader';
import { CourseTable } from './components/CourseTable';
import appTemplate from './app.html?raw';
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

    const courseTableHost = app.querySelector<HTMLElement>(
        '[data-course-table]'
    );
    if (courseTableHost !== null) {
        courseTableHost.replaceWith(CourseTable());
    }

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
