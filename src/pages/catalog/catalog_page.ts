import { type CourseRecord, getCourse, getRequirement } from '$lib/indexeddb';
import {
    type RequirementNode,
    filterRequirementsByPath,
    getRequirementId,
    getRequirementLabel,
} from '$lib/requirementsUtils';
import { ConsoleNav } from '$components/ConsoleNav';
import { CourseCard } from '$components/CourseCard';
import { getActiveRequirementsSelection } from '$lib/requirementsSync';
import templateHtml from './catalog_page.html?raw';

import { DegreePicker } from './components/DegreePicker';

const GROUP_EMPTY_MESSAGE =
    'לא נמצאו קורסים במסלול הזה. אפשר לבחור מסלול אחר לבדיקת דרישות.';
const GROUP_WAITING_MESSAGE = 'בחרו תכנית ומסלול כדי להציג קורסים.';
const GROUP_LOADING_MESSAGE = 'טוען קורסים מהאחסון המקומי...';
const GROUP_PENDING_MESSAGE = 'מעדכן בחירה בתכנית...';
const GROUP_MISSING_MESSAGE =
    'אין דרישות שמורות לתכנית זו. התחברו לאינטרנט ונסו לטעון שוב.';
const COURSE_NAME_FALLBACK_PREFIX = 'קורס';
const TABLET_MIN_WIDTH = 768;
const MOBILE_CARDS_PER_PAGE = 3;
const TABLET_CARDS_PER_PAGE = 9;
const COURSE_ROW_GRID_CLASS = 'grid min-w-0 grid-cols-3 gap-3';

type RequirementGroup = {
    id: string;
    label: string;
    subtitle: string;
    courseCodes: string[];
};

type GroupRenderingContext = {
    root: HTMLElement;
    state: HTMLParagraphElement;
    summary: HTMLParagraphElement;
    pickerRoot: HTMLElement;
    courseCache: Map<string, CourseRecord | null>;
    pickerPending: boolean;
    refreshTimer?: number;
    refreshVersion: number;
};

type PickerSelection = {
    catalogId: string;
    facultyId: string;
    programId: string;
    path?: string;
};

export function CatalogPage(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('CatalogPage template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('CatalogPage template root not found');
    }

    const consoleNavHost =
        root.querySelector<HTMLElement>('[data-console-nav]');
    if (consoleNavHost !== null) {
        consoleNavHost.replaceWith(ConsoleNav({ activePath: '/catalog' }));
    }

    const degreePickerHost = root.querySelector<HTMLElement>(
        '[data-catalog-degree-picker]'
    );
    const groupsRoot = root.querySelector<HTMLElement>('[data-catalog-groups]');
    const stateElement = root.querySelector<HTMLParagraphElement>(
        '[data-catalog-state]'
    );
    const summaryElement = root.querySelector<HTMLParagraphElement>(
        '[data-catalog-summary]'
    );

    if (
        degreePickerHost === null ||
        groupsRoot === null ||
        stateElement === null ||
        summaryElement === null
    ) {
        throw new Error('CatalogPage required elements not found');
    }

    const degreePicker = DegreePicker();
    degreePickerHost.replaceWith(degreePicker);

    const context: GroupRenderingContext = {
        root: groupsRoot,
        state: stateElement,
        summary: summaryElement,
        pickerRoot: degreePicker,
        courseCache: new Map(),
        pickerPending: false,
        refreshTimer: undefined,
        refreshVersion: 0,
    };

    const selectionInputs = degreePicker.querySelectorAll<HTMLElement>(
        '[data-degree-catalog], [data-degree-faculty], [data-degree-program], [data-degree-path]'
    );
    for (const input of selectionInputs) {
        input.addEventListener('change', () => {
            context.pickerPending = true;
            context.state.textContent = GROUP_PENDING_MESSAGE;
            renderInfoState(context.root, GROUP_PENDING_MESSAGE);
            scheduleCatalogGroupsRefresh(context);
        });
    }

    const pickerObserver = new MutationObserver(() => {
        scheduleCatalogGroupsRefresh(context);
    });
    pickerObserver.observe(degreePicker, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['disabled'],
    });

    window.addEventListener('resize', () => {
        scheduleCatalogGroupsRefresh(context);
    });

    renderGroupSkeleton(context.root, 4, getCardsPerPageForViewport());
    void refreshCatalogGroups(context);

    return root;
}

function scheduleCatalogGroupsRefresh(context: GroupRenderingContext): void {
    if (context.refreshTimer !== undefined) {
        window.clearTimeout(context.refreshTimer);
    }
    context.refreshTimer = window.setTimeout(() => {
        context.refreshTimer = undefined;
        void refreshCatalogGroups(context);
    }, 60);
}

