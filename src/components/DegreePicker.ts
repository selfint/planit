import { initCatalogSync } from '$lib/catalogSync';
import { getCatalogs, getRequirement, setMeta } from '$lib/indexeddb';
import {
    getActiveRequirementsSelection,
    syncRequirements,
} from '$lib/requirementsSync';

import templateHtml from './DegreePicker.html?raw';

type CatalogMap = Record<string, unknown>;

type SelectionState = {
    catalogId: string;
    facultyId: string;
    programId: string;
    path?: string;
};

type PickerState = {
    catalogs: CatalogMap;
    selection?: SelectionState;
    requirement?: RequirementNode;
};

type RequirementNode = {
    name?: string;
    en?: string;
    he?: string;
    courses?: string[];
    nested?: RequirementNode[];
};

export function DegreePicker(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('DegreePicker template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('DegreePicker template root not found');
    }

    const catalogSelect = root.querySelector<HTMLSelectElement>(
        '[data-degree-catalog]'
    );
    const facultySelect = root.querySelector<HTMLSelectElement>(
        '[data-degree-faculty]'
    );
    const programSelect = root.querySelector<HTMLSelectElement>(
        '[data-degree-program]'
    );
    const status = root.querySelector<HTMLParagraphElement>(
        '[data-degree-status]'
    );
    const pathSelect =
        root.querySelector<HTMLSelectElement>('[data-degree-path]');
    const pathEmpty = root.querySelector<HTMLSpanElement>('[data-path-empty]');
    const requirementRows = root.querySelector<HTMLTableSectionElement>(
        '[data-requirement-rows]'
    );

    if (
        catalogSelect === null ||
        facultySelect === null ||
        programSelect === null ||
        status === null ||
        pathSelect === null ||
        pathEmpty === null ||
        requirementRows === null
    ) {
        throw new Error('DegreePicker required elements not found');
    }

    const state: PickerState = {
        catalogs: {},
        selection: undefined,
        requirement: undefined,
    };

    catalogSelect.addEventListener('change', () => {
        const catalogId = catalogSelect.value;
        if (catalogId.length === 0) {
            state.selection = undefined;
            updateCatalogOptions(
                state,
                catalogSelect,
                facultySelect,
                programSelect,
                pathSelect,
                pathEmpty,
                requirementRows,
                status
            );
            return;
        }
        state.selection = {
            catalogId,
            facultyId: '',
            programId: '',
            path: undefined,
        };
        updateFacultyOptions(state, facultySelect, programSelect);
        updateProgramOptions(state, programSelect);
        resetRequirementView(pathSelect, pathEmpty, requirementRows);
        updateStatus(status, 'בחר פקולטה כדי להמשיך.');
    });

    facultySelect.addEventListener('change', () => {
        if (state.selection === undefined) {
            return;
        }
        state.selection = {
            ...state.selection,
            facultyId: facultySelect.value,
            programId: '',
            path: undefined,
        };
        updateProgramOptions(state, programSelect);
        resetRequirementView(pathSelect, pathEmpty, requirementRows);
        updateStatus(status, 'בחר תכנית כדי לטעון דרישות.');
    });

    programSelect.addEventListener('change', () => {
        if (state.selection === undefined) {
            return;
        }
        const programId = programSelect.value;
        if (programId.length === 0) {
            return;
        }
        state.selection = {
            ...state.selection,
            programId,
        };
        void loadRequirements(state, programSelect, status);
    });

    initCatalogSync({
        onSync: () => {
            void loadCatalogs(
                state,
                catalogSelect,
                facultySelect,
                programSelect,
                status,
                catalogIdValue,
                catalogNameValue,
                catalogFacultyValue,
                catalogProgramValue
            );
        },
    });

    void loadCatalogs(
        state,
        catalogSelect,
        facultySelect,
        programSelect,
        status,
        catalogIdValue,
        catalogNameValue,
        catalogFacultyValue,
        catalogProgramValue
    );

    return root;
}

