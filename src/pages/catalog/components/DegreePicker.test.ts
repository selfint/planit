/* @vitest-environment jsdom */
import { type StateProvider, state } from '$lib/stateManagement';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCatalogsMock = vi.fn();
const getRequirementMock = vi.fn();
const getActiveRequirementsSelectionMock = vi.fn();
const setActiveRequirementsSelectionMock = vi.fn();
const syncRequirementsMock = vi.fn();

vi.mock('$lib/catalogSync', () => ({
    CATALOG_SYNC_EVENT: 'planit:catalog-sync',
}));

import { DegreePicker } from './DegreePicker';

describe('DegreePicker', () => {
    beforeEach(async () => {
        getCatalogsMock.mockReset();
        getRequirementMock.mockReset();
        getActiveRequirementsSelectionMock.mockReset();
        setActiveRequirementsSelectionMock.mockReset();
        syncRequirementsMock.mockReset();

        getCatalogsMock.mockResolvedValue({
            '2025_200': {
                he: 'קטלוג 2025',
                'computer-science': {
                    he: 'מדעי המחשב',
                    '0324': {
                        he: 'מדעי המחשב - ארבע שנתי',
                    },
                },
            },
        });
        getActiveRequirementsSelectionMock.mockResolvedValue(undefined);
        syncRequirementsMock.mockResolvedValue({ status: 'updated' });
        setActiveRequirementsSelectionMock.mockResolvedValue(undefined);
        state.provider.set(createStateProviderMock());
    });

    it('does not persist active selection while path is required but not selected', async () => {
        getRequirementMock.mockResolvedValue({
            programId: '0324',
            data: {
                name: 'root',
                nested: [
                    {
                        name: 'software-path',
                        en: 'Software Path',
                        nested: [
                            {
                                name: 'core',
                                courses: ['236501'],
                            },
                        ],
                    },
                ],
            },
        });

        const picker = DegreePicker();
        await waitForUiWork();

        const catalogSelect = querySelect(picker, '[data-degree-catalog]');
        const facultySelect = querySelect(picker, '[data-degree-faculty]');
        const programSelect = querySelect(picker, '[data-degree-program]');
        const pathSelect = querySelect(picker, '[data-degree-path]');

        catalogSelect.value = '2025_200';
        catalogSelect.dispatchEvent(new Event('change'));
        await waitForUiWork();

        facultySelect.value = 'computer-science';
        facultySelect.dispatchEvent(new Event('change'));
        await waitForUiWork();

        programSelect.value = '0324';
        programSelect.dispatchEvent(new Event('change'));
        await waitForUiWork();

        expect(syncRequirementsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                catalogId: '2025_200',
                facultyId: 'computer-science',
                programId: '0324',
            }),
            { persistActiveSelection: false }
        );
        expect(pathSelect.required).toBe(true);
        expect(pathSelect.value).toBe('');
        expect(setActiveRequirementsSelectionMock).not.toHaveBeenCalled();

        pathSelect.value = 'software-path';
        pathSelect.dispatchEvent(new Event('change'));
        await waitForUiWork();

        expect(setActiveRequirementsSelectionMock).toHaveBeenCalledWith({
            catalogId: '2025_200',
            facultyId: 'computer-science',
            programId: '0324',
            path: 'software-path',
        });
    });

    it('persists active selection when program has no path options', async () => {
        getRequirementMock.mockResolvedValue({
            programId: '0324',
            data: {
                name: 'root',
                nested: [
                    {
                        name: 'core',
                        en: 'Core Requirements',
                        courses: ['236501'],
                    },
                ],
            },
        });

        const picker = DegreePicker();
        await waitForUiWork();

        const catalogSelect = querySelect(picker, '[data-degree-catalog]');
        const facultySelect = querySelect(picker, '[data-degree-faculty]');
        const programSelect = querySelect(picker, '[data-degree-program]');
        const pathSelect = querySelect(picker, '[data-degree-path]');

        catalogSelect.value = '2025_200';
        catalogSelect.dispatchEvent(new Event('change'));
        await waitForUiWork();

        facultySelect.value = 'computer-science';
        facultySelect.dispatchEvent(new Event('change'));
        await waitForUiWork();

        programSelect.value = '0324';
        programSelect.dispatchEvent(new Event('change'));
        await waitForUiWork();

        expect(pathSelect.required).toBe(false);
        expect(setActiveRequirementsSelectionMock).toHaveBeenCalledWith({
            catalogId: '2025_200',
            facultyId: 'computer-science',
            programId: '0324',
            path: undefined,
        });
    });
});

function querySelect(root: HTMLElement, selector: string): HTMLSelectElement {
    const element = root.querySelector<HTMLSelectElement>(selector);
    if (element === null) {
        throw new Error(`Expected select ${selector}`);
    }
    return element;
}

async function waitForUiWork(): Promise<void> {
    await Promise.resolve();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    await Promise.resolve();
}

function createStateProviderMock(): StateProvider {
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
            get: getCatalogsMock,
            set: vi.fn(),
        },
        requirements: {
            get: getRequirementMock,
            sync: syncRequirementsMock,
        },
        userDegree: {
            get: getActiveRequirementsSelectionMock,
            set: setActiveRequirementsSelectionMock,
        },
        userPlan: {
            get: vi.fn(),
            set: vi.fn(),
        },
    };
}
