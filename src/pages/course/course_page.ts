import { CourseCard } from '$components/CourseCard';
import { initCourseSync } from '$lib/courseSync';
import { getCourse } from '$lib/indexeddb';
import type { CourseRecord } from '$lib/indexeddb';

import templateHtml from './course_page.html?raw';

const EMPTY_VALUE = '—';
const UNKNOWN_COURSE_LABEL = 'קורס לא זמין במאגר';
const LOADING_LABEL = 'טוען פרטי קורס...';
const READY_LABEL = 'עודכן מהמאגר המקומי';
const NOT_FOUND_LABEL = 'קורס לא נמצא במאגר המקומי';

type CoursePageElements = {
    routeLabel: HTMLElement;
    courseCode: HTMLElement;
    courseName: HTMLElement;
    courseAbout: HTMLElement;
    coursePoints: HTMLElement;
    courseMedian: HTMLElement;
    courseFaculty: HTMLElement;
    courseSeasons: HTMLElement;
    syncState: HTMLElement;
    searchLink: HTMLAnchorElement;
    loadingState: HTMLElement;
    notFoundState: HTMLElement;
    notFoundMessage: HTMLElement;
    foundState: HTMLElement;
    dependenciesGrid: HTMLElement;
    dependenciesCount: HTMLElement;
    dependenciesEmpty: HTMLElement;
    adjacentGrid: HTMLElement;
    adjacentCount: HTMLElement;
    adjacentEmpty: HTMLElement;
    exclusiveGrid: HTMLElement;
    exclusiveCount: HTMLElement;
    exclusiveEmpty: HTMLElement;
};

type DependencyGroup = string[];
type RelatedCourseGroups = CourseRecord[][];

export function CoursePage(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('CoursePage template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('CoursePage template root not found');
    }

    const elements = queryElements(root);
    const requestedCode = getRequestedCourseCode(window.location.search);
    updateRouteLabel(elements.routeLabel, requestedCode);
    updateSearchLink(elements.searchLink, requestedCode);

    if (requestedCode === undefined) {
        showNotFound(
            elements,
            'נדרש פרמטר code בכתובת, למשל /course?code=104031.'
        );
        return root;
    }

    showLoading(elements);
    void loadAndRenderCourse(elements, requestedCode);

    initCourseSync({
        onSync: () => {
            void loadAndRenderCourse(elements, requestedCode);
        },
        onError: () => {
            elements.syncState.textContent = 'שגיאה בסנכרון, מוצג מידע מקומי';
        },
    });

    return root;
}

