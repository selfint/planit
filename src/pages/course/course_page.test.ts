/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
    return {
        getCourseMock: vi.fn(),
        initCourseSyncMock: vi.fn(),
    };
});

vi.mock('$lib/indexeddb', () => ({
    getCourse: mocks.getCourseMock,
}));

vi.mock('$lib/courseSync', () => ({
    initCourseSync: mocks.initCourseSyncMock,
}));

import { CoursePage } from './course_page';

describe('course page', () => {
    beforeEach(() => {
        mocks.getCourseMock.mockReset();
        mocks.initCourseSyncMock.mockReset();
        window.history.replaceState(null, '', '/course');
    });

    afterEach(() => {
        document.body.replaceChildren();
    });

    it('renders a root element', () => {
        mocks.getCourseMock.mockResolvedValue(undefined);

        const page = CoursePage();

        expect(page).toBeInstanceOf(HTMLElement);
        expect(page.getAttribute('data-page')).toBe('course');
    });

    it('shows not found when code query param is missing', async () => {
        const page = CoursePage();
        await flushPromises();

        const notFoundState = page.querySelector<HTMLElement>(
            "[data-state='not-found']"
        );
        const message = page.querySelector<HTMLElement>(
            "[data-role='not-found-message']"
        );

        expect(notFoundState?.classList.contains('hidden')).toBe(false);
        expect(message?.textContent).toContain('נדרש פרמטר code');
    });

    it('renders fetched course and related course cards', async () => {
        window.history.replaceState(null, '', '/course?code=CS101');
        mocks.getCourseMock.mockImplementation(async (code: string) => {
            if (code === 'CS101') {
                return {
                    code: 'CS101',
                    name: 'Intro to CS',
                    points: 4,
                    median: 88,
                    about: 'Foundations course',
                    connections: {
                        dependencies: [['MATH100']],
                        adjacent: ['CS102'],
                        exclusive: ['CS999'],
                    },
                    seasons: ['חורף', 'אביב'],
                };
            }

            if (code === 'MATH100') {
                return { code: 'MATH100', name: 'Calculus A' };
            }
            if (code === 'CS102') {
                return { code: 'CS102', name: 'Data Structures' };
            }
            return undefined;
        });

        const page = CoursePage();
        await flushPromises();

        const courseName = page.querySelector<HTMLElement>(
            "[data-role='course-name']"
        );
        const foundState = page.querySelector<HTMLElement>(
            "[data-state='found']"
        );
        const dependencyCards = page.querySelectorAll(
            "[data-role='dependencies-grid'] [data-component='CourseCard']"
        );
        const adjacentCards = page.querySelectorAll(
            "[data-role='adjacent-grid'] [data-component='CourseCard']"
        );
        const exclusiveCards = page.querySelectorAll(
            "[data-role='exclusive-grid'] [data-component='CourseCard']"
        );

        expect(courseName?.textContent).toBe('Intro to CS');
        expect(foundState?.classList.contains('hidden')).toBe(false);
        expect(dependencyCards).toHaveLength(1);
        expect(adjacentCards).toHaveLength(1);
        expect(exclusiveCards).toHaveLength(1);
        expect(mocks.initCourseSyncMock).toHaveBeenCalledTimes(1);
    });
});

async function flushPromises(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => {
        window.setTimeout(resolve, 0);
    });
}
