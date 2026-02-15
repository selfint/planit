/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

vi.mock('$components/CourseCard', () => ({
    CourseCard: (): HTMLElement => document.createElement('article'),
}));

vi.mock('./components/DegreePicker', () => ({
    DegreePicker: (): HTMLElement => {
        const root = document.createElement('section');
        root.innerHTML = `
            <select data-degree-catalog><option value="2025_200" selected></option></select>
            <select data-degree-faculty><option value="computer-science" selected></option></select>
            <select data-degree-program><option value="0324" selected></option></select>
            <select data-degree-path><option value="" selected></option></select>
            <table><tbody data-requirement-rows></tbody></table>
            <p data-degree-status></p>
        `;
        return root;
    },
}));

const getRequirementMock = vi.fn();
const getCourseMock = vi.fn<() => Promise<{ code: string; name: string }>>();

vi.mock('$lib/indexeddb', () => ({
    getRequirement: (programId: string): Promise<unknown> =>
        getRequirementMock(programId) as Promise<unknown>,
    getCourse: (): Promise<{ code: string; name: string }> => getCourseMock(),
}));

const getActiveRequirementsSelectionMock = vi.fn();

vi.mock('$lib/requirementsSync', () => ({
    getActiveRequirementsSelection: (): Promise<unknown> =>
        getActiveRequirementsSelectionMock() as Promise<unknown>,
}));

import { CatalogPage } from './catalog_page';

describe('catalog page route integration', () => {
    it('updates state text for missing requirements payload', async () => {
        getCourseMock.mockResolvedValue({ code: '236501', name: 'Intro' });
        getActiveRequirementsSelectionMock.mockResolvedValue({
            catalogId: '2025_200',
            facultyId: 'computer-science',
            programId: '0324',
            path: undefined,
        });
        getRequirementMock.mockResolvedValue(undefined);

        const page = CatalogPage();
        await waitForUiWork();

        const state = page.querySelector<HTMLElement>('[data-catalog-state]');
        expect(state?.textContent).toContain('אין דרישות שמורות');
    });
});

async function waitForUiWork(): Promise<void> {
    await Promise.resolve();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    await Promise.resolve();
}
