import templateHtml from './catalog_page.html?raw';
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

    renderGroupSkeleton(context.root, 6);
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

    const codes = collectUniqueCodes(groups);
    const recordsByCode = await loadCourseRecords(codes, context.courseCache);
    if (context.refreshVersion !== nextVersion) {
        return;
    }

    renderRequirementGroups(context.root, groups, recordsByCode);

    const totalCourses = codes.length;
    context.summary.textContent = `נטענו ${String(totalCourses)} קורסים מתוך ${String(groups.length)} קבוצות דרישה.`;
    context.state.textContent = `עודכן מנתונים שמורים אופליין עבור ${selection.programId}.`;
}

function renderRequirementGroups(
    root: HTMLElement,
    groups: RequirementGroup[],
    recordsByCode: Map<string, CourseRecord | null>
): void {
    root.replaceChildren();

    for (const group of groups) {
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

        const list = document.createElement('ul');
        list.className = 'divide-border/40 flex flex-col divide-y';

        for (const code of group.courseCodes) {
            const record = recordsByCode.get(code);
            const item = document.createElement('li');
            item.className = 'py-2';

            const anchor = document.createElement('a');
            anchor.href = `/course?code=${encodeURIComponent(code)}`;
            anchor.className =
                'hover:text-text focus-visible:ring-accent/60 flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 text-xs transition duration-200 ease-out focus-visible:ring-2';

            const textBlock = document.createElement('span');
            textBlock.className = 'flex min-w-0 flex-col gap-1';

            const name = document.createElement('span');
            name.className = 'text-text truncate text-sm';
            name.textContent = getCourseTitle(record, code);

            const meta = document.createElement('span');
            meta.className = 'text-text-muted text-xs';
            meta.textContent = `קוד ${code}`;

            textBlock.append(name);
            textBlock.append(meta);

            const points = document.createElement('span');
            points.className = 'text-text-muted shrink-0 text-xs';
            points.textContent = formatCoursePoints(record?.points);

            anchor.append(textBlock);
            anchor.append(points);
            item.append(anchor);
            list.append(item);
        }

        section.append(list);
        root.append(section);
    }
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

        for (let line = 0; line < 2; line += 1) {
            const row = document.createElement('span');
            row.className =
                'skeleton-shimmer h-10 w-full rounded-md sm:max-w-[28rem]';
            wrapper.append(row);
        }

        root.append(wrapper);
    }
}

function getCourseTitle(
    record: CourseRecord | null | undefined,
    code: string
): string {
    if (record?.name !== undefined && record.name.length > 0) {
        return record.name;
    }
    return `${COURSE_NAME_FALLBACK_PREFIX} ${code}`;
}

function formatCoursePoints(points: number | undefined): string {
    if (points === undefined || !Number.isFinite(points)) {
        return "נק'ז —";
    }
    return `נק"ז ${String(points)}`;
}
