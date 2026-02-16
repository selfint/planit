import {
    type PathOption,
    type RequirementNode,
    buildPathOptions,
    countUniqueCourses,
    filterRequirementsByPath,
    getRequirementId,
    getRequirementLabel,
} from '$lib/requirementsUtils';
import {
    getActiveRequirementsSelection,
    setActiveRequirementsSelection,
    syncRequirements,
} from '$lib/requirementsSync';
import { getCatalogs, getRequirement } from '$lib/indexeddb';
import { CATALOG_SYNC_EVENT } from '$lib/catalogSync';
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
    pathOptions: PathOption[];
};

const PATH_EMPTY_MESSAGE = 'לתכנית זו אין מסלולים לבחירה.';
const REQUIREMENTS_EMPTY_MESSAGE = 'בחר תכנית ומסלול כדי לראות דרישות.';
const REQUIREMENTS_MISSING_MESSAGE = 'לא נמצאו דרישות לתכנית זו.';
const REQUIREMENTS_PATH_MESSAGE = 'בחר מסלול כדי להציג דרישות.';
const REQUIREMENTS_PATH_EMPTY_MESSAGE = 'אין דרישות במסלול זה.';

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
    const pathSelect =
        root.querySelector<HTMLSelectElement>('[data-degree-path]');
    const pathEmpty =
        root.querySelector<HTMLParagraphElement>('[data-path-empty]');
    const status = root.querySelector<HTMLParagraphElement>(
        '[data-degree-status]'
    );
    const requirementRows = root.querySelector<HTMLTableSectionElement>(
        '[data-requirement-rows]'
    );

    if (
        catalogSelect === null ||
        facultySelect === null ||
        programSelect === null ||
        pathSelect === null ||
        pathEmpty === null ||
        status === null ||
        requirementRows === null
    ) {
        throw new Error('DegreePicker required elements not found');
    }

    const state: PickerState = {
        catalogs: {},
        selection: undefined,
        requirement: undefined,
        pathOptions: [],
    };

    catalogSelect.addEventListener('change', () => {
        const catalogId = catalogSelect.value;
        if (catalogId.length === 0) {
            state.selection = undefined;
            state.requirement = undefined;
            state.pathOptions = [];
            updateCatalogOptions(
                state,
                catalogSelect,
                facultySelect,
                programSelect
            );
            resetRequirementView(pathSelect, pathEmpty, requirementRows);
            updateStatus(status, 'בחר קטלוג כדי להמשיך.');
            return;
        }

        state.selection = {
            catalogId,
            facultyId: '',
            programId: '',
            path: undefined,
        };
        state.requirement = undefined;
        state.pathOptions = [];
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
        state.requirement = undefined;
        state.pathOptions = [];
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
            path: undefined,
        };
        state.requirement = undefined;
        state.pathOptions = [];
        void loadRequirements(
            state,
            programSelect,
            pathSelect,
            pathEmpty,
            requirementRows,
            status
        );
    });

    pathSelect.addEventListener('change', () => {
        if (state.selection === undefined) {
            return;
        }

        const path = pathSelect.value;
        state.selection = {
            ...state.selection,
            path: path.length > 0 ? path : undefined,
        };
        void persistActiveSelectionIfComplete(state);
        renderRequirementsTable(state, requirementRows, state.selection.path);

        if (
            state.selection.path === undefined &&
            state.pathOptions.length > 0
        ) {
            updateStatus(status, REQUIREMENTS_PATH_MESSAGE);
        }
    });

    window.addEventListener(CATALOG_SYNC_EVENT, () => {
        if (!root.isConnected) {
            return;
        }
        void loadCatalogs(
            state,
            catalogSelect,
            facultySelect,
            programSelect,
            pathSelect,
            pathEmpty,
            requirementRows,
            status
        );
    });

    void loadCatalogs(
        state,
        catalogSelect,
        facultySelect,
        programSelect,
        pathSelect,
        pathEmpty,
        requirementRows,
        status
    );

    return root;
}

