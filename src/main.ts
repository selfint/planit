import './style.css';

import { CatalogPage } from './pages/catalog/catalog_page';
import { CoursePage } from './pages/course/course_page';
import { LandingPage } from './pages/landing/landing_page';
import { LoginPage } from './pages/login/login_page';
import { PlanPage } from './pages/plan/plan_page';
import { SearchPage } from './pages/search/search_page';
import { SemesterPage } from './pages/semester/semester_page';
import { initPWA } from '$lib/pwa';

type PageFactory = () => HTMLElement;

const routes: Partial<Record<string, PageFactory>> = {
    '/': LandingPage,
    '/plan': PlanPage,
    '/catalog': CatalogPage,
    '/course': CoursePage,
    '/search': SearchPage,
    '/semester': SemesterPage,
    '/login': LoginPage,
};

function normalizePath(pathname: string): string {
    if (pathname === '/') {
        return pathname;
    }

    return pathname.replace(/\/+$/, '');
}

function createNotFoundPage(pathname: string): HTMLElement {
    const wrapper = document.createElement('section');
    wrapper.className = 'text-text min-h-screen w-full';

    const main = document.createElement('main');
    main.className =
        'mx-auto flex min-h-screen w-full max-w-5xl flex-col items-start justify-center gap-6 px-4 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-6 lg:px-8';

    const path = document.createElement('p');
    path.className = 'text-text-muted text-xs';
    path.textContent = pathname;

    const title = document.createElement('h1');
    title.className = 'text-3xl font-medium';
    title.textContent = 'העמוד לא נמצא';

    const description = document.createElement('p');
    description.className = 'text-text-muted max-w-2xl text-sm';
    description.textContent = 'הנתיב המבוקש אינו קיים. אפשר לחזור לעמוד הבית.';

    const link = document.createElement('a');
    link.className =
        'bg-accent text-accent-contrast rounded-full px-5 py-2 text-xs font-medium';
    link.href = '/';
    link.textContent = 'חזרה לעמוד הבית';

    main.append(path, title, description, link);
    wrapper.append(main);
    return wrapper;
}

function resolvePage(pathname: string): PageFactory | null {
    const normalizedPath = normalizePath(pathname);
    const page = routes[normalizedPath];
    if (page === undefined) {
        return null;
    }

    return page;
}

function renderRoute(pathname: string, replaceState = false): void {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app === null) {
        throw new Error('Missing #app element');
    }

    const normalizedPath = normalizePath(pathname);
    const page = resolvePage(normalizedPath);

    if (page === null) {
        app.replaceChildren(createNotFoundPage(normalizedPath));
    } else {
        app.replaceChildren(page());
    }

    if (replaceState && normalizedPath !== window.location.pathname) {
        window.history.replaceState(null, '', normalizedPath);
    }
}

function navigate(pathname: string): void {
    const normalizedPath = normalizePath(pathname);
    if (normalizedPath === window.location.pathname) {
        return;
    }

    window.history.pushState(null, '', normalizedPath);
    renderRoute(normalizedPath);
}

function shouldHandleClickNavigation(event: MouseEvent): boolean {
    if (event.defaultPrevented) {
        return false;
    }

    if (event.button !== 0) {
        return false;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return false;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
        return false;
    }

    const anchor = target.closest<HTMLAnchorElement>('a[href]');
    if (anchor === null) {
        return false;
    }

    if (anchor.target !== '' && anchor.target !== '_self') {
        return false;
    }

    if (anchor.hasAttribute('download')) {
        return false;
    }

    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) {
        return false;
    }

    if (url.search !== '' || url.hash !== '') {
        return false;
    }

    return true;
}

function initApp(): void {
    renderRoute(window.location.pathname, true);

    window.addEventListener('popstate', () => {
        renderRoute(window.location.pathname, true);
    });

    document.addEventListener('click', (event) => {
        if (!shouldHandleClickNavigation(event)) {
            return;
        }

        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const anchor = target.closest<HTMLAnchorElement>('a[href]');
        if (anchor === null) {
            return;
        }

        event.preventDefault();
        navigate(anchor.pathname);
    });
}

function main(): void {
    try {
        initApp();
        initPWA();
    } catch (err: unknown) {
        console.error('Failed to start app:', err);
    }
}

main();
