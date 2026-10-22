/* @vitest-environment jsdom */
import { type StateProvider, state } from '$lib/stateManagement';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$components/ConsoleNav', () => ({
    ConsoleNav: (): HTMLElement => document.createElement('nav'),
}));

import { SharePage } from './share_page';

describe('SharePage', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/share');
        state.provider.set(createStateProviderMock());
    });

    it('creates a share url from local user plan', async () => {
        const page = SharePage();
        const button = page.querySelector<HTMLButtonElement>('[data-share-create]');
        const output = page.querySelector<HTMLTextAreaElement>('[data-share-link]');
        expect(button).toBeTruthy();
        expect(output).toBeTruthy();

        button?.click();
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(output?.value).toContain('/share?plan=');
    });

    it('imports user plan payload from encoded data', async () => {
        const setPlan = vi.fn();
        state.provider.set(createStateProviderMock({ setPlan }));

        const page = SharePage();
        const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ version: 3, semesters: [] }))));
        const input = page.querySelector<HTMLTextAreaElement>('[data-share-import-input]');
        const button = page.querySelector<HTMLButtonElement>('[data-share-import]');

        if (input === null || button === null) {
            throw new Error('SharePage controls not found in test');
        }

        input.value = payload;
        button.click();
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(setPlan).toHaveBeenCalledWith({ version: 3, semesters: [] });
    });
});

function createStateProviderMock(options: { setPlan?: (value: unknown) => Promise<void> | void } = {}): StateProvider {
    return {
        courses: {
            get: vi.fn(),
            set: vi.fn(),
            query: vi.fn(),
            page: vi.fn(),
            count: vi.fn(),
            faculties: vi.fn(),
            getLastSync: vi.fn(),
        },
        catalogs: {
            get: vi.fn(),
            set: vi.fn(),
        },
        requirements: {
            get: vi.fn(),
            sync: vi.fn(),
        },
        userDegree: {
            get: vi.fn(),
            set: vi.fn(),
        },
        userPlan: {
            get: () => Promise.resolve({ key: 'planPageState', value: { version: 3, semesters: [] } }),
            set: options.setPlan ?? vi.fn(),
        },
        firebase: {
            login: vi.fn(),
            logout: vi.fn(),
            getUser: vi.fn(() => null),
        },
    };
}
