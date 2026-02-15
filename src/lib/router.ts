import { CatalogPage } from '../pages/catalog/catalog_page';
import { CoursePage } from '../pages/course/course_page';
import { LandingPage } from '../pages/landing/landing_page';
import { LoginPage } from '../pages/login/login_page';
import { NotFoundPage } from '../pages/404/not_found_page';
import { PlanPage } from '../pages/plan/plan_page';
import { SearchPage } from '../pages/search/search_page';
import { SemesterPage } from '../pages/semester/semester_page';

type PageFactory = () => HTMLElement;

export const REDIRECT_SESSION_KEY = 'planit:redirect-path';

const routes: Partial<Record<string, PageFactory>> = {
    '/': LandingPage,
    '/plan': PlanPage,
    '/catalog': CatalogPage,
    '/course': CoursePage,
    '/search': SearchPage,
    '/semester': SemesterPage,
    '/login': LoginPage,
};

export function normalizePath(pathname: string): string {
    if (pathname === '/') {
        return pathname;
    }

    return pathname.replace(/\/+$/, '');
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
        app.replaceChildren(NotFoundPage(normalizedPath));
    } else {
        app.replaceChildren(page());
    }

    if (replaceState && normalizedPath !== window.location.pathname) {
        window.history.replaceState(
            null,
            '',
            `${normalizedPath}${window.location.search}${window.location.hash}`
        );
    }
}

function navigate(url: URL): void {
    const nextUrl = new URL(url.href);
    nextUrl.pathname = normalizePath(nextUrl.pathname);
    const currentUrl = new URL(window.location.href);
    const isSameUrl =
        nextUrl.pathname === normalizePath(currentUrl.pathname) &&
        nextUrl.search === currentUrl.search &&
        nextUrl.hash === currentUrl.hash;
    if (isSameUrl) {
        return;
    }

    window.history.pushState(null, '', nextUrl);
    renderRoute(nextUrl.pathname);
}

export function shouldHandleClickNavigation(event: MouseEvent): boolean {
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

    return true;
}

function isSamePageHashNavigation(url: URL): boolean {
    if (url.hash === '') {
        return false;
    }

    return (
        normalizePath(url.pathname) ===
            normalizePath(window.location.pathname) &&
        url.search === window.location.search
    );
}

function restoreRedirectFromSession(): void {
    const redirectPath = window.sessionStorage.getItem(REDIRECT_SESSION_KEY);
    if (redirectPath === null || redirectPath === '') {
        return;
    }

    window.sessionStorage.removeItem(REDIRECT_SESSION_KEY);
    const redirectUrl = new URL(redirectPath, window.location.origin);
    if (redirectUrl.origin !== window.location.origin) {
        return;
    }

    window.history.replaceState(
        null,
        '',
        `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`
    );
}

export function initRouter(): void {
    restoreRedirectFromSession();
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

        const url = new URL(anchor.href, window.location.href);
        if (isSamePageHashNavigation(url)) {
            return;
        }

        event.preventDefault();
        navigate(url);
    });
}
