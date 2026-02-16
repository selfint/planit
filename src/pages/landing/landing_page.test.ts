/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

vi.mock('./components/LandingNav', () => ({
    LandingNav: (): HTMLElement => {
        const element = document.createElement('header');
        element.dataset.component = 'LandingNav';
        return element;
    },
}));

vi.mock('./components/LandingHero', () => ({
    LandingHero: (): HTMLElement => {
        const element = document.createElement('section');
        element.dataset.component = 'LandingHero';
        return element;
    },
}));

vi.mock('./components/LandingFeatureCard', () => ({
    LandingFeatureCard: (options: { href?: string }): HTMLElement => {
        const element = document.createElement('article');
        element.dataset.component = 'LandingFeatureCard';
        if (options.href !== undefined) {
            element.dataset.href = options.href;
        }
        return element;
    },
}));

import { LandingPage } from './landing_page';

describe('LandingPage', () => {
    it('renders mounted page regions', () => {
        const page = LandingPage();

        expect(page).toBeInstanceOf(HTMLElement);
        expect(
            page.querySelector('[data-component="LandingNav"]')
        ).toBeTruthy();
        expect(
            page.querySelector('[data-component="LandingHero"]')
        ).toBeTruthy();
    });

    it('replaces feature hosts with five feature cards', () => {
        const page = LandingPage();

        const cards = page.querySelectorAll(
            '[data-component="LandingFeatureCard"]'
        );
        expect(cards).toHaveLength(5);

        const hrefs = Array.from(cards).map((card) =>
            card.getAttribute('data-href')
        );
        expect(hrefs).toEqual([
            '/plan',
            '/catalog',
            '/search',
            '/semester',
            '/course',
        ]);
    });
});
