/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

vi.mock('$components/DegreePicker', () => ({
    DegreePicker: (): HTMLElement => {
        const root = document.createElement('section');
        root.innerHTML = `
            <select data-degree-catalog><option value=""></option></select>
            <select data-degree-faculty><option value=""></option></select>
            <select data-degree-program><option value=""></option></select>
            <select data-degree-path><option value=""></option></select>
            <table><tbody data-requirement-rows></tbody></table>
        `;
        return root;
    },
}));

const getRequirementMock = vi.fn();
const getCourseMock = vi.fn();

vi.mock('$lib/indexeddb', () => ({
    getRequirement: (...args: unknown[]) =>
        getRequirementMock(...(args as [string])),
    getCourse: (...args: unknown[]) => getCourseMock(...(args as [string])),
}));

const getActiveRequirementsSelectionMock = vi.fn();

vi.mock('$lib/requirementsSync', () => ({
    getActiveRequirementsSelection: (...args: unknown[]) =>
        getActiveRequirementsSelectionMock(...args),
}));

import { CatalogPage } from './catalog_page';

describe('CatalogPage', () => {
    it('renders waiting state when no active selection exists', async () => {
        getActiveRequirementsSelectionMock.mockResolvedValue(undefined);

        const page = CatalogPage();
        await waitForUiWork();

        const state = page.querySelector<HTMLElement>('[data-catalog-state]');
        expect(state?.textContent).toContain('בחרו תכנית ומסלול');
    });

    it('renders compact course list items for requirement groups', async () => {
        getActiveRequirementsSelectionMock.mockResolvedValue({
            catalogId: '2025_200',
            facultyId: 'computer-science',
            programId: '0324',
            path: 'software-path',
        });

        getRequirementMock.mockResolvedValue({
            programId: '0324',
            catalogId: '2025_200',
            facultyId: 'computer-science',
            data: {
                name: 'root',
                en: 'Root',
                nested: [
                    {
                        name: 'software-path',
                        en: 'Software Path',
                        nested: [
                            {
                                name: 'core',
                                he: 'חובה',
                                courses: ['236501', '236363'],
                            },
                        ],
                    },
                ],
            },
        });

        getCourseMock.mockImplementation(async (code: string) => ({
            code,
            name: `Course ${code}`,
        }));

        const page = CatalogPage();
        await waitForUiWork();

        const listItems = page.querySelectorAll<HTMLElement>(
            '[data-catalog-groups] li'
        );
        expect(listItems.length).toBeGreaterThanOrEqual(2);

        const links = page.querySelectorAll<HTMLAnchorElement>(
            'a[href^="/course?code="]'
        );
        expect(links.length).toBeGreaterThanOrEqual(2);

        const firstLinkText = links.item(0).textContent;
        expect(firstLinkText).toContain('Course 236501');
    });
});

async function waitForUiWork(): Promise<void> {
    await Promise.resolve();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    await Promise.resolve();
}
