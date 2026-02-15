/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

vi.mock('$components/CourseCard', () => ({
    CourseCard: (course?: { code?: string; name?: string }): HTMLElement => {
        const card = document.createElement('article');
        card.dataset.component = 'CourseCard';
        if (course?.code !== undefined) {
            card.dataset.courseCode = course.code;
        }
        card.textContent = course?.name ?? course?.code ?? 'skeleton';
        return card;
    },
}));

vi.mock('./components/DegreePicker', () => ({
    DegreePicker: (): HTMLElement => {
        const root = document.createElement('section');
        root.innerHTML = `
            <select data-degree-catalog><option value="2025_200" selected></option></select>
            <select data-degree-faculty><option value="computer-science" selected></option></select>
            <select data-degree-program><option value="0324" selected></option></select>
            <select data-degree-path><option value="software-path" selected></option></select>
            <table><tbody data-requirement-rows></tbody></table>
            <p data-degree-status></p>
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

    it('renders one page of three course cards and supports paging', async () => {
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
                                courses: [
                                    '236501',
                                    '236363',
                                    '236343',
                                    '234123',
                                ],
                            },
                        ],
                    },
                ],
            },
        });

        getCourseMock.mockImplementation(async (code: string) => {
            if (code === '236363') {
                return {
                    code,
                    name: `Course ${code}`,
                    median: 92,
                    current: true,
                };
            }
            if (code === '236501') {
                return {
                    code,
                    name: `Course ${code}`,
                    median: 85,
                    current: false,
                };
            }
            if (code === '234123') {
                return {
                    code,
                    name: `Course ${code}`,
                    median: 75,
                    current: true,
                };
            }
            return {
                code,
                name: `Course ${code}`,
                current: true,
            };
        });

        const page = CatalogPage();
        await waitForUiWork();

        const cards = page.querySelectorAll<HTMLElement>(
            '[data-component="CourseCard"]'
        );
        expect(cards.length).toBe(3);

        const firstPageLinks = page.querySelectorAll<HTMLAnchorElement>(
            'a[href^="/course?code="]'
        );
        expect(firstPageLinks.item(0).getAttribute('href')).toContain('236363');
        expect(firstPageLinks.item(1).getAttribute('href')).toContain('236501');
        expect(firstPageLinks.item(2).getAttribute('href')).toContain('234123');

        const nonCurrentLink =
            page.querySelector<HTMLAnchorElement>('a[href*="236501"]');
        expect(nonCurrentLink?.classList.contains('opacity-70')).toBe(true);

        const pageLabel = page.querySelector('[data-catalog-group-page]');
        expect(pageLabel?.textContent).toContain('עמוד 1 מתוך 2');

        const nextButton = Array.from(page.querySelectorAll('button')).find(
            (button) => button.textContent === 'הבא'
        );
        nextButton?.click();
        await waitForUiWork();

        const links = page.querySelectorAll<HTMLAnchorElement>(
            'a[href^="/course?code="]'
        );
        expect(links.length).toBe(1);
        expect(links.item(0).getAttribute('href')).toContain('236343');
    });

    it('hides rendered requirements while picker selection is changing', async () => {
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
                                courses: ['236501', '236363', '236343'],
                            },
                        ],
                    },
                ],
            },
        });

        getCourseMock.mockImplementation(async (code: string) => ({
            code,
            name: `Course ${code}`,
            median: 80,
            current: true,
        }));

        const page = CatalogPage();
        await waitForUiWork();

        const programSelect = page.querySelector<HTMLSelectElement>(
            '[data-degree-program]'
        );
        if (programSelect === null) {
            throw new Error('Expected program select in test');
        }

        programSelect.value = '';
        programSelect.dispatchEvent(new Event('change'));
        await waitForUiWork();

        const cards = page.querySelectorAll('[data-component="CourseCard"]');
        expect(cards.length).toBe(0);

        const state = page.querySelector<HTMLElement>('[data-catalog-state]');
        expect(state?.textContent).toContain('מעדכן בחירה');
    });
});

async function waitForUiWork(): Promise<void> {
    await Promise.resolve();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    await Promise.resolve();
}