async function loadCatalogs(
    state: PickerState,
    catalogSelect: HTMLSelectElement,
    facultySelect: HTMLSelectElement,
    programSelect: HTMLSelectElement,
    pathSelect: HTMLSelectElement,
    pathEmpty: HTMLParagraphElement,
    requirementRows: HTMLTableSectionElement,
    status: HTMLParagraphElement
): Promise<void> {
    state.catalogs = await getCatalogs();
    const storedSelection = await getActiveRequirementsSelection();
    if (storedSelection !== undefined) {
        state.selection = {
            catalogId: storedSelection.catalogId,
            facultyId: storedSelection.facultyId,
            programId: storedSelection.programId,
            path: storedSelection.path,
        };
    }

    updateCatalogOptions(state, catalogSelect, facultySelect, programSelect);

    const storedProgramId = state.selection?.programId;
    if (storedProgramId !== undefined && storedProgramId.length > 0) {
        await hydrateRequirements(
            state,
            pathSelect,
            pathEmpty,
            requirementRows,
            status
        );
    } else {
        resetRequirementView(pathSelect, pathEmpty, requirementRows);
        updateStatus(
            status,
            Object.keys(state.catalogs).length === 0
                ? 'אין קטלוגים זמינים אופליין.'
                : 'בחר תכנית כדי לטעון דרישות.'
        );
    }
}

function updateCatalogOptions(
    state: PickerState,
    catalogSelect: HTMLSelectElement,
    facultySelect: HTMLSelectElement,
    programSelect: HTMLSelectElement
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
        return;
    }

    updateFacultyOptions(state, facultySelect, programSelect);
    updateProgramOptions(state, programSelect);
}