async function loadCatalogs(
    state: PickerState,
    catalogSelect: HTMLSelectElement,
    facultySelect: HTMLSelectElement,
    programSelect: HTMLSelectElement,
    status: HTMLParagraphElement,
    catalogIdValue: HTMLTableCellElement,
    catalogNameValue: HTMLTableCellElement,
    catalogFacultyValue: HTMLTableCellElement,
    catalogProgramValue: HTMLTableCellElement
): Promise<void> {
    state.catalogs = await getCatalogs();
    const storedSelection = await getActiveRequirementsSelection();
    if (storedSelection !== undefined) {
        state.selection = {
            catalogId: storedSelection.catalogId,
            facultyId: storedSelection.facultyId,
            programId: storedSelection.programId,
        };
    }

    updateCatalogOptions(
        state,
        catalogSelect,
        facultySelect,
        programSelect,
        status,
        catalogIdValue,
        catalogNameValue,
        catalogFacultyValue,
        catalogProgramValue
    );
}

function updateCatalogOptions(
    state: PickerState,
    catalogSelect: HTMLSelectElement,
    facultySelect: HTMLSelectElement,
    programSelect: HTMLSelectElement,
    status: HTMLParagraphElement,
    catalogIdValue: HTMLTableCellElement,
    catalogNameValue: HTMLTableCellElement,
    catalogFacultyValue: HTMLTableCellElement,
    catalogProgramValue: HTMLTableCellElement
): void {
    const catalogIds = Object.keys(state.catalogs).sort();
    setSelectOptions(
        catalogSelect,
        catalogIds.map((id) => ({
            id,
            label: getNodeLabel(state.catalogs[id], id),
        })),
        'בחר קטלוג'
    );

    if (state.selection !== undefined) {
        catalogSelect.value = state.selection.catalogId;
    }

    if (catalogSelect.value.length === 0) {
        facultySelect.disabled = true;
        programSelect.disabled = true;
        setSelectOptions(facultySelect, [], 'בחר פקולטה');
        setSelectOptions(programSelect, [], 'בחר תכנית');
        updateCatalogTable(
            catalogIdValue,
            catalogNameValue,
            catalogFacultyValue,
            catalogProgramValue,
            '',
            undefined
        );
        updateStatus(
            status,
            catalogIds.length === 0
                ? 'אין קטלוגים זמינים אופליין.'
                : 'בחר קטלוג כדי להמשיך.'
        );
        return;
    }

    updateFacultyOptions(state, facultySelect, programSelect);
    updateProgramOptions(state, programSelect);
    updateCatalogTable(
        catalogIdValue,
        catalogNameValue,
        catalogFacultyValue,
        catalogProgramValue,
        catalogSelect.value,
        getRecord(state.catalogs[catalogSelect.value])
    );
    if (
        state.selection?.programId &&
        programSelect.value === state.selection.programId
    ) {
        updateStatus(status, 'התכנית האחרונה שמורה באופליין.');
        return;
    }
    updateStatus(status, 'בחר תכנית כדי לטעון דרישות.');
}

function updateFacultyOptions(
    state: PickerState,
    facultySelect: HTMLSelectElement,
    programSelect: HTMLSelectElement
): void {
    const catalogId = state.selection?.catalogId ?? '';
    const catalogData = getRecord(state.catalogs[catalogId]);
    const facultyEntries = catalogData
        ? Object.keys(catalogData).filter((key) => !isLabelKey(key))
        : [];
    const options = facultyEntries.map((id) => ({
        id,
        label: getNodeLabel(catalogData?.[id], id),
    }));

    setSelectOptions(facultySelect, options, 'בחר פקולטה');
    facultySelect.disabled = options.length === 0;

    if (state.selection !== undefined) {
        facultySelect.value = state.selection.facultyId;
    }

    programSelect.disabled = true;
    setSelectOptions(programSelect, [], 'בחר תכנית');
}

