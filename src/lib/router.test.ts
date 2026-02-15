/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

function mockPage(): HTMLElement {
    return document.createElement('div');
}

vi.mock('../pages/catalog/catalog_page', () => ({
    CatalogPage: (): HTMLElement => mockPage(),
}));
vi.mock('../pages/course/course_page', () => ({
    CoursePage: (): HTMLElement => mockPage(),
}));
vi.mock('../pages/landing/landing_page', () => ({
    LandingPage: (): HTMLElement => mockPage(),
}));
vi.mock('../pages/login/login_page', () => ({
    LoginPage: (): HTMLElement => mockPage(),
}));
vi.mock('../pages/plan/plan_page', () => ({
    PlanPage: (): HTMLElement => mockPage(),
}));
vi.mock('../pages/search/search_page', () => ({
    SearchPage: (): HTMLElement => mockPage(),
}));
vi.mock('../pages/semester/semester_page', () => ({
    SemesterPage: (): HTMLElement => mockPage(),
}));
vi.mock('../pages/404/not_found_page', () => ({
    NotFoundPage: (): HTMLElement => mockPage(),
}));

import {
    REDIRECT_SESSION_KEY,
    addBasePath,
    initRouter,
    normalizeBasePath,
    normalizePath,
    shouldHandleClickNavigation,
    stripBasePath,
} from '$lib/router';

describe('router lib', () => {
    it('normalizes trailing slashes while preserving root', () => {
        expect(normalizePath('/')).toBe('/');
        expect(normalizePath('/plan/')).toBe('/plan');
        expect(normalizePath('/catalog///')).toBe('/catalog');
        expect(normalizePath('')).toBe('/');
    });

    it('normalizes basename values for router mounting', () => {
        expect(normalizeBasePath('/')).toBe('/');
        expect(normalizeBasePath('/planit/')).toBe('/planit');
        expect(normalizeBasePath('planit/')).toBe('/planit');
        expect(normalizeBasePath('./')).toBe('/');
    });

    it('strips and reapplies basename for browser/app paths', () => {
        expect(stripBasePath('/planit', '/planit/')).toBe('/');
        expect(stripBasePath('/planit/search/', '/planit/')).toBe('/search');
        expect(stripBasePath('/search', '/planit/')).toBe('/search');

        expect(addBasePath('/', '/planit/')).toBe('/planit');
        expect(addBasePath('/search', '/planit/')).toBe('/planit/search');
        expect(addBasePath('/search', '/')).toBe('/search');
    });

    it('handles same-origin plain left-click anchor navigation', () => {
        const anchor = document.createElement('a');
        anchor.href = '/plan';
        document.body.append(anchor);

        const event = new MouseEvent('click', {
            bubbles: true,
            button: 0,
        });

        Object.defineProperty(event, 'target', {
            configurable: true,
            value: anchor,
        });

        expect(shouldHandleClickNavigation(event)).toBe(true);
    });

    it('handles links with search or hash as SPA navigation', () => {
        const anchor = document.createElement('a');
        anchor.href = '/search?q=algo#top';
        document.body.append(anchor);

        const event = new MouseEvent('click', {
            bubbles: true,
            button: 0,
        });

        Object.defineProperty(event, 'target', {
            configurable: true,
            value: anchor,
        });

        expect(shouldHandleClickNavigation(event)).toBe(true);
    });

    it('restores redirected deep-link path from session storage on init', () => {
        document.body.innerHTML = '<div id="app"></div>';
        window.sessionStorage.setItem(
            REDIRECT_SESSION_KEY,
            '/search?q=test#top'
        );

        initRouter();

        expect(window.location.pathname).toBe('/search');
        expect(window.location.search).toBe('?q=test');
        expect(window.location.hash).toBe('#top');
        expect(window.sessionStorage.getItem(REDIRECT_SESSION_KEY)).toBeNull();
    });
});