function updateFacultyOptions(
    state: PickerState,
    facultySelect: HTMLSelectElement,
    programSelect: HTMLSelectElement
): void {
    const catalogId = state.selection?.catalogId ?? '';
    const catalogData = getRecord(state.catalogs[catalogId]);
    const facultyEntries =
        catalogData !== undefined
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
    const facultyData =
        catalogData !== undefined
            ? getRecord(catalogData[facultyId])
            : undefined;
    const programEntries =
        facultyData !== undefined
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
    pathSelect: HTMLSelectElement,
    pathEmpty: HTMLParagraphElement,
    requirementRows: HTMLTableSectionElement,
    status: HTMLParagraphElement
): Promise<void> {
    if (state.selection === undefined) {
        return;
    }

    const selection = state.selection;
    programSelect.disabled = true;
    updateStatus(status, 'טוען דרישות...');

    const result = await syncRequirements(selection, {
        persistActiveSelection: false,
    });

    programSelect.disabled = false;

    await hydrateRequirements(
        state,
        pathSelect,
        pathEmpty,
        requirementRows,
        status
    );

    if (state.pathOptions.length > 0 && state.selection.path === undefined) {
        return;
    }

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

async function hydrateRequirements(
    state: PickerState,
    pathSelect: HTMLSelectElement,
    pathEmpty: HTMLParagraphElement,
    requirementRows: HTMLTableSectionElement,
    status: HTMLParagraphElement
): Promise<void> {
    const programId = state.selection?.programId ?? '';
    if (programId.length === 0) {
        resetRequirementView(pathSelect, pathEmpty, requirementRows);
        return;
    }

    const stored = await getRequirement(programId);
    state.requirement = toRequirementNode(stored?.data);

    const pathOptions = buildPathOptions(state.requirement);
    state.pathOptions = pathOptions;
    updatePathSection(state, pathSelect, pathEmpty);

    const selectedPath = state.selection?.path;
    if (pathOptions.length > 0 && selectedPath === undefined) {
        renderRequirementsMessage(requirementRows, REQUIREMENTS_PATH_MESSAGE);
        updateStatus(status, REQUIREMENTS_PATH_MESSAGE);
        return;
    }

    void persistActiveSelectionIfComplete(state);

    renderRequirementsTable(state, requirementRows, selectedPath);
    if (state.requirement === undefined) {
        updateStatus(status, REQUIREMENTS_MISSING_MESSAGE);
    }
}

function updatePathSection(
    state: PickerState,
    pathSelect: HTMLSelectElement,
    pathEmpty: HTMLParagraphElement
): void {
    const pathOptions = state.pathOptions;
    if (pathOptions.length === 0) {
        pathSelect.required = false;
        pathSelect.disabled = true;
        setSelectOptions(pathSelect, [], PATH_EMPTY_MESSAGE);
        pathEmpty.textContent = '';
        pathEmpty.classList.add('hidden');
        if (state.selection !== undefined) {
            state.selection = { ...state.selection, path: undefined };
        }
        return;
    }

    pathSelect.disabled = false;
    pathSelect.required = true;
    pathEmpty.textContent = '';
    pathEmpty.classList.add('hidden');
    setSelectOptions(
        pathSelect,
        pathOptions.map((option) => ({
            id: option.id,
            label: option.label,
        })),
        'בחר מסלול'
    );

    if (state.selection?.path !== undefined) {
        const exists = pathOptions.some(
            (option) => option.id === state.selection?.path
        );
        if (exists) {
            pathSelect.value = state.selection.path;
            return;
        }
    }

    pathSelect.value = '';
    if (state.selection !== undefined) {
        state.selection = { ...state.selection, path: undefined };
    }
}

function renderRequirementsTable(
    state: PickerState,
    rows: HTMLTableSectionElement,
    selectedPath?: string
): void {
    rows.replaceChildren();
    if (state.pathOptions.length > 0 && selectedPath === undefined) {
        renderRequirementsMessage(rows, REQUIREMENTS_PATH_MESSAGE);
        return;
    }
    const requirement = state.requirement;
    if (requirement === undefined) {
        renderRequirementsMessage(rows, REQUIREMENTS_MISSING_MESSAGE);
        return;
    }

    const filtered = filterRequirementsByPath(requirement, selectedPath);
    const nested = Array.isArray(filtered.nested) ? filtered.nested : [];
    const rowItems = collectRequirementRows(nested);
    if (rowItems.length === 0) {
        renderRequirementsMessage(
            rows,
            selectedPath !== undefined
                ? REQUIREMENTS_PATH_EMPTY_MESSAGE
                : REQUIREMENTS_EMPTY_MESSAGE
        );
        return;
    }

    for (const item of rowItems) {
        rows.append(createRequirementRow(item));
    }
}

function renderRequirementsMessage(
    rows: HTMLTableSectionElement,
    message: string
): void {
    rows.replaceChildren();
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.className = 'text-text px-3 py-2';
    cell.colSpan = 2;
    cell.textContent = message;
    row.append(cell);
    rows.append(row);
}

function createRequirementRow(item: RequirementRow): HTMLTableRowElement {
    const row = document.createElement('tr');
    const label = item.path;
    const count = item.count;

    row.append(createRequirementCell(label, 'text-start'));
    row.append(createRequirementCell(count.toString(), 'text-start'));

    return row;
}

function createRequirementCell(
    text: string,
    className?: string
): HTMLTableCellElement {
    const cell = document.createElement('td');
    cell.className =
        className !== undefined && className.length > 0
            ? `text-text px-3 py-2 ${className}`
            : 'text-text px-3 py-2';
    cell.textContent = text;
    return cell;
}

type RequirementRow = {
    path: string;
    count: number;
};

function collectRequirementRows(nodes: RequirementNode[]): RequirementRow[] {
    const rows: RequirementRow[] = [];
    for (const node of nodes) {
        collectRequirementRowsFromNode(node, [], rows);
    }
    return rows;
}

function collectRequirementRowsFromNode(
    node: RequirementNode,
    ancestors: string[],
    rows: RequirementRow[]
): void {
    const id = getRequirementId(node) ?? '—';
    const label = getRequirementLabel(node, id);
    const path = [...ancestors, label].join(' ');
    const hasCourses = Array.isArray(node.courses) && node.courses.length > 0;

    if (hasCourses) {
        rows.push({
            path,
            count: countUniqueCourses(node),
        });
    }

    if (Array.isArray(node.nested)) {
        for (const child of node.nested) {
            collectRequirementRowsFromNode(child, [...ancestors, label], rows);
        }
    }
}

function resetRequirementView(
    pathSelect: HTMLSelectElement,
    pathEmpty: HTMLParagraphElement,
    requirementRows: HTMLTableSectionElement
): void {
    pathSelect.required = false;
    pathSelect.disabled = true;
    setSelectOptions(pathSelect, [], PATH_EMPTY_MESSAGE);
    pathEmpty.textContent = '';
    pathEmpty.classList.add('hidden');
    renderRequirementsMessage(requirementRows, REQUIREMENTS_EMPTY_MESSAGE);
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

function toRequirementNode(value: unknown): RequirementNode | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    return value as RequirementNode;
}

function updateStatus(element: HTMLParagraphElement, message: string): void {
    element.textContent = message;
}

function isSelectionComplete(state: PickerState): boolean {
    const selection = state.selection;
    if (selection === undefined) {
        return false;
    }
    if (
        selection.catalogId.length === 0 ||
        selection.facultyId.length === 0 ||
        selection.programId.length === 0
    ) {
        return false;
    }
    if (state.pathOptions.length > 0 && (selection.path?.length ?? 0) === 0) {
        return false;
    }
    return true;
}

async function persistActiveSelectionIfComplete(
    state: PickerState
): Promise<void> {
    if (!isSelectionComplete(state) || state.selection === undefined) {
        return;
    }
    await setActiveRequirementsSelection(state.selection);
}