function queryElements(root: HTMLElement): CoursePageElements {
    const routeLabel = root.querySelector<HTMLElement>(
        "[data-role='route-label']"
    );
    const courseCode = root.querySelector<HTMLElement>(
        "[data-role='course-code']"
    );
    const courseName = root.querySelector<HTMLElement>(
        "[data-role='course-name']"
    );
    const courseAbout = root.querySelector<HTMLElement>(
        "[data-role='course-about']"
    );
    const coursePoints = root.querySelector<HTMLElement>(
        "[data-role='course-points']"
    );
    const courseMedian = root.querySelector<HTMLElement>(
        "[data-role='course-median']"
    );
    const courseFaculty = root.querySelector<HTMLElement>(
        "[data-role='course-faculty']"
    );
    const courseSeasons = root.querySelector<HTMLElement>(
        "[data-role='course-seasons']"
    );
    const syncState = root.querySelector<HTMLElement>(
        "[data-role='sync-state']"
    );
    const searchLink = root.querySelector<HTMLAnchorElement>(
        "[data-role='search-link']"
    );
    const loadingState = root.querySelector<HTMLElement>(
        "[data-state='loading']"
    );
    const notFoundState = root.querySelector<HTMLElement>(
        "[data-state='not-found']"
    );
    const notFoundMessage = root.querySelector<HTMLElement>(
        "[data-role='not-found-message']"
    );
    const foundState = root.querySelector<HTMLElement>("[data-state='found']");
    const dependenciesGrid = root.querySelector<HTMLElement>(
        "[data-role='dependencies-grid']"
    );
    const dependenciesCount = root.querySelector<HTMLElement>(
        "[data-role='dependencies-count']"
    );
    const dependenciesEmpty = root.querySelector<HTMLElement>(
        "[data-role='dependencies-empty']"
    );
    const adjacentGrid = root.querySelector<HTMLElement>(
        "[data-role='adjacent-grid']"
    );
    const adjacentCount = root.querySelector<HTMLElement>(
        "[data-role='adjacent-count']"
    );
    const adjacentEmpty = root.querySelector<HTMLElement>(
        "[data-role='adjacent-empty']"
    );
    const exclusiveGrid = root.querySelector<HTMLElement>(
        "[data-role='exclusive-grid']"
    );
    const exclusiveCount = root.querySelector<HTMLElement>(
        "[data-role='exclusive-count']"
    );
    const exclusiveEmpty = root.querySelector<HTMLElement>(
        "[data-role='exclusive-empty']"
    );

    if (
        routeLabel === null ||
        courseCode === null ||
        courseName === null ||
        courseAbout === null ||
        coursePoints === null ||
        courseMedian === null ||
        courseFaculty === null ||
        courseSeasons === null ||
        syncState === null ||
        searchLink === null ||
        loadingState === null ||
        notFoundState === null ||
        notFoundMessage === null ||
        foundState === null ||
        dependenciesGrid === null ||
        dependenciesCount === null ||
        dependenciesEmpty === null ||
        adjacentGrid === null ||
        adjacentCount === null ||
        adjacentEmpty === null ||
        exclusiveGrid === null ||
        exclusiveCount === null ||
        exclusiveEmpty === null
    ) {
        throw new Error('CoursePage required elements not found');
    }

    return {
        routeLabel,
        courseCode,
        courseName,
        courseAbout,
        coursePoints,
        courseMedian,
        courseFaculty,
        courseSeasons,
        syncState,
        searchLink,
        loadingState,
        notFoundState,
        notFoundMessage,
        foundState,
        dependenciesGrid,
        dependenciesCount,
        dependenciesEmpty,
        adjacentGrid,
        adjacentCount,
        adjacentEmpty,
        exclusiveGrid,
        exclusiveCount,
        exclusiveEmpty,
    };
}

function getRequestedCourseCode(search: string): string | undefined {
    const params = new URLSearchParams(search);
    const value = params.get('code');
    if (value === null) {
        return undefined;
    }

    const normalized = value.trim().toUpperCase();
    if (normalized.length === 0) {
        return undefined;
    }

    return normalized;
}

function updateRouteLabel(
    element: HTMLElement,
    code: string | undefined
): void {
    if (code === undefined) {
        element.textContent = '/course';
        return;
    }

    element.textContent = `/course?code=${code}`;
}

function updateSearchLink(
    link: HTMLAnchorElement,
    code: string | undefined
): void {
    if (code === undefined) {
        link.href = '/search';
        return;
    }

    link.href = `/search?q=${encodeURIComponent(code)}`;
}

function showLoading(elements: CoursePageElements): void {
    elements.loadingState.classList.remove('hidden');
    elements.notFoundState.classList.add('hidden');
    elements.foundState.classList.add('hidden');
    elements.syncState.textContent = LOADING_LABEL;
}

function showNotFound(elements: CoursePageElements, message: string): void {
    elements.loadingState.classList.add('hidden');
    elements.notFoundState.classList.remove('hidden');
    elements.foundState.classList.add('hidden');
    elements.notFoundMessage.textContent = message;
    elements.syncState.textContent = NOT_FOUND_LABEL;
}

function showCourseFound(elements: CoursePageElements): void {
    elements.loadingState.classList.add('hidden');
    elements.notFoundState.classList.add('hidden');
    elements.foundState.classList.remove('hidden');
    elements.syncState.textContent = READY_LABEL;
}

