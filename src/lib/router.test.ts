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

import { normalizePath, shouldHandleClickNavigation } from '$lib/router';

describe('router lib', () => {
    it('normalizes trailing slashes while preserving root', () => {
        expect(normalizePath('/')).toBe('/');
        expect(normalizePath('/plan/')).toBe('/plan');
        expect(normalizePath('/catalog///')).toBe('/catalog');
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

    it('ignores links with search or hash for native behavior', () => {
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

        expect(shouldHandleClickNavigation(event)).toBe(false);
    });
});