async function refreshCatalogGroups(
    context: GroupRenderingContext
): Promise<void> {
    const nextVersion = context.refreshVersion + 1;
    context.refreshVersion = nextVersion;

    context.state.textContent = GROUP_LOADING_MESSAGE;

    const selection = await getActiveRequirementsSelection();
    if (context.refreshVersion !== nextVersion) {
        return;
    }
    if (!isPickerSelectionComplete(context.pickerRoot)) {
        context.pickerPending = false;
        context.summary.textContent = GROUP_WAITING_MESSAGE;
        context.state.textContent = GROUP_WAITING_MESSAGE;
        renderInfoState(context.root, GROUP_WAITING_MESSAGE);
        return;
    }
    if (
        context.pickerPending &&
        !isPickerReadyForSelection(context.pickerRoot, selection)
    ) {
        context.summary.textContent = GROUP_PENDING_MESSAGE;
        context.state.textContent = GROUP_PENDING_MESSAGE;
        renderInfoState(context.root, GROUP_PENDING_MESSAGE);
        return;
    }
    context.pickerPending = false;

    if (selection === undefined) {
        context.summary.textContent = GROUP_WAITING_MESSAGE;
        context.state.textContent = GROUP_WAITING_MESSAGE;
        renderInfoState(context.root, GROUP_WAITING_MESSAGE);
        return;
    }

    const requirementRecord = await getRequirement(selection.programId);
    if (context.refreshVersion !== nextVersion) {
        return;
    }
    const rootNode = toRequirementNode(requirementRecord?.data);
    if (rootNode === undefined) {
        context.summary.textContent = GROUP_MISSING_MESSAGE;
        context.state.textContent = GROUP_MISSING_MESSAGE;
        renderInfoState(context.root, GROUP_MISSING_MESSAGE);
        return;
    }

    const filtered = filterRequirementsByPath(rootNode, selection.path);
    const groups = collectRequirementGroups(filtered);
    if (groups.length === 0) {
        context.summary.textContent = GROUP_EMPTY_MESSAGE;
        context.state.textContent = GROUP_EMPTY_MESSAGE;
        renderInfoState(context.root, GROUP_EMPTY_MESSAGE);
        return;
    }

    const cardsPerPage = getCardsPerPageForViewport();
    renderRequirementGroups(
        context.root,
        groups,
        context.courseCache,
        cardsPerPage
    );

    const totalCourses = collectUniqueCodes(groups).length;
    context.summary.textContent = `נטענו ${String(totalCourses)} קורסים מתוך ${String(groups.length)} קבוצות דרישה.`;
    context.state.textContent = `עודכן מנתונים שמורים אופליין עבור ${selection.programId}.`;
}

function isPickerReadyForSelection(
    pickerRoot: HTMLElement,
    selection: PickerSelection | undefined
): boolean {
    const statusText =
        pickerRoot.querySelector<HTMLElement>('[data-degree-status]')
            ?.textContent ?? '';
    if (statusText.includes('טוען דרישות')) {
        return false;
    }

    const pickerCatalog = getPickerSelectValue(
        pickerRoot,
        '[data-degree-catalog]'
    );
    const pickerFaculty = getPickerSelectValue(
        pickerRoot,
        '[data-degree-faculty]'
    );
    const pickerProgram = getPickerSelectValue(
        pickerRoot,
        '[data-degree-program]'
    );
    const pickerPath = getPickerSelectValue(pickerRoot, '[data-degree-path]');

    const selectedCatalog = selection?.catalogId ?? '';
    const selectedFaculty = selection?.facultyId ?? '';
    const selectedProgram = selection?.programId ?? '';
    const selectedPath = selection?.path ?? '';

    return (
        pickerCatalog === selectedCatalog &&
        pickerFaculty === selectedFaculty &&
        pickerProgram === selectedProgram &&
        pickerPath === selectedPath
    );
}

function getPickerSelectValue(root: HTMLElement, selector: string): string {
    const select = root.querySelector<HTMLSelectElement>(selector);
    return select?.value ?? '';
}

function isPickerSelectionComplete(pickerRoot: HTMLElement): boolean {
    const programValue = getPickerSelectValue(
        pickerRoot,
        '[data-degree-program]'
    );
    if (programValue.length === 0) {
        return false;
    }

    const pathSelect =
        pickerRoot.querySelector<HTMLSelectElement>('[data-degree-path]');
    if (pathSelect?.required === true && pathSelect.value.length === 0) {
        return false;
    }

    return true;
}

