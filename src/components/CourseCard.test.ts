/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadCourseCardModule(): Promise<typeof import('./CourseCard')> {
    vi.resetModules();
    return import('./CourseCard');
}

describe('CourseCard', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('parses template html once and clones for each card', async () => {
        const { CourseCard } = await loadCourseCardModule();
        const createElementSpy = vi.spyOn(document, 'createElement');

        try {
            const first = CourseCard();
            const second = CourseCard({ code: '234114', name: 'מבוא' });

            expect(first).not.toBe(second);

            const templateCalls = createElementSpy.mock.calls.filter(
                ([tagName]) => tagName === 'template'
            );
            expect(templateCalls).toHaveLength(1);
        } finally {
            createElementSpy.mockRestore();
        }
    });

    it('renders skeleton card when no course is provided', async () => {
        const { CourseCard } = await loadCourseCardModule();

        const card = CourseCard();
        const title = card.querySelector<HTMLElement>(
            "[data-role='course-title']"
        );
        const code = card.querySelector<HTMLElement>(
            "[data-role='course-code']"
        );

        expect(card.getAttribute('data-skeleton')).toBe('true');
        expect(card.getAttribute('aria-busy')).toBe('true');
        expect(title?.textContent).toBe('');
        expect(code?.textContent).toBe('');
    });

    it('renders populated course values and clears skeleton attributes', async () => {
        const { CourseCard } = await loadCourseCardModule();

        const card = CourseCard({
            code: '234124',
            name: 'מבני נתונים',
            points: 3.5,
            median: 84,
            tests: [{ year: 2025, monthIndex: 0, day: 20 }],
        });

        const statusDot = card.querySelector<HTMLElement>(
            "[data-role='status-dot']"
        );
        const points = card.querySelector<HTMLElement>(
            "[data-role='course-points']"
        );
        const median = card.querySelector<HTMLElement>(
            "[data-role='course-median']"
        );
        const title = card.querySelector<HTMLElement>(
            "[data-role='course-title']"
        );
        const code = card.querySelector<HTMLElement>(
            "[data-role='course-code']"
        );

        expect(card.hasAttribute('data-skeleton')).toBe(false);
        expect(card.hasAttribute('aria-busy')).toBe(false);
        expect(statusDot?.className).toContain('rounded-full');
        expect(points?.textContent).toBe('3.5');
        expect(median?.textContent).toBe('84');
        expect(title?.textContent).toBe('מבני נתונים');
        expect(code?.textContent).toBe('234124');
    });
});
