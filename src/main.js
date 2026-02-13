import './style.css';

import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { PlannerOverview } from './components/PlannerOverview';
import { StatusSidebar } from './components/StatusSidebar';
import { UpdateBanner } from './components/UpdateBanner';
import appTemplate from './app.html?raw';
import { initPWA } from '$lib/pwa';

/**
 * @returns {HTMLDivElement}
 */
function initApp() {
    const app = document.querySelector('#app');
    if (!(app instanceof HTMLDivElement)) {
        throw new Error('Missing #app element');
    }
    app.innerHTML = appTemplate;

    const headerHost = app.querySelector('[data-app-header]');
    if (headerHost instanceof HTMLElement) {
        headerHost.replaceWith(AppHeader());
    }

    const updateBannerHost = app.querySelector('[data-update-banner]');
    if (updateBannerHost instanceof HTMLElement) {
        updateBannerHost.replaceWith(UpdateBanner());
    }

    const plannerOverviewHost = app.querySelector('[data-planner-overview]');
    if (plannerOverviewHost instanceof HTMLElement) {
        plannerOverviewHost.replaceWith(PlannerOverview());
    }

    const statusSidebarHost = app.querySelector('[data-status-sidebar]');
    if (statusSidebarHost instanceof HTMLElement) {
        statusSidebarHost.replaceWith(StatusSidebar());
    }

    const footerHost = app.querySelector('[data-app-footer]');
    if (footerHost instanceof HTMLElement) {
        footerHost.replaceWith(AppFooter());
    }

    return app;
}

function main() {
    try {
        initApp();
        initPWA();
    } catch (err) {
        console.error('Failed to start app:', err);
    }
}

main();