function renderRequirementGroups(
    root: HTMLElement,
    groups: RequirementGroup[],
    courseCache: Map<string, CourseRecord | null>,
    cardsPerPage: number
): void {
    root.replaceChildren();

    groups.forEach((group) => {
        const section = document.createElement('section');
        section.className = 'flex min-w-0 flex-col gap-3 py-4';

        const heading = document.createElement('div');
        heading.className = 'flex flex-col gap-1';

        const title = document.createElement('h3');
        title.className = 'text-sm font-medium';
        title.textContent = group.label;

        const subtitle = document.createElement('p');
        subtitle.className = 'text-text-muted text-xs';
        subtitle.textContent = group.subtitle;

        heading.append(title);
        heading.append(subtitle);
        section.append(heading);

        const pager = document.createElement('div');
        pager.className = 'flex flex-wrap items-center justify-between gap-2';

        const pageLabel = document.createElement('p');
        pageLabel.className = 'text-text-muted min-w-0 text-xs';
        pageLabel.setAttribute('data-catalog-group-page', group.id);

        const controls = document.createElement('div');
        controls.className = 'flex shrink-0 items-center gap-2';

        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.className =
            'border-border/60 bg-surface-2/70 text-text-muted hover:text-text rounded-full border px-3 py-1 text-xs transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50';
        prevButton.textContent = 'הקודם';

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className =
            'border-border/60 bg-surface-2/70 text-text-muted hover:text-text rounded-full border px-3 py-1 text-xs transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50';
        nextButton.textContent = 'הבא';

        controls.append(prevButton);
        controls.append(nextButton);
        pager.append(pageLabel);
        pager.append(controls);
        section.append(pager);

        const row = document.createElement('div');
        row.className = COURSE_ROW_GRID_CLASS;
        section.append(row);

        const totalPages = getTotalPages(
            group.courseCodes.length,
            cardsPerPage
        );
        if (totalPages <= 1) {
            controls.classList.add('hidden');
        }

        let pageIndex = 0;
        let renderToken = 0;
        let sortedCodes: string[] | undefined;
        let recordsByCode: Map<string, CourseRecord | null> | undefined;

        async function ensureSortedGroupData(): Promise<{
            codes: string[];
            records: Map<string, CourseRecord | null>;
        }> {
            if (sortedCodes !== undefined && recordsByCode !== undefined) {
                return {
                    codes: sortedCodes,
                    records: recordsByCode,
                };
            }

            const loadedRecords = await loadCourseRecords(
                group.courseCodes,
                courseCache
            );
            const sorted = sortCourseCodesByMedian(
                group.courseCodes,
                loadedRecords
            );
            sortedCodes = sorted;
            recordsByCode = loadedRecords;

            return {
                codes: sorted,
                records: loadedRecords,
            };
        }

        async function renderCurrentPage(): Promise<void> {
            renderToken += 1;
            const localToken = renderToken;

            const groupData = await ensureSortedGroupData();
            if (localToken !== renderToken) {
                return;
            }

            const pageCodes = getCourseCodesForPage(
                groupData.codes,
                pageIndex,
                cardsPerPage
            );

            row.replaceChildren();

            for (const code of pageCodes) {
                const record = groupData.records.get(code);
                const card =
                    record === undefined || record === null
                        ? CourseCard({
                              code,
                              name: `${COURSE_NAME_FALLBACK_PREFIX} ${code}`,
                          })
                        : CourseCard(record);

                const anchor = document.createElement('a');
                anchor.href = `/course?code=${encodeURIComponent(code)}`;
                anchor.className =
                    'focus-visible:ring-accent/60 block min-w-0 w-full rounded-2xl focus-visible:ring-2';
                if (record?.current !== true) {
                    anchor.classList.add('opacity-70');
                }
                anchor.append(card);
                row.append(anchor);
            }

            pageLabel.textContent = `עמוד ${String(pageIndex + 1)} מתוך ${String(totalPages)} • ${String(group.courseCodes.length)} קורסים`;
            prevButton.disabled = pageIndex <= 0;
            nextButton.disabled = pageIndex + 1 >= totalPages;
        }

        prevButton.addEventListener('click', () => {
            if (pageIndex <= 0) {
                return;
            }
            pageIndex -= 1;
            void renderCurrentPage();
        });

        nextButton.addEventListener('click', () => {
            if (pageIndex + 1 >= totalPages) {
                return;
            }
            pageIndex += 1;
            void renderCurrentPage();
        });

        void renderCurrentPage();

        root.append(section);
    });
}