function updateProgramOptions(
    state: PickerState,
    programSelect: HTMLSelectElement
): void {
    const catalogId = state.selection?.catalogId ?? '';
    const facultyId = state.selection?.facultyId ?? '';
    const catalogData = getRecord(state.catalogs[catalogId]);
    const facultyData = catalogData
        ? getRecord(catalogData[facultyId])
        : undefined;
    const programEntries = facultyData
        ? Object.keys(facultyData).filter((key) => !isLabelKey(key))
        : [];
    const options = programEntries.map((id) => ({
        id,
        label: getNodeLabel(facultyData?.[id], id),
    }));

    setSelectOptions(programSelect, options, 'בחר תכנית');
    programSelect.disabled = options.length === 0;

    if (state.selection !== undefined) {
        programSelect.value = state.selection.programId;
    }
}

async function loadRequirements(
    state: PickerState,
    programSelect: HTMLSelectElement,
    status: HTMLParagraphElement
): Promise<void> {
    if (state.selection === undefined) {
        return;
    }

    const selection = state.selection;
    programSelect.disabled = true;
    updateStatus(status, 'טוען דרישות...');

    const result = await syncRequirements(selection);

    programSelect.disabled = false;
    if (result.status === 'updated') {
        updateStatus(status, 'הדרישות נטענו ונשמרו אופליין.');
        return;
    }
    if (result.status === 'offline') {
        updateStatus(status, 'אין חיבור לרשת. הדרישות הקודמות נשמרות.');
        return;
    }

    updateStatus(status, result.error ?? 'שגיאה בטעינת דרישות.');
}

function setSelectOptions(
    select: HTMLSelectElement,
    options: { id: string; label: string }[],
    placeholder: string
): void {
    select.replaceChildren();
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = placeholder;
    select.append(placeholderOption);

    for (const option of options) {
        const element = document.createElement('option');
        element.value = option.id;
        element.textContent = option.label;
        select.append(element);
    }
}

function getRecord(value: unknown): Record<string, unknown> | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    return value as Record<string, unknown>;
}

function isLabelKey(key: string): boolean {
    return key === 'en' || key === 'he';
}

function getNodeLabel(value: unknown, fallback: string): string {
    const record = getRecord(value);
    const hebrew = record?.he;
    if (typeof hebrew === 'string' && hebrew.length > 0) {
        return hebrew;
    }
    const english = record?.en;
    if (typeof english === 'string' && english.length > 0) {
        return english;
    }
    return fallback;
}

function updateCatalogTable(
    idCell: HTMLTableCellElement,
    nameCell: HTMLTableCellElement,
    facultyCell: HTMLTableCellElement,
    programCell: HTMLTableCellElement,
    catalogId: string,
    catalogData: Record<string, unknown> | undefined
): void {
    if (catalogData === undefined) {
        idCell.textContent = '—';
        nameCell.textContent = '—';
        facultyCell.textContent = '—';
        programCell.textContent = '—';
        return;
    }

    const label = getNodeLabel(catalogData, catalogId);
    const facultyEntries = Object.keys(catalogData).filter(
        (key) => !isLabelKey(key)
    );
    let programCount = 0;
    for (const facultyId of facultyEntries) {
        const facultyData = getRecord(catalogData[facultyId]);
        if (facultyData === undefined) {
            continue;
        }
        programCount += Object.keys(facultyData).filter(
            (key) => !isLabelKey(key)
        ).length;
    }

    idCell.textContent = catalogId.length > 0 ? catalogId : '—';
    nameCell.textContent = label.length > 0 ? label : '—';
    facultyCell.textContent = facultyEntries.length.toString();
    programCell.textContent = programCount.toString();
}

function updateStatus(element: HTMLParagraphElement, message: string): void {
    element.textContent = message;
}
