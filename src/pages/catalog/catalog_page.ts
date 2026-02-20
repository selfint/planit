import {
    type RequirementNode,
    filterRequirementsByPath,
    getRequirementId,
    getRequirementLabel,
} from '$lib/requirementsUtils';
import { ConsoleNav } from '$components/ConsoleNav';
import { CourseCard } from '$components/CourseCard';
import { type CourseRecord } from '$lib/indexeddb';
import { state as appState } from '$lib/stateManagement';
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
const GROUP_SKELETON_CARD_COUNT = 6;
const COURSE_ROW_SCROLL_CLASS =
    'min-w-0 max-w-full overflow-x-auto overflow-y-hidden pb-2 [scrollbar-width:thin]';
const COURSE_ROW_CLASS =
    'flex w-max min-w-full snap-x snap-mandatory gap-2';

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

    renderGroupSkeleton(context.root, 4);
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

    const selection = await appState.userDegree.get();
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

    const requirementRecord = await appState.requirements.get(
        selection.programId
    );
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

    renderRequirementGroups(context.root, groups, context.courseCache);

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
    courseCache: Map<string, CourseRecord | null>
): void {
    root.replaceChildren();

    groups.forEach((group) => {
        const section = document.createElement('section');
        section.className =
            'flex min-w-0 flex-col gap-3 py-4 [content-visibility:auto] [contain-intrinsic-size:24rem]';

        const heading = document.createElement('div');
        heading.className = 'mx-4 flex flex-col gap-1 xl:mx-0';

        const title = document.createElement('h3');
        title.className = 'text-sm font-medium';
        title.textContent = group.label;

        const subtitle = document.createElement('p');
        subtitle.className = 'text-text-muted text-xs';
        subtitle.textContent = group.subtitle;

        heading.append(title);
        heading.append(subtitle);
        section.append(heading);

        const rowScroll = document.createElement('div');
        rowScroll.className = COURSE_ROW_SCROLL_CLASS;

        const row = document.createElement('div');
        row.className = COURSE_ROW_CLASS;
        row.dataset.role = 'group-row';
        rowScroll.append(row);
        section.append(rowScroll);

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

            row.replaceChildren();

            for (const code of groupData.codes) {
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
                    'touch-manipulation focus-visible:ring-accent/60 block h-[7.5rem] w-[7.5rem] shrink-0 snap-start rounded-2xl focus-visible:ring-2 sm:h-[6.5rem] lg:w-[10.5rem] [content-visibility:auto] [contain-intrinsic-size:7.5rem_7.5rem] sm:[contain-intrinsic-size:7.5rem_6.5rem] lg:[contain-intrinsic-size:10.5rem_6.5rem]';
                if (record?.current !== true) {
                    anchor.classList.add('opacity-70');
                }
                anchor.append(card);
                row.append(anchor);
            }
        }

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

            const record = await appState.courses.get(code);
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
    text.className = 'text-text-muted mx-4 py-3 text-xs xl:mx-0';
    text.textContent = message;
    root.append(text);
}

function renderGroupSkeleton(
    root: HTMLElement,
    count: number
): void {
    root.replaceChildren();
    for (let index = 0; index < count; index += 1) {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-3 py-4';

        const title = document.createElement('span');
        title.className = 'skeleton-shimmer mx-4 h-4 w-44 rounded-md xl:mx-0';
        wrapper.append(title);

        const rowScroll = document.createElement('div');
        rowScroll.className = COURSE_ROW_SCROLL_CLASS;

        const row = document.createElement('div');
        row.className = COURSE_ROW_CLASS;
        row.dataset.role = 'group-row';
        for (
            let cardIndex = 0;
            cardIndex < GROUP_SKELETON_CARD_COUNT;
            cardIndex += 1
        ) {
            const cardShell = document.createElement('div');
            cardShell.className =
                'pointer-events-none block h-[7.5rem] w-[7.5rem] shrink-0 snap-start rounded-2xl sm:h-[6.5rem] lg:w-[10.5rem]';
            cardShell.setAttribute('aria-hidden', 'true');
            cardShell.append(CourseCard());
            row.append(cardShell);
        }
        rowScroll.append(row);
        wrapper.append(rowScroll);

        root.append(wrapper);
    }
}