function sortCourseCodesByMedian(
    codes: string[],
    recordsByCode: Map<string, CourseRecord | null>
): string[] {
    return [...codes].sort((leftCode, rightCode) => {
        const leftMedian = getCourseMedian(recordsByCode.get(leftCode));
        const rightMedian = getCourseMedian(recordsByCode.get(rightCode));
        if (rightMedian !== leftMedian) {
            return rightMedian - leftMedian;
        }
        return leftCode.localeCompare(rightCode);
    });
}

function getCourseMedian(record: CourseRecord | null | undefined): number {
    if (record?.median === undefined || !Number.isFinite(record.median)) {
        return Number.NEGATIVE_INFINITY;
    }
    return record.median;
}

function getTotalPages(courseCount: number, cardsPerPage: number): number {
    return Math.max(1, Math.ceil(courseCount / cardsPerPage));
}

function getCourseCodesForPage(
    courseCodes: string[],
    pageIndex: number,
    cardsPerPage: number
): string[] {
    const from = pageIndex * cardsPerPage;
    return courseCodes.slice(from, from + cardsPerPage);
}

async function loadCourseRecords(
    codes: string[],
    cache: Map<string, CourseRecord | null>
): Promise<Map<string, CourseRecord | null>> {
    const recordsByCode = new Map<string, CourseRecord | null>();
    await Promise.all(
        codes.map(async (code) => {
            const cached = cache.get(code);
            if (cached !== undefined) {
                recordsByCode.set(code, cached);
                return;
            }

            const record = await getCourse(code);
            const value = record ?? null;
            cache.set(code, value);
            recordsByCode.set(code, value);
        })
    );

    return recordsByCode;
}

function collectUniqueCodes(groups: RequirementGroup[]): string[] {
    const allCodes = new Set<string>();
    for (const group of groups) {
        for (const code of group.courseCodes) {
            allCodes.add(code);
        }
    }
    return [...allCodes];
}

function collectRequirementGroups(root: RequirementNode): RequirementGroup[] {
    const groups: RequirementGroup[] = [];
    collectRequirementGroupsFromNode(root, [], groups);
    return groups;
}

function collectRequirementGroupsFromNode(
    node: RequirementNode,
    ancestors: string[],
    groups: RequirementGroup[]
): void {
    const id = getRequirementId(node) ?? '—';
    const label = getRequirementLabel(node, id);
    const chain = [...ancestors, label];
    const courseCodes = collectDirectCourses(node);

    if (courseCodes.length > 0) {
        groups.push({
            id,
            label,
            subtitle: `${chain.join(' • ')} · ${String(courseCodes.length)} קורסים`,
            courseCodes,
        });
    }

    if (Array.isArray(node.nested)) {
        for (const child of node.nested) {
            collectRequirementGroupsFromNode(child, chain, groups);
        }
    }
}

function collectDirectCourses(node: RequirementNode): string[] {
    if (!Array.isArray(node.courses)) {
        return [];
    }
    const uniqueCodes = new Set<string>();
    for (const course of node.courses) {
        if (typeof course === 'string' && course.length > 0) {
            uniqueCodes.add(course);
        }
    }
    return [...uniqueCodes];
}

function toRequirementNode(value: unknown): RequirementNode | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    return value as RequirementNode;
}

function renderInfoState(root: HTMLElement, message: string): void {
    root.replaceChildren();
    const text = document.createElement('p');
    text.className = 'text-text-muted py-3 text-xs';
    text.textContent = message;
    root.append(text);
}

function renderGroupSkeleton(
    root: HTMLElement,
    count: number,
    cardsPerPage: number
): void {
    root.replaceChildren();
    for (let index = 0; index < count; index += 1) {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-3 py-4';

        const title = document.createElement('span');
        title.className = 'skeleton-shimmer h-4 w-44 rounded-md';
        wrapper.append(title);

        const row = document.createElement('div');
        row.className = COURSE_ROW_GRID_CLASS;
        for (let cardIndex = 0; cardIndex < cardsPerPage; cardIndex += 1) {
            row.append(CourseCard());
        }
        wrapper.append(row);

        const pager = document.createElement('span');
        pager.className = 'skeleton-shimmer h-3 w-36 rounded-md';
        wrapper.append(pager);

        root.append(wrapper);
    }
}

function getCardsPerPageForViewport(): number {
    if (window.innerWidth >= TABLET_MIN_WIDTH) {
        return TABLET_CARDS_PER_PAGE;
    }
    return MOBILE_CARDS_PER_PAGE;
}
