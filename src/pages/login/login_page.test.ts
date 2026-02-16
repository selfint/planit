/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

vi.mock('$components/ConsoleNav', () => ({
    ConsoleNav: (): HTMLElement => {
        const nav = document.createElement('nav');
        nav.dataset.component = 'ConsoleNav';
        return nav;
    },
}));

import { LoginPage } from './login_page';

describe('login page', () => {
    it('renders a root element', () => {
        const page = LoginPage();
        expect(page).toBeInstanceOf(HTMLElement);
    });

    it('mounts console navigation and login placeholder copy', () => {
        const page = LoginPage();

        expect(
            page.querySelector('[data-component="ConsoleNav"]')
        ).toBeTruthy();
        expect(page.textContent).toContain('עמוד כניסה');
    });
});
