/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';

import { NotFoundPage } from './not_found_page';

describe('not found page', () => {
    it('renders a root element', () => {
        const page = NotFoundPage();
        expect(page).toBeInstanceOf(HTMLElement);
    });

    it('renders supplied route path', () => {
        const page = NotFoundPage('/does-not-exist');
        const pathSlot = page.querySelector('[data-slot="path"]');

        expect(pathSlot?.textContent).toBe('/does-not-exist');
    });
});
