import './style.css';

import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { PlannerOverview } from './components/PlannerOverview';
import { StatusSidebar } from './components/StatusSidebar';
import { UpdateBanner } from './components/UpdateBanner';
import appTemplate from './app.html?raw';
import { initPWA } from '$lib/pwa';

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

    const updateBannerHost = app.querySelector<HTMLElement>(
        '[data-update-banner]'
    );
    if (updateBannerHost !== null) {
        updateBannerHost.replaceWith(UpdateBanner());
    }

    const plannerOverviewHost = app.querySelector<HTMLElement>(
        '[data-planner-overview]'
    );
    if (plannerOverviewHost !== null) {
        plannerOverviewHost.replaceWith(PlannerOverview());
    }

    const statusSidebarHost = app.querySelector<HTMLElement>(
        '[data-status-sidebar]'
    );
    if (statusSidebarHost !== null) {
        statusSidebarHost.replaceWith(StatusSidebar());
    }

    const footerHost = app.querySelector<HTMLElement>('[data-app-footer]');
    if (footerHost !== null) {
        footerHost.replaceWith(AppFooter());
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