async function loadAndRenderCourse(
    elements: CoursePageElements,
    code: string
): Promise<void> {
    const course = await getCourse(code);
    if (course === undefined) {
        showNotFound(elements, `לא נמצא קורס עם הקוד ${code}.`);
        return;
    }

    fillPrimaryCourseData(elements, course);
    const dependencyGroups = getDependencyGroups(course);
    const adjacentCodes = getConnectionCodes(course.connections?.adjacent);
    const exclusiveCodes = getConnectionCodes(course.connections?.exclusive);

    const [dependenciesByGroup, adjacent, exclusive] = await Promise.all([
        loadRelatedCourseGroups(code, dependencyGroups),
        loadRelatedCourses(code, adjacentCodes),
        loadRelatedCourses(code, exclusiveCodes),
    ]);

    renderDependencyGroups(
        elements.dependenciesGrid,
        elements.dependenciesCount,
        elements.dependenciesEmpty,
        dependenciesByGroup
    );
    renderRelatedCourseCards(
        elements.adjacentGrid,
        elements.adjacentCount,
        elements.adjacentEmpty,
        adjacent
    );
    renderRelatedCourseCards(
        elements.exclusiveGrid,
        elements.exclusiveCount,
        elements.exclusiveEmpty,
        exclusive
    );

    showCourseFound(elements);
}

function fillPrimaryCourseData(
    elements: CoursePageElements,
    course: CourseRecord
): void {
    elements.courseCode.textContent = course.code;
    elements.courseName.textContent =
        getNonEmptyString(course.name) ?? UNKNOWN_COURSE_LABEL;
    elements.courseAbout.textContent =
        getNonEmptyString(course.about) ??
        'אין תיאור זמין לקורס זה במאגר הנוכחי.';
    elements.coursePoints.textContent = formatNumber(course.points);
    elements.courseMedian.textContent = formatNumber(course.median);
    elements.courseFaculty.textContent =
        getNonEmptyString(course.faculty) ?? EMPTY_VALUE;
    elements.courseSeasons.textContent = formatSeasons(course.seasons);
}

function formatNumber(value: number | undefined): string {
    if (value === undefined || !Number.isFinite(value)) {
        return EMPTY_VALUE;
    }
    return value.toString();
}

function formatSeasons(seasons: string[] | undefined): string {
    if (!Array.isArray(seasons) || seasons.length === 0) {
        return EMPTY_VALUE;
    }

    const formatted = seasons
        .map((season) => season.trim())
        .filter((season) => season.length > 0);
    if (formatted.length === 0) {
        return EMPTY_VALUE;
    }
    return formatted.join(' · ');
}

function getNonEmptyString(value: string | undefined): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    const normalized = value.trim();
    if (normalized.length === 0) {
        return undefined;
    }
    return normalized;
}

function getDependencyGroups(course: CourseRecord): DependencyGroup[] {
    const dependencies = course.connections?.dependencies;
    if (!Array.isArray(dependencies)) {
        return [];
    }

    const groups: DependencyGroup[] = [];
    for (const dependencyGroup of dependencies) {
        if (!Array.isArray(dependencyGroup)) {
            continue;
        }
        const groupCodes: string[] = [];
        for (const dependencyCode of dependencyGroup) {
            if (typeof dependencyCode !== 'string') {
                continue;
            }
            const normalized = dependencyCode.trim().toUpperCase();
            if (normalized.length === 0) {
                continue;
            }
            if (!groupCodes.includes(normalized)) {
                groupCodes.push(normalized);
            }
        }
        if (groupCodes.length > 0) {
            groups.push(groupCodes);
        }
    }

    return groups;
}

function getConnectionCodes(codes: string[] | undefined): string[] {
    if (!Array.isArray(codes)) {
        return [];
    }

    return codes
        .map((code) => code.trim().toUpperCase())
        .filter((code) => code.length > 0);
}

