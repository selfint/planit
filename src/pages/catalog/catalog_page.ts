import templateHtml from './catalog_page.html?raw';
import { CourseCard } from '$components/CourseCard';
import { DegreePicker } from '$components/DegreePicker';
import { getCourse, getRequirement } from '$lib/indexeddb';
import type { CourseRecord } from '$lib/indexeddb';
import {
    filterRequirementsByPath,
    getRequirementId,
    getRequirementLabel,
} from '$lib/requirementsUtils';
import type { RequirementNode } from '$lib/requirementsUtils';
import { getActiveRequirementsSelection } from '$lib/requirementsSync';

const GROUP_EMPTY_MESSAGE =
    'לא נמצאו קורסים במסלול הזה. אפשר לבחור מסלול אחר לבדיקת דרישות.';
const GROUP_WAITING_MESSAGE = 'בחרו תכנית ומסלול כדי להציג קורסים.';
const GROUP_LOADING_MESSAGE = 'טוען קורסים מהאחסון המקומי...';
const GROUP_MISSING_MESSAGE =
    'אין דרישות שמורות לתכנית זו. התחברו לאינטרנט ונסו לטעון שוב.';
const COURSE_NAME_FALLBACK_PREFIX = 'קורס';
const CARDS_PER_PAGE = 3;

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
    courseCache: Map<string, CourseRecord | null>;
    refreshTimer?: number;
    refreshVersion: number;
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
        courseCache: new Map(),
        refreshTimer: undefined,
        refreshVersion: 0,
    };

    const selectionInputs = degreePicker.querySelectorAll<HTMLElement>(
        '[data-degree-catalog], [data-degree-faculty], [data-degree-program], [data-degree-path]'
    );
    for (const input of selectionInputs) {
        input.addEventListener('change', () =>
            scheduleCatalogGroupsRefresh(context)
        );
    }

    const requirementRows = degreePicker.querySelector<HTMLElement>(
        '[data-requirement-rows]'
    );
    if (requirementRows !== null) {
        const observer = new MutationObserver(() => {
            scheduleCatalogGroupsRefresh(context);
        });
        observer.observe(requirementRows, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    }

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

    const selection = await getActiveRequirementsSelection();
    if (context.refreshVersion !== nextVersion) {
        return;
    }
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

    renderRequirementGroups(context.root, groups, context.courseCache);

    const totalCourses = collectUniqueCodes(groups).length;
    context.summary.textContent = `נטענו ${String(totalCourses)} קורסים מתוך ${String(groups.length)} קבוצות דרישה.`;
    context.state.textContent = `עודכן מנתונים שמורים אופליין עבור ${selection.programId}.`;
}

function renderRequirementGroups(
    root: HTMLElement,
    groups: RequirementGroup[],
    courseCache: Map<string, CourseRecord | null>
): void {
    root.replaceChildren();

    groups.forEach((group) => {
        const section = document.createElement('section');
        section.className = 'flex flex-col gap-3 py-4';

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
        pager.className = 'flex items-center justify-between gap-3';

        const pageLabel = document.createElement('p');
        pageLabel.className = 'text-text-muted text-xs';
        pageLabel.setAttribute('data-catalog-group-page', group.id);

        const controls = document.createElement('div');
        controls.className = 'flex items-center gap-2';

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
        row.className = 'grid grid-cols-3 gap-3';
        section.append(row);

        const totalPages = getTotalPages(group.courseCodes.length);
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

            const pageCodes = getCourseCodesForPage(groupData.codes, pageIndex);

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
                    'focus-visible:ring-accent/60 rounded-2xl focus-visible:ring-2';
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

function getTotalPages(courseCount: number): number {
    return Math.max(1, Math.ceil(courseCount / CARDS_PER_PAGE));
}

function getCourseCodesForPage(
    courseCodes: string[],
    pageIndex: number
): string[] {
    const from = pageIndex * CARDS_PER_PAGE;
    return courseCodes.slice(from, from + CARDS_PER_PAGE);
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

function renderGroupSkeleton(root: HTMLElement, count: number): void {
    root.replaceChildren();
    for (let index = 0; index < count; index += 1) {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-3 py-4';

        const title = document.createElement('span');
        title.className = 'skeleton-shimmer h-4 w-44 rounded-md';
        wrapper.append(title);

        const row = document.createElement('div');
        row.className = 'grid grid-cols-3 gap-3';
        row.append(CourseCard());
        row.append(CourseCard());
        row.append(CourseCard());
        wrapper.append(row);

        const pager = document.createElement('span');
        pager.className = 'skeleton-shimmer h-3 w-36 rounded-md';
        wrapper.append(pager);

        root.append(wrapper);
    }
}