async function loadRelatedCourses(
    currentCourseCode: string,
    relatedCodes: string[]
): Promise<CourseRecord[]> {
    const uniqueCodes = Array.from(new Set(relatedCodes)).filter(
        (relatedCode) => relatedCode !== currentCourseCode
    );
    if (uniqueCodes.length === 0) {
        return [];
    }

    const relatedCourses = await Promise.all(
        uniqueCodes.map(async (relatedCode) => {
            const relatedCourse = await getCourse(relatedCode);
            if (relatedCourse !== undefined) {
                return relatedCourse;
            }
            return {
                code: relatedCode,
                name: UNKNOWN_COURSE_LABEL,
            } satisfies CourseRecord;
        })
    );

    return relatedCourses;
}

async function loadRelatedCourseGroups(
    currentCourseCode: string,
    groups: DependencyGroup[]
): Promise<RelatedCourseGroups> {
    if (groups.length === 0) {
        return [];
    }

    return Promise.all(
        groups.map(async (groupCodes) => {
            return loadRelatedCourses(currentCourseCode, groupCodes);
        })
    );
}

function renderDependencyGroups(
    container: HTMLElement,
    count: HTMLElement,
    emptyLabel: HTMLElement,
    groups: RelatedCourseGroups
): void {
    container.replaceChildren();
    const groupCount = groups.length;
    const courseCount = groups.reduce(
        (total, group) => total + group.length,
        0
    );
    count.textContent = `${String(groupCount)} חלופות · ${String(courseCount)} קורסים`;

    if (groupCount === 0 || courseCount === 0) {
        emptyLabel.classList.remove('hidden');
        return;
    }

    emptyLabel.classList.add('hidden');

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        const groupCourses = groups[groupIndex] ?? [];
        if (groupCourses.length === 0) {
            continue;
        }

        const groupSection = document.createElement('section');
        groupSection.className = 'flex flex-col gap-3';

        const groupGrid = document.createElement('div');
        groupGrid.className =
            'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3';

        for (
            let courseIndex = 0;
            courseIndex < groupCourses.length;
            courseIndex += 1
        ) {
            const course = groupCourses[courseIndex];
            const link = createCourseCardLink(course);
            groupGrid.append(link);
        }

        groupSection.append(groupGrid);
        container.append(groupSection);

        if (groupIndex < groups.length - 1) {
            const separator = document.createElement('div');
            separator.className = 'flex items-center gap-2 py-1';

            const lineStart = document.createElement('span');
            lineStart.className = 'bg-border/80 h-px flex-1';

            const lineEnd = document.createElement('span');
            lineEnd.className = 'bg-border/80 h-px flex-1';

            const orBadge = document.createElement('p');
            orBadge.className =
                'bg-surface-2 text-text-muted inline-flex w-fit items-center rounded-full px-3 py-1 text-xs';
            orBadge.textContent = 'או';

            separator.append(lineStart, orBadge, lineEnd);
            container.append(separator);
        }
    }
}

function renderRelatedCourseCards(
    grid: HTMLElement,
    count: HTMLElement,
    emptyLabel: HTMLElement,
    courses: CourseRecord[]
): void {
    grid.replaceChildren();
    count.textContent = `${String(courses.length)} קורסים`;
    if (courses.length === 0) {
        emptyLabel.classList.remove('hidden');
        return;
    }

    emptyLabel.classList.add('hidden');
    for (const course of courses) {
        grid.append(createCourseCardLink(course));
    }
}

function createCourseCardLink(course: CourseRecord): HTMLAnchorElement {
    const card = CourseCard(course, {
        statusClass:
            course.name === UNKNOWN_COURSE_LABEL ? 'bg-border' : undefined,
    });
    const link = document.createElement('a');
    link.href = `/course?code=${encodeURIComponent(course.code)}`;
    link.className = 'block';
    link.setAttribute('aria-label', `פתיחת הקורס ${course.code}`);
    link.append(card);
    return link;
}
